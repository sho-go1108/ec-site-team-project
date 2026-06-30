'use client'

/**
 * クライアント側の Context Provider をまとめるコンポーネント。
 * Server Component である app/layout.tsx から読み込む。
 */
import type { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  )
}
