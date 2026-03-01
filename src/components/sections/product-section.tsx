'use client'

import { motion } from 'framer-motion'
import { Cpu, Network, Database, Shield, BarChart3, HeadphonesIcon } from 'lucide-react'
import type { Dictionary } from '@/lib/get-dictionary'

const featureIcons = [Cpu, Network, Database, Shield, BarChart3, HeadphonesIcon]


interface ProductSectionProps {
  dict: Dictionary
}

export function ProductSection({ dict }: ProductSectionProps) {
  const features = [
    dict.product.features.gpu,
    dict.product.features.network,
    dict.product.features.storage,
    dict.product.features.security,
    dict.product.features.observability,
    dict.product.features.support,
  ]

  return (
    <section id="produto" className="px-6 py-24" style={{ backgroundColor: 'var(--bg-elevated)' }}>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
            style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}
          >
            {dict.product.badge}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="mb-4"
            style={{
              fontSize: 'var(--text-h2)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              color: 'var(--text-primary)',
            }}
          >
            {dict.product.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mx-auto text-base"
            style={{ color: 'var(--text-secondary)', maxWidth: '52ch' }}
          >
            {dict.product.subtitle}
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = featureIcons[i]
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
                className="group rounded-xl p-6 transition-all duration-200"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-default)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-border)'
                  e.currentTarget.style.boxShadow = '0 0 30px var(--accent-glow)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div
                  className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'var(--accent-bg)' }}
                >
                  <Icon className="h-5 w-5" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
                </div>
                <h3
                  className="mb-2 font-semibold"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                >
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: '100%' }}>
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
