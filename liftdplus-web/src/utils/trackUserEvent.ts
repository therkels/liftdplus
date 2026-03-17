import { createClient } from "@/utils/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function trackUserEvent(
  userId: string,
  eventName: string,
  properties: Record<string, unknown> = {},
  supabaseClient?: SupabaseClient
) {
  try {
    const supabase = supabaseClient ?? (await createClient());
    await supabase
      .schema("private")
      .from("user_events")
      .insert({
        user_id: userId,
        event_name: eventName,
        properties,
      });
  } catch (e) {
    console.error("[trackUserEvent] failed:", e);
  }
}
