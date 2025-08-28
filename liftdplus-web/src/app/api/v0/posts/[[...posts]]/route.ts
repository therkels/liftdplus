import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(
    request: NextRequest, 
    { params }: {params: {posts:string}}
    ) {
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
    const param_list = params.posts || [];
    const url = new URL(request.url);
    //case 1: Get all posts
    if (param_list.length === 0) {
        //get each filter requirement, if exists
        const { data, error } = await supabase.rpc('get_posts', {
            category_filter: url.searchParams.getAll('category'),
            audience_filter: url.searchParams.getAll('audience'),
            format_filter: url.searchParams.getAll('format'),
            sort_by: url.searchParams.get('sort_by') || 'popular'
        });
        
        if (error) {
            console.error("Error fetching posts:", error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
        
        return new Response(JSON.stringify({ posts: data?.[0]?.posts || [] }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        })
    }
    //get by post 
    else if (param_list.length === 1) {
        const { data, error } = await supabase.rpc('get_post', {
            post_id: param_list[0],
            user_id: user.id,
        });
        
        if (error) {
            console.error("Error fetching post:", error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
        
        return new Response(JSON.stringify({ post: data?.[0] || null }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        })
    }
    
    // Invalid number of parameters
    return new Response(JSON.stringify({error: "Invalid number of parameters"}), {
        status: 400,
        headers: { "Content-Type": "application/json" }
    })
}