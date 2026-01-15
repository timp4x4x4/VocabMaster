# 使用者單字集功能說明

## 📋 概述

這個功能允許使用者將公開的單字集匯入到自己的帳號，從而區分：
- **公開單字集**：所有使用者都可以查看的單字集
- **我的單字集**：使用者已匯入到自己帳號的單字集

## 🗄️ 資料庫結構

### `user_word_sets` 表

記錄使用者匯入的單字集關聯（只記錄基本的關聯關係：誰有哪個資料集）：

| 欄位 | 型別 | 說明 |
|------|------|------|
| `id` | UUID | 主鍵 |
| `user_id` | UUID | 使用者 ID（外鍵 → `users.id`） |
| `word_set_id` | UUID | 單字集 ID（外鍵 → `word_sets.id`） |
| `created_at` | TIMESTAMP | 匯入時間 |

**唯一約束**：`(user_id, word_set_id)` - 每個使用者只能匯入同一個單字集一次

## 📝 使用步驟

### 1. 執行 SQL Migration

在 Supabase Dashboard 的 SQL Editor 中執行：

```sql
-- 執行 supabase/create-user-word-sets-table.sql
```

或在終端機中：

```bash
# 使用 Supabase CLI（如果有的話）
supabase db push
```

### 2. 使用查詢函數

#### 取得使用者的單字集列表

```typescript
import { getUserWordSets } from '@/lib/queries/word-sets'
import { getCurrentUserFromSession } from '@/lib/auth/session'

// 在 Server Component 中
export default async function MyWordSetsPage() {
  const user = await getCurrentUserFromSession()
  if (!user) {
    return <div>請先登入</div>
  }

  const myWordSets = await getUserWordSets(user.id, {
    ascending: false, // 最新的在前
  })

  return (
    <div>
      {myWordSets.map((userWordSet) => (
        <div key={userWordSet.id}>
          <h3>{userWordSet.word_set.title}</h3>
        </div>
      ))}
    </div>
  )
}
```

#### 匯入單字集

```typescript
import { importWordSetToUser } from '@/lib/queries/word-sets'
import { getCurrentUserFromSession } from '@/lib/auth/session'

// 在 Server Action 或 API Route 中
export async function importWordSet(wordSetId: string) {
  const user = await getCurrentUserFromSession()
  if (!user) {
    throw new Error('請先登入')
  }

  try {
    await importWordSetToUser(user.id, wordSetId)
    return { success: true, message: '匯入成功' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
```

#### 檢查是否已匯入

```typescript
import { hasUserImportedWordSet } from '@/lib/queries/word-sets'

const isImported = await hasUserImportedWordSet(userId, wordSetId)
if (isImported) {
  // 顯示「已匯入」或「移除」按鈕
} else {
  // 顯示「匯入」按鈕
}
```

#### 移除單字集

```typescript
import { removeUserWordSet } from '@/lib/queries/word-sets'

await removeUserWordSet(userId, wordSetId)
```

## 🔄 資料流程

### 匯入流程

1. 使用者在公開單字集頁面點擊「匯入」
2. 前端呼叫 API Route（例如 `/api/word-sets/import`）
3. API Route 使用 `importWordSetToUser(userId, wordSetId)`
4. 在 `user_word_sets` 表中新增一筆記錄
5. 返回成功訊息

### 查詢流程

1. 使用者進入「我的單字集」頁面
2. Server Component 使用 `getUserWordSets(userId)` 查詢
3. 透過 JOIN 取得完整的 `word_sets` 資訊
4. 顯示單字集列表

## 🎯 使用場景

### 場景 1：區分公開和我的單字集

```typescript
// 公開單字集頁面
const publicWordSets = await getPublicWordSets()

// 我的單字集頁面
const myWordSets = await getUserWordSets(userId)
```

### 場景 2：在公開單字集頁面顯示匯入狀態

```typescript
// 在公開單字集列表中
const publicWordSets = await getPublicWordSets()
const user = await getCurrentUserFromSession()

for (const wordSet of publicWordSets) {
  const isImported = user 
    ? await hasUserImportedWordSet(user.id, wordSet.id)
    : false
  
  // 根據 isImported 顯示不同的按鈕
}
```

## 🔒 安全性

- 所有操作都使用 `createAdminSupabaseClient()` 來繞過 RLS（在 API Route 中）
- 在 Server Components 中使用 `createServerSupabaseClient()`（受 RLS 保護）
- 所有操作都會驗證 `user_id`，確保使用者只能操作自己的資料

## 📌 注意事項

1. **唯一約束**：每個使用者只能匯入同一個單字集一次
2. **CASCADE 刪除**：
   - 如果 `word_sets` 被刪除，相關的 `user_word_sets` 記錄也會被刪除
   - 如果使用者被刪除，相關的 `user_word_sets` 記錄也會被刪除
3. **簡單關聯**：此表只記錄基本的關聯關係（誰有哪個資料集），不包含額外的狀態資訊

## 🚀 下一步

1. 建立 API Route 來處理匯入/移除操作
2. 在 UI 中添加「匯入」和「我的單字集」功能

