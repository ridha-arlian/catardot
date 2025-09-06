import { createBrowserClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createClient = () => createBrowserClient(supabaseUrl, supabaseKey)

export const setSupabaseAuth = (client: ReturnType<typeof createClient>, supabaseAccessToken: string) => {
  client.auth.setSession({
    access_token: supabaseAccessToken,
    refresh_token: '',
  })
}

export const createApiClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseKey)
}

export const createAdminClient = () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  
  return createSupabaseClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
}