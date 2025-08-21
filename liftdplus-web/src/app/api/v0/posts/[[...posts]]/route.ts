import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(
    request: NextRequest, 
    { params }: {params: {posts:string}}
    ) {
    const supabase = await createClient();
    console.log(params.posts)
    if (!params.posts) {
        const { data, error } = await supabase.rpc('get_posts', {category_filter: ['sleep_rest']});
        return new Response(JSON.stringify({message: data}), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        })
    }
    return new Response(JSON.stringify({message: params}), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    })
}