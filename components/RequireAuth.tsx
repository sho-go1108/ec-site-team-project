'use client'

/**
 * 認証必須ページのガード（Nuxt版 middleware/auth.ts に相当）。
 *
 * 未ログインの場合は /login?redirect=... にリダイレクトする。
 * 注文確認・注文履歴・マイページなど、ログインが必要なページの中身を
 * このコンポーネントで囲って使う。
 *
 * 使い方:
 *   'use client'
 *   export default function MyPage() {
 *     return (
 *       <RequireAuth>
 *         <div>ログイン済みのときだけ表示される中身</div>
 *       </RequireAuth>
 *     )
 *   }
 */
import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoggedIn, isReady } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // localStorage の復元が終わるまで（isReady）は判定しない
    if (isReady && !isLoggedIn) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isReady, isLoggedIn, pathname, router])

  // 復元前・未ログイン時は中身を出さない（リダイレクト待ち）
  if (!isReady || !isLoggedIn) return null

  return <>{children}</>
}
