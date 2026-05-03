import { NextResponse } from 'next/server'

export function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export function corsResponse(data, status = 200) {
  return handleCORS(NextResponse.json(data, { status }))
}

export async function handleOPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}
