import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OtpRequest {
  email: string;
  otp: string;
  type: "login" | "2fa" | "email_change";
}

const typeMessages: Record<string, { title: string; description: string }> = {
  login: {
    title: "🔑 Cod de autentificare",
    description: "Folosește codul de mai jos pentru a te autentifica:",
  },
  "2fa": {
    title: "🔐 Verificare în doi pași",
    description: "Folosește codul de mai jos pentru a completa autentificarea:",
  },
  email_change: {
    title: "📧 Confirmare schimbare email",
    description: "Folosește codul de mai jos pentru a confirma noul email:",
  },
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp, type = "login" }: OtpRequest = await req.json();

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ error: "Email și OTP sunt obligatorii" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const message = typeMessages[type] || typeMessages.login;

    const emailResponse = await resend.emails.send({
      from: "HRL.dev <onboarding@resend.dev>",
      to: [email],
      subject: `${message.title} - HRL.dev`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; }
    h1 { color: #8B5CF6; margin-bottom: 20px; font-size: 24px; }
    p { color: #555; margin-bottom: 16px; }
    .otp-code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #8B5CF6; background: #F3F0FF; padding: 20px 30px; border-radius: 12px; margin: 30px 0; display: inline-block; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; }
    .warning { color: #ef4444; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${message.title}</h1>
    <p>${message.description}</p>
    <div class="otp-code">${escapeHtml(otp)}</div>
    <p><strong>Acest cod expiră în 10 minute.</strong></p>
    <p class="warning">Nu împărtăși acest cod cu nimeni!</p>
    <div class="footer">
      <p>Dacă nu ai solicitat acest cod, te rugăm să îți securizezi contul.</p>
      <p>© HRL.dev</p>
    </div>
  </div>
</body>
</html>
      `,
    });

    console.log("OTP email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending OTP email:", error);
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
