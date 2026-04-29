'use client'

import Link from 'next/link'
import { Settings } from 'lucide-react'

interface HeaderProps {
  title?: string
  showSettings?: boolean
  showBack?: boolean
  onBack?: () => void
}

export function Header({ 
  title = 'VetBuddy', 
  showSettings = true,
  showBack = false,
  onBack,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
        {showBack && onBack && (
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
            aria-label="Volver"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
      </div>
      {showSettings && (
        <Link
          href="/settings"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Configuración"
        >
          <Settings className="h-5 w-5" />
        </Link>
      )}
    </header>
  )
}
