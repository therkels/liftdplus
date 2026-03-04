import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import LandingPage from "./LandingPage";

export const metadata = {
  title: "LIFTD+ | Cannabis Education for Adults",
  description:
    "Learn about cannabis for sleep, stress, and pain relief before you walk into a dispensary. Free, judgment-free education for adults.",
  openGraph: {
    title: "LIFTD+ | Cannabis Education for Adults",
    description:
      "Learn about cannabis for sleep, stress, and pain relief before you walk into a dispensary.",
    type: "website",
    url: "https://app.liftdplus.com",
  },
};

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
