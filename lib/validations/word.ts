import { z } from 'zod'

/**
 * 單字表單驗證 schema
 * 使用 Zod 進行表單驗證，可與 React Hook Form 整合
 */
export const wordFormSchema = z.object({
  word: z.string().min(1, '單字不能為空').max(100, '單字長度不能超過 100 個字元'),
  definition: z.string().min(1, '定義不能為空').max(500, '定義長度不能超過 500 個字元'),
  example: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type WordFormData = z.infer<typeof wordFormSchema>

