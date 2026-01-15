import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { wordFormSchema } from '@/lib/validations/word'

export const dynamic = 'force-dynamic'

/**
 * 新增單字
 * POST /api/words
 */
export async function POST(request: NextRequest) {
  try {
    // 取得使用者 ID
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

    // 取得請求 body
    const body = await request.json()

    // 驗證輸入
    const validatedData = wordFormSchema.parse(body)

    // 使用 Admin Client 來插入單字（繞過 RLS）
    const adminSupabase = createAdminSupabaseClient()
    
    const { data, error } = await adminSupabase
      .from('words')
      .insert({
        english: validatedData.english,
        chinese: validatedData.chinese,
        pronunciation: validatedData.pronunciation || null,
        example: validatedData.example || null,
        category: validatedData.category || null,
        word_set_id: validatedData.word_set_id,
      })
      .select()
      .single()

    if (error) {
      console.error('新增單字錯誤:', error)
      return NextResponse.json(
        { error: error.message || '新增單字失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: '新增單字成功', word: data },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('新增單字錯誤:', error)
    
    // Zod 驗證錯誤
    if (error.issues) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || '新增單字失敗，請稍後再試' },
      { status: 500 }
    )
  }
}

