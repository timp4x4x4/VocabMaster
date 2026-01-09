'use client'

import { motion } from 'framer-motion'
import { createClientSupabaseClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface WordCardProps {
  word: {
    id: string
    word: string
    definition: string
    example?: string
    is_remembered?: boolean
  }
}

/**
 * 單字卡片範例
 * 展示如何在 Client Component 中進行互動操作（如標記已記住）
 */
export function WordCard({ word }: WordCardProps) {
  const supabase = createClientSupabaseClient()
  const [isRemembered, setIsRemembered] = useState(word.is_remembered ?? false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggleRemembered = async () => {
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('words')
        .update({ is_remembered: !isRemembered })
        .eq('id', word.id)

      if (error) throw error

      setIsRemembered(!isRemembered)
    } catch (error) {
      console.error('更新失敗:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="p-4 border rounded-lg bg-card"
    >
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xl font-semibold">{word.word}</h2>
        <motion.button
          onClick={handleToggleRemembered}
          disabled={isUpdating}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`px-3 py-1 rounded-md text-sm ${
            isRemembered
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {isRemembered ? '已記住' : '未記住'}
        </motion.button>
      </div>
      <p className="text-muted-foreground mb-2">{word.definition}</p>
      {word.example && (
        <p className="text-sm italic text-muted-foreground">
          例句: {word.example}
        </p>
      )}
    </motion.div>
  )
}

