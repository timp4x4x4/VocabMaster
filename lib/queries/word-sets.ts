import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'

/**
 * 單字集相關的資料查詢函數
 */

export interface WordSet {
  id: string
  title: string
  description: string | null
  category: string | null
  difficulty: string | null
  word_count: number
  tags: string[] | null
  created_at: string
  updated_at: string
}

/**
 * 使用者單字集關聯（只記錄基本的關聯關係）
 */
export interface UserWordSet {
  id: string
  user_id: string
  word_set_id: string
  created_at: string
  // 關聯的單字集資訊
  word_set: WordSet
}

/**
 * 取得所有公開單字集列表
 */
export async function getPublicWordSets(options?: {
  ascending?: boolean
  limit?: number
  category?: string
}) {
  const supabase = createServerSupabaseClient()
  
  let query = supabase
    .from('word_sets')
    .select('*')

  // 根據分類過濾
  if (options?.category) {
    query = query.eq('category', options.category)
  }

  // 一律使用時間排序
  const ascending = options?.ascending ?? false
  query = query.order('created_at', { ascending })

  // 限制數量
  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`取得單字集列表失敗: ${error.message}`)
  }

  return data as WordSet[]
}

/**
 * 根據 ID 取得單個單字集
 */
export async function getWordSetById(id: string) {
  const supabase = createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('word_sets')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`取得單字集失敗: ${error.message}`)
  }

  return data as WordSet
}

/**
 * 取得使用者的單字集列表（已匯入的）
 */
export async function getUserWordSets(userId: string, options?: {
  ascending?: boolean
  limit?: number
}) {
  const supabase = createServerSupabaseClient()
  
  let query = supabase
    .from('user_word_sets')
    .select(`
      *,
      word_set:word_sets(*)
    `)
    .eq('user_id', userId)

  // 排序
  const ascending = options?.ascending ?? false
  query = query.order('created_at', { ascending })

  // 限制數量
  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`取得使用者單字集列表失敗: ${error.message}`)
  }

  return data as UserWordSet[]
}

/**
 * 檢查使用者是否已匯入某個單字集
 */
export async function hasUserImportedWordSet(userId: string, wordSetId: string): Promise<boolean> {
  const supabase = createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('user_word_sets')
    .select('id')
    .eq('user_id', userId)
    .eq('word_set_id', wordSetId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // 找不到記錄，表示未匯入
      return false
    }
    throw new Error(`檢查單字集匯入狀態失敗: ${error.message}`)
  }

  return !!data
}

/**
 * 匯入單字集到使用者帳號
 */
export async function importWordSetToUser(userId: string, wordSetId: string) {
  // 使用 Admin Client 來確保可以插入（繞過 RLS）
  const adminSupabase = createAdminSupabaseClient()
  
  // 先檢查是否已匯入
  const alreadyImported = await hasUserImportedWordSet(userId, wordSetId)
  if (alreadyImported) {
    throw new Error('此單字集已經匯入到您的帳號')
  }

  // 檢查單字集是否存在
  const { data: wordSet, error: wordSetError } = await adminSupabase
    .from('word_sets')
    .select('id')
    .eq('id', wordSetId)
    .single()

  if (wordSetError || !wordSet) {
    throw new Error('單字集不存在')
  }

  // 匯入單字集
  const { data, error } = await adminSupabase
    .from('user_word_sets')
    .insert({
      user_id: userId,
      word_set_id: wordSetId,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`匯入單字集失敗: ${error.message}`)
  }

  return data
}

/**
 * 移除使用者匯入的單字集
 */
export async function removeUserWordSet(userId: string, wordSetId: string) {
  // 使用 Admin Client 來確保可以刪除（繞過 RLS）
  const adminSupabase = createAdminSupabaseClient()
  
  const { error } = await adminSupabase
    .from('user_word_sets')
    .delete()
    .eq('user_id', userId)
    .eq('word_set_id', wordSetId)

  if (error) {
    throw new Error(`移除單字集失敗: ${error.message}`)
  }
}

/**
 * 取得使用者單字集的詳細資訊（包含單字集資料）
 */
export async function getUserWordSetById(userId: string, wordSetId: string) {
  const supabase = createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('user_word_sets')
    .select(`
      *,
      word_set:word_sets(*)
    `)
    .eq('user_id', userId)
    .eq('word_set_id', wordSetId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('此單字集尚未匯入到您的帳號')
    }
    throw new Error(`取得使用者單字集失敗: ${error.message}`)
  }

  return data as UserWordSet
}

