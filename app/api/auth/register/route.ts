import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { hashPassword } from '@/lib/auth/password'
import { signupFormSchema } from '@/lib/validations/auth'

// 標記為動態路由（因為使用了 createServerSupabaseClient，內部使用 cookies）
export const dynamic = 'force-dynamic'

/**
 * 註冊 API Route
 * POST /api/auth/register
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 驗證輸入
    const validatedData = signupFormSchema.parse(body)
    
    // 使用一般 client 檢查 email（因為只是讀取）
    const supabase = createServerSupabaseClient()
    
    // 檢查 email 是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', validatedData.email)
      .single()
    
    if (existingUser) {
      return NextResponse.json(
        { error: '此電子郵件已被註冊' },
        { status: 400 }
      )
    }
    
    // 雜湊密碼
    const hashedPassword = await hashPassword(validatedData.password)
    
    // 使用 Admin client 來插入（繞過 RLS）
    const adminSupabase = createAdminSupabaseClient()
    
    // 建立使用者
    // 注意：如果 users.id 是外鍵指向 auth.users.id，則需要先建立 auth 使用者
    // 這裡假設 users.id 是獨立的 UUID
    const { data: newUser, error: insertError } = await adminSupabase
      .from('users')
      .insert({
        email: validatedData.email,
        password: hashedPassword, // 儲存雜湊後的密碼
        daily_goal: 10,
        language: 'zh-TW',
        timezone: 'Asia/Taipei',
      })
      .select('id, email, username, full_name, avatar_url, daily_goal, language, timezone, total_words_learned, streak_count, created_at, updated_at')
      .single()
    
    if (insertError) {
      console.error('註冊錯誤:', insertError)
      return NextResponse.json(
        { error: '註冊失敗，請稍後再試' },
        { status: 500 }
      )
    }
    
    // 不返回密碼（select 時已經排除了 password）
    return NextResponse.json(
      {
        message: '註冊成功',
        user: newUser,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('註冊錯誤:', error)
    
    // Zod 驗證錯誤
    if (error.issues) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || '註冊失敗，請稍後再試' },
      { status: 500 }
    )
  }
}

