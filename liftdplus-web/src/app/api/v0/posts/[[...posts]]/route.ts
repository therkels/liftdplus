import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"


export async function GET(
    request: NextRequest, 
    { params }: {params: {posts:string}}
    ) {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();

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
      return getAllPosts(supabase, user.id,url);
    }
    //get by post 
    else if (param_list.length === 1) {
        return getPostByID(supabase,param_list[0], user.id)
    }
    else if (param_list.length == 2) {
        if (param_list[2] === "archive") {

        }
    }
}

export async function PUT(request: NextRequest, { params }: {params: {posts:string}}) {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();

    if (!user) {
        return new Response(JSON.stringify({error:"Not authenticated."}),{
            status:401,
            headers: {'Content-Type':"application/json"}
        })
    }

    const param_list = params.posts || [];
    const url = new URL(request.url);



    
}

export async function DELETE(request: NextRequest, { params }: {params: {posts:string}}) {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();

    if (!user) {
        return new Response(JSON.stringify({error:"Not authenticated."}),{
            status:401,
            headers: {'Content-Type':"application/json"}
        })
    }

    const param_list = params.posts || [];
    const url = new URL(request.url);

    

    
}

async function getAllPosts(supabase: any, user_id:string, url: URL) {
    const { data, error } = await supabase.rpc('get_posts', {
        user_id: user_id,
        category_filter:url.searchParams.getAll('category'),
        audience_filter:url.searchParams.getAll('audience'),
        format_filter:url.searchParams.getAll('format'),
        sort_by: url.searchParams.get('sort_by') || 'popular'
    })
    console.log(error)
    return jsonResponse(data)
}
async function getPostByID(supabase: any, post_id: string, user_id: string) {
    const { data, error } = await supabase.rpc('get_post', {
        post_id:post_id,
        user_id:user_id,
    });
    return new Response(JSON.stringify({message: data}), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    })
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}