import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { verifyPassword, hashPassword } from '@/lib/auth/password'
import { cookies } from 'next/headers'

// 標記為動態路由（因為使用了 cookies）
export const dynamic = 'force-dynamic'

/**
 * 更新密碼
 * PUT /api/settings/password
 */
export async function PUT(request: NextRequest) {
  try {
    // 取得當前使用者
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('session_token')?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: '未登入' },
        { status: 401 }
      )
    }

    const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8')
    const [userId] = decoded.split(':')
    
    if (!userId) {
      return NextResponse.json(
        { error: '無效的 session' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '請提供目前密碼和新密碼' },
        { status: 400 }
      )
    }

    const adminSupabase = createAdminSupabaseClient()

    // 取得使用者資料（包含密碼）
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('id, password')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: '使用者不存在' },
        { status: 404 }
      )
    }

    if (!user.password) {
      return NextResponse.json(
        { error: '此帳號尚未設定密碼' },
        { status: 400 }
      )
    }

    // 驗證目前密碼
    const isPasswordValid = await verifyPassword(currentPassword, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '目前密碼錯誤' },
        { status: 401 }
      )
    }

    // 雜湊新密碼
    const hashedPassword = await hashPassword(newPassword)

    // 更新密碼
    const { error: updateError } = await adminSupabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', userId)

    if (updateError) {
      console.error('更新密碼錯誤:', updateError)
      return NextResponse.json(
        { error: '更新密碼失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: '密碼已更新' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('更新密碼錯誤:', error)
    return NextResponse.json(
      { error: error.message || '更新密碼失敗' },
      { status: 500 }
    )
  }
}

