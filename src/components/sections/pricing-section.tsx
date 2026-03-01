'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Calculator } from 'lucide-react'
import type { Dictionary } from '@/lib/get-dictionary'
import type { Locale } from '@/lib/i18n'

const GPU_OPTIONS = [
  { id: 'h100-80gb', label: 'H100 80GB SXM', pricePerHour: 3.2 },
  { id: 'h100-nvl', label: 'H100 NVL 94GB', pricePerHour: 3.8 },
  { id: 'a100-80gb', label: 'A100 80GB', pricePerHour: 2.1 },
  { id: 'a100-40gb', label: 'A100 40GB', pricePerHour: 1.5 },
  { id: 'l40s', label: 'L40S 48GB', pricePerHour: 1.2 },
]

const STORAGE_PRICE_PER_GB = 0.08

const PLANS = [
  {
    key: 'onDemand' as const,
    discount: 0,
    featured: false,
    perks: ['Sem comprometimento', 'Billing por hora', 'Acesso imediato'],
  },
  {
    key: 'reserved' as const,
    discount: 0.35,
    featured: true,
    perks: ['Desconto 35%', 'Comprometimento 1 ano', 'Suporte prioritário'],
  },
  {
    key: 'enterprise' as const,
    discount: 0.45,
    featured: false,
    perks: ['Cluster dedicado', 'SLA customizado', 'Gestor de conta'],
  },
]

interface PricingSectionProps {
  dict: Dictionary
  lang: Locale
}

export function PricingSection({ dict }: PricingSectionProps) {
  const [selectedGpu, setSelectedGpu] = useState(GPU_OPTIONS[0])
  const [hours, setHours] = useState(160)
  const [instances, setInstances] = useState(1)
  const [storageGb, setStorageGb] = useState(100)

  const baseMonthly = selectedGpu.pricePerHour * hours * instances
  const storageCost = storageGb * STORAGE_PRICE_PER_GB
  const totalBase = baseMonthly + storageCost

  return (
    <section id="precario" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
            style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}
          >
            {dict.pricing.badge}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="mb-4"
            style={{ fontSize: 'var(--text-h2)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}
          >
            {dict.pricing.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.16 }}
            className="mx-auto text-base"
            style={{ color: 'var(--text-secondary)', maxWidth: '50ch' }}
          >
            {dict.pricing.subtitle}
          </motion.p>
        </div>

        {/* Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 rounded-2xl p-6 md:p-8"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--accent-bg)' }}>
              <Calculator className="h-4 w-4" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
            </div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {dict.pricing.calculator.title}
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* GPU selector */}
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {dict.pricing.calculator.gpu}
              </label>
              <select
                value={selectedGpu.id}
                onChange={(e) => setSelectedGpu(GPU_OPTIONS.find((g) => g.id === e.target.value) ?? GPU_OPTIONS[0])}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              >
                {GPU_OPTIONS.map((gpu) => (
                  <option key={gpu.id} value={gpu.id} style={{ backgroundColor: 'var(--bg-surface)' }}>
                    {gpu.label} — €{gpu.pricePerHour}/h
                  </option>
                ))}
              </select>
            </div>

            {/* Hours */}
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {dict.pricing.calculator.hours}: <span style={{ color: 'var(--accent)' }}>{hours}h</span>
              </label>
              <input
                type="range"
                min={1}
                max={744}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="mt-1 flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>1h</span><span>744h</span>
              </div>
            </div>

            {/* Instances */}
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {dict.pricing.calculator.instances}: <span style={{ color: 'var(--accent)' }}>{instances}</span>
              </label>
              <input
                type="range"
                min={1}
                max={32}
                value={instances}
                onChange={(e) => setInstances(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="mt-1 flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>1</span><span>32</span>
              </div>
            </div>

            {/* Storage */}
            <div>
              <label className="mb-2 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {dict.pricing.calculator.storage}: <span style={{ color: 'var(--accent)' }}>{storageGb}GB</span>
              </label>
              <input
                type="range"
                min={0}
                max={10000}
                step={50}
                value={storageGb}
                onChange={(e) => setStorageGb(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="mt-1 flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>0</span><span>10TB</span>
              </div>
            </div>
          </div>

          {/* Result */}
          <div
            className="mt-6 flex flex-col items-center justify-between gap-4 rounded-xl p-5 sm:flex-row"
            style={{ backgroundColor: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
          >
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                {dict.pricing.calculator.estimate}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                {instances}× {selectedGpu.label} · {hours}h · {storageGb}GB NVMe
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                €{totalBase.toLocaleString('pt-PT', { maximumFractionDigits: 0 })}
                <span className="text-base font-normal" style={{ color: 'var(--text-muted)' }}>/mês</span>
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ≈ €{selectedGpu.pricePerHour}/h por GPU
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            {dict.pricing.calculator.disclaimer}
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan, i) => {
            const planDict = dict.pricing.plans[plan.key]
            const monthlyPrice = totalBase * (1 - plan.discount)
            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl p-6 transition-all duration-200"
                style={{
                  backgroundColor: plan.featured ? 'var(--bg-elevated)' : 'var(--bg-elevated)',
                  border: plan.featured ? '1px solid var(--accent-border)' : '1px solid var(--border-default)',
                  background: plan.featured
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, var(--bg-elevated) 100%)'
                    : undefined,
                }}
              >
                {plan.featured && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: 'var(--accent)', color: '#000' }}
                  >
                    Popular
                  </span>
                )}
                <h3 className="mb-1 font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                  {planDict.name}
                </h3>
                <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {planDict.description}
                </p>
                {plan.discount > 0 && (
                  <p className="mb-1 text-3xl font-bold tabular-nums" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                    €{monthlyPrice.toLocaleString('pt-PT', { maximumFractionDigits: 0 })}
                    <span className="text-base font-normal" style={{ color: 'var(--text-muted)' }}>/mês</span>
                  </p>
                )}
                {plan.discount > 0 && (
                  <p className="mb-4 text-xs line-through" style={{ color: 'var(--text-muted)' }}>
                    €{totalBase.toLocaleString('pt-PT', { maximumFractionDigits: 0 })}/mês
                  </p>
                )}
                <ul className="mb-6 flex flex-col gap-2">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Check className="h-4 w-4 shrink-0" style={{ color: 'var(--accent)' }} strokeWidth={2} />
                      {perk}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contacto"
                  className="block rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-all duration-150"
                  style={
                    plan.featured
                      ? { backgroundColor: 'var(--accent)', color: '#000' }
                      : { backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-hover)' }
                  }
                >
                  {planDict.cta}
                </a>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
