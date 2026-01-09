-- ============================================
-- 在 users 表加入 password 欄位
-- ============================================

-- 加入 password 欄位（TEXT 型別，儲存 bcrypt 雜湊）
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password TEXT;

-- 建立索引（如果需要根據 email 查詢）
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 注意：
-- 1. password 欄位儲存的是 bcrypt 雜湊值（不是原始密碼）
-- 2. bcrypt 雜湊值長度約 60 字元
-- 3. 雜湊是單向的，無法還原原始密碼
-- 4. 使用 bcryptjs 進行雜湊和驗證

-- 如果 users 表已經有資料，現有使用者的 password 會是 NULL
-- 這些使用者需要重新設定密碼

