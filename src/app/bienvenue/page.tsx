import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe/client";
import { createServiceClient } from "@/lib/supabase/server";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function BienvenueePage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/");
  }

  // Retrieve the Stripe session to get the customer's email and IDs
  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ["subscription", "customer"],
  });

  if (session.status !== "complete") {
    redirect("/#devenir-membre");
  }

  const email = session.customer_details?.email;
  if (!email) {
    redirect("/");
  }

  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;

  const stripeSubscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  const supabase = await createServiceClient();

  // Create or find the auth user
  const { data: existingUsers } = await supabase
    .from("members")
    .select("id, email")
    .eq("email", email)
    .limit(1);

  let userId: string;

  if (existingUsers && existingUsers.length > 0) {
    userId = existingUsers[0].id;
  } else {
    // Create a new auth user
    const { data: newUser, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
      });

    if (createError || !newUser.user) {
      // User might already exist in auth but not in members — look up by email
      const { data: authList } = await supabase.auth.admin.listUsers();
      const found = authList?.users.find((u) => u.email === email);
      if (!found) {
        throw new Error(`Could not create or find user for ${email}`);
      }
      userId = found.id;
    } else {
      userId = newUser.user.id;
    }

    // Upsert the member row
    await supabase.from("members").upsert(
      {
        id: userId,
        email,
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        subscription_status: "active",
      },
      { onConflict: "id" }
    );
  }

  // Update Stripe IDs and subscription status on every successful checkout
  await supabase
    .from("members")
    .update({
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      subscription_status: "active",
    })
    .eq("id", userId);

  // Send magic link so the member can log in and complete onboarding
  await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/onboarding`,
    },
  });

  // Also send via Supabase's own email (triggers the configured template)
  await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/onboarding`,
      shouldCreateUser: false,
    },
  });

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <div className="w-full max-w-sm">
        <p className="mb-4 text-3xl">🎉</p>
        <h1 className="mb-4 font-display text-4xl uppercase tracking-wide">
          Bienvenue dans le club
        </h1>
        <p className="mb-2 text-foreground/80">
          On vient de t&apos;envoyer un lien de connexion à{" "}
          <strong>{email}</strong>.
        </p>
        <p className="mb-10 text-foreground/60">
          Clique dessus pour remplir le questionnaire sur votre couple. Le
          premier mail part sous 24 h.
        </p>
        <p className="text-sm text-foreground/40">
          Pas reçu ? Vérifie les spams ou{" "}
          <Link href="/connexion" className="underline hover:text-foreground/70">
            demande un nouveau lien
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
