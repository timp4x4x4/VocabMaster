'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { BookOpen, Volume2, Plus, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { wordFormSchema, type WordFormData } from '@/lib/validations/word'

export interface Word {
  id: string
  english: string
  chinese: string
  pronunciation?: string | null
  example?: string | null
  category?: string | null
  word_set_id?: string
}

interface WordListViewProps {
  words: Word[]
  wordSetId: string
}

/**
 * 單字列表視圖
 * 以列表形式顯示所有單字及其詳細資訊
 */
export function WordListView({ words, wordSetId }: WordListViewProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingWord, setEditingWord] = useState<Word | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<WordFormData>({
    resolver: zodResolver(wordFormSchema),
    defaultValues: {
      word_set_id: wordSetId,
    },
  })

  const onSubmit = async (data: WordFormData) => {
    setIsSubmitting(true)
    try {
      const url = editingWord ? `/api/words/${editingWord.id}` : '/api/words'
      const method = editingWord ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        reset()
        setIsDialogOpen(false)
        setEditingWord(null)
        // 刷新 Server Component 資料，保持當前 tab 狀態
        router.refresh()
      } else {
        const errorData = await response.json()
        alert(errorData.error || (editingWord ? '更新單字失敗' : '新增單字失敗'))
      }
    } catch (error) {
      console.error(editingWord ? '更新單字失敗:' : '新增單字失敗:', error)
      alert(editingWord ? '更新單字失敗，請稍後再試' : '新增單字失敗，請稍後再試')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (word: Word) => {
    setEditingWord(word)
    setValue('english', word.english)
    setValue('chinese', word.chinese)
    setValue('pronunciation', word.pronunciation || '')
    setValue('example', word.example || '')
    setValue('category', word.category || '')
    setValue('word_set_id', word.word_set_id || wordSetId)
    setIsDialogOpen(true)
  }

  const handleDelete = async (wordId: string) => {
    if (!confirm('確定要刪除此單字嗎？')) {
      return
    }

    setIsDeleting(wordId)
    try {
      const response = await fetch(`/api/words/${wordId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // 刷新 Server Component 資料，保持當前 tab 狀態
        router.refresh()
      } else {
        const errorData = await response.json()
        alert(errorData.error || '刪除單字失敗')
      }
    } catch (error) {
      console.error('刪除單字失敗:', error)
      alert('刪除單字失敗，請稍後再試')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleAddNew = () => {
    setEditingWord(null)
    reset({
      word_set_id: wordSetId,
      english: '',
      chinese: '',
      pronunciation: '',
      example: '',
      category: '',
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="w-full max-w-4xl mx-auto relative pb-20">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          共 {words.length} 個單字
        </p>
      </div>

      {words.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">此單字集沒有單字</p>
        </div>
      ) : (
        <div className="space-y-3">
          {words.map((word, index) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow relative">
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

                    {/* 右側：分類標籤和操作按鈕 */}
                    <div className="flex items-start gap-2 flex-shrink-0">
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
                            <DropdownMenuItem
                              onClick={() => handleEdit(word)}
                              className="flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              編輯
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(word.id)}
                              disabled={isDeleting === word.id}
                              className="flex items-center gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              {isDeleting === word.id ? '刪除中...' : '刪除'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* 浮動新增按鈕 */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={handleAddNew}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* 新增單字對話框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingWord ? '編輯單字' : '新增單字'}</DialogTitle>
            <DialogDescription>
              {editingWord ? '編輯單字資訊' : '新增單字到此單字集'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="english" className="text-sm font-medium">
                英文單字 <span className="text-destructive">*</span>
              </label>
              <input
                id="english"
                {...register('english')}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="例如：apple"
              />
              {errors.english && (
                <p className="text-sm text-destructive">{errors.english.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="chinese" className="text-sm font-medium">
                中文翻譯 <span className="text-destructive">*</span>
              </label>
              <input
                id="chinese"
                {...register('chinese')}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="例如：蘋果"
              />
              {errors.chinese && (
                <p className="text-sm text-destructive">{errors.chinese.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="pronunciation" className="text-sm font-medium">
                發音（選填）
              </label>
              <input
                id="pronunciation"
                {...register('pronunciation')}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="例如：æpl"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="example" className="text-sm font-medium">
                例句（選填）
              </label>
              <textarea
                id="example"
                {...register('example')}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="例如：I like to eat an apple every day."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                分類（選填）
              </label>
              <input
                id="category"
                {...register('category')}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="例如：食物"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (editingWord ? '更新中...' : '新增中...') : (editingWord ? '更新' : '新增')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

