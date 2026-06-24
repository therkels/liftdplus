import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    // Verify the user is actually authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already exists in private.users
    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (existingUser) {
      // User already exists — nothing to do
      return NextResponse.json({ success: true, created: false });
    }

    // Create the user record
    const { error: upsertError } = await supabaseAdmin
      .from("users")
      .upsert({
        id: user.id,
        username: "user_" + Math.random().toString(36).substring(2, 10),
        profile_icon_url: user.user_metadata?.avatar_url || null,
        user_type_id: "viewer"
      }, { onConflict: "id" });

    if (upsertError) {
      console.error("Error creating user:", upsertError.message);
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, created: true });

  } catch (err) {
    console.error("Unexpected error in user create route:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
