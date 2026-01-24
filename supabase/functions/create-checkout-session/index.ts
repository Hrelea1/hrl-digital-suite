import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Nu ești autentificat");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Token invalid");
    }

    const { packageId } = await req.json();

    if (!packageId) {
      throw new Error("ID-ul pachetului este necesar");
    }

    // Get package details
    const { data: pkg, error: pkgError } = await supabaseClient
      .from("service_packages")
      .select("*")
      .eq("id", packageId)
      .single();

    if (pkgError || !pkg) {
      throw new Error("Pachetul nu a fost găsit");
    }

    if (!pkg.price) {
      throw new Error("Acest pachet necesită o ofertă personalizată. Contactează-ne!");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    // Get or create price in Stripe
    let priceId = pkg.stripe_price_id;
    
    if (!priceId) {
      // Create product and price in Stripe
      const product = await stripe.products.create({
        name: pkg.name,
        description: pkg.short_description || pkg.description || undefined,
        metadata: {
          supabase_package_id: pkg.id,
        },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(pkg.price * 100), // Convert to cents
        currency: "eur",
      });

      priceId = price.id;

      // Save price ID to database using service role
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      await supabaseAdmin
        .from("service_packages")
        .update({ stripe_price_id: priceId })
        .eq("id", pkg.id);
    }

    // Get the origin for redirect URLs
    const origin = req.headers.get("origin") || "https://lovable.dev";

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/#/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#/checkout/cancel`,
      metadata: {
        supabase_user_id: user.id,
        package_id: pkg.id,
        package_name: pkg.name,
      },
    });

    // Create order in database
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabaseAdmin.from("orders").insert({
      user_id: user.id,
      package_id: pkg.id,
      stripe_session_id: session.id,
      amount: pkg.price,
      currency: "eur",
      status: "pending",
      customer_email: user.email,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "A apărut o eroare";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
