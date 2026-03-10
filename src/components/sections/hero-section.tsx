"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CircuitTree } from "@/components/sections/circuit-tree"
import { ArrowRight, ExternalLink } from "lucide-react"
import type { Dictionary } from "@/lib/get-dictionary"

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
}

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as const },
  },
}

interface HeroSectionProps {
  dict: Dictionary
}

export function HeroSection({ dict }: HeroSectionProps) {
  const titleLines = dict.hero.title.split('\n')
  const stats = [
    dict.hero.stats.uptime,
    dict.hero.stats.latency,
    dict.hero.stats.compliance,
  ] as { value: string; label: string }[]

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden pt-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 py-20 lg:flex-row lg:gap-12 lg:py-32">
        {/* Content — centered on mobile, left-aligned on desktop */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-1 flex-col items-center text-center lg:items-start lg:text-left"
        >
          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-balance text-5xl font-extrabold leading-[1.1] tracking-tighter text-primary sm:text-6xl lg:text-7xl"
          >
            {titleLines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground"
          >
            {dict.hero.subtitle}
          </motion.p>

          {/* Badge */}
          <motion.div variants={fadeInUp} className="mt-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {dict.hero.badge}
              </span>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={fadeInUp}
            className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:justify-start lg:border-l-6 lg:border-primary/30 lg:pl-6"
          >
            {stats.map((stat, i) => (
              <span key={i} className="flex items-center gap-6 sm:gap-8">
                {i > 0 && <div className="h-8 w-px bg-border" />}
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </span>
            ))}
          </motion.div>

          {/* Buttons */}
          <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <Button
              size="lg"
              className="group bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base px-8 h-12"
            >
              {dict.hero.ctaPrimary}
              <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-border text-foreground hover:bg-secondary hover:text-foreground font-medium text-base px-8 h-12"
            >
              {dict.hero.ctaSecondary}
              <ExternalLink className="ml-1 size-3.5" />
            </Button>
          </motion.div>

        </motion.div>

        {/* Right visual — desktop only */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="relative flex-1 hidden lg:block"
        >
          <div className="relative aspect-square w-full max-w-140 ml-auto">
            <div className="absolute inset-0 rounded-full border border-border/30" />
            <div className="absolute inset-4 rounded-full border border-border/20" />
            <div className="absolute inset-8 rounded-full border border-primary/10" />
            <div className="absolute inset-12">
              <CircuitTree />
            </div>
          </div>
        </motion.div>

        {/* Circuit visual — mobile only */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="relative lg:hidden w-full max-w-sm mx-auto"
        >
          <div className="relative aspect-square w-full">
            <div className="absolute inset-0 rounded-full border border-border/30" />
            <div className="absolute inset-4 rounded-full border border-primary/10" />
            <div className="absolute inset-8">
              <CircuitTree />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
