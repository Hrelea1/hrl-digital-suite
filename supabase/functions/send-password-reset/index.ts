import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetLink }: PasswordResetRequest = await req.json();

    if (!email || !resetLink) {
      return new Response(
        JSON.stringify({ error: "Email și link sunt obligatorii" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailResponse = await resend.emails.send({
      from: "HRL.dev <onboarding@resend.dev>",
      to: [email],
      subject: "Resetează-ți parola - HRL.dev",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    h1 { color: #8B5CF6; margin-bottom: 20px; font-size: 24px; }
    p { color: #555; margin-bottom: 16px; }
    .button { display: inline-block; background: #8B5CF6; color: #fff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .button:hover { background: #7C3AED; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888; }
    .link { word-break: break-all; font-size: 12px; color: #888; background: #f5f5f5; padding: 10px; border-radius: 6px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔐 Resetare parolă</h1>
    <p>Ai solicitat resetarea parolei pentru contul tău HRL.dev.</p>
    <p>Apasă butonul de mai jos pentru a seta o parolă nouă:</p>
    <a href="${escapeHtml(resetLink)}" class="button">Resetează parola</a>
    <p class="link">Sau copiază acest link: ${escapeHtml(resetLink)}</p>
    <p><strong>Acest link expiră în 1 oră.</strong></p>
    <div class="footer">
      <p>Dacă nu ai solicitat resetarea parolei, poți ignora acest email.</p>
      <p>© HRL.dev</p>
    </div>
  </div>
</body>
</html>
      `,
    });

    console.log("Password reset email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
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
