"use server";

import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe/client";

export async function createCheckoutSession() {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/bienvenue?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/#devenir-membre`,
    allow_promotion_codes: false,
    billing_address_collection: "auto",
    locale: "fr",
  });

  redirect(session.url!);
}
