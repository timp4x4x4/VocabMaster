import { getPublicWordSets, getUserWordSets } from '@/lib/queries/word-sets'
import { getCurrentUserFromSession } from '@/lib/auth/session'
import { WordSetCard } from '@/components/words/WordSetCard'
import { redirect } from 'next/navigation'

interface WordsPageProps {
  searchParams: { type?: string }
}

/**
 * 單字庫頁面
 * 根據 type 參數顯示不同的內容：
 * - type=public: 公開單字庫（顯示所有公開單字集）
 * - 無參數: 我的單字庫（顯示使用者已匯入的單字集）
 */
export default async function WordsPage({ searchParams }: WordsPageProps) {
  const isPublic = searchParams.type === 'public'
  
  // 如果不是公開頁面，先檢查使用者是否登入
  let user = null
  if (!isPublic) {
    user = await getCurrentUserFromSession()
    if (!user) {
      // 如果未登入，導向登入頁（redirect 會拋出特殊錯誤，不應該被 catch）
      redirect('/auth')
    }
  }
  
  try {
    let wordSets
    
    if (isPublic) {
      // 取得公開單字集列表
      wordSets = await getPublicWordSets({
        ascending: false, // false = 最新的在前
      })
    } else {
      // 取得使用者的單字集（此時 user 一定存在）
      if (!user) {
        // 這不應該發生，但為了型別安全
        throw new Error('使用者未登入')
      }
      
      const userWordSets = await getUserWordSets(user.id, {
        ascending: false, // false = 最新的在前
      })
      
      // 將 UserWordSet 轉換為 WordSet 格式
      wordSets = userWordSets.map((userWordSet) => userWordSet.word_set)
    }

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
              <WordSetCard key={wordSet.id} wordSet={wordSet} isPublic={isPublic} />
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

