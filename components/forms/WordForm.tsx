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
        <label htmlFor="english" className="block text-sm font-medium mb-1">
          英文單字 <span className="text-destructive">*</span>
        </label>
        <input
          id="english"
          {...register('english')}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="例如：apple"
        />
        {errors.english && (
          <p className="text-sm text-destructive mt-1">{errors.english.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="chinese" className="block text-sm font-medium mb-1">
          中文翻譯 <span className="text-destructive">*</span>
        </label>
        <input
          id="chinese"
          {...register('chinese')}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="例如：蘋果"
        />
        {errors.chinese && (
          <p className="text-sm text-destructive mt-1">
            {errors.chinese.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="pronunciation" className="block text-sm font-medium mb-1">
          發音（選填）
        </label>
        <input
          id="pronunciation"
          {...register('pronunciation')}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="例如：æpl"
        />
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
          placeholder="例如：I like to eat an apple every day."
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1">
          分類（選填）
        </label>
        <input
          id="category"
          {...register('category')}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="例如：食物"
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

