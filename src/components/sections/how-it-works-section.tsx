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

const PARTICLE_DELAY = 500 // ms before animation starts
const PARTICLE_DURATION = 12000 // ms for full path traversal

/* easeInOut — same curve drives both particle and trail */
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
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
      {/* Step number — Geist Black (font-sans weight 900) */}
      <span
        className="font-sans text-5xl text-primary lg:text-8xl"
        style={{ fontWeight: 900 }}
      >
        {number}
      </span>

      {/* Card */}
      <div
        className="group max-w-100 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111113] p-6 transition-all duration-300 hover:border-[rgba(255,255,255,0.10)] lg:p-8"
        style={{
          boxShadow: "none",
        }}
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

  // Refs for rAF-driven animation
  const fullPathRef = useRef<SVGPathElement>(null)
  const trailMaskRef = useRef<SVGPathElement>(null)
  const particleGroupRef = useRef<SVGGElement>(null)
  const animPlayed = useRef(false)

  const t = dict.howItWorks

  // Measure container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Layout constants
  const stepHeight = 320
  const stepGap = 80
  const cardWidth = 320
  const numberWidth = 80
  const radius = 45
  const horizontalExtent = dimensions.width * 0.4

  // Path coordinates
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

  // Combined continuous path through all 3 segments
  const fullPathD =
    dimensions.width > 0
      ? [
          // Segment 1: left → right (fromLeft)
          `M ${s1.x} ${s1.y}`,
          `L ${m1 - radius} ${s1.y}`,
          `A ${radius} ${radius} 0 0 1 ${m1} ${s1.y + radius}`,
          `L ${m1} ${e1.y - radius}`,
          `A ${radius} ${radius} 0 0 1 ${m1 - radius} ${e1.y}`,
          `L ${e1.x} ${e1.y}`,
          // Segment 2: right → left (fromRight) — continues from e1
          `L ${m2 + radius} ${e1.y}`,
          `A ${radius} ${radius} 0 0 0 ${m2} ${e1.y + radius}`,
          `L ${m2} ${e2.y - radius}`,
          `A ${radius} ${radius} 0 0 0 ${m2 + radius} ${e2.y}`,
          `L ${e2.x} ${e2.y}`,
          // Segment 3: left → right (fromLeft) — continues from e2
          `L ${m3 - radius} ${e2.y}`,
          `A ${radius} ${radius} 0 0 1 ${m3} ${e2.y + radius}`,
          `L ${m3} ${e3.y - radius}`,
        ].join(" ")
      : ""

  // Single rAF loop drives BOTH particle position AND trail reveal — perfect sync
  useEffect(() => {
    if (
      !isInView ||
      animPlayed.current ||
      !fullPathRef.current ||
      !trailMaskRef.current ||
      !particleGroupRef.current
    )
      return

    animPlayed.current = true

    const path = fullPathRef.current
    const trailMask = trailMaskRef.current
    const particle = particleGroupRef.current
    const totalLength = path.getTotalLength()

    let startTime: number | null = null
    let rafId: number

    function tick(ts: number) {
      if (!startTime) startTime = ts
      const elapsed = ts - startTime - PARTICLE_DELAY

      if (elapsed < 0) {
        rafId = requestAnimationFrame(tick)
        return
      }

      const progress = Math.min(elapsed / PARTICLE_DURATION, 1)
      const eased = easeInOut(progress)

      // Trail: reveal via mask strokeDashoffset (both driven by same eased value)
      trailMask.style.strokeDashoffset = String(1 - eased)

      // Particle: position along path
      const pt = path.getPointAtLength(eased * totalLength)
      particle.setAttribute("transform", `translate(${pt.x},${pt.y})`)

      // Particle opacity: fade in first 3%, full during middle, fade out last 15%
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
  }, [isInView, fullPathD])

  const viewBoxH = (stepHeight + stepGap) * 4

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
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Steps container with SVG overlay */}
        <div ref={containerRef} className="relative">
          {/* SVG connecting lines — Desktop only */}
          {dimensions.width > 0 && fullPathD && (
            <svg
              className="pointer-events-none absolute inset-0 hidden lg:block"
              style={{ width: "100%", height: "100%" }}
              viewBox={`0 0 ${dimensions.width} ${viewBoxH}`}
              preserveAspectRatio="none"
            >
              <defs>
                {/* Glow filter for the particle */}
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

                {/* Mask for progressive trail reveal — solid path that uncovers the dashed trail */}
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

              {/* Hidden path for getPointAtLength() */}
              <path
                ref={fullPathRef}
                d={fullPathD}
                fill="none"
                stroke="none"
              />

              {/* Base ghost line — low opacity, always visible */}
              <path
                d={fullPathD}
                fill="none"
                stroke="#10b981"
                strokeWidth={2}
                opacity={0.2}
              />

              {/* Dashed trail — revealed progressively via mask, synced with particle */}
              <path
                d={fullPathD}
                fill="none"
                stroke="#10b981"
                strokeWidth={2}
                opacity={1}
                mask="url(#trail-mask)"
              />

              {/* Particle — glowing dot that follows the path */}
              <g ref={particleGroupRef} opacity="0" filter="url(#particle-glow)">
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

          {/* Mobile connecting lines */}
          <div className="absolute left-8 top-0 h-full w-px lg:hidden">
            <div className="h-full w-full border-l-2 border-dashed border-primary/25" />
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
