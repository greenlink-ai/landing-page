"use client"

import { useRef } from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { Clock, Zap, Flag } from "lucide-react"
import type { Dictionary } from "@/lib/get-dictionary"
import { useParticleCanvas } from "@/hooks/use-particle-canvas"

const GreenLinkOrb = dynamic(
  () =>
    import("@/components/three/greenlink-orb").then((mod) => ({
      default: mod.GreenLinkOrb,
    })),
  { ssr: false }
)

const pillarIcons = [Clock, Zap, Flag]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
  },
}

interface AboutSectionProps {
  dict: Dictionary
}

export function AboutSection({ dict }: AboutSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useParticleCanvas(canvasRef)

  const a = dict.about
  const pillars = [
    a.pillars.instantAccess,
    a.pillars.stateOfArt,
    a.pillars.sovereignty,
  ]

  return (
    <section id="sobre" className="relative overflow-hidden py-24 lg:py-32">
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
          className="mb-20"
        >
          {/* Badge with pulsing dot */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {a.badge}
            </span>
          </div>

          {/* Title row with 3D orb */}
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left - Title and subtitle */}
            <div>
              <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {a.title}{" "}
                <span className="text-primary">{a.titleHighlight}</span>
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                {a.subtitle}
              </p>
            </div>

            {/* Right - 3D Orb Animation */}
            <div className="flex justify-center lg:justify-end">
              <GreenLinkOrb />
            </div>
          </div>

          {/* Vision & Mission side by side */}
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:gap-12">
            <div>
              <h3 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {a.visionTitle}
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                {a.visionDescription.before}
                <span className="font-medium text-primary">{a.visionDescription.highlight}</span>
                {a.visionDescription.after}
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {a.goalTitle}
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                {a.goalDescription.before}
                <span className="font-medium text-primary">{a.goalDescription.highlight1}</span>
                {a.goalDescription.mid}
                <span className="font-medium text-primary">{a.goalDescription.highlight2}</span>
                {a.goalDescription.after}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
          className="mb-20 grid grid-cols-2 gap-6 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-card/30 p-8 backdrop-blur-sm md:grid-cols-4"
        >
          {a.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary lg:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Value proposition title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
          className="mb-10"
        >
          <h3 className="text-xl font-semibold text-foreground">
            {a.valueProposition}
          </h3>
        </motion.div>

        {/* Pillars grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {pillars.map((pillar, i) => {
            const Icon = pillarIcons[i]
            return (
              <motion.div
                key={pillar.title}
                variants={itemVariants}
                className="group relative rounded-2xl border border-[rgba(255,255,255,0.06)] bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
                whileHover={{
                  boxShadow: "0 0 30px 0 rgba(16, 185, 129, 0.1)",
                }}
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-primary/10">
                  <Icon
                    className="size-6 text-primary"
                    strokeWidth={1.5}
                  />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {pillar.title}
                </h3>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>

                {/* Hover glow effect */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute inset-px rounded-2xl bg-linear-to-b from-primary/5 to-transparent" />
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Closing statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
          className="mt-16 text-center"
        >
          <p className="mx-auto max-w-2xl text-pretty text-base text-muted-foreground">
            {a.closingStatement}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
