import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  projectType: string;
  budget: string;
  timeline: string;
  details: string;
  name: string;
  email: string;
  phone?: string;
}

const projectTypeLabels: Record<string, string> = {
  prezentare: "Site de prezentare",
  magazin: "Magazin online",
  aplicatie: "Aplicație web",
  saas: "Platformă SaaS",
  altele: "Altele",
};

const budgetLabels: Record<string, string> = {
  "<300": "Mai puțin de 300€",
  "300-800": "300€ - 800€",
  "800-1700": "800€ - 1700€",
  ">1700": "Peste 1700€",
};

const timelineLabels: Record<string, string> = {
  "1-2saptamani": "1-2 săptămâni",
  "2-4saptamani": "2-4 săptămâni",
  "1-2luni": "1-2 luni",
  ">2luni": "Peste 2 luni",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ContactFormData = await req.json();

    // Basic validation
    if (!data.name || !data.email || !data.projectType || !data.budget || !data.timeline || !data.details) {
      return new Response(
        JSON.stringify({ error: "Date incomplete" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Build email content
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #8B5CF6; border-bottom: 2px solid #8B5CF6; padding-bottom: 10px; }
    .field { margin-bottom: 16px; }
    .label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
    .value { font-size: 16px; background: #f5f5f5; padding: 12px; border-radius: 8px; }
    .details { white-space: pre-wrap; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Nouă cerere de proiect</h1>
    
    <div class="field">
      <div class="label">Nume</div>
      <div class="value">${escapeHtml(data.name)}</div>
    </div>
    
    <div class="field">
      <div class="label">Email</div>
      <div class="value"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></div>
    </div>
    
    ${data.phone ? `
    <div class="field">
      <div class="label">Telefon</div>
      <div class="value"><a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></div>
    </div>
    ` : ''}
    
    <div class="field">
      <div class="label">Tip proiect</div>
      <div class="value">${escapeHtml(projectTypeLabels[data.projectType] || data.projectType)}</div>
    </div>
    
    <div class="field">
      <div class="label">Buget estimat</div>
      <div class="value">${escapeHtml(budgetLabels[data.budget] || data.budget)}</div>
    </div>
    
    <div class="field">
      <div class="label">Termen dorit</div>
      <div class="value">${escapeHtml(timelineLabels[data.timeline] || data.timeline)}</div>
    </div>
    
    <div class="field">
      <div class="label">Detalii proiect</div>
      <div class="value details">${escapeHtml(data.details)}</div>
    </div>
    
    <div class="footer">
      Cerere trimisă prin formularul de contact HRL.dev
    </div>
  </div>
</body>
</html>
    `;

    const emailResponse = await resend.emails.send({
      from: "HRL.dev Contact <onboarding@resend.dev>",
      to: ["contact@hrldev.ro"],
      reply_to: data.email,
      subject: `[HRL.dev] Cerere nouă: ${projectTypeLabels[data.projectType] || data.projectType} - ${data.name}`,
      html: emailHtml,
    });

    console.log("Contact email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Email trimis cu succes" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Eroare la trimiterea email-ului" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

serve(handler);
