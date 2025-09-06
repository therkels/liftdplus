import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"


export async function GET(
    request: NextRequest
    ) {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();

    if (!user) {
        return jsonResponse({error:'not Authenticated'}, 400);
    }

    const url = new URL(request.url);
    await supabase.from('event_logs').insert([
        {
            event_type: 'get_liked_info',
            details: {},
            user_id: user.id
        }
    ]);
    return getLikedInfo(supabase,user.id)
}

export async function PUT(request: NextRequest, { params }: {params: {posts:string}}) {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();

    if (!user) {
        return jsonResponse({error:'not Authenticated'}, 400);
    }

    const param_list = params.posts || [];
    const url = new URL(request.url);
}

async function getLikedInfo(supabase: any, user_id:string) {
    const { data, error } = await supabase.rpc('get_liked_posts', {
        user_id: user_id,
    })
    console.log(error)
    return jsonResponse(data)
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}