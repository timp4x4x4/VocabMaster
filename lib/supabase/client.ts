import { createBrowserClient } from '@supabase/supabase-js'

/**
 * Client-side Supabase client
 * 用於 Client Components 中進行使用者互動操作
 * 
 * 使用範例:
 * ```tsx
 * 'use client'
 * import { createClientSupabaseClient } from '@/lib/supabase/client'
 * 
 * export function LoginButton() {
 *   const supabase = createClientSupabaseClient()
 *   const handleLogin = async () => {
 *     await supabase.auth.signInWithPassword({ email, password })
 *   }
 *   return <button onClick={handleLogin}>登入</button>
 * }
 * ```
 */
export function createClientSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

