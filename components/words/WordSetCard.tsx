'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BookOpen, Tag, Calendar, MoreVertical, Download, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  isPublic?: boolean
}

export function WordSetCard({ wordSet, isPublic = false }: WordSetCardProps) {
  const [isImported, setIsImported] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  // 檢查是否已匯入（公開頁面）或是否已匯入（我的單字集頁面，應該都是已匯入的）
  useEffect(() => {
    if (isPublic) {
      checkImportStatus()
    } else {
      // 在我的單字集頁面，所有單字集都是已匯入的
      setIsImported(true)
    }
  }, [isPublic, wordSet.id])

  const checkImportStatus = async () => {
    try {
      const response = await fetch(`/api/word-sets/import?wordSetId=${wordSet.id}`)
      if (response.ok) {
        const data = await response.json()
        setIsImported(data.isImported)
      }
    } catch (error) {
      console.error('檢查匯入狀態失敗:', error)
    }
  }

  const handleImport = async () => {
    if (isImporting || isImported) return

    setIsImporting(true)
    try {
      const response = await fetch('/api/word-sets/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wordSetId: wordSet.id }),
      })

      if (response.ok) {
        setIsImported(true)
      } else {
        const data = await response.json()
        alert(data.error || '匯入失敗')
      }
    } catch (error) {
      console.error('匯入失敗:', error)
      alert('匯入失敗，請稍後再試')
    } finally {
      setIsImporting(false)
    }
  }

  const handleRemove = async () => {
    if (isRemoving || !isImported) return

    if (!confirm('確定要取消匯入此單字集嗎？')) {
      return
    }

    setIsRemoving(true)
    try {
      const response = await fetch('/api/word-sets/import', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wordSetId: wordSet.id }),
      })

      if (response.ok) {
        // 取消匯入成功，刷新頁面
        window.location.reload()
      } else {
        const data = await response.json()
        alert(data.error || '取消匯入失敗')
      }
    } catch (error) {
      console.error('取消匯入失敗:', error)
      alert('取消匯入失敗，請稍後再試')
    } finally {
      setIsRemoving(false)
    }
  }

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
      className="relative"
    >
      <Link href={`/words/${wordSet.id}`} prefetch={true}>
        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-xl line-clamp-2 flex-1">{wordSet.title}</CardTitle>
            <div className="flex items-center gap-2 flex-shrink-0">
              {wordSet.difficulty && (
                <span className={`px-2 py-1 text-xs font-medium rounded border whitespace-nowrap ${getDifficultyColor(wordSet.difficulty)}`}>
                  {wordSet.difficulty === 'beginner' ? '初級' : 
                   wordSet.difficulty === 'intermediate' ? '中級' : 
                   wordSet.difficulty === 'advanced' ? '高級' : 
                   wordSet.difficulty}
                </span>
              )}
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-1.5 rounded-md hover:bg-accent transition-colors"
                      aria-label="更多選項"
                      onClick={(e) => e.preventDefault()}
                    >
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    {isPublic ? (
                      <DropdownMenuItem
                        onClick={handleImport}
                        disabled={isImporting || isImported}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        {isImported ? '已匯入' : isImporting ? '匯入中...' : '匯入'}
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={handleRemove}
                        disabled={isRemoving}
                        className="flex items-center gap-2 text-destructive focus:text-destructive"
                      >
                        <X className="h-4 w-4" />
                        {isRemoving ? '取消中...' : '取消匯入'}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
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

