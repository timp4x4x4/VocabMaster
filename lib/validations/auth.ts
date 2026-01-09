import { z } from 'zod'

/**
 * 登入表單驗證 schema
 */
export const loginFormSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件地址'),
  password: z.string().min(6, '密碼長度至少需要 6 個字元'),
})

export type LoginFormData = z.infer<typeof loginFormSchema>

/**
 * 註冊表單驗證 schema
 */
export const signupFormSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件地址'),
  password: z.string().min(6, '密碼長度至少需要 6 個字元'),
  confirmPassword: z.string().min(6, '密碼長度至少需要 6 個字元'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '密碼與確認密碼不相符',
  path: ['confirmPassword'],
})

export type SignupFormData = z.infer<typeof signupFormSchema>

