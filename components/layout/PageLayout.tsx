import type { ReactNode } from 'react'

type PageLayoutProps = {
  children: ReactNode
  contentClassName?: string
}

export function PageLayout({
  children,
  contentClassName = '',
}: PageLayoutProps) {
  return (
    <main className="container-app py-12 sm:py-16">
      <section className={`mx-auto ${contentClassName}`}>
        {children}
      </section>
    </main>
  )
}
