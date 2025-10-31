// server-only admin client (DO NOT import this in any client component)
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,   // already configured in your app
  process.env.SUPABASE_SERVICE_ROLE_KEY!,  // add in Vercel env vars (Preview/Prod/Dev)
  { db: { schema: "private" } }
);
