-- ============================================
-- 修正註冊時的 RLS 政策
-- 允許公開註冊（不需要登入）
-- ============================================

-- 刪除現有的插入政策（如果有的話）
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Anyone can register" ON users;

-- 建立允許公開註冊的政策
-- 注意：這允許任何人註冊，但我們會在 API 中驗證 email 唯一性
CREATE POLICY "Anyone can register" ON users
  FOR INSERT
  WITH CHECK (true);

-- 或者，如果你想要更嚴格的控制，可以檢查 email 格式
-- CREATE POLICY "Anyone can register with valid email" ON users
--   FOR INSERT
--   WITH CHECK (
--     email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
--   );

-- 確保其他政策仍然有效
-- 使用者可以讀取自己的資料
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id OR id IN (
    -- 允許讀取自己的資料（如果使用 session token）
    SELECT user_id FROM study_records WHERE user_id = id
  ));

-- 或者更簡單的方式：允許讀取自己的資料（基於 session）
-- 但這需要根據你的 session 實作調整

-- 如果使用 session token 而不是 Supabase Auth，可以這樣設定：
-- 允許讀取自己的資料（通過 session）
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (true); -- 暫時允許所有人讀取，你可以根據需求調整

-- 使用者可以更新自己的資料
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (true); -- 暫時允許，你可以在 API 中驗證權限

-- ============================================
-- 更好的方式：使用 Service Role Key（推薦）
-- ============================================
-- 在 API Route 中使用 Service Role Key 來繞過 RLS
-- 這樣可以完全控制誰可以註冊
-- 需要在 .env.local 中加入：
-- SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

