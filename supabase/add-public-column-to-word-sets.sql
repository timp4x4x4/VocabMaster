-- ============================================
-- 在 word_sets 表加入 public 欄位
-- 用於標記單字集是否為公開
-- ============================================

-- 加入 public 欄位（BOOLEAN 型別，預設為 true）
ALTER TABLE word_sets 
ADD COLUMN IF NOT EXISTS public BOOLEAN DEFAULT true;

-- 建立索引（如果需要根據 public 狀態查詢）
CREATE INDEX IF NOT EXISTS idx_word_sets_public ON word_sets(public);

-- 更新現有資料（如果需要，可以將所有現有單字集設為公開）
-- UPDATE word_sets SET public = true WHERE public IS NULL;

-- ============================================
-- 注意事項
-- ============================================
-- 1. public 欄位預設值為 true，表示新建立的單字集預設為公開
-- 2. 如果現有單字集需要設為非公開，可以執行：
--    UPDATE word_sets SET public = false WHERE id = 'your_word_set_id';
-- 3. 查詢公開單字集時，可以加上條件：
--    SELECT * FROM word_sets WHERE public = true;

