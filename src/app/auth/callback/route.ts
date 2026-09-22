import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/profil";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // If no explicit next, check onboarding status
      if (!searchParams.get("next")) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data: member } = await supabase
            .from("members")
            .select("onboarding_completed_at")
            .eq("id", user.id)
            .single();
          if (!member?.onboarding_completed_at) {
            return NextResponse.redirect(`${origin}/onboarding`);
          }
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/connexion?error=auth`);
}
