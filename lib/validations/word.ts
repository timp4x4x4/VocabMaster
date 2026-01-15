import { z } from 'zod'

/**
 * 單字表單驗證 schema
 * 使用 Zod 進行表單驗證，可與 React Hook Form 整合
 */
export const wordFormSchema = z.object({
  english: z.string().min(1, '英文單字不能為空').max(100, '英文單字長度不能超過 100 個字元'),
  chinese: z.string().min(1, '中文翻譯不能為空').max(500, '中文翻譯長度不能超過 500 個字元'),
  pronunciation: z.string().optional().nullable(),
  example: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  word_set_id: z.string().min(1, '單字集 ID 不能為空'),
})

export type WordFormData = z.infer<typeof wordFormSchema>

