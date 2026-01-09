'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { loginFormSchema, signupFormSchema, type LoginFormData, type SignupFormData } from '@/lib/validations/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * 登入/註冊頁面
 * 可以在登入和註冊之間切換
 */
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold mb-2">VocabMaster</CardTitle>
            <CardDescription>
              {isLogin ? '登入您的帳號' : '建立新帳號'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {isLogin ? (
                <LoginForm
                  key="login"
                  onSwitchToSignup={() => setIsLogin(false)}
                  onSuccess={() => router.push('/lobby')}
                />
              ) : (
                <SignupForm
                  key="signup"
                  onSwitchToLogin={() => setIsLogin(true)}
                  onSuccess={() => {
                    setIsLogin(true)
                    // 可以顯示成功訊息
                  }}
                />
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

/**
 * 登入表單
 */
function LoginForm({
  onSwitchToSignup,
  onSuccess,
}: {
  onSwitchToSignup: () => void
  onSuccess: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '登入失敗')
      }

      // 登入成功
      onSuccess()
    } catch (error: any) {
      setError('root', {
        message: error.message || '登入失敗，請檢查您的帳號密碼',
      })
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium mb-1.5">
          電子郵件
        </label>
        <input
          id="login-email"
          type="email"
          {...register('email')}
          className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          placeholder="your@email.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="login-password" className="block text-sm font-medium mb-1.5">
          密碼
        </label>
        <input
          id="login-password"
          type="password"
          {...register('password')}
          className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="text-sm text-destructive mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      {errors.root && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-destructive/10 border border-destructive/20 rounded-md"
        >
          <p className="text-sm text-destructive">{errors.root.message}</p>
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? '登入中...' : '登入'}
      </motion.button>

      <div className="text-center text-sm text-muted-foreground">
        還沒有帳號？{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-primary hover:underline font-medium"
        >
          立即註冊
        </button>
      </div>
    </motion.form>
  )
}

/**
 * 註冊表單
 */
function SignupForm({
  onSwitchToLogin,
  onSuccess,
}: {
  onSwitchToLogin: () => void
  onSuccess: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '註冊失敗')
      }

      // 註冊成功，切換到登入頁面
      onSuccess()
    } catch (error: any) {
      setError('root', {
        message: error.message || '註冊失敗，請稍後再試',
      })
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium mb-1.5">
          電子郵件
        </label>
        <input
          id="signup-email"
          type="email"
          {...register('email')}
          className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          placeholder="your@email.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium mb-1.5">
          密碼
        </label>
        <input
          id="signup-password"
          type="password"
          {...register('password')}
          className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          placeholder="至少 6 個字元"
        />
        {errors.password && (
          <p className="text-sm text-destructive mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="signup-confirm-password" className="block text-sm font-medium mb-1.5">
          確認密碼
        </label>
        <input
          id="signup-confirm-password"
          type="password"
          {...register('confirmPassword')}
          className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          placeholder="再次輸入密碼"
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {errors.root && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-destructive/10 border border-destructive/20 rounded-md"
        >
          <p className="text-sm text-destructive">{errors.root.message}</p>
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? '註冊中...' : '註冊'}
      </motion.button>

      <div className="text-center text-sm text-muted-foreground">
        已經有帳號了？{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary hover:underline font-medium"
        >
          立即登入
        </button>
      </div>
    </motion.form>
  )
}

