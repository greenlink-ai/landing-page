"use client"

import { motion } from "framer-motion"
import type { Dictionary } from "@/lib/get-dictionary"

/* ═══════════════════════════════════════════════
   Types & Data
   ═══════════════════════════════════════════════ */
interface Quote {
  text: string
  author: string
  role: string
  sourceUrl: string
  sourceDomain: string
  align: "left" | "right"
}

/* ═══════════════════════════════════════════════
   QuoteBlock Component
   ═══════════════════════════════════════════════ */
function QuoteBlock({ quote }: { quote: Quote }) {
  const isLeft = quote.align === "left"

  return (
    <motion.blockquote
      initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={`relative max-w-175 ${
        isLeft ? "mr-auto" : "ml-auto text-right"
      } max-lg:mr-auto max-lg:ml-0 max-lg:text-left`}
    >
      {/* Large quotation marks */}
      <span
        className={`pointer-events-none absolute -top-8 select-none text-7xl font-bold leading-none text-[#fafafa] lg:-top-10 lg:text-8xl ${
          isLeft ? "-left-2" : "-right-2"
        } max-lg:-left-2 max-lg:right-auto`}
      >
        &ldquo;
      </span>

      {/* Quote text — italic */}
      <p className="text-base font-bold italic leading-relaxed text-[#fafafa] lg:text-2xl">
        {quote.text}
      </p>

      {/* Attribution — with emerald accent border */}
      <footer
        className={`mt-6 ${
          isLeft
            ? "border-l-6 border-emerald-500 pl-4"
            : "border-r-6 border-emerald-500 pr-4"
        } max-lg:border-r-0 max-lg:border-l-[3px] max-lg:pl-4 max-lg:pr-0 max-lg:text-left`}
      >
        <span className="text-sm font-semibold text-emerald-500 lg:text-lg">
          {quote.author}
        </span>
        <span className="block text-xs text-[#71717a] lg:text-md">{quote.role}</span>
        <a
          href={quote.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-sm text-[#71717a] transition-colors duration-150 hover:text-[#fafafa]"
        >
          Source: {quote.sourceDomain}
        </a>
      </footer>
    </motion.blockquote>
  )
}

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */
interface WhyNowSectionProps {
  dict: Dictionary
  lang: string
  className?: string
}

export function WhyNowSection({ dict, lang, className }: WhyNowSectionProps) {
  const t = dict.whyNow
  const quotes: Quote[] = t.quotes as Quote[]

  return (
    <section
      id="why-now"
      className={`relative py-24 lg:py-32 ${className ?? ""}`}
    >
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          className="mb-24 flex flex-col items-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-[#fafafa] lg:text-5xl">
            {t.title}
          </h2>
        </motion.div>

        {/* Quotes */}
        <div className="flex flex-col gap-12 lg:gap-24">
          {quotes.map((quote, i) => (
            <QuoteBlock key={i} quote={quote} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-30 text-center font-display text-4xl font-bold tracking-tight text-[#fafafa]"
        >
          {t.ctaBefore}
          <a
            href={`/${lang}/why-section-long`}
            className="text-emerald-500 transition-all duration-150 hover:text-emerald-400"
          >
            {t.ctaLink}
          </a>
          {t.ctaAfter}
        </motion.p>
      </div>
    </section>
  )
}
