import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const {
        data: {user}
    } = await supabase.auth.getUser();

    if (!user) {
        return new Response(JSON.stringify({error:"Not authenticated."}),{
            status:401,
            headers: {'Content-Type':"application/json"}
        })
    }
    const { data, error } = await supabase.rpc('get_user_feed', { user_id: user.id });
    if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
    return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}