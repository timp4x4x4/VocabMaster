import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

/**
 * 取得當前使用者資料
 * GET /api/auth/me
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('session_token')?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: '未登入' },
        { status: 401 }
      )
    }
    
    // 解析 session token
    const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8')
    const [userId] = decoded.split(':')
    
    if (!userId) {
      return NextResponse.json(
        { error: '無效的 session' },
        { status: 401 }
      )
    }
    
    // 使用 Admin Client 取得使用者資料（繞過 RLS）
    const adminSupabase = createAdminSupabaseClient()
    const { data: user, error } = await adminSupabase
      .from('users')
      .select('id, email, username, full_name, avatar_url, daily_goal, language, timezone, total_words_learned, streak_count, created_at')
      .eq('id', userId)
      .single()
    
    if (error || !user) {
      return NextResponse.json(
        { error: '使用者不存在' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { user },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('取得使用者資料錯誤:', error)
    return NextResponse.json(
      { error: '取得使用者資料失敗' },
      { status: 500 }
    )
  }
}

