import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import LandingPage from "./LandingPage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/explore");
  }

  return <LandingPage />;
}
