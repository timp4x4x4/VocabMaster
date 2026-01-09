import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * Session 管理工具
 * 用於在 Server Components 中取得當前登入的使用者
 */

/**
 * 取得當前登入的使用者
 * 從 cookie 中讀取 session token 並驗證
 */
export async function getCurrentUserFromSession() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('session_token')?.value
    
    if (!sessionToken) {
      return null
    }
    
    // 解析 session token（簡單實作，你可以根據需求調整）
    const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8')
    const [userId] = decoded.split(':')
    
    if (!userId) {
      return null
    }
    
    // 從資料庫取得使用者資料
    const supabase = createServerSupabaseClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, username, full_name, avatar_url, daily_goal, language, timezone, total_words_learned, streak_count, created_at')
      .eq('id', userId)
      .single()
    
    if (error || !user) {
      return null
    }
    
    return user
  } catch (error) {
    console.error('取得 session 錯誤:', error)
    return null
  }
}

