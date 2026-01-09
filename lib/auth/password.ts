import bcrypt from 'bcryptjs'

/**
 * 密碼雜湊與驗證工具
 * 使用 bcryptjs 進行密碼雜湊（單向，無法還原）
 * 
 * 注意：雖然你提到"加密"，但密碼儲存應該使用"雜湊"（hashing）
 * - 雜湊是單向的，無法還原原始密碼
 * - 加密是雙向的，可以解密（不適合密碼儲存）
 * - bcrypt 是業界標準的密碼雜湊演算法
 */

/**
 * 雜湊密碼
 * @param password 原始密碼
 * @returns 雜湊後的密碼字串
 */
export async function hashPassword(password: string): Promise<string> {
  // saltRounds: 10 是平衡安全性和效能的推薦值
  // 更高的值更安全但更慢，10 是業界標準
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

/**
 * 驗證密碼
 * @param password 使用者輸入的原始密碼
 * @param hashedPassword 資料庫中儲存的雜湊密碼
 * @returns 是否匹配
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * 檢查密碼強度（可選功能）
 * @param password 密碼
 * @returns 強度評分和建議
 */
export function checkPasswordStrength(password: string): {
  score: number // 0-4
  strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
  suggestions: string[]
} {
  const suggestions: string[] = []
  let score = 0

  // 長度檢查
  if (password.length >= 8) {
    score++
  } else {
    suggestions.push('密碼長度至少需要 8 個字元')
  }

  if (password.length >= 12) {
    score++
  }

  // 包含小寫字母
  if (/[a-z]/.test(password)) {
    score++
  } else {
    suggestions.push('建議包含小寫字母')
  }

  // 包含大寫字母
  if (/[A-Z]/.test(password)) {
    score++
  } else {
    suggestions.push('建議包含大寫字母')
  }

  // 包含數字
  if (/\d/.test(password)) {
    score++
  } else {
    suggestions.push('建議包含數字')
  }

  // 包含特殊字元
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++
  } else {
    suggestions.push('建議包含特殊字元')
  }

  let strength: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
  if (score <= 2) {
    strength = 'weak'
  } else if (score === 3) {
    strength = 'fair'
  } else if (score === 4) {
    strength = 'good'
  } else if (score === 5) {
    strength = 'strong'
  } else {
    strength = 'very-strong'
  }

  return { score, strength, suggestions }
}

