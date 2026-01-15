import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import { importWordSetToUser, hasUserImportedWordSet, removeUserWordSet } from '@/lib/queries/word-sets'

export const dynamic = 'force-dynamic'

/**
 * 匯入單字集到使用者帳號
 * POST /api/word-sets/import
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
    const { wordSetId } = body

    if (!wordSetId) {
      return NextResponse.json(
        { error: '缺少 wordSetId 參數' },
        { status: 400 }
      )
    }

    // 檢查是否已匯入
    const alreadyImported = await hasUserImportedWordSet(userId, wordSetId)
    if (alreadyImported) {
      return NextResponse.json(
        { error: '此單字集已經匯入到您的帳號' },
        { status: 400 }
      )
    }

    // 匯入單字集
    await importWordSetToUser(userId, wordSetId)

    return NextResponse.json(
      { message: '匯入成功' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('匯入單字集錯誤:', error)
    return NextResponse.json(
      { error: error.message || '匯入失敗，請稍後再試' },
      { status: 500 }
    )
  }
}

/**
 * 檢查使用者是否已匯入某個單字集
 * GET /api/word-sets/import?wordSetId=xxx
 */
export async function GET(request: NextRequest) {
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

    // 取得查詢參數
    const { searchParams } = new URL(request.url)
    const wordSetId = searchParams.get('wordSetId')

    if (!wordSetId) {
      return NextResponse.json(
        { error: '缺少 wordSetId 參數' },
        { status: 400 }
      )
    }

    // 檢查是否已匯入
    const isImported = await hasUserImportedWordSet(userId, wordSetId)

    return NextResponse.json(
      { isImported },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('檢查匯入狀態錯誤:', error)
    return NextResponse.json(
      { error: error.message || '檢查失敗，請稍後再試' },
      { status: 500 }
    )
  }
}

/**
 * 取消匯入單字集（移除使用者匯入的單字集）
 * DELETE /api/word-sets/import
 */
export async function DELETE(request: NextRequest) {
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
    const { wordSetId } = body

    if (!wordSetId) {
      return NextResponse.json(
        { error: '缺少 wordSetId 參數' },
        { status: 400 }
      )
    }

    // 移除單字集
    await removeUserWordSet(userId, wordSetId)

    return NextResponse.json(
      { message: '已取消匯入' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('取消匯入單字集錯誤:', error)
    return NextResponse.json(
      { error: error.message || '取消匯入失敗，請稍後再試' },
      { status: 500 }
    )
  }
}

