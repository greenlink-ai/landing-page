'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Send, CheckCircle2, AlertCircle, Mail, Building2, User } from 'lucide-react'
import type { Dictionary } from '@/lib/get-dictionary'
import type { Locale } from '@/lib/i18n'

const schema = z.object({
  fullName: z.string().min(2, 'Nome demasiado curto'),
  email: z.string().email('Email inválido'),
  companyName: z.string().optional(),
  message: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface ContactSectionProps {
  dict: Dictionary
  lang: Locale
}

export function ContactSection({ dict, lang }: ContactSectionProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const f = dict.contact.form

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, locale: lang }),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
      reset()
    } catch {
      setStatus('error')
    }
  }

  const inputStyle = {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
    borderRadius: '0.5rem',
    padding: '0.625rem 0.875rem',
    width: '100%',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 150ms',
  } as React.CSSProperties

  return (
    <section id="contacto" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
          {/* Left: info */}
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
              {dict.contact.badge}
            </span>
            <h2
              className="mb-4"
              style={{ fontSize: 'var(--text-h2)', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)' }}
            >
              {dict.contact.title}
            </h2>
            <p className="mb-8 text-base leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: '44ch' }}>
              {dict.contact.subtitle}
            </p>

            <div className="flex flex-col gap-4">
              {[
                { icon: Mail, label: 'Email', value: 'hello@greenlink.eu' },
                { icon: Building2, label: 'Sede', value: 'Lisboa, Portugal 🇵🇹' },
                { icon: User, label: 'Suporte', value: '24/7 Técnico' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'var(--accent-bg)' }}
                  >
                    <item.icon className="h-4 w-4" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl p-6 md:p-8"
            style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
          >
            {status === 'success' ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <CheckCircle2 className="h-12 w-12" style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{f.success}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    {f.name} <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <input
                    {...register('fullName')}
                    placeholder={f.namePlaceholder}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent-border)')}
                    onBlur={(e) => (e.target.style.borderColor = errors.fullName ? 'var(--error)' : 'var(--border-default)')}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>{errors.fullName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    {f.email} <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder={f.emailPlaceholder}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent-border)')}
                    onBlur={(e) => (e.target.style.borderColor = errors.email ? 'var(--error)' : 'var(--border-default)')}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--error)' }}>{errors.email.message}</p>
                  )}
                </div>

                {/* Company */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    {f.company}
                  </label>
                  <input
                    {...register('companyName')}
                    placeholder={f.companyPlaceholder}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent-border)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
                  />
                </div>

                {/* Use case */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    {f.useCase}
                  </label>
                  <textarea
                    {...register('message')}
                    rows={4}
                    placeholder={f.useCasePlaceholder}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--accent-border)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
                  />
                </div>

                {/* Error */}
                {status === 'error' && (
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <AlertCircle className="h-4 w-4 shrink-0" style={{ color: 'var(--error)' }} />
                    <p className="text-sm" style={{ color: 'var(--error)' }}>{f.error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all duration-150 disabled:opacity-60"
                  style={{ backgroundColor: 'var(--accent)', color: '#000' }}
                  onMouseEnter={(e) => { if (status !== 'loading') e.currentTarget.style.boxShadow = '0 0 20px var(--accent-glow-strong)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
                >
                  {status === 'loading' ? (
                    f.submitting
                  ) : (
                    <>
                      {f.submit}
                      <Send className="h-4 w-4" strokeWidth={2} />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
