import Link from 'next/link'
import type { Locale } from '@/lib/i18n'
import type { Dictionary } from '@/lib/get-dictionary'
import { CircuitTreeLogo } from '@/components/sections/circuit-tree'

interface FooterProps {
  lang: Locale
  dict: Dictionary
}

export function Footer({ lang, dict }: FooterProps) {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderTop: '1px solid var(--border-default)',
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href={`/${lang}`} className="mb-3 flex items-center gap-2 font-bold text-lg" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              <CircuitTreeLogo className="h-7 w-7 shrink-0" />
              Greenlink
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)', maxWidth: '28rem' }}>
              {dict.footer.tagline}
            </p>
          </div>

          {/* Platform links */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              {dict.footer.sections.platform}
            </p>
            <ul className="flex flex-col gap-2">
              {[
                { href: `/${lang}/produto`, label: dict.footer.links.product },
                { href: `/${lang}/precario`, label: dict.footer.links.pricing },
                { href: `/${lang}/casos-de-uso`, label: dict.footer.links.useCases },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors duration-150" style={{ color: 'var(--text-secondary)' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              {dict.footer.sections.company}
            </p>
            <ul className="flex flex-col gap-2">
              {[
                { href: `/${lang}/sobre`, label: dict.footer.links.about },
                { href: `/${lang}/contacto`, label: dict.footer.links.contact },
                { href: `/${lang}/privacidade`, label: dict.footer.links.privacy },
                { href: `/${lang}/termos`, label: dict.footer.links.terms },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors duration-150" style={{ color: 'var(--text-secondary)' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs md:flex-row" style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
          <p>{dict.footer.copyright}</p>
          <p>
            {dict.footer.euBadge}{' '}
            <span style={{ color: 'var(--accent)' }}>🇪🇺 EU</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
