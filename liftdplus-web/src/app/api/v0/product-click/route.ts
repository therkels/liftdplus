import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const destination = searchParams.get('destination')
  if (!destination) {
    return NextResponse.json({ error: 'Missing destination' }, { status: 400 })
  }
  return NextResponse.redirect(decodeURIComponent(destination))
}
