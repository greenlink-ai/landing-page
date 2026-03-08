"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Canvas } from "@react-three/fiber"
import { Check, Cpu, Network, HardDrive } from "lucide-react"
import type { Dictionary } from "@/lib/get-dictionary"
import { useParticleCanvas } from "@/hooks/use-particle-canvas"
import { ChipScene } from "@/components/three/chip"
import { ClusterScene } from "@/components/three/cluster"
import { StorageScene } from "@/components/three/storage"

function Scene3D({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      style={{ background: "transparent" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#10b981" />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#6ee7b7" />
      {children}
    </Canvas>
  )
}

/* ═══════════════════════════════════════════════
   3D SCENE MAPPING
   ═══════════════════════════════════════════════ */

const SCENE_COMPONENTS = [ChipScene, ClusterScene, StorageScene]
const BLOCK_IDS = ["solutions-instances", "solutions-clusters", "solutions-storage"]
const BLOCK_ICONS = [Cpu, Network, HardDrive]

/* ═══════════════════════════════════════════════
   SOLUTION BLOCK
   ═══════════════════════════════════════════════ */

interface SolutionTier {
  name: string
  price: string
}

interface SolutionBlockData {
  badge: string
  title: string
  subtitle: string
  description: string
  features: string[]
  tiers: SolutionTier[]
}

function SolutionBlock({
  block,
  index,
}: {
  block: SolutionBlockData
  index: number
}): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const isReversed = index % 2 === 1
  const SceneComponent = SCENE_COMPONENTS[index] ?? ChipScene
  const Icon = BLOCK_ICONS[index] ?? Cpu
  const blockId = BLOCK_IDS[index]

  return (
    <div
      id={blockId}
      ref={ref}
      className={`scroll-mt-24 grid gap-8 lg:grid-cols-2 lg:gap-12 ${
        isReversed ? "lg:[direction:rtl]" : ""
      }`}
    >
      {/* Text content */}
      <motion.div
        className="flex flex-col justify-center lg:[direction:ltr]"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
      >
        {/* Badge */}
        <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
          <Icon className="size-4 text-primary" strokeWidth={1.5} />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {block.badge}
          </span>
        </div>

        <h3 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
          {block.title}
        </h3>
        <p className="mb-4 text-lg font-medium text-primary">
          {block.subtitle}
        </p>
        <p className="mb-6 text-base leading-relaxed text-muted-foreground">
          {block.description}
        </p>

        {/* Features */}
        <ul className="mb-6 space-y-2">
          {block.features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Check
                className="size-4 flex-shrink-0 text-primary"
                strokeWidth={2}
              />
              {feature}
            </li>
          ))}
        </ul>

        {/* Pricing tiers */}
        <div className="flex flex-wrap gap-3">
          {block.tiers.map((tier, tierIndex) => (
            <div
              key={tier.name}
              className={`rounded-lg border px-4 py-2 ${
                tierIndex === 1
                  ? "border-primary/50 bg-primary/10"
                  : "border-border bg-secondary/50"
              }`}
            >
              <div className="text-xs text-muted-foreground">
                {tier.name}
              </div>
              <div
                className={`text-sm font-semibold ${
                  tierIndex === 1 ? "text-primary" : "text-foreground"
                }`}
              >
                {tier.price}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 3D Canvas */}
      <motion.div
        className="order-first flex items-center justify-center lg:order-0 lg:[direction:ltr]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.4, 0.25, 1] }}
      >
        <div className="h-62.5 w-full lg:h-87.5">
          <Scene3D>
            <SceneComponent />
          </Scene3D>
        </div>
      </motion.div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

interface SolutionsSectionProps {
  dict: Dictionary
}

export function SolutionsSection({ dict }: SolutionsSectionProps): React.JSX.Element {
  const t = dict.solutions
  const blocks = t.blocks as SolutionBlockData[]
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useParticleCanvas(canvasRef)

  return (
    <section id="solutions" className="relative overflow-hidden py-24 lg:py-32">
      {/* Floating particles background */}
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
          className="mb-20 text-center"
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
          <p className="mx-auto mt-4 max-w-[65ch] text-lg text-muted-foreground">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Solution blocks */}
        <div className="space-y-24 lg:space-y-32">
          {blocks.map((block, index) => (
            <SolutionBlock key={block.title} block={block} index={index} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          className="mt-20 text-center"
        >
          <a
            href="#contact"
            className="inline-flex items-center rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t.cta}
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default SolutionsSection
