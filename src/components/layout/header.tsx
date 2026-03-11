'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/ui/brand-logo'
import { useBrandLogo } from '@/lib/use-brand-logo'
import type { Locale } from '@/lib/i18n'
import type { Dictionary } from '@/lib/get-dictionary'
import { LanguageSwitcher } from './language-switcher'

const BRAND_TEXT_SVG = '/greenlink-text.svg'

interface HeaderProps {
  lang: Locale
  dict: Dictionary
}

function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="relative flex h-6 w-7 flex-col items-center justify-center">
      <span
        className="absolute h-0.5 w-full rounded-full bg-current transition-all duration-300 ease-in-out"
        style={{
          transform: isOpen ? 'rotate(45deg)' : 'translateY(-8px)',
        }}
      />
      <span
        className="absolute h-0.5 w-full rounded-full bg-current transition-all duration-300 ease-in-out"
        style={{
          opacity: isOpen ? 0 : 1,
          transform: isOpen ? 'scaleX(0)' : 'scaleX(1)',
        }}
      />
      <span
        className="absolute h-0.5 w-full rounded-full bg-current transition-all duration-300 ease-in-out"
        style={{
          transform: isOpen ? 'rotate(-45deg)' : 'translateY(8px)',
        }}
      />
    </div>
  )
}

export function Header({ lang, dict }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [brandPaths, setBrandPaths] = useState<string[]>([])
  const logoPaths = useBrandLogo()
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobileOpen])

  const navLinks = [
    { href: `/${lang}#solutions`, label: dict.nav.product },
    { href: `/${lang}/use-cases`, label: dict.nav.useCases },
    { href: `/${lang}/infrastructure`, label: dict.nav.infrastructure },
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
        {/* Brand text — hidden on mobile */}
        <Link href={`/${lang}`} className="hidden items-center md:flex">
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

        {/* Mobile: empty spacer to keep hamburger on the right */}
        <div className="md:hidden" />

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

        {/* Right side — desktop */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher lang={lang} />
          <Button
            asChild
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            <Link href={`/${lang}#contact`}>
              {dict.nav.getStarted}
            </Link>
          </Button>
        </div>

        {/* Mobile menu button — animated hamburger/X */}
        <button
          className="text-foreground md:hidden p-1"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle menu"
        >
          <HamburgerIcon isOpen={isMobileOpen} />
        </button>
      </div>

      {/* Mobile nav — fullscreen overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed inset-0 top-16 z-40 bg-background/98 backdrop-blur-2xl md:hidden"
            style={{ height: '80dvh' }}
          >
            <nav
              className="flex h-full flex-col items-center justify-center gap-2 px-6"
              aria-label="Mobile navigation"
            >
              {/* Logo at the top of the menu */}
              {logoPaths && (
                <div className="mb-6" style={{ width: 'min(220px, 50vw)' }}>
                  <BrandLogo paths={logoPaths} className="h-auto w-full" />
                </div>
              )}

              {/* Nav links — centered */}
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.25 }}
                  className={`w-full rounded-lg py-3 text-center text-base font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}

              {/* Language switcher — centered */}
              <div className="mt-6 flex flex-col items-center gap-4">
                <LanguageSwitcher lang={lang} />
                <Button
                  asChild
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8"
                >
                  <Link
                    href={`/${lang}#contact`}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {dict.nav.getStarted}
                  </Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
