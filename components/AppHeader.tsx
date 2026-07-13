'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { DropdownMenu } from '@/components/DropdownMenu'
import { MobileHeaderMenu } from '@/components/MobileHeaderMenu'

const DEBUG = {
  // ヘッダーの表示確認用。true にすると Context 経由の localStorage 状態を使わない。
  // レビュー・実動作確認時は false のままにする。
  enabled: false,
  login: true,
  cartCount: 100,
}

export function AppHeader() {
  const router = useRouter()
  // localStorage の保存・復元は各 Context 側に任せ、ヘッダーは状態だけを参照する。
  const { isLoggedIn, logout } = useAuth()
  const { totalItems } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const loginState = DEBUG.enabled ? DEBUG.login : isLoggedIn
  const displayCartCount = DEBUG.enabled ? DEBUG.cartCount : totalItems
  const displayCartBadge = displayCartCount > 99 ? '99+' : displayCartCount.toString()

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev)
  }

  // PC幅に戻ったとき、非表示のモバイルメニューが開いた状態で残らないようにする。
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 640px)')

    const closeMenuOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) {
        closeMobileMenu()
      }
    }

    mediaQuery.addEventListener('change', closeMenuOnDesktop)

    return () => {
      mediaQuery.removeEventListener('change', closeMenuOnDesktop)
    }
  }, [closeMobileMenu])

  const handleLogout = () => {
    logout()
    closeMobileMenu()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper shadow-sm">
      <div className="container-app flex items-center justify-between py-5">
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="text-2xl font-extrabold tracking-wide text-ink transition-opacity hover:opacity-80 sm:text-3xl"
        >
          XEDGE STORE
        </Link>

        <MobileHeaderMenu
          isOpen={isMobileMenuOpen}
          isLoggedIn={loginState}
          cartCount={displayCartCount}
          cartBadge={displayCartBadge}
          onToggle={toggleMobileMenu}
          onClose={closeMobileMenu}
          onLogout={handleLogout}
        />

        <nav className="hidden items-center gap-x-6 gap-y-3 text-sm font-medium sm:flex">
          <Link href="/products" className="transition-colors hover:text-muted">
            商品一覧
          </Link>

          <Link
            href="/cart"
            className="inline-flex items-center gap-0.5 transition-colors hover:text-muted"
          >
            <span>カート</span>

            {displayCartCount > 0 && (
              <span className="-mt-4 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-bold leading-none text-paper">
                {displayCartBadge}
              </span>
            )}
          </Link>

          {loginState ? (
            <>
              <Link href="/orders" className="transition-colors hover:text-muted">
                注文履歴
              </Link>

              <DropdownMenu label="アカウント">
                <Link
                  href="/mypage"
                  role="menuitem"
                  className="block rounded-md px-3 py-2 transition-colors hover:bg-paper-soft focus:bg-paper-soft focus:outline-none"
                >
                  マイページ
                </Link>

                <div className="my-3 border-t border-line" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="block w-full cursor-pointer rounded-md px-3 py-2 text-left transition-colors hover:bg-paper-soft focus:bg-paper-soft focus:outline-none"
                >
                  ログアウト
                </button>
              </DropdownMenu>
            </>
          ) : (
            <DropdownMenu label="ログイン">
              <Link
                href="/login"
                role="menuitem"
                className="block rounded-md px-3 py-2 transition-colors hover:bg-paper-soft focus:bg-paper-soft focus:outline-none"
              >
                ログイン
              </Link>

              <div className="my-3 border-t border-line" />

              <p className="mb-2 text-xs text-muted">初めてのご利用ですか？</p>

              <Link
                href="/signup"
                role="menuitem"
                className="block rounded-md px-3 py-2 font-medium transition-colors hover:bg-paper-soft focus:bg-paper-soft focus:outline-none"
              >
                会員登録はこちら
              </Link>
            </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
  )
}
