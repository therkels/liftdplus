import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(
    request: NextRequest, 
    { params }: {params: {posts:string}}
    ) {
    const supabase = await createClient();
    const param_list = params.posts || [];
    const url = new URL(request.url);
    //case 1: Get all posts
    if (param_list.length === 0) {
        //get each filter requirement, if exists
        const { data, error } = await supabase.rpc('get_posts', {
            category_filter:url.searchParams.getAll('category'),
            audience_filter:url.searchParams.getAll('audience'),
            format_filter:url.searchParams.getAll('format'),
            sort_by: url.searchParams.get('sort_by') || 'popular'
        });
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