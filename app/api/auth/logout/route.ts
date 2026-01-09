import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// 標記為動態路由（因為使用了 cookies）
export const dynamic = 'force-dynamic'

/**
 * 登出 API Route
 * POST /api/auth/logout
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    
    // 刪除 session cookie
    cookieStore.delete('session_token')
    
    return NextResponse.json(
      { message: '登出成功' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('登出錯誤:', error)
    return NextResponse.json(
      { error: '登出失敗，請稍後再試' },
      { status: 500 }
    )
  }
}

