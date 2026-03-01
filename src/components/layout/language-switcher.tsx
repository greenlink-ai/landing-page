'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Locale } from '@/lib/i18n'

interface LanguageSwitcherProps {
  lang: Locale
}

export function LanguageSwitcher({ lang }: LanguageSwitcherProps) {
  const pathname = usePathname()

  function switchLocale(target: Locale) {
    const segments = pathname.split('/')
    segments[1] = target
    return segments.join('/')
  }

  return (
    <div className="flex items-center rounded-md border border-border bg-secondary px-1 py-0.5 text-xs">
      {(['pt', 'en'] as Locale[]).map((locale) => (
        <Link
          key={locale}
          href={switchLocale(locale)}
          className={`rounded px-2 py-1 font-medium uppercase transition-colors ${
            lang === locale
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {locale}
        </Link>
      ))}
    </div>
  )
}
