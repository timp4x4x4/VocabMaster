# VocabMaster

單字學習管理系統 - 使用 Next.js App Router + Supabase + shadcn/ui

## 技術棧

- **Next.js 14** (App Router) - React 全端框架
- **TypeScript** - 型別安全
- **Supabase** - 後端即服務 (BaaS)
  - `@supabase/ssr` - Server Components 資料查詢
  - `@supabase/supabase-js` - Client Components 使用者互動
- **shadcn/ui** - UI 元件庫
- **Framer Motion** - 動畫效果
- **React Hook Form** - 表單狀態管理
- **Zod** - 表單驗證
- **Tailwind CSS** - 樣式框架

## 專案結構

```
VocabMaster/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首頁
│   ├── globals.css        # 全域樣式
│   └── words/             # 單字相關頁面
│       └── page.tsx       # Server Component 範例
├── components/            # React 元件
│   ├── ui/               # shadcn/ui 元件（需透過 CLI 安裝）
│   ├── forms/            # 表單元件
│   │   └── WordForm.tsx  # 新增單字表單（Client Component）
│   ├── auth/             # 認證相關元件
│   │   └── LoginForm.tsx # 登入表單（Client Component）
│   └── words/            # 單字相關元件
│       └── WordCard.tsx  # 單字卡片（Client Component）
├── lib/                  # 工具函數
│   ├── utils.ts          # 通用工具（cn 函數等）
│   ├── supabase/         # Supabase 設定
│   │   ├── server.ts     # Server-side client
│   │   ├── client.ts     # Client-side client
│   │   └── middleware.ts # Middleware helper
│   └── validations/      # Zod 驗證 schema
│       ├── word.ts       # 單字表單驗證
│       └── auth.ts      # 認證表單驗證
├── middleware.ts         # Next.js middleware（刷新 session）
└── components.json       # shadcn/ui 配置

```

## 資料庫溝通策略

### Server Components (伺服器端組件)

**用途**: 獲取單字列表、使用者個人資料

**工具**: `@supabase/ssr`

**優勢**: 
- 直接在 Server 讀取資料庫，速度快
- SEO 友好
- 不需要額外的 API Route

**使用範例**:
```tsx
// app/words/page.tsx
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function WordsPage() {
  const supabase = createServerSupabaseClient()
  const { data: words } = await supabase.from('words').select('*')
  return <div>{/* render words */}</div>
}
```

### Client Components (客戶端組件)

**用途**: 使用者登入/登出、點擊「已記住」按鈕、新增單字

**工具**: `@supabase/supabase-js`

**優勢**: 
- 在瀏覽器端直接與 Supabase 互動
- 即時反應，無需重新載入頁面

**使用範例**:
```tsx
'use client'
import { createClientSupabaseClient } from '@/lib/supabase/client'

export function LoginButton() {
  const supabase = createClientSupabaseClient()
  const handleLogin = async () => {
    await supabase.auth.signInWithPassword({ email, password })
  }
  return <button onClick={handleLogin}>登入</button>
}
```

## 安裝步驟

1. **安裝依賴**
```bash
npm install
```

2. **設定環境變數**
```bash
cp .env.example .env.local
```

編輯 `.env.local`，填入你的 Supabase 專案資訊：
- `NEXT_PUBLIC_SUPABASE_URL`: 從 Supabase Dashboard > Settings > API 取得
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 從 Supabase Dashboard > Settings > API 取得

3. **安裝 shadcn/ui 元件**（需要時）
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
# ... 其他需要的元件
```

4. **執行開發伺服器**
```bash
npm run dev
```

## 表單與驗證

使用 **React Hook Form** + **Zod** 進行表單管理與驗證：

- 效能最佳：React Hook Form 使用 uncontrolled components，減少重新渲染
- 型別安全：Zod schema 自動推斷 TypeScript 型別
- 驗證邏輯集中：所有驗證規則定義在 `lib/validations/` 中

範例請參考 `components/forms/WordForm.tsx` 和 `components/auth/LoginForm.tsx`

## 動畫效果

使用 **Framer Motion** 為元件添加動畫：

- 表單進入動畫
- 按鈕 hover/tap 效果
- 列表項目動畫

範例請參考各 Client Component

## 下一步

1. 在 Supabase 建立資料表（words, users 等）
2. 設定 Row Level Security (RLS) 政策
3. 安裝需要的 shadcn/ui 元件
4. 實作完整的 CRUD 功能
5. 加入更多動畫效果和 UI 優化

## 參考資源

- [Next.js App Router 文件](https://nextjs.org/docs/app)
- [Supabase SSR 文件](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [shadcn/ui 文件](https://ui.shadcn.com/)
- [React Hook Form 文件](https://react-hook-form.com/)
- [Framer Motion 文件](https://www.framer.com/motion/)
