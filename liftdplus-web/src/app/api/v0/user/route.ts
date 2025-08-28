import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/server"

// Toggle this via environment variable to switch between dev mode (hardcoded user) and production (real auth)
// const USE_DEV_MODE = process.env.API_DEV_MODE === 'true';
const USE_DEV_MODE = true;
const DEV_USER_ID = process.env.DEV_USER_ID || "153ac42d-e0f7-4cfd-aaa6-14302482e7fb";

export async function GET(request: NextRequest) {
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
                return new Response(JSON.stringify({ error: "Not authenticated" }), {
                    status: 401,
                    headers: { "Content-Type": "application/json" }
                });
            }
            
            userId = user.id;
        }
        
        const { data, error } = await supabase.rpc('get_user', { user_id: userId });

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify(data[0] || {}), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            error: "Internal server error",
            message: error instanceof Error ? error.message : "Unknown error"
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
