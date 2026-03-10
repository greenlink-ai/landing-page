"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
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

const PARTICLE_DELAY = 500
const DESKTOP_DURATION = 12000
const MOBILE_DURATION = 6000

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

/* ═══════════════════════════════════════════════
   Shared path animation — drives particle + trail
   ═══════════════════════════════════════════════ */
function runPathAnimation(
  path: SVGPathElement,
  trailMask: SVGPathElement,
  particle: SVGGElement,
  delay: number,
  duration: number,
): () => void {
  const totalLength = path.getTotalLength()
  let startTime: number | null = null
  let rafId: number

  function tick(ts: number) {
    if (!startTime) startTime = ts
    const elapsed = ts - startTime - delay

    if (elapsed < 0) {
      rafId = requestAnimationFrame(tick)
      return
    }

    const progress = Math.min(elapsed / duration, 1)
    const eased = easeInOut(progress)

    trailMask.style.strokeDashoffset = String(1 - eased)

    const pt = path.getPointAtLength(eased * totalLength)
    particle.setAttribute("transform", `translate(${pt.x},${pt.y})`)

    let opacity = 1
    if (progress < 0.03) opacity = progress / 0.03
    else if (progress > 0.85) opacity = Math.max(0, (1 - progress) / 0.15)
    particle.setAttribute("opacity", String(opacity))

    if (progress < 1) {
      rafId = requestAnimationFrame(tick)
    }
  }

  rafId = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(rafId)
}

/* ═══════════════════════════════════════════════
   StepCard Component
   ═══════════════════════════════════════════════ */
function StepCard({
  number,
  title,
  description,
  index,
  isLeft,
}: {
  number: string
  title: string
  description: string
  index: number
  isLeft: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: [0.25, 0.4, 0.25, 1] }}
      className={`flex items-center gap-6 ${isLeft ? "lg:flex-row" : "lg:flex-row-reverse"}`}
    >
      {/* Step number — fixed width on mobile for consistent line alignment */}
      <span
        className="min-w-12 shrink-0 text-center font-sans text-5xl text-primary lg:min-w-0 lg:text-8xl"
        style={{ fontWeight: 900 }}
      >
        {number}
      </span>

      {/* Card */}
      <div
        className="group max-w-100 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111113] p-6 transition-all duration-300 hover:border-[rgba(255,255,255,0.10)] lg:p-8"
        style={{ boxShadow: "none" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow =
            "0 0 30px rgba(16, 185, 129, 0.15)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none"
        }}
      >
        <h3 className="mb-2 text-lg font-semibold text-[#fafafa]">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-[#a1a1aa]">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */
interface HowItWorksSectionProps {
  dict: Dictionary
}

export function HowItWorksSection({ dict }: HowItWorksSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [stepCenters, setStepCenters] = useState<number[]>([])
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  // Desktop SVG refs
  const fullPathRef = useRef<SVGPathElement>(null)
  const trailMaskRef = useRef<SVGPathElement>(null)
  const particleGroupRef = useRef<SVGGElement>(null)

  // Mobile SVG refs
  const mobilePathRef = useRef<SVGPathElement>(null)
  const mobileTrailRef = useRef<SVGPathElement>(null)
  const mobileParticleRef = useRef<SVGGElement>(null)

  const animPlayed = useRef(false)

  const t = dict.howItWorks

  // Measure container + step vertical centers
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setDimensions({ width: rect.width, height: rect.height })

      const containerTop = rect.top
      setStepCenters(
        stepRefs.current.map((el) => {
          if (!el) return 0
          const r = el.getBoundingClientRect()
          return r.top - containerTop + r.height / 2
        }),
      )
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  /* ── Desktop path computation ── */
  const stepHeight = 320
  const stepGap = 80
  const cardWidth = 320
  const numberWidth = 80
  const radius = 45
  const horizontalExtent = dimensions.width * 0.4

  const s1 = { x: numberWidth + cardWidth + 40, y: stepHeight / 2 }
  const e1 = {
    x: dimensions.width - numberWidth - cardWidth - 40,
    y: stepHeight + stepGap + stepHeight / 2,
  }
  const e2 = {
    x: numberWidth + cardWidth + 40,
    y: (stepHeight + stepGap) * 2 + stepHeight / 2,
  }
  const e3 = {
    x: dimensions.width - numberWidth - cardWidth - 40,
    y: (stepHeight + stepGap) * 3 + stepHeight / 2,
  }

  const m1 = s1.x + horizontalExtent
  const m2 = e1.x - horizontalExtent
  const m3 = e2.x + horizontalExtent

  const fullPathD =
    dimensions.width > 0
      ? [
          `M ${s1.x} ${s1.y}`,
          `L ${m1 - radius} ${s1.y}`,
          `A ${radius} ${radius} 0 0 1 ${m1} ${s1.y + radius}`,
          `L ${m1} ${e1.y - radius}`,
          `A ${radius} ${radius} 0 0 1 ${m1 - radius} ${e1.y}`,
          `L ${e1.x} ${e1.y}`,
          `L ${m2 + radius} ${e1.y}`,
          `A ${radius} ${radius} 0 0 0 ${m2} ${e1.y + radius}`,
          `L ${m2} ${e2.y - radius}`,
          `A ${radius} ${radius} 0 0 0 ${m2 + radius} ${e2.y}`,
          `L ${e2.x} ${e2.y}`,
          `L ${m3 - radius} ${e2.y}`,
          `A ${radius} ${radius} 0 0 1 ${m3} ${e2.y + radius}`,
          `L ${m3} ${e3.y - radius}`,
        ].join(" ")
      : ""

  const viewBoxH = (stepHeight + stepGap) * 4

  /* ── Mobile path computation ── */
  const MOBILE_LINE_X = 50 // between number (min-w-12=48px) and card (gap-6=24px): 48 + 12
  const mobilePathD =
    stepCenters.length === 4 && stepCenters[0] > 0
      ? `M ${MOBILE_LINE_X} ${stepCenters[0]} L ${MOBILE_LINE_X} ${stepCenters[3]}`
      : ""

  /* ── Animation — drives both desktop & mobile ── */
  useEffect(() => {
    if (!isInView || animPlayed.current) return

    const cleanups: (() => void)[] = []

    // Desktop
    if (
      fullPathRef.current &&
      trailMaskRef.current &&
      particleGroupRef.current
    ) {
      cleanups.push(
        runPathAnimation(
          fullPathRef.current,
          trailMaskRef.current,
          particleGroupRef.current,
          PARTICLE_DELAY,
          DESKTOP_DURATION,
        ),
      )
    }

    // Mobile
    if (
      mobilePathRef.current &&
      mobileTrailRef.current &&
      mobileParticleRef.current
    ) {
      cleanups.push(
        runPathAnimation(
          mobilePathRef.current,
          mobileTrailRef.current,
          mobileParticleRef.current,
          PARTICLE_DELAY,
          MOBILE_DURATION,
        ),
      )
    }

    if (cleanups.length > 0) {
      animPlayed.current = true
    }

    return () => cleanups.forEach((fn) => fn())
  }, [isInView, fullPathD, mobilePathD])

  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-10 lg:px-16">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
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
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Steps container with SVG overlays */}
        <div ref={containerRef} className="relative">
          {/* ── Desktop SVG ── */}
          {dimensions.width > 0 && fullPathD && (
            <svg
              className="pointer-events-none absolute inset-0 hidden lg:block"
              style={{ width: "100%", height: "100%" }}
              viewBox={`0 0 ${dimensions.width} ${viewBoxH}`}
              preserveAspectRatio="none"
            >
              <defs>
                <filter
                  id="particle-glow"
                  x="-200%"
                  y="-200%"
                  width="500%"
                  height="500%"
                >
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <mask id="trail-mask">
                  <path
                    ref={trailMaskRef}
                    d={fullPathD}
                    stroke="white"
                    strokeWidth={6}
                    fill="none"
                    pathLength={1}
                    strokeDasharray="1"
                    strokeDashoffset="1"
                  />
                </mask>
              </defs>
              <path
                ref={fullPathRef}
                d={fullPathD}
                fill="none"
                stroke="none"
              />
              <path
                d={fullPathD}
                fill="none"
                stroke="#10b981"
                strokeWidth={2}
                opacity={0.2}
              />
              <path
                d={fullPathD}
                fill="none"
                stroke="#10b981"
                strokeWidth={2}
                opacity={1}
                mask="url(#trail-mask)"
              />
              <g ref={particleGroupRef} opacity="0" filter="url(#particle-glow)">
                <circle cx="0" cy="0" r="4" fill="#10b981" />
                <circle cx="0" cy="0" r="10" fill="#10b981" opacity="0.35" />
              </g>
            </svg>
          )}

          {/* ── Mobile SVG — vertical line with same particle animation ── */}
          {mobilePathD && (
            <svg
              className="pointer-events-none absolute inset-0 lg:hidden"
              style={{ width: "100%", height: "100%" }}
              viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            >
              <defs>
                <filter
                  id="mobile-particle-glow"
                  x="-200%"
                  y="-200%"
                  width="500%"
                  height="500%"
                >
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Hidden path for getPointAtLength() */}
              <path
                ref={mobilePathRef}
                d={mobilePathD}
                fill="none"
                stroke="none"
              />

              {/* Ghost line — low opacity, always visible */}
              <path
                d={mobilePathD}
                fill="none"
                stroke="#10b981"
                strokeWidth={1.5}
                opacity={0.12}
              />

              {/* Trail — directly animated via strokeDashoffset */}
              <path
                ref={mobileTrailRef}
                d={mobilePathD}
                fill="none"
                stroke="#10b981"
                strokeWidth={2}
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset="1"
              />

              {/* Particle — glowing dot */}
              <g
                ref={mobileParticleRef}
                opacity="0"
                filter="url(#mobile-particle-glow)"
              >
                <circle cx="0" cy="0" r="4" fill="#10b981" />
                <circle cx="0" cy="0" r="10" fill="#10b981" opacity="0.35" />
              </g>
            </svg>
          )}

          {/* Steps */}
          <div className="relative flex flex-col gap-16 lg:gap-20">
            {stepKeys.map((key, index) => {
              const step = t.steps[key]
              const isLeft = index % 2 === 0
              return (
                <div
                  key={key}
                  ref={(el) => {
                    stepRefs.current[index] = el
                  }}
                  className={`flex ${isLeft ? "lg:justify-start" : "lg:justify-end"}`}
                >
                  <StepCard
                    number={String(index + 1)}
                    title={step.title}
                    description={step.description}
                    index={index}
                    isLeft={isLeft}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
          className="mt-16 text-center"
        >
          <Button
            size="lg"
            className="bg-primary px-8 py-6 text-base font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {t.cta}
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
