"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import type { Dictionary } from "@/lib/get-dictionary"
import { useParticleCanvas } from "@/hooks/use-particle-canvas"

/** Parses **bold** markers into React nodes with white highlight. */
function renderHighlighted(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-semibold text-[#fafafa]">
        {part}
      </span>
    ) : (
      part
    ),
  )
}

interface WhySectionLongProps {
  dict: Dictionary
}

export function WhySectionLong({ dict }: WhySectionLongProps) {
  const t = dict.whySectionLong
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useParticleCanvas(canvasRef, 30)

  return (
    <section className="relative pt-36 pb-28">
      {/* Floating particles */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ width: "100%", height: "100%" }}
      />
      <div className="mx-auto max-w-3xl px-8 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          className="mb-12 text-center"
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
          <h1 className="pb-10 text-3xl font-bold tracking-tight text-[#fafafa] sm:text-4xl lg:text-7xl">
            {t.title}
          </h1>
        </motion.div>

        {/* Paragraphs */}
        <div className="flex flex-col gap-8">
          {(t.paragraphs as string[]).map((paragraph, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.05,
                ease: [0.25, 0.4, 0.25, 1],
              }}
              className="text-base leading-relaxed text-[#a1a1aa] lg:text-lg"
            >
              {renderHighlighted(paragraph)}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  )
}
