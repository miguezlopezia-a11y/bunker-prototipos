import { NextResponse } from 'next/server'

function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

export async function GET() {
  return handleCORS(NextResponse.json({
    status: 'ok',
    service: 'Corrector de Examenes',
    database: 'Supabase PostgreSQL',
    version: '2.0.0'
  }))
}
