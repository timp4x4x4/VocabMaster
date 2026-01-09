import { getPublicWordSets } from '@/lib/queries/word-sets'
import { WordSetCard } from '@/components/words/WordSetCard'

interface WordsPageProps {
  searchParams: { type?: string }
}

/**
 * 單字庫頁面
 * 根據 type 參數顯示不同的內容：
 * - type=public: 公開單字庫（顯示單字集）
 * - 無參數: 我的單字庫（暫時顯示公開單字集，之後可改為顯示用戶自己的）
 */
export default async function WordsPage({ searchParams }: WordsPageProps) {
  try {
    const isPublic = searchParams.type === 'public'
    
    // 取得公開單字集列表
    const wordSets = await getPublicWordSets({
      ascending: false, // false = 最新的在前
    })

    return (
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isPublic ? '公開單字庫' : '我的單字庫'}
          </h1>
          <p className="text-muted-foreground">
            {isPublic 
              ? '瀏覽所有公開的單字集' 
              : '管理您自己的單字集'}
          </p>
        </div>

        {wordSets.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">目前沒有單字集</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wordSets.map((wordSet) => (
              <WordSetCard key={wordSet.id} wordSet={wordSet} />
            ))}
          </div>
        )}
      </div>
    )
  } catch (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-destructive">
          載入錯誤: {error instanceof Error ? error.message : '未知錯誤'}
        </div>
      </div>
    )
  }
}

