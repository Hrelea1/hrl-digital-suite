-- 1. Add 'client' role to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client';

-- 2. Create audit_logs table for enterprise-level logging
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs FOR SELECT
USING (auth.uid() = user_id);

-- Only system (via service role) can insert audit logs
-- No direct insert policy for regular users - will be done via edge function

-- 3. Create gdpr_consents table for GDPR compliance
CREATE TABLE public.gdpr_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    consent_type TEXT NOT NULL,
    consented BOOLEAN NOT NULL DEFAULT false,
    consent_text TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ
);

-- Index for efficient querying
CREATE INDEX idx_gdpr_consents_user_id ON public.gdpr_consents(user_id);
CREATE INDEX idx_gdpr_consents_email ON public.gdpr_consents(email);

-- Enable RLS
ALTER TABLE public.gdpr_consents ENABLE ROW LEVEL SECURITY;

-- Users can view their own consents
CREATE POLICY "Users can view their own consents"
ON public.gdpr_consents FOR SELECT
USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Users can insert their own consents
CREATE POLICY "Users can insert their own consents"
ON public.gdpr_consents FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update (revoke) their own consents
CREATE POLICY "Users can revoke their own consents"
ON public.gdpr_consents FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all consents
CREATE POLICY "Admins can view all consents"
ON public.gdpr_consents FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Create rate_limit_attempts table for tracking rate limiting
CREATE TABLE public.rate_limit_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL,
    action_type TEXT NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 1,
    first_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    blocked_until TIMESTAMPTZ,
    UNIQUE(identifier, action_type)
);

-- Index for efficient querying
CREATE INDEX idx_rate_limit_identifier ON public.rate_limit_attempts(identifier);
CREATE INDEX idx_rate_limit_action ON public.rate_limit_attempts(action_type);

-- Enable RLS - only service role can access this table
ALTER TABLE public.rate_limit_attempts ENABLE ROW LEVEL SECURITY;

-- 5. Create function to log audit events (security definer for service-level access)
CREATE OR REPLACE FUNCTION public.log_audit_event(
    _user_id UUID,
    _action TEXT,
    _resource_type TEXT,
    _resource_id UUID DEFAULT NULL,
    _details JSONB DEFAULT '{}',
    _ip_address TEXT DEFAULT NULL,
    _user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
    VALUES (_user_id, _action, _resource_type, _resource_id, _details, _ip_address, _user_agent)
    RETURNING id INTO _log_id;
    
    RETURN _log_id;
END;
$$;

-- 6. Create function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    _identifier TEXT,
    _action_type TEXT,
    _max_attempts INTEGER DEFAULT 5,
    _window_minutes INTEGER DEFAULT 15,
    _block_minutes INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _record RECORD;
    _now TIMESTAMPTZ := now();
    _window_start TIMESTAMPTZ := _now - (_window_minutes || ' minutes')::INTERVAL;
    _result JSONB;
BEGIN
    -- Get existing record
    SELECT * INTO _record
    FROM public.rate_limit_attempts
    WHERE identifier = _identifier AND action_type = _action_type;
    
    -- Check if blocked
    IF _record IS NOT NULL AND _record.blocked_until IS NOT NULL AND _record.blocked_until > _now THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'blocked_until', _record.blocked_until,
            'attempts', _record.attempt_count,
            'reason', 'Too many attempts. Please try again later.'
        );
    END IF;
    
    -- If record exists and within window
    IF _record IS NOT NULL AND _record.first_attempt_at > _window_start THEN
        -- Check if max attempts reached
        IF _record.attempt_count >= _max_attempts THEN
            -- Block the identifier
            UPDATE public.rate_limit_attempts
            SET blocked_until = _now + (_block_minutes || ' minutes')::INTERVAL,
                last_attempt_at = _now
            WHERE identifier = _identifier AND action_type = _action_type;
            
            RETURN jsonb_build_object(
                'allowed', false,
                'blocked_until', _now + (_block_minutes || ' minutes')::INTERVAL,
                'attempts', _record.attempt_count,
                'reason', 'Too many attempts. Please try again later.'
            );
        END IF;
        
        -- Increment attempt count
        UPDATE public.rate_limit_attempts
        SET attempt_count = attempt_count + 1,
            last_attempt_at = _now,
            blocked_until = NULL
        WHERE identifier = _identifier AND action_type = _action_type;
        
        RETURN jsonb_build_object(
            'allowed', true,
            'attempts', _record.attempt_count + 1,
            'remaining', _max_attempts - _record.attempt_count - 1
        );
    ELSE
        -- Reset or create new record
        INSERT INTO public.rate_limit_attempts (identifier, action_type, attempt_count, first_attempt_at, last_attempt_at)
        VALUES (_identifier, _action_type, 1, _now, _now)
        ON CONFLICT (identifier, action_type)
        DO UPDATE SET
            attempt_count = 1,
            first_attempt_at = _now,
            last_attempt_at = _now,
            blocked_until = NULL;
        
        RETURN jsonb_build_object(
            'allowed', true,
            'attempts', 1,
            'remaining', _max_attempts - 1
        );
    END IF;
END;
$$;

-- 7. Create trigger to log important actions automatically
CREATE OR REPLACE FUNCTION public.trigger_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM public.log_audit_event(
            NEW.user_id,
            'create',
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(NEW)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM public.log_audit_event(
            COALESCE(NEW.user_id, OLD.user_id),
            'update',
            TG_TABLE_NAME,
            NEW.id,
            jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
        );
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM public.log_audit_event(
            OLD.user_id,
            'delete',
            TG_TABLE_NAME,
            OLD.id,
            to_jsonb(OLD)
        );
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add audit triggers to important tables
CREATE TRIGGER audit_project_requests
    AFTER INSERT OR UPDATE OR DELETE ON public.project_requests
    FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

CREATE TRIGGER audit_messages
    AFTER INSERT OR UPDATE OR DELETE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

CREATE TRIGGER audit_profiles
    AFTER INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

CREATE TRIGGER audit_purchased_packages
    AFTER INSERT OR UPDATE OR DELETE ON public.purchased_packages
    FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

-- 8. Create function for GDPR data export
CREATE OR REPLACE FUNCTION public.export_user_data(_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _result JSONB;
BEGIN
    -- Only allow users to export their own data or admins
    IF auth.uid() != _user_id AND NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    
    SELECT jsonb_build_object(
        'profile', (SELECT to_jsonb(p) FROM public.profiles p WHERE p.user_id = _user_id),
        'project_requests', (SELECT COALESCE(jsonb_agg(to_jsonb(pr)), '[]'::jsonb) FROM public.project_requests pr WHERE pr.user_id = _user_id),
        'messages', (SELECT COALESCE(jsonb_agg(to_jsonb(m)), '[]'::jsonb) FROM public.messages m WHERE m.user_id = _user_id),
        'purchased_packages', (SELECT COALESCE(jsonb_agg(to_jsonb(pp)), '[]'::jsonb) FROM public.purchased_packages pp WHERE pp.user_id = _user_id),
        'gdpr_consents', (SELECT COALESCE(jsonb_agg(to_jsonb(gc)), '[]'::jsonb) FROM public.gdpr_consents gc WHERE gc.user_id = _user_id),
        'exported_at', now()
    ) INTO _result;
    
    -- Log the export
    PERFORM public.log_audit_event(_user_id, 'gdpr_export', 'user_data', _user_id);
    
    RETURN _result;
END;
$$;

-- 9. Create function for GDPR data deletion
CREATE OR REPLACE FUNCTION public.delete_user_data(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only allow users to delete their own data or admins
    IF auth.uid() != _user_id AND NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;
    
    -- Log before deletion
    PERFORM public.log_audit_event(_user_id, 'gdpr_deletion_requested', 'user_data', _user_id);
    
    -- Delete user data from all tables (cascading from auth.users will handle most)
    DELETE FROM public.messages WHERE user_id = _user_id;
    DELETE FROM public.project_requests WHERE user_id = _user_id;
    DELETE FROM public.purchased_packages WHERE user_id = _user_id;
    DELETE FROM public.profiles WHERE user_id = _user_id;
    DELETE FROM public.user_roles WHERE user_id = _user_id;
    -- gdpr_consents will be deleted via CASCADE
    
    RETURN true;
END;
$$;