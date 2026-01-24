import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeRequest {
  email: string;
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userName }: WelcomeRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email obligatoriu" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const greeting = userName ? `Salut ${escapeHtml(userName)}!` : "Salut!";

    const emailResponse = await resend.emails.send({
      from: "HRL.dev <onboarding@resend.dev>",
      to: [email],
      subject: "Bine ai venit la HRL.dev! 🚀",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    h1 { color: #8B5CF6; margin-bottom: 20px; font-size: 28px; }
    p { color: #555; margin-bottom: 16px; }
    .button { display: inline-block; background: #8B5CF6; color: #fff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .features { background: #F3F0FF; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .features h3 { color: #8B5CF6; margin-bottom: 12px; }
    .features ul { margin: 0; padding-left: 20px; }
    .features li { margin-bottom: 8px; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Bine ai venit!</h1>
    <p>${greeting}</p>
    <p>Îți mulțumim că te-ai alăturat comunității HRL.dev! Suntem încântați să te avem alături.</p>
    
    <div class="features">
      <h3>Ce poți face acum:</h3>
      <ul>
        <li>Explorează serviciile noastre</li>
        <li>Completează profilul tău</li>
        <li>Trimite-ne o cerere de proiect</li>
        <li>Contactează-ne pentru orice întrebare</li>
      </ul>
    </div>
    
    <a href="https://hrldev.ro/#/dashboard" class="button">Accesează Dashboard</a>
    
    <p>Dacă ai întrebări, nu ezita să ne contactezi!</p>
    
    <div class="footer">
      <p>Cu drag,<br>Echipa HRL.dev</p>
    </div>
  </div>
</body>
</html>
      `,
    });

    console.log("Welcome email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
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
