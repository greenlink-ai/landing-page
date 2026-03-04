'use client'

import { motion } from 'framer-motion'
import { Cpu, Gpu, Network, ShieldCheck, HardDrive, Leaf } from 'lucide-react'
import type { Dictionary } from '@/lib/get-dictionary'

const featureIcons = [Cpu, Gpu, Network, ShieldCheck, HardDrive, Leaf]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const },
  },
}

interface InfrastructureSectionProps {
  dict: Dictionary
}

export function InfrastructureSection({ dict }: InfrastructureSectionProps) {
  const items = [
    dict.infrastructure.items.compute,
    dict.infrastructure.items.gpu,
    dict.infrastructure.items.network,
    dict.infrastructure.items.security,
    dict.infrastructure.items.storage,
    dict.infrastructure.items.sustainability,
  ]

  return (
    <section id="infrastructure" className="relative pt-36 pb-28">
      <div className="mx-auto max-w-6xl px-10 lg:px-16">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as const }}
          className="mb-16 text-center"
        >
          {/* Badge with pulsing dot */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {dict.infrastructure.badge}
            </span>
          </div>
          {/* Title */}
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {dict.infrastructure.title}
          </h2>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item, i) => {
            const Icon = featureIcons[i]
            return (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className="group relative rounded-2xl border border-[rgba(255,255,255,0.06)] bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
                style={{
                  boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)',
                }}
                whileHover={{
                  boxShadow: '0 0 30px 0 rgba(16, 185, 129, 0.15)',
                }}
              >
                {/* Icon */}
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-primary/10">
                  <Icon className="size-6 text-primary" strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h3 className="mb-1 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="mb-4 text-sm text-muted-foreground">
                  {item.description}
                </p>

                {/* Specs list */}
                <ul className="space-y-1.5">
                  {item.specs.map((spec: string) => (
                    <li
                      key={spec}
                      className="flex items-center gap-2 text-xs text-muted-foreground/80"
                    >
                      <span className="size-1 rounded-full bg-primary/50" />
                      {spec}
                    </li>
                  ))}
                </ul>

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
