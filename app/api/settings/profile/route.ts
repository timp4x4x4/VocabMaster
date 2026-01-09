import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

/**
 * 更新個人資料
 * PUT /api/settings/profile
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

    const formData = await request.formData()
    const username = formData.get('username') as string | null
    const full_name = formData.get('full_name') as string | null
    const avatarFile = formData.get('avatar') as File | null

    const adminSupabase = createAdminSupabaseClient()
    const updateData: any = {}

    // 更新基本資料（只有在表單有提供值時才更新）
    if (username !== null) {
      updateData.username = username.trim() || null
    }
    if (full_name !== null) {
      updateData.full_name = full_name.trim() || null
    }

    // 處理頭像上傳
    if (avatarFile && avatarFile.size > 0) {
      try {
        // 路徑結構：avatars/Avatar/{userId}/image（沒有副檔名）
        const filePath = `Avatar/${userId}/image`

        // 檢查 Supabase Bucket 是否存在
        const { data: bucketList, error: bucketError } = await adminSupabase.storage.listBuckets()
        if (bucketError) {
          console.error('無法列出 Buckets:', bucketError)
        } else {
          const avatarsBucket = bucketList?.find(b => b.name === 'avatars')
          if (!avatarsBucket) {
            console.error('找不到 avatars bucket')
            return NextResponse.json(
              { error: '找不到 avatars bucket，請確認 Supabase Storage 設定' },
              { status: 500 }
            )
          }
        }

        // 上傳到 Supabase Storage
        const { data: uploadData, error: uploadError } = await adminSupabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, {
            upsert: true,
            contentType: avatarFile.type,
          })

        if (uploadError) {
          console.error('上傳頭像失敗:', uploadError)
          return NextResponse.json(
            { error: '上傳頭像失敗: ' + uploadError.message },
            { status: 500 }
          )
        }

        // 取得公開 URL
        const { data: urlData } = adminSupabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        if (urlData && urlData.publicUrl) {
          // 添加時間戳以避免快取
          const publicUrlWithTimestamp = `${urlData.publicUrl}?t=${Date.now()}`
          updateData.avatar_url = publicUrlWithTimestamp
        } else {
          console.error('無法取得頭像公開 URL')
          return NextResponse.json(
            { error: '無法取得頭像 URL' },
            { status: 500 }
          )
        }
      } catch (uploadException: any) {
        console.error('上傳過程發生例外:', uploadException)
        return NextResponse.json(
          { error: '上傳頭像時發生錯誤: ' + uploadException.message },
          { status: 500 }
        )
      }
    }

    // 檢查是否有需要更新的資料
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: '沒有需要更新的資料' },
        { status: 400 }
      )
    }

    // 更新使用者資料
    const { data: updatedUser, error: updateError } = await adminSupabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, email, username, full_name, avatar_url, daily_goal, language, timezone, total_words_learned, streak_count, created_at')
      .single()

    if (updateError) {
      console.error('更新使用者資料錯誤:', updateError)
      return NextResponse.json(
        { error: '更新失敗: ' + updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: '個人資料已更新', user: updatedUser },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('更新個人資料錯誤:', error)
    return NextResponse.json(
      { error: error.message || '更新失敗' },
      { status: 500 }
    )
  }
}
