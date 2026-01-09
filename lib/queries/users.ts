import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * 使用者相關的資料查詢函數
 */

export interface User {
  id: string
  email: string
  password?: string // 密碼（雜湊後），通常不應該返回給前端
  username: string | null
  full_name: string | null
  avatar_url: string | null
  daily_goal: number
  language: string
  timezone: string
  total_words_learned: number
  streak_count: number
  last_study_date: string | null
  last_login_at: string | null
  created_at: string
  updated_at: string
}

/**
 * 取得當前使用者資料
 */
export async function getCurrentUser() {
  const supabase = createServerSupabaseClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return null
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    // 如果使用者表還沒有記錄，返回 null
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`取得使用者資料失敗: ${error.message}`)
  }

  return data as User
}

/**
 * 取得使用者資料（根據 ID）
 */
export async function getUserById(userId: string) {
  const supabase = createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    throw new Error(`取得使用者資料失敗: ${error.message}`)
  }

  return data as User
}

