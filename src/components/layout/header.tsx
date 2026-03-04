'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Locale } from '@/lib/i18n'
import type { Dictionary } from '@/lib/get-dictionary'
import { LanguageSwitcher } from './language-switcher'

const BRAND_TEXT_SVG = '/greenlink-text.svg'

interface HeaderProps {
  lang: Locale
  dict: Dictionary
}

export function Header({ lang, dict }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [brandPaths, setBrandPaths] = useState<string[]>([])
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    fetch(BRAND_TEXT_SVG)
      .then((r) => r.text())
      .then((text) => {
        const allPaths = [...text.matchAll(/\bd="([\s\S]*?)"/g)]
        setBrandPaths(allPaths.map((m) => m[1].replace(/[\r\n]+/g, ' ').trim()))
      })
      .catch(() => {})
  }, [])

  const navLinks = [
    { href: `/${lang}#product`, label: dict.nav.product },
    { href: `/${lang}/casos-de-uso`, label: dict.nav.useCases },
    { href: `/${lang}/produto`, label: dict.nav.infrastructure },
    { href: `/${lang}#pricing`, label: dict.nav.pricing },
    { href: `/${lang}#about`, label: dict.nav.about },
    { href: `/${lang}#contact`, label: dict.nav.contact },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
        isScrolled
          ? 'border-border/50 bg-background/80'
          : 'border-transparent bg-background/60'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Greenlink */}
        <Link href={`/${lang}`} className="flex items-center">
          {brandPaths.length > 0 && (
            <svg
              viewBox="0 0 2750 800"
              className="h-8 w-auto"
              fill="none"
              aria-label="Greenlink"
            >
              {brandPaths.map((d, i) => (
                <path key={i} d={d} fill="#fafafa" />
              ))}
            </svg>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                isActive(link.href)
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher lang={lang} />
          <Button
            asChild
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            <Link href={`/${lang}#contacto`}>
              {dict.nav.getStarted}
            </Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          className="text-foreground md:hidden"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
        >
          <nav className="flex flex-col gap-1 p-4" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`rounded-md px-3 py-2.5 text-sm transition-colors ${
                  isActive(link.href)
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
                onClick={() => setIsMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
              <LanguageSwitcher lang={lang} />
              <Button
                asChild
                size="sm"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                <Link
                  href={`/${lang}#contacto`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  {dict.nav.getStarted}
                </Link>
              </Button>
            </div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  )
}
