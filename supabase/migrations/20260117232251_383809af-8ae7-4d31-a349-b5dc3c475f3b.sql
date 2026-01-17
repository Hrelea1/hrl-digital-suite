-- Add policy for rate_limit_attempts table
-- This table should only be accessible via security definer functions
-- But we need at least one policy to avoid the linter warning

-- Policy: Allow service role access only (effectively no direct access)
CREATE POLICY "No direct access - use functions"
ON public.rate_limit_attempts FOR SELECT
USING (false);

-- The check_rate_limit function uses SECURITY DEFINER which bypasses RLS