import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"


export async function GET(
    request: NextRequest, 
    { params }: {params: {posts:string}}
    ) {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();

    if (!user) {
        return jsonResponse({error:'not Authenticated'}, 400);
    }

    const param_list = params.posts || [];
    const url = new URL(request.url);

    return jsonResponse({message:'archive route'})
}

export async function PUT(request: NextRequest, { params }: {params: {posts:string}}) {
    const supabase = await createClient();
    const {data: {user}} = await supabase.auth.getUser();

    if (!user) {
        return jsonResponse({error:'not Authenticated'}, 400);
    }

    const param_list = params.posts || [];
    const url = new URL(request.url);

    if (param_list.length === 2) {
        if (param_list[1] == 'archive'){
            const category = url.searchParams.get('category')
            if (!category) {
                return jsonResponse({error:'a category is required for archives'})
            }
            return putArchivedPost(supabase, param_list[0], user.id, url.searchParams.get('category')||'')
        }
        else if (param_list[1] == 'like'){
            return putLikePost(supabase, param_list[0], user.id)
        }
    }


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
    if (param_list.length === 2) {
        if (param_list[1] == 'archive'){
            return deleteArchivedPost(supabase, param_list[0], user.id)
        }
        else if (param_list[1] == 'like'){
            return deleteLikePost(supabase, param_list[0], user.id)
        }
    }
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


function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}