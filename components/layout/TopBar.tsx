'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
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

/**
 * 頂部導航欄
 * 顯示在所有登入後的頁面
 */
export function TopBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [streakCount, setStreakCount] = useState(0)

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
            onClick={() => router.push('/words?action=add')}
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
    </header>
  )
}

