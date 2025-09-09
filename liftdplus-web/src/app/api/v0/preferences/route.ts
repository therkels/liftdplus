import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new Response(JSON.stringify({error:"Not authenticated."}),{
            status:401,
            headers: {'Content-Type':"application/json"}
        })
    }


    // Get user preferences with tag info - using RPC to access private schema
    const { data: preferences, error } = await supabase
        .rpc('get_user_preferences', { user_id: user.id });

    await supabase.from('event_logs').insert([
        {
            event_type: 'get_preferences',
            details: {},
            user_id: user.id
        }
    ]);
    if (error) {
        console.error("Error fetching preferences:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }

    return new Response(JSON.stringify({ preferences: preferences || [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return new Response(JSON.stringify({error:"Not authenticated."}),{
            status:401,
            headers: {'Content-Type':"application/json"}
        })
    }

    const body = await request.json();
    const { interests } = body; // Array of interest display names

    if (!Array.isArray(interests)) {
        return new Response(JSON.stringify({error:"Invalid interests format"}),{
            status:400,
            headers: {'Content-Type':"application/json"}
        })
    }

    console.log("Saving preferences for user:", user.id, "interests:", interests);

    try {
        // First, get tag IDs for the interest display names - using RPC to access private schema
        const { data: tags, error: tagsError } = await supabase
            .rpc('get_tags_by_names', { 
                tag_names: interests,
                tag_category: 'topic' 
            });

        if (tagsError) {
            console.error("Error fetching tags:", tagsError);
            throw tagsError;
        }

        console.log("Found tags for interests:", tags);

        // Update user preferences using RPC function
        const { error: updateError } = await supabase
            .rpc('update_user_preferences', {
              p_user_id: user.id,
              p_tag_ids: tags?.map((tag: any) => tag.id) || []
            });

        if (updateError) {
            console.error("Error updating preferences:", updateError);
            throw updateError;
        }

        return new Response(JSON.stringify({ 
            message: "Preferences updated successfully",
            saved_preferences: tags?.map((t: any) => t.display_name) || [],
            user_id: user.id
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Error updating preferences:", error);
        return new Response(JSON.stringify({ 
            error: error instanceof Error ? error.message : "Failed to update preferences" 
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
