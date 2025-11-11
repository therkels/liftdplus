// src/app/api/v0/posts/like/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const SCHEMA = "private";
const LIKES_TABLE = "likes"; // ✅ your table name from Supabase

// ✅ Handle a PUT (add or toggle like)
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();

    // 1️⃣ Identify user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

 // 2️⃣ Parse JSON body
const body = await request.json().catch(() => null);
console.log("📦 like body received:", body); // 👈 ADD THIS LINE
const post_id = Number(body?.post_id);
if (!post_id || Number.isNaN(post_id)) {
  return NextResponse.json({ error: "Missing or invalid post_id" }, { status: 400 });
}


    // 3️⃣ Check if already liked
    const { data: existing } = await supabase
      .schema(SCHEMA)
      .from(LIKES_TABLE)
      .select("id")
      .eq("post_id", post_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      // unlike
      await supabase
        .schema(SCHEMA)
        .from(LIKES_TABLE)
        .delete()
        .eq("id", existing.id);
      return NextResponse.json({ liked: false });
    } else {
      // like
      const { error: insertError } = await supabase
        .schema(SCHEMA)
        .from(LIKES_TABLE)
        .insert([{ post_id, user_id: user.id }]);

      if (insertError) throw insertError;
      return NextResponse.json({ liked: true });
    }
  } catch (e: any) {
    console.error("PUT /posts/like error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}

// ✅ Handle DELETE (explicit unlike)
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json().catch(() => null);
    const post_id = Number(body?.post_id);
    if (!post_id || Number.isNaN(post_id)) {
      return NextResponse.json({ error: "Missing or invalid post_id" }, { status: 400 });
    }

    const { error } = await supabase
      .schema(SCHEMA)
      .from(LIKES_TABLE)
      .delete()
      .eq("post_id", post_id)
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ liked: false });
  } catch (e: any) {
    console.error("DELETE /posts/like error:", e);
    return NextResponse.json(
      { error: e?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
