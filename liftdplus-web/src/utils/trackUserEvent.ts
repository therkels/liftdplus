import { createClient } from "@/utils/supabase/server";

export async function trackUserEvent(
  userId: string,
  eventName: string,
  properties: Record<string, unknown> = {}
) {
  try {
    const supabase = await createClient();
    await supabase
      .schema("private")
      .from("user_events")
      .insert({
        user_id: userId,
        event_name: eventName,
        properties,
      });
  } catch (e) {
    // Fire and forget — never block the main action
    console.error("[trackUserEvent] failed:", e);
  }
}
