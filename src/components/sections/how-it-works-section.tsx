"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"
import type { Dictionary } from "@/lib/get-dictionary"

/* ═══════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════ */
const stepKeys = [
  "createAccount",
  "chooseResources",
  "launchInstance",
  "scale",
] as const
const NUM_STEPS = stepKeys.length

// Animation timing
const V_LINE_DURATION = 2.5 // vertical line draws over 2.5s
const BRANCH_DURATION = 0.3
const CARD_FADE_DURATION = 0.4

// Mobile line X position (left-aligned)
const MOBILE_LINE_X = 20

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */
interface HowItWorksSectionProps {
  dict: Dictionary
}

export function HowItWorksSection({ dict }: HowItWorksSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" })

  const [stepYs, setStepYs] = useState<number[]>([])
  const [dims, setDims] = useState({ w: 0, h: 0 })
  const measured = stepYs.length === NUM_STEPS && dims.w > 0

  const t = dict.howItWorks

  /* --- Measure row center Y positions --- */
  useEffect(() => {
    function measure() {
      const container = timelineRef.current
      if (!container) return
      const cRect = container.getBoundingClientRect()
      const ys = rowRefs.current.map((ref) => {
        if (!ref) return 0
        const r = ref.getBoundingClientRect()
        return r.top - cRect.top + r.height / 2
      })
      setStepYs(ys)
      setDims({ w: cRect.width, h: cRect.height })
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  /* --- Animation delay for step i based on vertical line progress --- */
  const getDelay = useCallback(
    (i: number): number => {
      if (!measured) return 0
      const first = stepYs[0]
      const last = stepYs[NUM_STEPS - 1]
      const total = last - first
      if (total <= 0) return 0
      return ((stepYs[i] - first) / total) * V_LINE_DURATION
    },
    [measured, stepYs],
  )

  const centerX = dims.w / 2
  // Branch extends from center to the edge of the center column (80px each side)
  const branchLen = 80

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 lg:py-32"
    >
      <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
        {/* ═══ HEADER ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          className="mb-16 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t.badge}
            </span>
          </div>

          <h2 className="mx-auto max-w-3xl text-balance text-3xl font-bold tracking-tight text-[#fafafa] sm:text-4xl lg:text-5xl">
            {t.title}
          </h2>

          <p className="mx-auto mt-6 max-w-[65ch] text-pretty text-lg text-[#a1a1aa]">
            {t.subtitle}
          </p>
        </motion.div>

        {/* ═══ TIMELINE AREA ═══ */}
        <div ref={timelineRef} className="relative">
          {/* ─── Desktop SVG: single overlay with ALL lines ─── */}
          {measured && (
            <svg
              className="pointer-events-none absolute inset-0 z-10 hidden lg:block"
              width={dims.w}
              height={dims.h}
              fill="none"
            >
              {/* Main vertical dashed line (center) */}
              <motion.line
                x1={centerX}
                y1={stepYs[0]}
                x2={centerX}
                y2={stepYs[NUM_STEPS - 1]}
                stroke="#10b981"
                strokeOpacity={0.5}
                strokeWidth={2}
                strokeDasharray="6 6"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : undefined}
                transition={{
                  duration: V_LINE_DURATION,
                  ease: "easeInOut",
                }}
              />

              {/* Horizontal branches — one per step */}
              {stepYs.map((y, i) => {
                const goesRight = i % 2 === 0
                const endX = goesRight
                  ? centerX + branchLen
                  : centerX - branchLen
                const delay = getDelay(i)

                return (
                  <motion.line
                    key={`branch-${i}`}
                    x1={centerX}
                    y1={y}
                    x2={endX}
                    y2={y}
                    stroke="#10b981"
                    strokeOpacity={0.5}
                    strokeWidth={2}
                    strokeDasharray="6 6"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={
                      isInView
                        ? { pathLength: 1, opacity: 1 }
                        : undefined
                    }
                    transition={{
                      pathLength: { duration: BRANCH_DURATION, delay },
                      opacity: { duration: 0.05, delay },
                    }}
                  />
                )
              })}
            </svg>
          )}

          {/* ─── Mobile SVG: vertical line on the left ─── */}
          {measured && (
            <svg
              className="pointer-events-none absolute inset-0 z-10 lg:hidden"
              width={dims.w}
              height={dims.h}
              fill="none"
            >
              <motion.line
                x1={MOBILE_LINE_X}
                y1={stepYs[0]}
                x2={MOBILE_LINE_X}
                y2={stepYs[NUM_STEPS - 1]}
                stroke="#10b981"
                strokeOpacity={0.5}
                strokeWidth={2}
                strokeDasharray="6 6"
                initial={{ pathLength: 0 }}
                animate={isInView ? { pathLength: 1 } : undefined}
                transition={{
                  duration: V_LINE_DURATION,
                  ease: "easeInOut",
                }}
              />

              {stepYs.map((y, i) => (
                <motion.line
                  key={`m-branch-${i}`}
                  x1={MOBILE_LINE_X}
                  y1={y}
                  x2={MOBILE_LINE_X + 36}
                  y2={y}
                  stroke="#10b981"
                  strokeOpacity={0.5}
                  strokeWidth={2}
                  strokeDasharray="6 6"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={
                    isInView
                      ? { pathLength: 1, opacity: 1 }
                      : undefined
                  }
                  transition={{
                    pathLength: {
                      duration: BRANCH_DURATION,
                      delay: getDelay(i),
                    },
                    opacity: { duration: 0.05, delay: getDelay(i) },
                  }}
                />
              ))}
            </svg>
          )}

          {/* ═══ STEP ROWS ═══ */}
          <div className="flex flex-col gap-10 lg:gap-14">
            {stepKeys.map((key, i) => {
              const step = t.steps[key]
              const goesRight = i % 2 === 0
              const cardDelay = getDelay(i) + BRANCH_DURATION
              const numDelay = getDelay(i)

              return (
                <div
                  key={key}
                  ref={(el) => {
                    rowRefs.current[i] = el
                  }}
                  className="relative min-h-30"
                >
                  {/* ─── Desktop layout: grid with center gap ─── */}
                  <div className="hidden min-h-[inherit] items-center lg:grid lg:grid-cols-[1fr_160px_1fr]">
                    {/* Left column */}
                    <div className={goesRight ? "" : "flex justify-end"}>
                      {!goesRight && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={
                            isInView
                              ? { opacity: 1, y: 0 }
                              : undefined
                          }
                          transition={{
                            duration: CARD_FADE_DURATION,
                            delay: cardDelay,
                            ease: [0.25, 0.46, 0.45, 0.94],
                          }}
                          className="max-w-sm rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111113] p-6 text-right transition-all duration-200 hover:border-[rgba(255,255,255,0.10)] hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                        >
                          <h3 className="mb-2 text-lg font-semibold text-[#fafafa]">
                            {step.title}
                          </h3>
                          <p className="text-sm leading-relaxed text-[#a1a1aa]">
                            {step.description}
                          </p>
                        </motion.div>
                      )}
                    </div>

                    {/* Center: step number offset to the opposite side of the card */}
                    <div
                      className={`relative z-20 flex items-center ${
                        goesRight ? "justify-start pl-2" : "justify-end pr-2"
                      }`}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={
                          isInView
                            ? { opacity: 1, scale: 1 }
                            : undefined
                        }
                        transition={{
                          duration: 0.3,
                          delay: numDelay,
                          ease: "easeOut",
                        }}
                        className="drop-shadow-[0_0_16px_rgba(16,185,129,0.6)]"
                      >
                        <Image
                          src={`/${i + 1}.svg`}
                          alt={`Step ${i + 1}`}
                          width={28}
                          height={56}
                          className="h-20 w-auto"
                        />
                      </motion.div>
                    </div>

                    {/* Right column */}
                    <div className={!goesRight ? "" : "flex justify-start"}>
                      {goesRight && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={
                            isInView
                              ? { opacity: 1, y: 0 }
                              : undefined
                          }
                          transition={{
                            duration: CARD_FADE_DURATION,
                            delay: cardDelay,
                            ease: [0.25, 0.46, 0.45, 0.94],
                          }}
                          className="max-w-sm rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111113] p-6 transition-all duration-200 hover:border-[rgba(255,255,255,0.10)] hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                        >
                          <h3 className="mb-2 text-lg font-semibold text-[#fafafa]">
                            {step.title}
                          </h3>
                          <p className="text-sm leading-relaxed text-[#a1a1aa]">
                            {step.description}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* ─── Mobile layout: left line, all cards right ─── */}
                  <div className="flex items-center gap-4 pl-14 lg:hidden">
                    {/* Number (positioned on the left vertical line) */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={
                        isInView
                          ? { opacity: 1, scale: 1 }
                          : undefined
                      }
                      transition={{
                        duration: 0.3,
                        delay: numDelay,
                        ease: "easeOut",
                      }}
                      className="absolute left-1 top-1/2 z-20 -translate-y-1/2 drop-shadow-[0_0_36px_rgba(16,185,129,0.3)]"
                    >
                      <Image
                        src={`/${i + 1}.svg`}
                        alt={`Step ${i + 1}`}
                        width={20}
                        height={40}
                        className="h-10 w-auto"
                      />
                    </motion.div>

                    {/* Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={
                        isInView
                          ? { opacity: 1, y: 0 }
                          : undefined
                      }
                      transition={{
                        duration: CARD_FADE_DURATION,
                        delay: cardDelay,
                      }}
                      className="flex-1 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111113] p-5"
                    >
                      <h3 className="mb-1 text-base font-semibold text-[#fafafa]">
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-[#a1a1aa]">
                        {step.description}
                      </p>
                    </motion.div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ═══ CTA ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 flex flex-col items-center text-center"
        >
          <a
            href="#contact"
            className="inline-flex items-center rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition-all duration-150 hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]"
          >
            {t.cta}
          </a>
          <p className="mt-3 text-sm text-[#71717a]">{t.ctaSubtext}</p>
        </motion.div>
      </div>
    </section>
  )
}
