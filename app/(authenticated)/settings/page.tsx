'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { User, Palette, Shield } from 'lucide-react'
import { ProfileTab } from '@/components/settings/ProfileTab'
import { AppearanceTab } from '@/components/settings/AppearanceTab'
import { SecurityTab } from '@/components/settings/SecurityTab'
import { useToast } from '@/components/ui/toast'

type ProfileFormData = {
  username?: string
  full_name?: string
}

type PasswordFormData = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'security'>('profile')

  // 取得使用者資料
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          router.push('/auth')
        }
      } catch (error) {
        console.error('取得使用者資料失敗:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [router])

  // 更新個人資料
  const handleUpdateProfile = async (data: ProfileFormData, avatarFile: File | null) => {
    try {
      const formData = new FormData()

      // 只有在有值時才添加字段（避免覆蓋原有值）
      if (data.username !== undefined) {
        formData.append('username', data.username || '')
      }
      if (data.full_name !== undefined) {
        formData.append('full_name', data.full_name || '')
      }
      if (avatarFile && avatarFile.size > 0) {
        formData.append('avatar', avatarFile)
      }

      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || '更新失敗')
      }

      // 重新取得使用者資料
      const userResponse = await fetch('/api/auth/me')
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)
      }

      toast('個人資料已更新', { type: 'success' })
    } catch (error: any) {
      console.error('更新個人資料錯誤:', error)
      toast(error.message || '更新失敗', { type: 'error' })
    }
  }

  // 更新密碼
  const handleUpdatePassword = async (data: PasswordFormData) => {
    try {
      const response = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || '密碼更新失敗')
      }

      toast('密碼已更新', { type: 'success' })
    } catch (error: any) {
      toast(error.message || '密碼更新失敗', { type: 'error' })
    }
  }

  // 刪除帳號
  const handleDeleteAccount = async () => {
    if (!confirm('確定要刪除帳號嗎？此操作無法復原，所有資料將被永久刪除。')) {
      return
    }

    const password = prompt('請輸入密碼以確認刪除：')
    if (!password) return

    try {
      const response = await fetch('/api/settings/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || '刪除帳號失敗')
      }

      router.push('/auth')
    } catch (error: any) {
      toast(error.message || '刪除帳號失敗', { type: 'error' })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center text-muted-foreground">載入中...</div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile' as const, label: '個人資料', icon: User },
    { id: 'appearance' as const, label: '介面外觀', icon: Palette },
    { id: 'security' as const, label: '帳號安全', icon: Shield },
  ]

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">設定</h1>
        <p className="text-muted-foreground">管理您的帳號設定和偏好</p>
      </motion.div>

      {/* 標籤頁 */}
      <div className="flex gap-2 mb-6 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* 個人資料 */}
      {activeTab === 'profile' && (
        <ProfileTab user={user} onProfileUpdate={handleUpdateProfile} />
      )}

      {/* 介面外觀 */}
      {activeTab === 'appearance' && <AppearanceTab />}

      {/* 帳號安全 */}
      {activeTab === 'security' && (
        <SecurityTab
          user={user}
          onPasswordUpdate={handleUpdatePassword}
          onDeleteAccount={handleDeleteAccount}
        />
      )}
    </div>
  )
}

