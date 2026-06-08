import { NextResponse } from "next/server";

import { supabaseAdmin } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(null, { status: 401 });
  }

  const { product_id, rating, note } = await req.json();

  await supabaseAdmin.from("product_ratings").upsert(
    {
      user_id: user.id,
      product_id,
      rating,
      note,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,product_id" }
  );

  return NextResponse.json({ success: true });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json([]);
  }

  const { data } = await supabaseAdmin
    .from("product_ratings")
    .select("*")
    .eq("user_id", user.id);

  return NextResponse.json(data);
}
