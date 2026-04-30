import Stripe from "npm:stripe@14";
import { createClient } from "npm:@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id ?? session.metadata?.user_id;
      const credits = parseInt(session.metadata?.credits ?? "0", 10);
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

      if (userId && credits > 0) {
        // Fetch current credits to increment
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("credits_remaining")
          .eq("id", userId)
          .maybeSingle();

        await supabase
          .from("user_profiles")
          .upsert({
            id: userId,
            credits_remaining: (profile?.credits_remaining ?? 0) + credits,
            stripe_customer_id: customerId ?? null,
            stripe_subscription_id: subscriptionId ?? null,
            updated_at: new Date().toISOString(),
          });

        console.log(`Checkout complete: +${credits} credits for user ${userId}`);
      }
    }

    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;

      // Skip the first invoice — handled by checkout.session.completed
      if (invoice.billing_reason === "subscription_create") {
        return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
      if (!subscriptionId) {
        return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const userId = subscription.metadata?.user_id;
      const credits = parseInt(subscription.metadata?.credits ?? "0", 10);

      if (userId && credits > 0) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("credits_remaining")
          .eq("id", userId)
          .maybeSingle();

        await supabase
          .from("user_profiles")
          .update({ credits_remaining: (profile?.credits_remaining ?? 0) + credits, updated_at: new Date().toISOString() })
          .eq("id", userId);

        console.log(`Renewal: +${credits} credits for user ${userId}`);
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response("Handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
