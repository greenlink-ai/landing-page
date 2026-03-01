'use client'

import { motion } from 'framer-motion'
import { BrainCircuit, Rocket, Sliders, FlaskConical } from 'lucide-react'
import type { Dictionary } from '@/lib/get-dictionary'

const caseIcons = [BrainCircuit, Rocket, Sliders, FlaskConical]

interface UseCasesSectionProps {
  dict: Dictionary
}

export function UseCasesSection({ dict }: UseCasesSectionProps) {
  const cases = [
    dict.useCases.cases.training,
    dict.useCases.cases.inference,
    dict.useCases.cases.finetuning,
    dict.useCases.cases.research,
  ]

  return (
    <section id="casos-de-uso" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
            style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}
          >
            {dict.useCases.badge}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="mb-4"
            style={{
              fontSize: 'var(--text-h2)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              color: 'var(--text-primary)',
            }}
          >
            {dict.useCases.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className="mx-auto text-base"
            style={{ color: 'var(--text-secondary)', maxWidth: '48ch' }}
          >
            {dict.useCases.subtitle}
          </motion.p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {cases.map((item, i) => {
            const Icon = caseIcons[i]
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex gap-5 rounded-xl p-6 transition-all duration-200"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-border)'
                  e.currentTarget.style.background = `linear-gradient(135deg, var(--accent-bg) 0%, var(--bg-elevated) 100%)`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)'
                  e.currentTarget.style.background = 'var(--bg-elevated)'
                }}
              >
                <div
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'var(--accent-bg)' }}
                >
                  <Icon className="h-5 w-5" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
                </div>
                <div>
                  <h3
                    className="mb-2 font-semibold"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: '100%' }}>
                    {item.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
