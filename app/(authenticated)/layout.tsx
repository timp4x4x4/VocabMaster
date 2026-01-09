import { TopBar } from '@/components/layout/TopBar'

/**
 * 已登入使用者的 Layout
 * 所有放在 (authenticated) 資料夾下的頁面都會有 TopBar
 */
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1">{children}</main>
    </div>
  )
}

