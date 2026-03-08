"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n"
import type { Dictionary } from "@/lib/get-dictionary"

const BRAND_SVG_URL = "/GreenLink-V2.svg"

/* ─── Inline SVG social icons (no library dependency) ─── */
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46L20 4" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════
   Footer
   ═══════════════════════════════════════════════ */
interface FooterProps {
  lang: Locale
  dict: Dictionary
}

interface BrandPaths {
  tree: string
  green: string
  link: string
}

export function Footer({ lang, dict }: FooterProps) {
  const [paths, setPaths] = useState<BrandPaths | null>(null)
  const t = dict.footer

  useEffect(() => {
    fetch(BRAND_SVG_URL)
      .then((r) => r.text())
      .then((text) => {
        const allPaths = [...text.matchAll(/\bd="([\s\S]*?)"/g)]
        if (allPaths.length >= 3) {
          setPaths({
            link: allPaths[0][1].replace(/[\r\n]+/g, " ").trim(),
            green: allPaths[1][1].replace(/[\r\n]+/g, " ").trim(),
            tree: allPaths[2][1].replace(/[\r\n]+/g, " ").trim(),
          })
        }
      })
      .catch(() => {})
  }, [])

  const productLinks = [
    { href: `/${lang}#solutions-instances`, label: t.links.instances },
    { href: `/${lang}#solutions-clusters`, label: t.links.clusters },
    { href: `/${lang}#solutions-storage`, label: t.links.storage },
    { href: `/${lang}#pricing`, label: t.links.pricing },
  ]

  const resourceLinks = [
    { href: `/${lang}/infrastructure`, label: t.links.infrastructure },
    { href: `/${lang}/gpu`, label: t.links.gpu },
    { href: `/${lang}/use-cases`, label: t.links.useCases },
    { href: `/${lang}/why-section-long`, label: t.links.whySectionLong },
  ]

  const companyLinks = [
    { href: `/${lang}#about`, label: t.links.about },
    { href: `/${lang}#contact`, label: t.links.contact },
  ]

  const legalLinks = [
    { href: `/${lang}/privacy`, label: t.links.privacy },
    { href: `/${lang}/cookie-policy`, label: t.links.cookiePolicy },
  ]

  const handleConsentPreferences = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const win = window as unknown as Record<string, unknown>
    if (typeof win.displayPreferenceModal === "function") {
      ;(win.displayPreferenceModal as () => void)()
    }
  }

  const footerColumns = [
    { title: t.sections.product, links: productLinks },
    { title: t.sections.resources, links: resourceLinks },
    { title: t.sections.company, links: companyLinks },
    { title: t.sections.legal, links: legalLinks },
  ]

  return (
    <footer style={{ backgroundColor: "#09090b" }}>
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {/* Brand + tagline — centered at top */}
        <div className="flex flex-col items-center text-center">
          <div style={{ width: "min(480px, 60vw)" }}>
            {paths && (
              <svg
                viewBox="0 0 3500 1500"
                className="h-auto w-full"
                fill="none"
              >
                <defs>
                  <filter
                    id="footer-glow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur
                      in="SourceGraphic"
                      stdDeviation="6"
                      result="blur1"
                    />
                    <feGaussianBlur
                      in="SourceGraphic"
                      stdDeviation="2"
                      result="blur2"
                    />
                    <feMerge>
                      <feMergeNode in="blur1" />
                      <feMergeNode in="blur2" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Tree — emerald with glow */}
                <g filter="url(#footer-glow)">
                  <path
                    d={paths.tree}
                    stroke="#10b981"
                    strokeWidth={5}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={paths.tree}
                    stroke="#6ee7b7"
                    strokeWidth={1.5}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.5}
                  />
                </g>

                {/* "Green" text — white */}
                <path
                  d={paths.green}
                  fill="#fafafa"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* "Link" text — white */}
                <path
                  d={paths.link}
                  fill="#fafafa"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[#a1a1aa]">
            {t.tagline}
          </p>
        </div>

        {/* Navigation columns — centered below */}
        <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4 sm:justify-items-center">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.05em] text-[#fafafa]">
                {col.title}
              </p>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#a1a1aa] transition-colors duration-150 hover:text-[#fafafa]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {/* Consent Preferences — only in the Legal column */}
                {col.title === t.sections.legal && (
                  <li>
                    <a
                      href="#"
                      onClick={handleConsentPreferences}
                      className="termly-display-preferences text-sm text-[#a1a1aa] transition-colors duration-150 hover:text-[#fafafa]"
                    >
                      {t.links.consentPreferences}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div
          className="mt-12 border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        />

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-[#fafafa]">
            &copy; {new Date().getFullYear()} {t.copyright}
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://linkedin.com/company/greenlink"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-[#fafafa] transition-colors duration-150 hover:text-emerald-500"
            >
              <LinkedInIcon className="size-7" />
            </a>
            <a
              href="https://x.com/greenlink"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="text-[#fafafa] transition-colors duration-150 hover:text-emerald-500"
            >
              <XIcon className="size-7" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
