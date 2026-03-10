"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import Link from "next/link"
import { Send, Check, CheckCircle2, AlertCircle, ArrowUp } from "lucide-react"
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import type { Dictionary } from "@/lib/get-dictionary"
import type { Locale } from "@/lib/i18n"

/* ═══════════════════════════════════════════════
   Multi-Select Checkbox Component
   ═══════════════════════════════════════════════ */
function MultiSelectCheckbox({
  options,
  selected,
  onChange,
}: {
  options: { id: string; label: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
}) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => {
        const isSelected = selected.includes(option.id)
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => toggle(option.id)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              isSelected
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-[rgba(255,255,255,0.06)] bg-[#1c1c1f] text-muted-foreground hover:border-primary/30 hover:bg-[#1c1c1f]/80"
            }`}
          >
            <div
              className={`flex size-4 items-center justify-center rounded border transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/40"
              }`}
            >
              {isSelected && (
                <Check
                  className="size-3 text-primary-foreground"
                  strokeWidth={3}
                />
              )}
            </div>
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Zod Schema (i18n)
   ═══════════════════════════════════════════════ */
function createContactSchema(f: Dictionary["contact"]["form"]) {
  return z.object({
    fullName: z.string().min(2, f.nameError),
    company: z.string().optional(),
    email: z.string().email(f.emailError),
    phone: z.string().optional(),
    needs: z.array(z.string()).min(1, f.needsError),
    message: z.string().min(1, f.messageError),
  })
}

type ContactFormData = z.infer<ReturnType<typeof createContactSchema>>

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */
interface ContactSectionProps {
  dict: Dictionary
  lang: Locale
}

export function ContactSection({ dict, lang }: ContactSectionProps) {
  const t = dict.contact
  const f = t.form

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([])
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)

  const contactSchema = createContactSchema(f)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) })

  const needsOptions = Object.entries(f.needsOptions).map(([id, label]) => ({
    id,
    label,
  }))

  function handleNeedsChange(needs: string[]) {
    setSelectedNeeds(needs)
    setValue("needs", needs)
    if (errors.needs) trigger("needs")
  }

  async function onSubmit(data: ContactFormData) {
    if (!turnstileToken) return
    setStatus("loading")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          needs: selectedNeeds,
          locale: lang,
          turnstileToken,
        }),
      })
      if (!res.ok) throw new Error("Request failed")
      setStatus("success")
      reset()
      setSelectedNeeds([])
      setTurnstileToken(null)
    } catch {
      setStatus("error")
      turnstileRef.current?.reset()
      setTurnstileToken(null)
    }
  }

  const inputBase =
    "w-full rounded-lg border bg-[#1c1c1f] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none transition-all duration-200"
  const inputNormal =
    `${inputBase} border-[rgba(255,255,255,0.06)] focus:border-primary/50 focus:ring-2 focus:ring-primary/20`
  const inputError =
    `${inputBase} border-red-500/50 ring-2 ring-red-500/20 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20`

  return (
    <section
      id="contact"
      className="relative overflow-hidden py-24 lg:py-32"
    >
      <div className="relative mx-auto max-w-6xl px-10 lg:px-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left side - Title, subtitle and info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
            className="flex flex-col justify-center"
          >
            {/* Badge with pulsing dot */}
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.badge}
              </span>
            </div>

            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {t.title}{" "}
              <span className="text-primary">{t.titleHighlight}</span>
            </h2>

            <p className="mt-6 text-base leading-relaxed text-muted-foreground lg:text-lg">
              {t.subtitle}
            </p>

            {/* Info items */}
            <div className="mt-10 space-y-4">
              {[t.info.response].map((text) => (
                <div
                  key={text}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                    <Check className="size-4 text-primary" />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right side - Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.6,
              delay: 0.15,
              ease: [0.25, 0.4, 0.25, 1],
            }}
          >
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
                className="flex flex-col items-center gap-6 rounded-2xl bg-emerald-500 px-8 py-16 text-center"
              >
                <div className="flex size-16 items-center justify-center rounded-full bg-black/10">
                  <CheckCircle2
                    className="size-9 text-black"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-black">
                    {f.successTitle}
                  </h3>
                  <p className="mx-auto max-w-sm text-sm leading-relaxed text-black/70">
                    {f.successMessage}
                  </p>
                </div>
                <a
                  href="#hero"
                  onClick={() => setStatus("idle")}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-black/10 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-black/20"
                >
                  <ArrowUp className="size-4" />
                  {f.successCta}
                </a>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-card/50 p-6 backdrop-blur-sm lg:p-8"
                noValidate
              >
                <div className="space-y-5">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {f.name} <span className="text-primary">*</span>
                    </label>
                    <input
                      {...register("fullName")}
                      type="text"
                      placeholder={f.namePlaceholder}
                      className={errors.fullName ? inputError : inputNormal}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-destructive">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  {/* Company (optional) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {f.company}{" "}
                      <span className="text-xs text-muted-foreground">
                        {f.companyOptional}
                      </span>
                    </label>
                    <input
                      {...register("company")}
                      type="text"
                      placeholder={f.companyPlaceholder}
                      className={inputNormal}
                    />
                  </div>

                  {/* Email & Phone row */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {f.email} <span className="text-primary">*</span>
                      </label>
                      <input
                        {...register("email")}
                        type="email"
                        placeholder={f.emailPlaceholder}
                        className={errors.email ? inputError : inputNormal}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-destructive">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        {f.phone}{" "}
                        <span className="text-xs text-muted-foreground">
                          {f.phoneOptional}
                        </span>
                      </label>
                      <input
                        {...register("phone")}
                        type="tel"
                        placeholder={f.phonePlaceholder}
                        className={inputNormal}
                      />
                    </div>
                  </div>

                  {/* Needs (multi-select) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {f.needs} <span className="text-primary">*</span>
                    </label>
                    <div className={errors.needs ? "rounded-lg ring-2 ring-red-500/20" : ""}>
                      <MultiSelectCheckbox
                        options={needsOptions}
                        selected={selectedNeeds}
                        onChange={handleNeedsChange}
                      />
                    </div>
                    {errors.needs && (
                      <p className="mt-1 text-xs text-destructive">
                        {f.needsError}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      {f.message} <span className="text-primary">*</span>
                    </label>
                    <textarea
                      {...register("message")}
                      placeholder={f.messagePlaceholder}
                      rows={4}
                      className={`${errors.message ? inputError : inputNormal} resize-none`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-destructive">
                        {f.messageError}
                      </p>
                    )}
                  </div>

                  {/* Error */}
                  {status === "error" && (
                    <div
                      className="flex items-center gap-2 rounded-lg border px-3 py-2.5"
                      style={{
                        backgroundColor: "rgba(239,68,68,0.08)",
                        borderColor: "rgba(239,68,68,0.3)",
                      }}
                    >
                      <AlertCircle className="size-4 shrink-0 text-destructive" />
                      <p className="text-sm text-destructive">{f.error}</p>
                    </div>
                  )}

                  {/* Turnstile */}
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    onSuccess={setTurnstileToken}
                    onExpire={() => setTurnstileToken(null)}
                    options={{ theme: "dark", size: "flexible" }}
                  />

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={status === "loading" || !turnstileToken}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {status === "loading" ? (
                      <>
                        <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                        {f.submitting}
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        {f.submit}
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-muted-foreground">
                    {f.privacy}{" "}
                    <Link
                      href={`/${lang}/privacy`}
                      className="text-primary hover:underline"
                    >
                      {f.privacyLink}
                    </Link>
                    .
                  </p>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
