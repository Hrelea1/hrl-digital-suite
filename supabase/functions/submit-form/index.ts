import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import {
  getClientIP,
  getUserAgent,
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  isHoneypotTriggered,
  checkRateLimit,
  logAuditEvent,
  getSecurityHeaders,
} from '../_shared/security.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const responseHeaders = { ...corsHeaders, ...getSecurityHeaders() };

  try {
    const ipAddress = getClientIP(req);
    const userAgent = getUserAgent(req);

    // Create admin client for rate limiting and audit logging
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Rate limit check - 5 submissions per 15 minutes per IP
    const rateCheck = await checkRateLimit(
      supabaseAdmin,
      ipAddress,
      'form_submit',
      5,
      15,
      30
    );

    if (!rateCheck.allowed) {
      await logAuditEvent(
        supabaseAdmin,
        null,
        'rate_limit_exceeded',
        'form_submission',
        undefined,
        { ip: ipAddress, action: 'form_submit' },
        ipAddress,
        userAgent
      );

      return new Response(
        JSON.stringify({
          error: 'Prea multe încercări. Te rugăm să aștepți câteva minute.',
          retry_after: 30 * 60,
        }),
        {
          status: 429,
          headers: { ...responseHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await req.json();

    // Check honeypot fields
    if (isHoneypotTriggered(body)) {
      await logAuditEvent(
        supabaseAdmin,
        null,
        'honeypot_triggered',
        'form_submission',
        undefined,
        { ip: ipAddress },
        ipAddress,
        userAgent
      );

      // Return success to confuse bots
      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { ...responseHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate required fields
    const { projectType, budget, timeline, details, name, email, phone, gdprConsent, userId } = body;

    // Validation
    const errors: Record<string, string> = {};

    if (!projectType || !['prezentare', 'magazin', 'aplicatie', 'saas', 'altele'].includes(projectType)) {
      errors.projectType = 'Tip proiect invalid';
    }

    if (!budget || !['<300', '300-800', '800-1700', '>1700'].includes(budget)) {
      errors.budget = 'Buget invalid';
    }

    if (!timeline || !['1-2saptamani', '2-4saptamani', '1-2luni', '>2luni'].includes(timeline)) {
      errors.timeline = 'Timeline invalid';
    }

    const sanitizedDetails = sanitizeInput(details || '');
    if (!sanitizedDetails || sanitizedDetails.length < 10) {
      errors.details = 'Detaliile trebuie să aibă cel puțin 10 caractere';
    }

    const sanitizedName = sanitizeInput(name || '');
    if (!sanitizedName || sanitizedName.length < 2) {
      errors.name = 'Numele trebuie să aibă cel puțin 2 caractere';
    }

    if (!email || !isValidEmail(email)) {
      errors.email = 'Email invalid';
    }

    if (phone && !isValidPhone(phone)) {
      errors.phone = 'Număr de telefon invalid';
    }

    if (!gdprConsent) {
      errors.gdprConsent = 'Trebuie să accepți politica de confidențialitate';
    }

    if (Object.keys(errors).length > 0) {
      return new Response(
        JSON.stringify({ error: 'Validare eșuată', errors }),
        {
          status: 400,
          headers: { ...responseHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check auth if userId provided
    let authenticatedUserId: string | null = null;
    
    if (userId) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } },
        });
        
        const token = authHeader.replace('Bearer ', '');
        const { data: claims, error: claimsError } = await supabaseClient.auth.getClaims(token);
        
        if (!claimsError && claims?.claims?.sub === userId) {
          authenticatedUserId = userId;
        }
      }
    }

    // Store GDPR consent
    const { error: consentError } = await supabaseAdmin
      .from('gdpr_consents')
      .insert({
        user_id: authenticatedUserId,
        email: email,
        consent_type: 'form_submission',
        consented: true,
        consent_text: 'Accept procesarea datelor conform Politicii de Confidențialitate HRL.dev',
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    if (consentError) {
      console.error('Consent storage error:', consentError);
    }

    // If authenticated user, store in project_requests
    if (authenticatedUserId) {
      const { data: projectData, error: projectError } = await supabaseAdmin
        .from('project_requests')
        .insert({
          user_id: authenticatedUserId,
          project_type: projectType,
          budget,
          timeline,
          details: sanitizedDetails,
        })
        .select('id')
        .single();

      if (projectError) {
        console.error('Project request error:', projectError);
        return new Response(
          JSON.stringify({ error: 'A apărut o eroare la salvare. Încearcă din nou.' }),
          {
            status: 500,
            headers: { ...responseHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      await logAuditEvent(
        supabaseAdmin,
        authenticatedUserId,
        'form_submit_authenticated',
        'project_request',
        projectData?.id,
        { project_type: projectType, budget, timeline },
        ipAddress,
        userAgent
      );

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Cererea a fost salvată în dashboard-ul tău.',
          projectId: projectData?.id,
        }),
        {
          status: 200,
          headers: { ...responseHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // For non-authenticated users, just log the submission
    await logAuditEvent(
      supabaseAdmin,
      null,
      'form_submit_guest',
      'contact_form',
      undefined,
      {
        project_type: projectType,
        budget,
        timeline,
        name: sanitizedName,
        // Don't log full email for privacy
        email_domain: email.split('@')[1],
      },
      ipAddress,
      userAgent
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Mulțumim! Te vom contacta în curând.',
      }),
      {
        status: 200,
        headers: { ...responseHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Form submission error:', err);
    
    return new Response(
      JSON.stringify({ error: 'A apărut o eroare. Te rugăm să încerci din nou.' }),
      {
        status: 500,
        headers: { ...responseHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
