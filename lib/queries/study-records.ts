import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * 學習記錄相關的資料查詢函數
 */

export interface StudyRecord {
  id: string
  user_id: string
  study_date: string
  words_count: number
  study_time_minutes: number
  created_at: string
  updated_at: string
}

/**
 * 取得使用者的學習記錄
 */
export async function getStudyRecords(userId: string, options?: {
  startDate?: Date
  endDate?: Date
  limit?: number
}) {
  const supabase = createServerSupabaseClient()
  
  let query = supabase
    .from('study_records')
    .select('*')
    .eq('user_id', userId)

  // 日期範圍過濾
  if (options?.startDate) {
    query = query.gte('study_date', options.startDate.toISOString().split('T')[0])
  }
  if (options?.endDate) {
    query = query.lte('study_date', options.endDate.toISOString().split('T')[0])
  }

  // 排序（最新的在前）
  query = query.order('study_date', { ascending: false })

  // 限制數量
  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`取得學習記錄失敗: ${error.message}`)
  }

  return data as StudyRecord[]
}

/**
 * 取得特定日期的學習記錄
 */
export async function getStudyRecordByDate(userId: string, date: Date) {
  const supabase = createServerSupabaseClient()
  
  const dateString = date.toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('study_records')
    .select('*')
    .eq('user_id', userId)
    .eq('study_date', dateString)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // 沒有找到記錄
      return null
    }
    throw new Error(`取得學習記錄失敗: ${error.message}`)
  }

  return data as StudyRecord
}

/**
 * 取得使用者的學習統計
 */
export async function getUserStudyStats(userId: string) {
  const supabase = createServerSupabaseClient()
  
  // 今日學習記錄
  const today = new Date()
  const todayRecord = await getStudyRecordByDate(userId, today)
  
  // 本週學習記錄
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekRecords = await getStudyRecords(userId, {
    startDate: weekAgo,
    endDate: today,
  })
  
  // 計算本週總學習單字數
  const weekWordsCount = weekRecords.reduce((sum, record) => sum + record.words_count, 0)
  
  // 總學習單字數（從使用者表取得）
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('total_words_learned')
    .eq('id', userId)
    .single()

  if (userError) {
    throw new Error(`取得使用者資料失敗: ${userError.message}`)
  }

  return {
    todayWordsCount: todayRecord?.words_count || 0,
    weekWordsCount,
    totalWordsCount: userData.total_words_learned || 0,
    streakCount: userData.streak_count || 0,
  }
}

