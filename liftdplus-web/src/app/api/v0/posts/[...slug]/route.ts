import type { NextRequest } from "next/server"

export async function GET(request:NextRequest) {
    return new Response('Hello, here is an API!', {
        status:200,
    })
}