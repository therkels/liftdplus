import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"

// Toggle this via environment variable to switch between dev mode (hardcoded user) and production (real auth)
const USE_DEV_MODE = process.env.API_DEV_MODE === 'true';
const DEV_USER_ID = process.env.DEV_USER_ID || "153ac42d-e0f7-4cfd-aaa6-14302482e7fb";

export async function GET(
    request: NextRequest, 
    { params }: {params: {posts: string[]}}
    ) {
    try {
        const supabase = await createClient();
        
        let userId: string;
        
        if (USE_DEV_MODE) {
            // Development mode: use hardcoded user ID
            userId = DEV_USER_ID;
        } else {
            // Production mode: use real authentication
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            
            if (!user) {
                return new Response(JSON.stringify({error:"Not authenticated."}),{
                    status:401,
                    headers: {'Content-Type':"application/json"}
                })
            }
            
            userId = user.id;
        }

        const param_list = params.posts || [];
        const url = new URL(request.url);
        
        //case 1: Get all posts
        if (param_list.length === 0) {
            //get each filter requirement, if exists
            const { data, error } = await supabase.rpc('get_posts', {
                user_id: userId,
                category_filter:url.searchParams.getAll('category'),
                audience_filter:url.searchParams.getAll('audience'),
                format_filter:url.searchParams.getAll('format'),
                sort_by: url.searchParams.get('sort_by') || 'popular'
            });
            
            if (error) {
                console.error("Error fetching posts:", error);
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }
            
            return new Response(JSON.stringify(data), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            })
        }
        //case 2: Get single post by ID
        else if (param_list.length === 1) {
            const { data, error } = await supabase.rpc('get_post', {
                post_id: param_list[0],
                user_id: userId,
            });
            
            if (error) {
                console.error("Error fetching post:", error);
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }
            
            // Return the first item (single post) instead of wrapping in message
            return new Response(JSON.stringify(data[0] || {}), {
                status: 200,
                headers: { "Content-Type": "application/json" }
            })
        }
        
        // Invalid route
        return new Response(JSON.stringify({ error: "Invalid route" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
        
    } catch (error) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ 
            error: "Internal server error",
            message: error instanceof Error ? error.message : "Unknown error"
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}