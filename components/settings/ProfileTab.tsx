'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AvatarUpload } from '@/components/settings/AvatarUpload'

// 表單驗證 schema
const profileSchema = z.object({
  username: z.string().max(50, '使用者名稱不能超過 50 個字元').optional(),
  full_name: z.string().max(100, '全名不能超過 100 個字元').optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileTabProps {
  user: any
  onProfileUpdate: (data: ProfileFormData, avatarFile: File | null) => Promise<void>
}

export function ProfileTab({ user, onProfileUpdate }: ProfileTabProps) {
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      full_name: user?.full_name || '',
    },
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // 當 user 更新時，同步表單值
  useEffect(() => {
    if (user) {
      profileForm.reset({
        username: user.username || '',
        full_name: user.full_name || '',
      })
    }
  }, [user, profileForm])

  const handleSubmit = async (data: ProfileFormData) => {
    await onProfileUpdate(data, avatarFile)
    setAvatarFile(null) // 清除暫存的檔案
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>個人資料</CardTitle>
          <CardDescription>更新您的個人資訊和頭像</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit(handleSubmit)} className="space-y-6">
            {/* 頭像上傳 */}
            <div>
              <label className="block text-sm font-medium mb-2">頭像</label>
              <AvatarUpload
                currentAvatar={user?.avatar_url || undefined}
                onAvatarChange={setAvatarFile}
              />
            </div>

            {/* 顯示名稱 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1.5">
                使用者名稱
              </label>
              <input
                id="username"
                {...profileForm.register('username')}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="輸入使用者名稱"
              />
              {profileForm.formState.errors.username && (
                <p className="text-sm text-destructive mt-1">
                  {profileForm.formState.errors.username.message}
                </p>
              )}
            </div>

            {/* 全名 */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium mb-1.5">
                全名
              </label>
              <input
                id="full_name"
                {...profileForm.register('full_name')}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="輸入全名（選填）"
              />
              {profileForm.formState.errors.full_name && (
                <p className="text-sm text-destructive mt-1">
                  {profileForm.formState.errors.full_name.message}
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
                儲存變更
              </motion.button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

