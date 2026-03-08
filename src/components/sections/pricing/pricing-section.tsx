"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cpu, Server } from "lucide-react"
import type { Dictionary } from "@/lib/get-dictionary"
import { useParticleCanvas } from "@/hooks/use-particle-canvas"
import { InstancesTab } from "./instances-tab"
import { ClustersTab } from "./clusters-tab"

interface PricingSectionProps {
  dict: Dictionary
}

export function PricingSection({ dict }: PricingSectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useParticleCanvas(canvasRef)

  const [activeTab, setActiveTab] = useState<"instances" | "clusters">(
    "instances",
  )

  const p = dict.pricing

  return (
    <section id="pricing" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Canvas particles */}
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
          className="mb-12 text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {p.badge}
            </span>
          </div>

          <h2 className="mx-auto max-w-3xl text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {p.title} <span className="text-primary">{p.titleHighlight}</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            {p.subtitle}
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 flex justify-center"
        >
          <div className="inline-flex rounded-xl border border-[rgba(255,255,255,0.06)] bg-card/50 p-1.5">
            <button
              onClick={() => setActiveTab("instances")}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all duration-300 ${
                activeTab === "instances"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Cpu className="size-4" strokeWidth={1.5} />
              {p.tabs.instances}
            </button>
            <button
              onClick={() => setActiveTab("clusters")}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all duration-300 ${
                activeTab === "clusters"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Server className="size-4" strokeWidth={1.5} />
              {p.tabs.clusters}
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "instances" && <InstancesTab dict={p} />}
          {activeTab === "clusters" && <ClustersTab dict={p} />}
        </AnimatePresence>
      </div>
    </section>
  )
}
