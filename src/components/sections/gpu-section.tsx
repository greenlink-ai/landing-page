"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { Dictionary } from "@/lib/get-dictionary"
import { useParticleCanvas } from "@/hooks/use-particle-canvas"

/* ═══════════════════════════════════════════════
   Icon SVG mapping (NVIDIA official spec icons)
   ═══════════════════════════════════════════════ */

const SPEC_ICONS = [
  "/gpu/5th gen tensor core.svg",
  "/gpu/4th gen rt cores.svg",
  "/gpu/CUDA Cores.svg",
  "/gpu/GPU chip.svg",
  "/gpu/9th gen NVENC.svg",
  "/gpu/6th gen NVDEC.svg",
  "/gpu/MIG.svg",
  "/gpu/PCIe Gen 5.svg",
  "/gpu/DisplayPort 2.1.svg",
]

const SPEC_KEYS = [
  "tensorCores",
  "rtCores",
  "cudaCores",
  "gpuMemory",
  "nvenc",
  "nvdec",
  "mig",
  "pcie",
  "displayPort",
] as const

const WORKLOAD_KEYS = [
  "agenticAi",
  "physicalAi",
  "mediaEntertainment",
  "rendering",
  "scientific",
] as const

/* ═══════════════════════════════════════════════
   SVG icon — fetches SVG, strips bounding rect,
   renders inline with emerald fill
   ═══════════════════════════════════════════════ */

function SvgIcon({ src, className = "size-8" }: { src: string; className?: string }) {
  const [svgContent, setSvgContent] = useState<string | null>(null)

  useEffect(() => {
    fetch(src)
      .then((r) => r.text())
      .then((text) => {
        // Strip XML declaration
        let cleaned = text.replace(/<\?xml[^?]*\?>\s*/g, "")
        // Strip comments
        cleaned = cleaned.replace(/<!--[\s\S]*?-->\s*/g, "")
        // Strip <style> blocks
        cleaned = cleaned.replace(/<style[\s\S]*?<\/style>\s*/g, "")
        // Strip transparent bounding rects (fill-opacity:0 or class="st1")
        cleaned = cleaned.replace(/<rect[^>]*(?:fill-opacity\s*[:=]\s*["']?0|class=["']st1["'])[^>]*\/?\s*>/g, "")
        // Remove class attributes (no longer needed without <style>)
        cleaned = cleaned.replace(/\s*class="[^"]*"/g, "")
        // Replace all fill="#FFFFFF", fill="white", or fill="none" on non-root elements with currentColor
        cleaned = cleaned.replace(/fill=["'](?:#FFFFFF|#ffffff|white)["']/g, 'fill="currentColor"')
        // Handle inline style fills
        cleaned = cleaned.replace(/fill:\s*#(?:FFFFFF|ffffff);?/gi, "fill:currentColor;")
        // Remove fill="none" from root svg so children inherit
        cleaned = cleaned.replace(/(<svg[^>]*)\s+fill=["']none["']/g, "$1")
        // Set root <svg> to scale to container and inherit fill from parent
        cleaned = cleaned.replace(
          /<svg([^>]*)>/,
          '<svg$1 width="100%" height="100%" fill="currentColor">',
        )
        setSvgContent(cleaned)
      })
      .catch(() => {})
  }, [src])

  if (!svgContent) return <div className={className} />

  return (
    <div
      className={`${className} text-primary [&>svg]:size-full`}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  )
}

/* ═══════════════════════════════════════════════
   Animation variants
   ═══════════════════════════════════════════════ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
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

/* ═══════════════════════════════════════════════
   GpuSection
   ═══════════════════════════════════════════════ */

interface GpuSectionProps {
  dict: Dictionary
}

export function GpuSection({ dict }: GpuSectionProps) {
  const t = dict.gpu as Record<string, unknown>
  const specs = t.specs as Record<string, { title: string; description: string; specs: string[] }>
  const workloads = t.workloads as Record<string, { title: string; description: string }>
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useParticleCanvas(canvasRef)

  return (
    <section id="gpu" className="relative overflow-hidden pt-36 pb-28">
      {/* Floating particles background */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ width: "100%", height: "100%" }}
      />
      <div className="relative mx-auto max-w-6xl px-10 lg:px-16">
        {/* ── Header ── */}
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
              {t.badge as string}
            </span>
          </div>

          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t.title as string}
          </h2>
          <p className="mx-auto mt-4 max-w-[75ch] text-lg text-muted-foreground">
            {t.subtitle as string}
          </p>
        </motion.div>

        {/* ── Specs Bento Grid ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SPEC_KEYS.map((key, i) => {
            const spec = specs[key]
            return (
              <motion.div
                key={key}
                variants={itemVariants}
                className="group relative rounded-2xl border border-[rgba(255,255,255,0.06)] bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
                whileHover={{
                  boxShadow: "0 0 30px 0 rgba(16, 185, 129, 0.15)",
                }}
              >
                {/* Icon */}
                <SvgIcon src={SPEC_ICONS[i]} className="mx-auto mb-4 size-24" />

                {/* Title */}
                <h3 className="mb-1 text-center text-lg font-semibold text-foreground">
                  {spec.title}
                </h3>

                {/* Description */}
                <p className="mb-4 text-center text-sm text-muted-foreground">
                  {spec.description}
                </p>

                {/* Spec bullets */}
                <ul className="space-y-1.5">
                  {spec.specs.map((s: string) => (
                    <li
                      key={s}
                      className="flex items-center gap-2 text-xs text-muted-foreground/80"
                    >
                      <span className="size-1 rounded-full bg-primary/50" />
                      {s}
                    </li>
                  ))}
                </ul>

                {/* Hover glow */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute inset-px rounded-2xl bg-linear-to-b from-primary/5 to-transparent" />
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* ── Workloads ── */}
        <div className="mt-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <h3 className="text-3xl font-bold text-foreground">
              {t.workloadsTitle as string}
            </h3>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="mt-12 grid gap-x-12 gap-y-8 md:grid-cols-2"
          >
            {WORKLOAD_KEYS.map((key) => {
              const w = workloads[key]
              return (
                <motion.div
                  key={key}
                  variants={itemVariants}
                  className="border-l-2 border-primary pl-4"
                >
                  <h4 className="text-lg font-semibold text-foreground">
                    {w.title}
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {w.description}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default GpuSection
