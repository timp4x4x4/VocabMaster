import { getWordSetById } from '@/lib/queries/word-sets'
import { getWordsBySetId } from '@/lib/queries/words'
import { WordSetTabs } from '@/components/words/WordSetTabs'
import { notFound } from 'next/navigation'

interface WordSetPageProps {
  params: { id: string }
}

/**
 * 單字集詳情頁面
 * 提供標籤頁切換功能，可以在「字卡」和「單字列表」兩種視圖之間切換
 */
export default async function WordSetPage({ params }: WordSetPageProps) {
  try {
    // 並行取得單字集資訊和單字列表，提升載入速度
    const [wordSet, words] = await Promise.all([
      getWordSetById(params.id),
      getWordsBySetId(params.id, {
        ascending: true,
      })
    ])

    return (
      <div className="container mx-auto py-6 px-4 max-w-4xl overflow-hidden">
        {/* 返回按鈕和標題 */}
        <WordSetTabs 
          words={words} 
          wordSetTitle={wordSet.title}
          wordSetDescription={wordSet.description}
          wordSetId={wordSet.id}
        />
      </div>
    )
  } catch (error) {
    if (error instanceof Error && error.message.includes('不存在')) {
      notFound()
    }
    
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-destructive">
          載入錯誤: {error instanceof Error ? error.message : '未知錯誤'}
        </div>
      </div>
    )
  }
}

