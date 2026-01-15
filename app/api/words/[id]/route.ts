import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { wordFormSchema } from '@/lib/validations/word'

export const dynamic = 'force-dynamic'

/**
 * 更新單字
 * PUT /api/words/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 驗證輸入（移除 word_set_id 的必填要求，因為更新時不需要）
    const { word_set_id, ...updateData } = wordFormSchema.parse(body)

    // 使用 Admin Client 來更新單字（繞過 RLS）
    const adminSupabase = createAdminSupabaseClient()
    
    const { data, error } = await adminSupabase
      .from('words')
      .update({
        english: updateData.english,
        chinese: updateData.chinese,
        pronunciation: updateData.pronunciation || null,
        example: updateData.example || null,
        category: updateData.category || null,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('更新單字錯誤:', error)
      return NextResponse.json(
        { error: error.message || '更新單字失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: '更新單字成功', word: data },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('更新單字錯誤:', error)
    
    // Zod 驗證錯誤
    if (error.issues) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || '更新單字失敗，請稍後再試' },
      { status: 500 }
    )
  }
}

/**
 * 刪除單字
 * DELETE /api/words/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 使用 Admin Client 來刪除單字（繞過 RLS）
    const adminSupabase = createAdminSupabaseClient()
    
    const { error } = await adminSupabase
      .from('words')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('刪除單字錯誤:', error)
      return NextResponse.json(
        { error: error.message || '刪除單字失敗' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: '刪除單字成功' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('刪除單字錯誤:', error)
    return NextResponse.json(
      { error: error.message || '刪除單字失敗，請稍後再試' },
      { status: 500 }
    )
  }
}

