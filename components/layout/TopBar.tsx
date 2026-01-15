'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  LayoutDashboard, 
  BookOpen, 
  Plus, 
  Flame, 
  User,
  LogOut,
  Settings,
  Earth
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { wordSetFormSchema, type WordSetFormData } from '@/lib/validations/word-set'

/**
 * 頂部導航欄
 * 顯示在所有登入後的頁面
 */
export function TopBar() {
  return (
    <Suspense fallback={<TopBarFallback />}>
      <TopBarContent />
    </Suspense>
  )
}

/**
 * TopBar 的載入狀態（不使用 searchParams）
 */
function TopBarFallback() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [streakCount, setStreakCount] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WordSetFormData>({
    resolver: zodResolver(wordSetFormSchema),
    defaultValues: {
      public: true,
    },
  })

  const onSubmit = async (data: WordSetFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/word-sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        reset()
        setIsDialogOpen(false)
        // 導航到新建立的單字集
        router.push(`/words/${result.wordSet.id}`)
        router.refresh()
      } else {
        const errorData = await response.json()
        alert(errorData.error || '新增單字集失敗')
      }
    } catch (error) {
      console.error('新增單字集失敗:', error)
      alert('新增單字集失敗，請稍後再試')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setStreakCount(data.user?.streak_count || 0)
        } else {
          if (response.status === 401) {
            router.push('/auth')
          }
        }
      } catch (error) {
        console.error('取得使用者資料失敗:', error)
      }
    }
    fetchUser()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth')
      router.refresh()
    } catch (error) {
      console.error('登出失敗:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/lobby" className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              VocabMaster
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/lobby"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              儀表板
            </Link>
            <Link
              href="/words"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <BookOpen className="h-4 w-4" />
              我的單字庫
            </Link>
            <Link
              href="/words?type=public"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Earth className="h-4 w-4" />
              公開單字庫
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">新增</span>
          </button>
          {streakCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-md bg-accent text-accent-foreground text-sm font-medium">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>{streakCount}</span>
            </div>
          )}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="hidden md:inline text-sm font-medium">
                {user?.email?.split('@')[0] || '使用者'}
              </span>
            </button>
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-md border bg-popover shadow-md z-50">
                  <div className="p-2">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium">{user?.email || '使用者'}</p>
                      {user?.username && (
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      )}
                    </div>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4" />
                      設定
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      登出
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 新增單字集對話框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>新增單字集</DialogTitle>
            <DialogDescription>
              建立一個新的單字集
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title-fallback" className="text-sm font-medium">
                標題 <span className="text-destructive">*</span>
              </label>
              <input
                id="title-fallback"
                {...register('title')}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="例如：TOEIC 核心單字"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="description-fallback" className="text-sm font-medium">
                描述（選填）
              </label>
              <textarea
                id="description-fallback"
                {...register('description')}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="例如：包含 TOEIC 考試中最常用的核心單字"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="category-fallback" className="text-sm font-medium">
                  分類（選填）
                </label>
                <input
                  id="category-fallback"
                  {...register('category')}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="例如：考試"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="difficulty-fallback" className="text-sm font-medium">
                  難度（選填）
                </label>
                <select
                  id="difficulty-fallback"
                  {...register('difficulty')}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">選擇難度</option>
                  <option value="beginner">初級</option>
                  <option value="intermediate">中級</option>
                  <option value="advanced">高級</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="tags-fallback" className="text-sm font-medium">
                標籤（選填，用逗號分隔）
              </label>
              <input
                id="tags-fallback"
                {...register('tags', {
                  setValueAs: (value: string) => {
                    if (!value) return null
                    return value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                  }
                })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="例如：TOEIC, 考試, 單字"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="public-fallback"
                {...register('public')}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="public-fallback" className="text-sm font-medium">
                設為公開單字集
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '新增中...' : '新增'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  )
}

/**
 * TopBar 的主要內容（使用 searchParams）
 */
function TopBarContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [streakCount, setStreakCount] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WordSetFormData>({
    resolver: zodResolver(wordSetFormSchema),
    defaultValues: {
      public: true,
    },
  })

  const onSubmit = async (data: WordSetFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/word-sets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        reset()
        setIsDialogOpen(false)
        // 導航到新建立的單字集
        router.push(`/words/${result.wordSet.id}`)
        router.refresh()
      } else {
        const errorData = await response.json()
        alert(errorData.error || '新增單字集失敗')
      }
    } catch (error) {
      console.error('新增單字集失敗:', error)
      alert('新增單字集失敗，請稍後再試')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 取得使用者資料
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setStreakCount(data.user?.streak_count || 0)
        } else {
          // 如果未登入，導向登入頁
          if (response.status === 401) {
            router.push('/auth')
          }
        }
      } catch (error) {
        console.error('取得使用者資料失敗:', error)
      }
    }
    fetchUser()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth')
      router.refresh()
    } catch (error) {
      console.error('登出失敗:', error)
    }
  }

  const navItems = [
    { href: '/lobby', label: '儀表板', icon: LayoutDashboard, matchType: 'exact' },
    { href: '/words', label: '我的單字庫', icon: BookOpen, matchType: 'my' },
    { href: '/words?type=public', label: '公開單字庫', icon: Earth, matchType: 'public' },
  ]

  // 判斷導航項目是否為 active
  const isNavItemActive = (item: typeof navItems[0]) => {
    if (item.matchType === 'exact') {
      return pathname === item.href
    }
    if (item.matchType === 'my') {
      // 我的單字庫：pathname 是 /words 且沒有 type=public
      return pathname === '/words' && searchParams.get('type') !== 'public'
    }
    if (item.matchType === 'public') {
      // 公開單字庫：pathname 是 /words 且有 type=public
      return pathname === '/words' && searchParams.get('type') === 'public'
    }
    return false
  }

  return (      
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* 左側：Logo 和導航 */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/lobby" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            >
              VocabMaster
            </motion.div>
          </Link>

          {/* 導航項目 */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = isNavItemActive(item)
              // 使用 label 作為 key，因為每個項目的 label 都是唯一的
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* 右側：搜尋、新增、連續天數、使用者選單 */}
        <div className="flex items-center gap-4">
          {/* 搜尋（暫時隱藏，等實作） */}
          {/* <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-md border bg-background text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            <input
              type="text"
              placeholder="搜尋單字..."
              className="outline-none bg-transparent w-32"
            />
          </div> */}

          {/* 新增按鈕 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">新增</span>
          </motion.button>

          {/* 連續學習天數 */}
          {streakCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-md bg-accent text-accent-foreground text-sm font-medium">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>{streakCount}</span>
            </div>
          )}

          {/* 使用者選單 */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="hidden md:inline text-sm font-medium">
                {user?.email?.split('@')[0] || '使用者'}
              </span>
              <motion.svg
                animate={{ rotate: showUserMenu ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </motion.button>

            {/* 下拉選單 */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 rounded-md border bg-popover shadow-md z-50"
                >
                  <div className="p-2">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium">{user?.email || '使用者'}</p>
                      {user?.username && (
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      )}
                    </div>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4" />
                      設定
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      登出
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 新增單字集對話框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>新增單字集</DialogTitle>
            <DialogDescription>
              建立一個新的單字集
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title-content" className="text-sm font-medium">
                標題 <span className="text-destructive">*</span>
              </label>
              <input
                id="title-content"
                {...register('title')}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="例如：TOEIC 核心單字"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="description-content" className="text-sm font-medium">
                描述（選填）
              </label>
              <textarea
                id="description-content"
                {...register('description')}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="例如：包含 TOEIC 考試中最常用的核心單字"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="category-content" className="text-sm font-medium">
                  分類（選填）
                </label>
                <input
                  id="category-content"
                  {...register('category')}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="例如：考試"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="difficulty-content" className="text-sm font-medium">
                  難度（選填）
                </label>
                <select
                  id="difficulty-content"
                  {...register('difficulty')}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">選擇難度</option>
                  <option value="beginner">初級</option>
                  <option value="intermediate">中級</option>
                  <option value="advanced">高級</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="tags-content" className="text-sm font-medium">
                標籤（選填，用逗號分隔）
              </label>
              <input
                id="tags-content"
                {...register('tags', {
                  setValueAs: (value: string) => {
                    if (!value) return null
                    return value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                  }
                })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="例如：TOEIC, 考試, 單字"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="public-content"
                {...register('public')}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="public-content" className="text-sm font-medium">
                設為公開單字集
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '新增中...' : '新增'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  )
}

