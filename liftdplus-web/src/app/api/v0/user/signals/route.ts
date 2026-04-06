import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: eventData } = await supabaseAdmin
      .from("user_events")
      .select("event_name")
      .eq("user_id", user.id);

    const { data: checklistData } = await supabaseAdmin
      .from("user_events")
      .select("id")
      .eq("user_id", user.id)
      .eq("event_name", "checklist_completed")
      .limit(1);

    return NextResponse.json({
      articles_viewed: eventData?.filter((e) => e.event_name === "article_viewed").length ?? 0,
      saves: eventData?.filter((e) => e.event_name === "post_archived").length ?? 0,
      checklist_complete: (checklistData?.length ?? 0) > 0,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
