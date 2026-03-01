'use client'

import { motion } from 'framer-motion'
import { Globe, Zap, Eye } from 'lucide-react'
import type { Dictionary } from '@/lib/get-dictionary'

const valueIcons = [Globe, Zap, Eye]

interface AboutSectionProps {
  dict: Dictionary
}

export function AboutSection({ dict }: AboutSectionProps) {
  const values = [
    dict.about.values.sovereignty,
    dict.about.values.performance,
    dict.about.values.transparency,
  ]

  return (
    <section id="sobre" className="px-6 py-24" style={{ backgroundColor: 'var(--bg-elevated)' }}>
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span
              className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
              style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}
            >
              {dict.about.badge}
            </span>
            <h2
              className="mb-6"
              style={{
                fontSize: 'var(--text-h2)',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                color: 'var(--text-primary)',
              }}
            >
              {dict.about.title}
            </h2>
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: '55ch' }}>
              {dict.about.description}
            </p>
          </motion.div>

          {/* Right: values */}
          <div className="flex flex-col gap-4">
            {values.map((value, i) => {
              const Icon = valueIcons[i]
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  className="flex items-start gap-4 rounded-xl p-5"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <div
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'var(--accent-bg)' }}
                  >
                    <Icon className="h-4 w-4" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                      {value.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: '100%' }}>
                      {value.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
