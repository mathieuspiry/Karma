import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./SignOutButton";

export default async function ProfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 font-display text-4xl uppercase tracking-wide">
          Mon profil
        </h1>
        <p className="mb-2 text-foreground/70 text-sm uppercase tracking-widest">
          Connecté en tant que
        </p>
        <p className="mb-8 text-foreground">{user.email}</p>
        <SignOutButton />
      </div>
    </main>
  );
}
