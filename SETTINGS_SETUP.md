# 設定頁面安裝說明

## 📦 需要安裝的套件

執行以下命令安裝必要的套件：

```bash
npm install next-themes react-image-crop
```

## 🎨 功能說明

### 1. 個人資料 (Profile)
- ✅ 頭像上傳與裁切
- ✅ 顯示名稱（username）
- ✅ 全名（full_name）

### 2. 介面外觀 (Appearance)
- ✅ 主題切換（Light / Dark / System）
- ✅ 使用 next-themes 實作

### 3. 帳號安全 (Security)
- ✅ Email 顯示
- ✅ 修改密碼
- ✅ 刪除帳號

## 🔧 Supabase Storage 設定

### 建立 Bucket

1. 前往 Supabase Dashboard > Storage
2. 建立新 Bucket：
   - **Name**: `avatars`
   - **Public bucket**: ✅ 勾選
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/*`

### 設定 RLS 政策（可選）

如果使用 Admin Client，可以跳過 RLS 設定。如果需要，參考 `supabase/storage-setup.md`。

## 📁 檔案結構

```
avatars/
└── Avatar/
    └── {userId}/
        └── image.{ext}
```

## 🚀 使用方式

1. 訪問 `/settings` 頁面
2. 切換標籤頁查看不同設定
3. 上傳頭像：選擇圖片 → 裁切 → 確認 → 點擊「儲存變更」
4. 修改密碼：輸入目前密碼和新密碼
5. 刪除帳號：輸入密碼確認

## ⚠️ 注意事項

- 頭像上傳後會先存在前端，點擊「儲存變更」才會上傳到 Supabase Storage
- 新上傳的頭像會覆蓋舊的（使用 `upsert: true`）
- 刪除帳號會同時刪除頭像和所有相關資料

