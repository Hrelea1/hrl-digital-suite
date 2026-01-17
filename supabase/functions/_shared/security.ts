import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Get client IP from headers
export function getClientIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

// Get user agent
export function getUserAgent(req: Request): string {
  return req.headers.get('user-agent') || 'unknown';
}

// Sanitize text input - remove XSS vectors
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: protocol
    .trim()
    .slice(0, 10000); // Max length
}

// Validate email format strictly
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Validate phone number (international format)
export function isValidPhone(phone: string): boolean {
  if (!phone) return true; // Optional field
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Check for honeypot fields (should be empty)
export function isHoneypotTriggered(data: Record<string, unknown>): boolean {
  const honeypotFields = ['website', 'url', 'company_website', 'fax'];
  return honeypotFields.some(field => data[field] && String(data[field]).trim() !== '');
}

// Rate limit check using database
export async function checkRateLimit(
  supabaseAdmin: SupabaseClient,
  identifier: string,
  actionType: string,
  maxAttempts = 5,
  windowMinutes = 15,
  blockMinutes = 30
): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
  try {
    const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
      _identifier: identifier,
      _action_type: actionType,
      _max_attempts: maxAttempts,
      _window_minutes: windowMinutes,
      _block_minutes: blockMinutes,
    } as unknown);

    if (error) {
      console.error('Rate limit check error:', error);
      // Fail open for now, but log the error
      return { allowed: true };
    }

    const result = data as { allowed: boolean; reason?: string; remaining?: number };
    return {
      allowed: result.allowed,
      reason: result.reason,
      remaining: result.remaining,
    };
  } catch (err) {
    console.error('Rate limit exception:', err);
    return { allowed: true };
  }
}

// Log audit event
export async function logAuditEvent(
  supabaseAdmin: SupabaseClient,
  userId: string | null,
  action: string,
  resourceType: string,
  resourceId?: string,
  details: Record<string, unknown> = {},
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await supabaseAdmin.rpc('log_audit_event', {
      _user_id: userId,
      _action: action,
      _resource_type: resourceType,
      _resource_id: resourceId || null,
      _details: details,
      _ip_address: ipAddress || null,
      _user_agent: userAgent || null,
    } as unknown);
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// Security headers for responses
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}
