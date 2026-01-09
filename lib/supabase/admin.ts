import { createClient } from '@supabase/supabase-js'

/**
 * Admin Supabase client
 * 使用 Service Role Key 來繞過 RLS
 * 僅用於伺服器端的管理操作（如註冊、管理使用者等）
 * 
 * ⚠️ 警告：Service Role Key 有完整權限，只能在伺服器端使用！
 * 絕對不要暴露給瀏覽器端！
 */
export function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY 環境變數未設定')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

