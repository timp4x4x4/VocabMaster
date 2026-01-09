# Supabase Storage 設定說明

## 📦 建立 Storage Bucket

### 步驟

1. 前往 [Supabase Dashboard](https://app.supabase.com/)
2. 選擇你的專案
3. 進入 **Storage**
4. 點擊 **New bucket**
5. 設定：
   - **Name**: `avatars`
   - **Public bucket**: ✅ 勾選（這樣才能取得公開 URL）
   - **File size limit**: 建議 5MB
   - **Allowed MIME types**: `image/*`

### 設定 RLS 政策

在 Storage > Policies 中設定：

```sql
-- 允許所有人讀取（因為是公開 bucket）
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 允許已登入使用者上傳自己的頭像
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 允許已登入使用者更新自己的頭像
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 允許已登入使用者刪除自己的頭像
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## 📁 檔案結構

```
avatars/
└── Avatar/
    └── {userId}/
        └── image.{ext}
```

例如：
```
avatars/
└── Avatar/
    └── 123e4567-e89b-12d3-a456-426614174000/
        └── image.jpg
```

## 🔧 使用 Admin Client 的原因

由於我們使用自訂的認證系統（不是 Supabase Auth），在 API Route 中使用 **Admin Client** 來上傳檔案，這樣可以繞過 RLS 政策。

## ✅ 驗證設定

上傳一個測試檔案，確認：
1. Bucket 已建立
2. 檔案可以上傳
3. 可以取得公開 URL
4. 檔案可以覆蓋（upsert: true）

