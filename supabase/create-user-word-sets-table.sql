-- ============================================
-- 建立使用者單字集關聯表
-- 用於記錄使用者匯入的單字集，區分公開資料集和使用者自己的資料集
-- 只記錄基本的關聯關係：誰有哪個資料集
-- ============================================

-- 建立 user_word_sets 表
CREATE TABLE IF NOT EXISTS user_word_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word_set_id UUID NOT NULL REFERENCES word_sets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 唯一約束：每個使用者只能匯入同一個單字集一次
  UNIQUE(user_id, word_set_id)
);

-- 建立索引以提高查詢效能
CREATE INDEX IF NOT EXISTS idx_user_word_sets_user_id ON user_word_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_word_sets_word_set_id ON user_word_sets(word_set_id);
CREATE INDEX IF NOT EXISTS idx_user_word_sets_created_at ON user_word_sets(created_at DESC);

-- ============================================
-- Row Level Security (RLS) 政策
-- ============================================

-- 啟用 RLS
ALTER TABLE user_word_sets ENABLE ROW LEVEL SECURITY;

-- 政策 1: 使用者可以查看自己的單字集
DROP POLICY IF EXISTS "Users can view own word sets" ON user_word_sets;
CREATE POLICY "Users can view own word sets" ON user_word_sets
  FOR SELECT
  USING (true); -- 暫時允許所有人查看，你可以根據需求調整為 auth.uid() = user_id

-- 政策 2: 使用者可以匯入單字集到自己帳號
DROP POLICY IF EXISTS "Users can import word sets" ON user_word_sets;
CREATE POLICY "Users can import word sets" ON user_word_sets
  FOR INSERT
  WITH CHECK (true); -- 暫時允許，你可以在 API 中驗證 user_id

-- 政策 3: 使用者可以移除自己匯入的單字集
DROP POLICY IF EXISTS "Users can delete own word sets" ON user_word_sets;
CREATE POLICY "Users can delete own word sets" ON user_word_sets
  FOR DELETE
  USING (true); -- 暫時允許，你可以在 API 中驗證 user_id

-- ============================================
-- 注意事項
-- ============================================
-- 1. 這個表記錄使用者匯入的單字集，不影響原始的 word_sets 表
-- 2. 當使用者匯入單字集時，只需要在 user_word_sets 中新增一筆記錄
-- 3. 查詢使用者的單字集時，可以 JOIN word_sets 表取得完整資訊
-- 4. 如果 word_sets 被刪除，相關的 user_word_sets 記錄也會被 CASCADE 刪除
-- 5. 如果使用者被刪除，相關的 user_word_sets 記錄也會被 CASCADE 刪除

