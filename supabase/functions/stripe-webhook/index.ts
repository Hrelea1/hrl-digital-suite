import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    let event: Stripe.Event;

    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } else {
      // For testing without webhook secret
      event = JSON.parse(body);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log("Processing completed checkout:", session.id);

      // Update order status
      const { data: order, error: orderError } = await supabaseAdmin
        .from("orders")
        .update({
          status: "completed",
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .eq("stripe_session_id", session.id)
        .select()
        .single();

      if (orderError) {
        console.error("Error updating order:", orderError);
        throw orderError;
      }

      // Get package details
      const { data: pkg } = await supabaseAdmin
        .from("service_packages")
        .select("*")
        .eq("id", order.package_id)
        .single();

      // Create purchased_package
      const { error: purchaseError } = await supabaseAdmin
        .from("purchased_packages")
        .insert({
          user_id: order.user_id,
          package_id: order.package_id,
          package_name: pkg?.name || session.metadata?.package_name || "Pachet",
          package_type: pkg?.category || "website",
          price: order.amount,
          status: "active",
          order_id: order.id,
          start_date: new Date().toISOString(),
        });

      if (purchaseError) {
        console.error("Error creating purchased package:", purchaseError);
      }

      // Get user email
      const customerEmail = session.customer_details?.email || order.customer_email;

      // Send confirmation email
      if (customerEmail) {
        try {
          const emailResponse = await fetch(
            `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-purchase-confirmation`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              },
              body: JSON.stringify({
                email: customerEmail,
                packageName: pkg?.name || "Pachetul tău",
                amount: order.amount,
                orderId: order.id,
              }),
            }
          );

          if (!emailResponse.ok) {
            console.error("Failed to send confirmation email:", await emailResponse.text());
          }
        } catch (emailError) {
          console.error("Error sending email:", emailError);
        }
      }

      // Log audit event
      await supabaseAdmin.rpc("log_audit_event", {
        _user_id: order.user_id,
        _action: "purchase_completed",
        _resource_type: "purchased_packages",
        _resource_id: order.id,
        _details: {
          package_id: order.package_id,
          package_name: pkg?.name,
          amount: order.amount,
          stripe_session_id: session.id,
        },
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Webhook error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400 }
    );
  }
});
