import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { wordSetFormSchema } from '@/lib/validations/word-set'

export const dynamic = 'force-dynamic'

/**
 * 新增單字集
 * POST /api/word-sets
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
    const validatedData = wordSetFormSchema.parse(body)

    // 使用 Admin Client 來插入單字集（繞過 RLS）
    const adminSupabase = createAdminSupabaseClient()
    
    const { data, error } = await adminSupabase
      .from('word_sets')
      .insert({
        title: validatedData.title,
        description: validatedData.description || null,
        category: validatedData.category || null,
        difficulty: validatedData.difficulty || null,
        tags: validatedData.tags || null,
        public: validatedData.public ?? true,
        word_count: 0, // 新建立的單字集初始單字數為 0
      })
      .select()
      .single()

    if (error) {
      console.error('新增單字集錯誤:', error)
      return NextResponse.json(
        { error: error.message || '新增單字集失敗' },
        { status: 500 }
      )
    }

    // 自動將新建立的單字集匯入到使用者的帳號
    await adminSupabase
      .from('user_word_sets')
      .insert({
        user_id: userId,
        word_set_id: data.id,
      })

    return NextResponse.json(
      { message: '新增單字集成功', wordSet: data },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('新增單字集錯誤:', error)
    
    // Zod 驗證錯誤
    if (error.issues) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || '新增單字集失敗，請稍後再試' },
      { status: 500 }
    )
  }
}

