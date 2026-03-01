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

interface FeaturesSectionProps {
  dict: Dictionary
}

export function FeaturesSection({ dict }: FeaturesSectionProps) {
  const items = [
    dict.features.items.compute,
    dict.features.items.gpu,
    dict.features.items.network,
    dict.features.items.security,
    dict.features.items.storage,
    dict.features.items.sustainability,
  ]

  return (
    <section id="infraestrutura" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-10 lg:px-16">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as const }}
          className="mb-16 text-center"
        >
          {/* Badge */}
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            {dict.features.badge}
          </span>
          {/* Title */}
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {dict.features.title}
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
