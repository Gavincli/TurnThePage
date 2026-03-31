import { createClient } from '@supabase/supabase-js'

type ViteEnv = {
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_ANON_KEY: string
}

const env = (import.meta as ImportMeta & { env: ViteEnv }).env
const supabaseUrl = env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY?.trim()

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment and redeploy.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
