# 環境變數設定

請建立 `.env.local` 檔案（此檔案已被 .gitignore 忽略，不會被提交到版本控制）

## 檔案內容

```env
# Supabase 設定
# 從 Supabase Dashboard > Settings > API 取得這些值

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Service Role Key（用於繞過 RLS，僅伺服器端使用）
# ⚠️ 警告：絕對不要暴露給瀏覽器端！
# 從 Supabase Dashboard > Settings > API > service_role key 取得
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Session Secret（用於加密 session token，可選）
# 如果使用 JWT 或其他 session 機制，可以設定這個
# 生成方式：openssl rand -base64 32
SESSION_SECRET=your_random_secret_key_here
```

## 取得 Supabase 憑證

1. 前往 [Supabase Dashboard](https://app.supabase.com/)
2. 選擇或建立你的專案
3. 進入 **Settings** > **API**
4. 複製以下資訊：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ 保密！

## 注意事項

- `.env.local` 檔案只存在於本地開發環境
- 所有以 `NEXT_PUBLIC_` 開頭的變數會暴露給瀏覽器端
- 生產環境請在部署平台（Vercel、Netlify 等）設定環境變數

