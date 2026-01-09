import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * 單字相關的資料查詢函數
 * 這些函數可以在 Server Components 中重複使用
 */

export interface Word {
  id: string
  english: string
  chinese: string
  pronunciation: string
  example: string
  category: string
  word_set_id: string
  created_at: string
}

/**
 * 取得所有單字列表
 * @param options 查詢選項
 */
export async function getWords(options?: {
  ascending?: boolean
  limit?: number
  category?: string
  wordSetId?: string
}) {
  const supabase = createServerSupabaseClient()
  
  let query = supabase
    .from('words')
    .select('*')

  // 根據分類過濾
  if (options?.category) {
    query = query.eq('category', options.category)
  }

  // 根據單字集過濾
  if (options?.wordSetId) {
    query = query.eq('word_set_id', options.wordSetId)
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
    throw new Error(`取得單字列表失敗: ${error.message}`)
  }

  return data as Word[]
}

/**
 * 根據 ID 取得單個單字
 */
export async function getWordById(id: string) {
  const supabase = createServerSupabaseClient()
  
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`取得單字失敗: ${error.message}`)
  }

  return data as Word
}

/**
 * 根據單字集 ID 取得單字列表
 */
export async function getWordsBySetId(wordSetId: string, options?: {
  ascending?: boolean
  limit?: number
}) {
  const supabase = createServerSupabaseClient()
  
  let query = supabase
    .from('words')
    .select('*')
    .eq('word_set_id', wordSetId)

  // 一律使用時間排序
  const ascending = options?.ascending ?? false
  query = query.order('created_at', { ascending })

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`取得單字集單字列表失敗: ${error.message}`)
  }

  return data as Word[]
}

/**
 * 根據分類取得單字列表
 */
export async function getWordsByCategory(category: string, options?: {
  ascending?: boolean
  limit?: number
}) {
  const supabase = createServerSupabaseClient()
  
  let query = supabase
    .from('words')
    .select('*')
    .eq('category', category)

  // 一律使用時間排序
  const ascending = options?.ascending ?? false
  query = query.order('created_at', { ascending })

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`取得分類單字列表失敗: ${error.message}`)
  }

  return data as Word[]
}

/**
 * 搜尋單字（根據英文、中文或例句）
 */
export async function searchWords(keyword: string, options?: {
  ascending?: boolean
  limit?: number
}) {
  const supabase = createServerSupabaseClient()
  
  let query = supabase
    .from('words')
    .select('*')
    .or(`english.ilike.%${keyword}%,chinese.ilike.%${keyword}%,example.ilike.%${keyword}%`)

  // 一律使用時間排序
  const ascending = options?.ascending ?? false
  query = query.order('created_at', { ascending })

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`搜尋單字失敗: ${error.message}`)
  }

  return data as Word[]
}

