import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'XEDGE STORE',
  description: '衣服ECサイト (ポートフォリオ)',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {/* AuthProvider / CartProvider を全ページに提供する。
            共通ヘッダー/フッターは components/ に作成して、ここで <AppHeader /> 等を配置する想定。 */}
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
