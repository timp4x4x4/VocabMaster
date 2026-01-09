'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FlashCard } from './FlashCard'
import { WordListView } from './WordListView'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export interface Word {
  id: string
  english: string
  chinese: string
  pronunciation?: string | null
  example?: string | null
  category?: string | null
}

// 答案類型：0 = 答錯（wrong），1 = 答對（correct）
type AnswerStack = 0 | 1

interface WordSetTabsProps {
  words: Word[]
  wordSetTitle: string
  wordSetDescription?: string | null
}

/**
 * 單字集標籤頁組件
 * 管理答對/答錯計數狀態、歷史記錄和當前位置，確保在 Tab 切換時狀態保持
 */
export function WordSetTabs({ words, wordSetTitle, wordSetDescription }: WordSetTabsProps) {
  // 將計數狀態提升到這裡，確保在 Tab 切換時狀態保持
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  // 當前卡片位置和翻轉狀態
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  // 使用 stack 記錄答案歷史：0 = 答錯，1 = 答對
  const [answerStack, setAnswerStack] = useState<AnswerStack[]>([])
  // 歷史記錄：記錄每張卡片的索引和翻轉狀態
  const [history, setHistory] = useState<Array<{ index: number; flipped: boolean }>>([
    { index: 0, flipped: false }
  ])

  return (
    <Tabs defaultValue="flashcard" className="w-full">
      {/* 返回按鈕 */}
      <div className="mb-6">
        <Link
          href="/words?type=public"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          返回單字庫
        </Link>
        
        {/* 標題和 Tab 在同一行 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold mb-2">{wordSetTitle}</h1>
            {wordSetDescription && (
              <p className="text-muted-foreground text-sm line-clamp-2">{wordSetDescription}</p>
            )}
          </div>
          
          {/* Tab 切換在標題右方 */}
          <div className="flex-shrink-0 self-start sm:self-center">
            <TabsList>
              <TabsTrigger value="flashcard">字卡</TabsTrigger>
              <TabsTrigger value="list">單字列表</TabsTrigger>
            </TabsList>
          </div>
        </div>
      </div>
      
      <TabsContent value="flashcard" className="mt-0">
        <FlashCard
          words={words}
          wordSetTitle={wordSetTitle}
          correctCount={correctCount}
          wrongCount={wrongCount}
          onCorrectCountChange={setCorrectCount}
          onWrongCountChange={setWrongCount}
          currentIndex={currentIndex}
          isFlipped={isFlipped}
          onCurrentIndexChange={setCurrentIndex}
          onIsFlippedChange={setIsFlipped}
          answerStack={answerStack}
          onAnswerStackChange={setAnswerStack}
          history={history}
          onHistoryChange={setHistory}
        />
      </TabsContent>
      
      <TabsContent value="list" className="mt-0">
        <WordListView words={words} />
      </TabsContent>
    </Tabs>
  )
}

