import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false } }
)

// Client-side Supabase client with anon key (respects RLS)
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)
