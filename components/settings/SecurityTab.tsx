'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { Save, Mail, Lock, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// 表單驗證 schema
const passwordSchema = z.object({
  currentPassword: z.string().min(6, '密碼長度至少需要 6 個字元'),
  newPassword: z.string().min(6, '新密碼長度至少需要 6 個字元'),
  confirmPassword: z.string().min(6, '確認密碼長度至少需要 6 個字元'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '新密碼與確認密碼不相符',
  path: ['confirmPassword'],
})

type PasswordFormData = z.infer<typeof passwordSchema>

interface SecurityTabProps {
  user: any
  onPasswordUpdate: (data: PasswordFormData) => Promise<void>
  onDeleteAccount: () => Promise<void>
}

export function SecurityTab({ user, onPasswordUpdate, onDeleteAccount }: SecurityTabProps) {
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    await onPasswordUpdate(data)
    passwordForm.reset()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            電子郵件
          </CardTitle>
          <CardDescription>您的帳號電子郵件地址</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{user?.email}</p>
              <p className="text-sm text-muted-foreground">電子郵件無法修改</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 修改密碼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            修改密碼
          </CardTitle>
          <CardDescription>更新您的登入密碼</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-1.5">
                目前密碼
              </label>
              <input
                id="currentPassword"
                type="password"
                {...passwordForm.register('currentPassword')}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive mt-1">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-1.5">
                新密碼
              </label>
              <input
                id="newPassword"
                type="password"
                {...passwordForm.register('newPassword')}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive mt-1">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5">
                確認新密碼
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...passwordForm.register('confirmPassword')}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
              >
                <Save className="h-4 w-4" />
                更新密碼
              </motion.button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 刪除帳號 */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">危險區域</CardTitle>
          <CardDescription>永久刪除您的帳號和所有資料</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              刪除帳號後，所有資料將被永久刪除且無法復原。請謹慎操作。
            </p>
            <motion.button
              type="button"
              onClick={onDeleteAccount}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-2 bg-destructive text-destructive-foreground rounded-md font-medium hover:bg-destructive/90 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              刪除帳號
            </motion.button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

