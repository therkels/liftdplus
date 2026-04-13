import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

import ExplorePageClient from "./ExplorePageClient";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profileRow, error: profileError } = await supabaseAdmin
      .from("user_recommendation_profile")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profileError && !profileRow) {
      redirect("/onboarding/legacy");
    }
  }

  return <ExplorePageClient />;
}
