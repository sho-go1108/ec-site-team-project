'use client'

import Link from 'next/link'

type MobileHeaderMenuProps = {
  isOpen: boolean
  isLoggedIn: boolean
  cartCount: number
  cartBadge: string
  onToggle: () => void
  onClose: () => void
  onLogout: () => void
}

export function MobileHeaderMenu({
  isOpen,
  isLoggedIn,
  cartCount,
  cartBadge,
  onToggle,
  onClose,
  onLogout,
}: MobileHeaderMenuProps) {
  return (
    <>
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded border border-line text-ink transition-colors hover:bg-paper-soft sm:hidden"
        aria-label="メニューを開閉"
        aria-controls="mobile-navigation"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        {isOpen ? (
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.22 4.22a.75.75 0 011.06 0L10 8.94l4.72-4.72a.75.75 0 111.06 1.06L11.06 10l4.72 4.72a.75.75 0 11-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 01-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 010-1.06z"
            />
          </svg>
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3 5.75A.75.75 0 013.75 5h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 5.75zM3 10a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 10zm0 4.25a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <nav
          id="mobile-navigation"
          className="absolute left-0 top-full w-full border-t border-line bg-paper px-4 py-3 text-sm font-medium shadow-sm sm:hidden"
        >
          <div className="flex flex-col">
            <Link
              href="/"
              onClick={onClose}
              className="rounded px-3 py-3 transition-colors hover:bg-paper-soft"
            >
              トップ
            </Link>

            <Link
              href="/products"
              onClick={onClose}
              className="rounded px-3 py-3 transition-colors hover:bg-paper-soft"
            >
              商品一覧
            </Link>

            <Link
              href="/cart"
              onClick={onClose}
              className="flex items-center gap-2 rounded px-3 py-3 transition-colors hover:bg-paper-soft"
            >
              <span>カート</span>

              {/* カートが空のときはバッジを表示しない。 */}
              {cartCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-bold leading-none text-paper">
                  {cartBadge}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  href="/orders"
                  onClick={onClose}
                  className="rounded px-3 py-3 transition-colors hover:bg-paper-soft"
                >
                  注文履歴
                </Link>

                <Link
                  href="/mypage"
                  onClick={onClose}
                  className="rounded px-3 py-3 transition-colors hover:bg-paper-soft"
                >
                  マイページ
                </Link>

                <button
                  type="button"
                  onClick={onLogout}
                  className="cursor-pointer rounded px-3 py-3 text-left transition-colors hover:bg-paper-soft"
                >
                  ログアウト
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="rounded px-3 py-3 transition-colors hover:bg-paper-soft"
                >
                  ログイン
                </Link>

                <Link
                  href="/signup"
                  onClick={onClose}
                  className="rounded px-3 py-3 transition-colors hover:bg-paper-soft"
                >
                  会員登録
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </>
  )
}
