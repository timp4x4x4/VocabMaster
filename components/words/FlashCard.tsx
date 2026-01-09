'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, X, Check, Undo2 } from 'lucide-react'

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

interface FlashCardProps {
  words: Word[]
  wordSetTitle: string
  correctCount: number
  wrongCount: number
  onCorrectCountChange: (count: number | ((prev: number) => number)) => void
  onWrongCountChange: (count: number | ((prev: number) => number)) => void
  currentIndex: number
  isFlipped: boolean
  onCurrentIndexChange: (index: number | ((prev: number) => number)) => void
  onIsFlippedChange: (flipped: boolean | ((prev: boolean) => boolean)) => void
  answerStack: AnswerStack[]
  onAnswerStackChange: (stack: AnswerStack[] | ((prev: AnswerStack[]) => AnswerStack[])) => void
  history: Array<{ index: number; flipped: boolean }>
  onHistoryChange: (history: Array<{ index: number; flipped: boolean }> | ((prev: Array<{ index: number; flipped: boolean }>) => Array<{ index: number; flipped: boolean }>)) => void
}

export function FlashCard({ 
  words, 
  wordSetTitle, 
  correctCount, 
  wrongCount, 
  onCorrectCountChange, 
  onWrongCountChange,
  currentIndex,
  isFlipped,
  onCurrentIndexChange,
  onIsFlippedChange,
  answerStack,
  onAnswerStackChange,
  history,
  onHistoryChange
}: FlashCardProps) {
  const currentWord = words[currentIndex]

  const handleRemember = () => {
    // 「記得」按鈕：只負責增加答對計數
    onCorrectCountChange(prev => prev + 1)
    
    // 將答案推入 stack：1 表示答對
    onAnswerStackChange(prev => [...prev, 1])
    
    // 更新當前歷史記錄
    const updatedHistory = [...history]
    if (updatedHistory.length > 0) {
      updatedHistory[updatedHistory.length - 1] = {
        index: currentIndex,
        flipped: isFlipped
      }
    }
    
    // 跳到下一張
    const nextIndex = currentIndex < words.length - 1 ? currentIndex + 1 : 0
    onCurrentIndexChange(nextIndex)
    onIsFlippedChange(false)
    
    // 記錄歷史：添加新卡片
    onHistoryChange([...updatedHistory, { index: nextIndex, flipped: false }])
  }

  const handleForget = () => {
    // 「沒記得」按鈕：只負責增加答錯計數
    onWrongCountChange(prev => prev + 1)
    
    // 將答案推入 stack：0 表示答錯
    onAnswerStackChange(prev => [...prev, 0])
    
    // 更新當前歷史記錄
    const updatedHistory = [...history]
    if (updatedHistory.length > 0) {
      updatedHistory[updatedHistory.length - 1] = {
        index: currentIndex,
        flipped: isFlipped
      }
    }
    
    // 跳到下一張
    const nextIndex = currentIndex < words.length - 1 ? currentIndex + 1 : 0
    onCurrentIndexChange(nextIndex)
    onIsFlippedChange(false)
    
    // 記錄歷史：添加新卡片
    onHistoryChange([...updatedHistory, { index: nextIndex, flipped: false }])
  }

  const handlePrevious = () => {
    // 使用 stack 方式：從 stack 中彈出最後一個答案
    if (history.length > 1 && answerStack.length > 0) {
      // 從 stack 彈出最後一個答案
      const lastAnswer = answerStack[answerStack.length - 1]
      onAnswerStackChange(prev => prev.slice(0, -1))
      
      // 根據答案減少對應的計數
      if (lastAnswer === 1) {
        // 1 = 答對，減少答對計數
        onCorrectCountChange(prev => Math.max(0, prev - 1))
      } else {
        // 0 = 答錯，減少答錯計數
        onWrongCountChange(prev => Math.max(0, prev - 1))
      }
      
      // 回到上一張卡片的狀態
      const previousHistory = history.slice(0, -1)
      const previousState = previousHistory[previousHistory.length - 1]
      
      onCurrentIndexChange(previousState.index)
      onIsFlippedChange(previousState.flipped)
      onHistoryChange(previousHistory)
    }
  }

  const handleFlip = () => {
    const newFlippedState = !isFlipped
    onIsFlippedChange(newFlippedState)
    
    // 更新當前歷史記錄的翻轉狀態
    const updatedHistory = [...history]
    if (updatedHistory.length > 0) {
      updatedHistory[updatedHistory.length - 1] = { 
        index: currentIndex, 
        flipped: newFlippedState
      }
      onHistoryChange(updatedHistory)
    }
  }

  if (words.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">此單字集沒有單字</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* 進度指示和統計 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} / {words.length}
          </p>
          {/* 統計資訊 */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-green-600 dark:text-green-400 font-medium">{correctCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <X className="h-4 w-4 text-destructive" />
              <span className="text-destructive font-medium">{wrongCount}</span>
            </div>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 字卡 */}
      <div className="relative perspective-1000 mb-8" style={{ perspective: '1000px', height: '400px' }}>
        <motion.div
          className="relative w-full h-full cursor-pointer"
          onClick={handleFlip}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 15 }}
          style={{ 
            transformStyle: 'preserve-3d',
            position: 'relative',
            width: '100%',
            height: '100%'
          }}
        >
          {/* 正面（英文） */}
          <div
            className="absolute inset-0"
            style={{ 
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)'
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`front-${currentIndex}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full bg-card border-2 border-border rounded-lg shadow-lg flex flex-col items-center justify-center p-6 overflow-hidden"
              >
                <div className="text-center w-full h-full flex flex-col items-center justify-center py-2">
                  <p className="text-xs text-muted-foreground mb-2 flex-shrink-0">點擊卡片翻轉</p>
                  <div className="flex-1 flex flex-col items-center justify-center space-y-2 max-w-full min-h-0">
                    <h2 className="text-3xl md:text-4xl font-bold leading-tight break-words px-4">
                      {currentWord.english}
                    </h2>
                    {currentWord.pronunciation && (
                      <p className="text-lg text-muted-foreground">
                        /{currentWord.pronunciation}/
                      </p>
                    )}
                    {currentWord.category && (
                      <div className="mt-1 flex-shrink-0">
                        <span className="inline-block px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">
                          {currentWord.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 背面（中文） */}
          <div
            className="absolute inset-0"
            style={{ 
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`back-${currentIndex}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full bg-primary text-primary-foreground border-2 border-primary rounded-lg shadow-lg flex flex-col items-center justify-center p-6 overflow-hidden"
              >
                <div className="text-center w-full h-full flex flex-col items-center justify-center py-2">
                  <p className="text-xs opacity-80 mb-2 flex-shrink-0">點擊卡片翻轉</p>
                  <div className="flex-1 flex flex-col items-center justify-center space-y-2 max-w-full min-h-0">
                    <h2 className="text-3xl md:text-4xl font-bold leading-tight break-words px-4">
                      {currentWord.chinese}
                    </h2>
                    {currentWord.example && (
                      <div className="mt-2 pt-3 border-t border-primary-foreground/20 max-w-md flex-shrink-0">
                        <p className="text-xs opacity-80 mb-1">例句</p>
                        <p className="text-base italic leading-relaxed break-words">
                          {currentWord.example}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* 控制按鈕 */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleForget}
          className="flex items-center gap-2 px-6 py-3 rounded-md border-2 border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors font-medium"
        >
          <X className="h-5 w-5" />
          沒記得
        </button>
        
        <button
          onClick={handlePrevious}
          disabled={history.length <= 1 || answerStack.length === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-md border bg-background hover:bg-accent transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Undo2 className="h-5 w-5" />
          上一步
        </button>
        
        <button
          onClick={handleRemember}
          className="flex items-center gap-2 px-6 py-3 rounded-md border-2 border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors font-medium"
        >
          <Check className="h-5 w-5" />
          記得
        </button>

      </div>
    </div>
  )
}

