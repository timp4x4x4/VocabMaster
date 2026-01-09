import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { verifyPassword } from '@/lib/auth/password'
import { cookies } from 'next/headers'

/**
 * 刪除帳號
 * DELETE /api/settings/delete-account
 */
export async function DELETE(request: NextRequest) {
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
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: '請提供密碼以確認刪除' },
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

    // 驗證密碼
    const isPasswordValid = await verifyPassword(password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: '密碼錯誤' },
        { status: 401 }
      )
    }

    // 刪除頭像（如果有的話）
    try {
      const { data: listData } = await adminSupabase.storage
        .from('avatars')
        .list(`Avatar/${userId}`)

      if (listData && listData.length > 0) {
        const filesToDelete = listData.map(file => `Avatar/${userId}/${file.name}`)
        await adminSupabase.storage
          .from('avatars')
          .remove(filesToDelete)
      }
    } catch (storageError) {
      console.error('刪除頭像錯誤:', storageError)
      // 繼續刪除帳號，即使頭像刪除失敗
    }

    // 刪除使用者資料（CASCADE 會自動刪除相關資料）
    const { error: deleteError } = await adminSupabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (deleteError) {
      console.error('刪除使用者錯誤:', deleteError)
      return NextResponse.json(
        { error: '刪除帳號失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: '帳號已刪除' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('刪除帳號錯誤:', error)
    return NextResponse.json(
      { error: error.message || '刪除帳號失敗' },
      { status: 500 }
    )
  }
}

