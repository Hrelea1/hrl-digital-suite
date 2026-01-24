import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PurchaseConfirmationRequest {
  email: string;
  packageName: string;
  amount: number;
  orderId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, packageName, amount, orderId }: PurchaseConfirmationRequest = await req.json();

    if (!email || !packageName) {
      throw new Error("Email și numele pachetului sunt necesare");
    }

    // Get project URL for dashboard link
    const projectUrl = Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", "") || "";
    const dashboardUrl = `${projectUrl}/#/dashboard/packages`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmare achiziție</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Mulțumim pentru achiziție! 🎉</h1>
        </div>
        
        <div style="background: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <p style="font-size: 16px; margin-bottom: 20px;">Bună,</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Achiziția ta a fost procesată cu succes! Iată detaliile comenzii:
          </p>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin: 25px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Pachet:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${escapeHtml(packageName)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Sumă plătită:</td>
                <td style="padding: 8px 0; text-align: right; font-weight: 600;">${amount}€</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">ID Comandă:</td>
                <td style="padding: 8px 0; text-align: right; font-size: 12px; font-family: monospace;">${orderId.slice(0, 8)}...</td>
              </tr>
            </table>
          </div>
          
          <h2 style="color: #1a1a2e; font-size: 20px; margin-top: 30px;">📋 Pașii următori</h2>
          
          <div style="margin: 20px 0;">
            <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
              <span style="background: #10b981; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 12px; flex-shrink: 0;">1</span>
              <div>
                <strong>Programează o consultație</strong>
                <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">Vom discuta detaliile proiectului tău și vom stabili un plan de acțiune.</p>
              </div>
            </div>
            
            <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
              <span style="background: #3b82f6; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 12px; flex-shrink: 0;">2</span>
              <div>
                <strong>Pregătește materialele</strong>
                <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">Logo, texte, imagini sau orice alt material relevant pentru proiect.</p>
              </div>
            </div>
            
            <div style="display: flex; align-items: flex-start;">
              <span style="background: #8b5cf6; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; margin-right: 12px; flex-shrink: 0;">3</span>
              <div>
                <strong>Accesează dashboard-ul</strong>
                <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">Urmărește progresul proiectului și comunică cu echipa noastră.</p>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              📅 Programează consultația
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #64748b; text-align: center;">
            Ai întrebări? Răspunde direct la acest email sau contactează-ne la 
            <a href="mailto:contact@example.com" style="color: #3b82f6;">contact@example.com</a>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
          <p>© ${new Date().getFullYear()} HRL Web Design. Toate drepturile rezervate.</p>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "HRL Web Design <noreply@hrlwebdesign.ro>",
      to: [email],
      subject: `Confirmare achiziție: ${packageName}`,
      html: emailHtml,
    });

    console.log("Purchase confirmation email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending purchase confirmation:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
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
