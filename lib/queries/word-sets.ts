import { createServerSupabaseClient } from '@/lib/supabase/server'

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

