'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

type DropdownMenuProps = {
  label: string
  children: ReactNode
}

export function DropdownMenu({ label, children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const closeMenu = useCallback(() => {
    setIsOpen(false)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDownOutside = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      // メニュー外をクリックしたときだけ閉じる。
      if (menuRef.current && !menuRef.current.contains(target)) {
        closeMenu()
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu()
      }
    }

    document.addEventListener('pointerdown', handlePointerDownOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, closeMenu])

  return (
    <div
      ref={menuRef}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          closeMenu()
        }
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex cursor-pointer items-center gap-1 transition-colors hover:text-muted"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {label}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          onClick={(event) => {
            const target = event.target

            if (!(target instanceof Element)) {
              return
            }

            // Link やボタンを選択したら、遷移・処理後にメニューを閉じる。
            if (target.closest('[role="menuitem"]')) {
              closeMenu()
            }
          }}
          className="absolute right-0 top-full z-50 mt-3 w-60 rounded-lg border border-line bg-paper p-4 shadow-lg"
        >
          {children}
        </div>
      )}
    </div>
  )
}
