"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { Brain, Server, Sparkles, FlaskConical } from "lucide-react"
import { useParticleCanvas } from "@/hooks/use-particle-canvas"
import type { Dictionary } from "@/lib/get-dictionary"

/* ═══════════════════════════════════════════════
   Icon mapping (order matches dictionary keys)
   ═══════════════════════════════════════════════ */
const caseIcons = [Brain, Server, Sparkles, FlaskConical] as const
const caseKeys = ["training", "inference", "finetuning", "research"] as const

/* ═══════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as const },
  },
}

/* ═══════════════════════════════════════════════
   Highlight text with emerald color
   ═══════════════════════════════════════════════ */
function highlightText(text: string, highlights: string[]): string {
  let result = text
  highlights.forEach((highlight) => {
    const regex = new RegExp(`(${highlight})`, "gi")
    result = result.replace(
      regex,
      `<span class="text-primary font-medium">$1</span>`
    )
  })
  return result
}

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */
interface UseCasesSectionProps {
  dict: Dictionary
}

export function UseCasesSection({ dict }: UseCasesSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useParticleCanvas(canvasRef, 50)

  const t = dict.useCases

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Canvas-based floating particles */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ width: "100%", height: "100%" }}
      />

      <div className="relative mx-auto max-w-6xl px-10 lg:px-16">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          className="mb-16 text-center"
        >
          {/* Badge with pulsing dot */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.badge}
            </span>
          </div>

          {/* Title */}
          <h2 className="mx-auto max-w-3xl text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t.title}{" "}
            <span className="text-primary">{t.titleHighlight}</span>.
          </h2>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Use cases grid - 2x2 layout */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 md:grid-cols-2"
        >
          {caseKeys.map((key, i) => {
            const useCase = t.cases[key]
            const Icon = caseIcons[i]
            const highlights = (useCase as { highlights?: string[] }).highlights ?? []

            return (
              <motion.div
                key={key}
                variants={itemVariants}
                className="group relative rounded-2xl border border-[rgba(255,255,255,0.06)] bg-card/50 p-8 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
                whileHover={{
                  boxShadow: "0 0 40px 0 rgba(16, 185, 129, 0.12)",
                }}
              >
                {/* Icon */}
                <div className="mb-5 flex size-14 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-primary/10">
                  <Icon
                    className="size-7 text-primary"
                    strokeWidth={1.5}
                  />
                </div>

                {/* Title */}
                <h3 className="mb-3 text-xl font-semibold uppercase tracking-wide text-foreground">
                  {useCase.title}
                </h3>

                {/* Description with highlighted keywords */}
                <p
                  className="text-base leading-relaxed text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: highlightText(useCase.description, highlights),
                  }}
                />

                {/* Hover glow effect */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute inset-px rounded-2xl bg-linear-to-b from-primary/5 to-transparent" />
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
