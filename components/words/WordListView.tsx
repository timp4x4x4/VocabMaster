'use client'

import { motion } from 'framer-motion'
import { BookOpen, Volume2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export interface Word {
  id: string
  english: string
  chinese: string
  pronunciation?: string | null
  example?: string | null
  category?: string | null
}

interface WordListViewProps {
  words: Word[]
}

/**
 * 單字列表視圖
 * 以列表形式顯示所有單字及其詳細資訊
 */
export function WordListView({ words }: WordListViewProps) {
  if (words.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">此單字集沒有單字</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          共 {words.length} 個單字
        </p>
      </div>

      <div className="space-y-3">
        {words.map((word, index) => (
          <motion.div
            key={word.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* 左側：英文和發音 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{word.english}</h3>
                      {word.pronunciation && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Volume2 className="h-4 w-4" />
                          <span className="text-sm">/{word.pronunciation}/</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-lg text-foreground mb-2">{word.chinese}</p>
                    
                    {word.example && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-muted-foreground mb-1">例句</p>
                        <p className="text-sm italic text-foreground">{word.example}</p>
                      </div>
                    )}
                  </div>

                  {/* 右側：分類標籤 */}
                  {word.category && (
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <BookOpen className="h-3 w-3" />
                        <span>分類</span>
                      </div>
                      <span className="inline-block px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">
                        {word.category}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

