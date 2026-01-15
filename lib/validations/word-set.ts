import { z } from 'zod'

/**
 * 單字集表單驗證 schema
 * 使用 Zod 進行表單驗證，可與 React Hook Form 整合
 */
export const wordSetFormSchema = z.object({
  title: z.string().min(1, '標題不能為空').max(100, '標題長度不能超過 100 個字元'),
  description: z.string().max(500, '描述長度不能超過 500 個字元').optional().nullable(),
  category: z.string().max(50, '分類長度不能超過 50 個字元').optional().nullable(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  public: z.boolean().default(true),
})

export type WordSetFormData = z.infer<typeof wordSetFormSchema>

