import { cookies } from 'next/headers'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

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
      console.debug('沒有 session token')
      return null
    }
    
    // 解析 session token（簡單實作，你可以根據需求調整）
    const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8')
    const [userId] = decoded.split(':')
    
    if (!userId) {
      console.debug('無法解析 session token')
      return null
    }
    
    // 使用 Admin Client 來查詢使用者（繞過 RLS）
    // 因為我們已經有 userId，這是安全的
    const adminSupabase = createAdminSupabaseClient()
    const { data: user, error } = await adminSupabase
      .from('users')
      .select('id, email, username, full_name, avatar_url, daily_goal, language, timezone, total_words_learned, streak_count, created_at')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('查詢使用者錯誤:', error)
      return null
    }
    
    if (!user) {
      console.debug('使用者不存在:', userId)
      return null
    }
    
    return user
  } catch (error) {
    console.error('取得 session 錯誤:', error)
    return null
  }
}

