"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <button
      onClick={handleSignOut}
      className="border border-foreground/30 px-6 py-2 text-sm uppercase tracking-widest text-foreground/70 transition-colors hover:border-foreground hover:text-foreground"
    >
      Se déconnecter
    </button>
  );
}
