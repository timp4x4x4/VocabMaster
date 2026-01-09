'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { wordFormSchema, type WordFormData } from '@/lib/validations/word'
import { motion } from 'framer-motion'
import { createClientSupabaseClient } from '@/lib/supabase/client'

/**
 * Client Component 範例
 * 使用 React Hook Form + Zod 進行表單驗證
 * 使用 Framer Motion 進行動畫效果
 * 使用 Supabase Client 進行資料庫操作
 */
export function WordForm() {
  const supabase = createClientSupabaseClient()
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<WordFormData>({
    resolver: zodResolver(wordFormSchema),
  })

  const onSubmit = async (data: WordFormData) => {
    try {
      const { error } = await supabase
        .from('words')
        .insert([data])

      if (error) throw error

      reset()
      // 可以加入成功提示
    } catch (error) {
      console.error('新增單字失敗:', error)
      // 可以加入錯誤提示
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div>
        <label htmlFor="word" className="block text-sm font-medium mb-1">
          單字
        </label>
        <input
          id="word"
          {...register('word')}
          className="w-full px-3 py-2 border rounded-md"
        />
        {errors.word && (
          <p className="text-sm text-destructive mt-1">{errors.word.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="definition" className="block text-sm font-medium mb-1">
          定義
        </label>
        <textarea
          id="definition"
          {...register('definition')}
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
        />
        {errors.definition && (
          <p className="text-sm text-destructive mt-1">
            {errors.definition.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="example" className="block text-sm font-medium mb-1">
          例句（選填）
        </label>
        <textarea
          id="example"
          {...register('example')}
          className="w-full px-3 py-2 border rounded-md"
          rows={2}
        />
      </div>

      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
      >
        {isSubmitting ? '新增中...' : '新增單字'}
      </motion.button>
    </motion.form>
  )
}

