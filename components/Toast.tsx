'use client'

import { useEffect } from 'react'

export type ToastItem = {
  id: string
  message: string
}

type ToastProps = {
  toast: ToastItem
  onClose: (id: string) => void
  duration?: number
}

function Toast({ toast, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timerId = window.setTimeout(() => onClose(toast.id), duration)

    return () => window.clearTimeout(timerId)
  }, [toast.id, duration, onClose])

  return (
    <div role="status" aria-live="polite" className="rounded-md bg-ink px-5 py-3 text-sm text-paper shadow-lg">
      {toast.message}
    </div>
  )
}

type ToastContainerProps = {
  toasts: ToastItem[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 flex max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  )
}
