import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type SubscriptionStatus =
  Database["public"]["Enums"]["subscription_status"];

// Map Stripe statuses to our enum
function toSubscriptionStatus(
  status: Stripe.Subscription.Status
): SubscriptionStatus {
  const map: Partial<Record<Stripe.Subscription.Status, SubscriptionStatus>> =
    {
      trialing: "trialing",
      active: "active",
      past_due: "past_due",
      canceled: "canceled",
      incomplete: "incomplete",
      incomplete_expired: "canceled",
      unpaid: "past_due",
      paused: "past_due",
    };
  return map[status] ?? "incomplete";
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const status = toSubscriptionStatus(subscription.status);

    await supabase
      .from("members")
      .update({
        subscription_status: status,
        stripe_subscription_id: subscription.id,
      })
      .eq("stripe_customer_id", subscription.customer as string);
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    if (invoice.customer) {
      await supabase
        .from("members")
        .update({ subscription_status: "past_due" })
        .eq("stripe_customer_id", invoice.customer as string);
    }
  }

  return NextResponse.json({ received: true });
}
