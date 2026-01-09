'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, Tag, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export interface WordSetCardProps {
  wordSet: {
    id: string
    title: string
    description: string | null
    category: string | null
    difficulty: string | null
    word_count: number
    tags: string[] | null
    created_at: string
  }
}

export function WordSetCard({ wordSet }: WordSetCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getDifficultyColor = (difficulty: string | null) => {
    if (!difficulty) return 'bg-muted text-muted-foreground'
    
    const colors: Record<string, string> = {
      beginner: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
      intermediate: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
      advanced: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    }
    return colors[difficulty.toLowerCase()] || 'bg-muted text-muted-foreground'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/words/${wordSet.id}`} prefetch={true}>
        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-xl line-clamp-2 flex-1">{wordSet.title}</CardTitle>
            {wordSet.difficulty && (
              <span className={`px-2 py-1 text-xs font-medium rounded border whitespace-nowrap ${getDifficultyColor(wordSet.difficulty)}`}>
                {wordSet.difficulty === 'beginner' ? '初級' : 
                 wordSet.difficulty === 'intermediate' ? '中級' : 
                 wordSet.difficulty === 'advanced' ? '高級' : 
                 wordSet.difficulty}
              </span>
            )}
          </div>
          
          {wordSet.description && (
            <CardDescription className="line-clamp-2">
              {wordSet.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* 分類和單字數 */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {wordSet.category && (
                <div className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4" />
                  <span>{wordSet.category}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />
                <span>{wordSet.word_count} 個單字</span>
              </div>
            </div>

            {/* 標籤 */}
            {wordSet.tags && wordSet.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {wordSet.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md"
                  >
                    {tag}
                  </span>
                ))}
                {wordSet.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs text-muted-foreground">
                    +{wordSet.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* 建立時間 */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(wordSet.created_at)}</span>
            </div>
          </div>
        </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

