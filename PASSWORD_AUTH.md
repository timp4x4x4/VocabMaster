# 密碼認證系統說明

## 🔐 架構說明

### 密碼儲存方式

使用 **bcryptjs** 進行密碼雜湊（hashing），而不是加密（encryption）：

- ✅ **雜湊是單向的**：無法還原原始密碼
- ✅ **bcrypt 是業界標準**：被廣泛使用且安全
- ✅ **自動加鹽（salt）**：每個密碼都有唯一的鹽值
- ❌ **不需要 key**：bcrypt 使用內建的 salt 機制

### 為什麼使用雜湊而不是加密？

| 特性 | 雜湊 (Hashing) | 加密 (Encryption) |
|------|---------------|------------------|
| 方向 | 單向（無法還原） | 雙向（可以解密） |
| 用途 | 密碼驗證 | 資料傳輸/儲存 |
| 安全性 | ✅ 適合密碼 | ❌ 不適合密碼 |
| 是否需要 key | ❌ 不需要 | ✅ 需要 |

## 📁 檔案結構

```
lib/auth/
├── password.ts      # 密碼雜湊與驗證
└── session.ts       # Session 管理

app/api/auth/
├── register/route.ts  # 註冊 API
├── login/route.ts     # 登入 API
└── logout/route.ts    # 登出 API
```

## 🚀 使用方式

### 1. 安裝依賴

```bash
npm install
```

### 2. 在 Supabase 執行 SQL

執行 `supabase/add-password-column.sql` 來加入 `password` 欄位：

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password TEXT;
```

### 3. 註冊新使用者

```typescript
// Client Component
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  }),
})

const data = await response.json()
```

### 4. 登入

```typescript
// Client Component
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
})

const data = await response.json()
// 登入成功後，會設定 session cookie
```

### 5. 在 Server Component 中取得當前使用者

```typescript
// Server Component
import { getCurrentUserFromSession } from '@/lib/auth/session'

export default async function Page() {
  const user = await getCurrentUserFromSession()
  
  if (!user) {
    return <div>請先登入</div>
  }
  
  return <div>歡迎，{user.email}</div>
}
```

## 🔧 API 端點

### POST `/api/auth/register`

註冊新使用者

**請求：**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**回應：**
```json
{
  "message": "註冊成功",
  "user": {
    "id": "...",
    "email": "user@example.com",
    // ... 其他使用者資料（不包含密碼）
  }
}
```

### POST `/api/auth/login`

登入

**請求：**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**回應：**
```json
{
  "message": "登入成功",
  "user": {
    "id": "...",
    "email": "user@example.com",
    // ... 其他使用者資料
  }
}
```

### POST `/api/auth/logout`

登出

**回應：**
```json
{
  "message": "登出成功"
}
```

## 🔒 安全性說明

### 密碼雜湊

- 使用 `bcryptjs` 進行雜湊
- Salt rounds: 10（業界標準）
- 雜湊值長度：約 60 字元
- 儲存在 `users.password` 欄位

### Session 管理

- 使用 HTTP-only cookie 儲存 session token
- Cookie 在生產環境使用 `secure` 標記（HTTPS only）
- Session 有效期：7 天

### 密碼驗證

- 最小長度：6 個字元（可在 `lib/validations/auth.ts` 調整）
- 建議使用 `checkPasswordStrength()` 檢查密碼強度

## 📝 注意事項

1. **users 表的 id**
   - 如果 `users.id` 是外鍵指向 `auth.users.id`，需要先建立 Supabase Auth 使用者
   - 如果 `users.id` 是獨立的 UUID，可以直接插入

2. **現有使用者**
   - 如果 `users` 表已有資料，現有使用者的 `password` 會是 `NULL`
   - 這些使用者需要重新設定密碼

3. **環境變數**
   - `SESSION_SECRET` 是可選的（如果使用 JWT 或其他機制）
   - 目前實作使用簡單的 base64 編碼

## 🔄 與 Supabase Auth 的差異

| 特性 | 自訂密碼系統 | Supabase Auth |
|------|------------|---------------|
| 控制權 | ✅ 完全控制 | ❌ 由 Supabase 管理 |
| 實作複雜度 | ⚠️ 需要自己實作 | ✅ 開箱即用 |
| 安全性 | ✅ bcrypt 很安全 | ✅ 業界標準 |
| 功能豐富度 | ⚠️ 需要自己實作 | ✅ 包含 OAuth、Email 驗證等 |

## 🎯 下一步

1. ✅ 執行 SQL 加入 `password` 欄位
2. ✅ 安裝依賴：`npm install`
3. ✅ 測試註冊功能
4. ✅ 測試登入功能
5. ✅ 更新前端表單使用新的 API

