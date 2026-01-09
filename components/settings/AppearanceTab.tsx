'use client'

import { motion } from 'framer-motion'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AppearanceTab() {
  const { theme, setTheme } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>介面外觀</CardTitle>
          <CardDescription>選擇您偏好的主題模式</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-3 p-4 border rounded-md text-left transition-colors ${
                  theme === 'light'
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-accent'
                }`}
              >
                <Sun className="h-5 w-5" />
                <div>
                  <div className="font-medium">淺色模式</div>
                  <div className="text-sm text-muted-foreground">使用淺色主題</div>
                </div>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-3 p-4 border rounded-md text-left transition-colors ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-accent'
                }`}
              >
                <Moon className="h-5 w-5" />
                <div>
                  <div className="font-medium">深色模式</div>
                  <div className="text-sm text-muted-foreground">使用深色主題</div>
                </div>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`flex items-center gap-3 p-4 border rounded-md text-left transition-colors ${
                  theme === 'system'
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-accent'
                }`}
              >
                <Monitor className="h-5 w-5" />
                <div>
                  <div className="font-medium">系統設定</div>
                  <div className="text-sm text-muted-foreground">跟隨系統主題</div>
                </div>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

