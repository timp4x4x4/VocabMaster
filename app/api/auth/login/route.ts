import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { verifyPassword } from '@/lib/auth/password'
import { loginFormSchema } from '@/lib/validations/auth'
import { cookies } from 'next/headers'

/**
 * 登入 API Route
 * POST /api/auth/login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 驗證輸入
    const validatedData = loginFormSchema.parse(body)
    
    // 使用 Admin Client 來查詢使用者（因為需要讀取 password，且可能被 RLS 阻擋）
    const adminSupabase = createAdminSupabaseClient()
    
    // 查詢使用者
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id, email, password, username, full_name, avatar_url, daily_goal, language, timezone, total_words_learned, streak_count, created_at')
      .eq('email', validatedData.email)
      .single()
    
    if (userError) {
      console.error('查詢使用者錯誤:', userError)
      // 如果是找不到使用者，返回一般錯誤訊息（不洩露 email 是否存在）
      if (userError.code === 'PGRST116') {
        return NextResponse.json(
          { error: '電子郵件或密碼錯誤' },
          { status: 401 }
        )
      }
      return NextResponse.json(
        { error: '登入失敗，請稍後再試' },
        { status: 500 }
      )
    }
    
    if (!user) {
      return NextResponse.json(
        { error: '電子郵件或密碼錯誤' },
        { status: 401 }
      )
    }
    
    // 驗證密碼
    if (!user.password) {
      return NextResponse.json(
        { error: '此帳號尚未設定密碼' },
        { status: 401 }
      )
    }
    
    const isPasswordValid = await verifyPassword(
      validatedData.password,
      user.password
    )
    
    if (!isPasswordValid) {
      console.error('密碼驗證失敗:', {
        email: validatedData.email,
        hasPassword: !!user.password,
        passwordLength: user.password?.length,
      })
      return NextResponse.json(
        { error: '電子郵件或密碼錯誤' },
        { status: 401 }
      )
    }
    
    // 更新最後登入時間（使用同一個 admin client）
    await adminSupabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id)
    
    // 建立 session（使用 Supabase Auth 或自訂 session）
    // 這裡我們使用簡單的方式，你可以根據需求調整
    const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')
    
    // 設定 cookie（使用 Next.js cookies）
    const cookieStore = cookies()
    cookieStore.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 天
    })
    
    // 不返回密碼
    const { password, ...userWithoutPassword } = user
    
    return NextResponse.json(
      {
        message: '登入成功',
        user: userWithoutPassword,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('登入錯誤:', error)
    
    // Zod 驗證錯誤
    if (error.issues) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || '登入失敗，請稍後再試' },
      { status: 500 }
    )
  }
}

