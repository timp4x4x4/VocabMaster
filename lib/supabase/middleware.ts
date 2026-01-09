import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Supabase middleware helper
 * 用於 middleware.ts 中刷新使用者 session
 */
export async function updateSession(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({
      request,
    })

    // 檢查環境變數
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase 環境變數未設定')
      return supabaseResponse
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // 刷新使用者 session（如果失敗，只記錄錯誤但不中斷請求）
    try {
      await supabase.auth.getUser()
    } catch (authError) {
      // Session 驗證失敗是正常的（例如未登入），只記錄錯誤但不中斷
      console.debug('Session 驗證失敗（可能未登入）:', authError)
    }

    return supabaseResponse
  } catch (error) {
    // 如果 middleware 發生錯誤，記錄並返回正常響應（避免中斷所有請求）
    console.error('Middleware 錯誤:', error)
    return NextResponse.next({
      request,
    })
  }
}

