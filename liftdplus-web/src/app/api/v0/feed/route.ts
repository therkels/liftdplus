import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const {
        data: {user}
    } = await supabase.auth.getUser();

    if (!user) {
        console.log("Feed API: No authenticated user");
        return new Response(JSON.stringify({error:"Not authenticated."}),{
            status:401,
            headers: {'Content-Type':"application/json"}
        })
    }

    console.log("Feed API: Authenticated user:", user.id);

    // First, let's check user preferences using RPC
    const { data: preferences, error: prefError } = await supabase
        .rpc('get_user_preferences', { user_id: user.id });
    
    console.log("Feed API: User preferences:", preferences);
    console.log("Feed API: Preferences error:", prefError);

    // Check if user has any topic preferences
    const topicPreferences = preferences?.filter((p: any) => p.tag?.category === 'topic') || [];
    console.log("Feed API: Topic preferences:", topicPreferences);

    // Get all posts to see what's available using RPC
    const { data: allPosts, error: postsError } = await supabase
        .rpc('get_all_published_posts');
    
    console.log("Feed API: All published posts count:", allPosts?.length || 0);
    console.log("Feed API: Sample posts:", allPosts?.slice(0, 3));

    // Check for posts with "sleep" related tags
    const sleepPosts = allPosts?.filter((post: any) => 
        post.topic_tags?.toLowerCase().includes('sleep') ||
        post.topic_tags?.toLowerCase().includes('rest')
    );
    console.log("Feed API: Sleep/rest related posts:", sleepPosts);

    // Now call the feed function
    const { data, error } = await supabase.rpc('get_user_feed', { user_id: user.id });
    
    console.log("Feed API: get_user_feed result:", data);
    console.log("Feed API: get_user_feed error:", error);
    
    if (error) {
        console.error("Feed API: Database error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }

    console.log("Feed API: Returning feed with", data?.length || 0, "topics");
    
    // Transform the data to match expected format
    const transformedData = data?.map((topic: any) => ({
        topic_id: topic.topic_id,
        topic_display: topic.topic_display,
        posts: Array.isArray(topic.posts) ? topic.posts : []
    })) || [];
    
    return new Response(JSON.stringify({ topics: transformedData }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}