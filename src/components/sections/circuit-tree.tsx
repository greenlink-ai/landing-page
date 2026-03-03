"use client"

import { useEffect, useState } from "react"
import AnimatedTree from "@/components/three/AnimatedTree"

/* ─── Tree SVG file ─── */
const TREE_SVG_URL = "/tree_edited.svg"

/* ═══════════════════════════════════════════════
   Main CircuitTree - wrapper that fetches SVG and passes to AnimatedTree
   ═══════════════════════════════════════════════ */
export function CircuitTree() {
  const [pathData, setPathData] = useState<string | null>(null)

  /* Fetch SVG path data */
  useEffect(() => {
    fetch(TREE_SVG_URL)
      .then((r) => r.text())
      .then((text) => {
        const match = text.match(/\bd="([\s\S]*?)"/)
        if (match) {
          setPathData(match[1].replace(/[\r\n]+/g, " ").trim())
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="relative h-full w-full" aria-hidden="true">
      {/* Emerald glow aura */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: "60%",
          height: "60%",
          background:
            "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Animated tree */}
      <div className="absolute inset-0">
        {pathData && (
          <AnimatedTree
            pathData={pathData}
            particleCount={50}
            drawDuration={5}
            nodeCount={35}
            className="h-full w-full"
          />
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Small logo version for the header
   ═══════════════════════════════════════════════ */
export function CircuitTreeLogo({ className = "" }: { className?: string }) {
  const [pathData, setPathData] = useState<string | null>(null)

  useEffect(() => {
    fetch(TREE_SVG_URL)
      .then((r) => r.text())
      .then((text) => {
        const match = text.match(/\bd="([\s\S]*?)"/)
        if (match) setPathData(match[1].replace(/[\r\n]+/g, " ").trim())
      })
      .catch(() => {})
  }, [])

  if (!pathData) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-primary ${className}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="text-primary-foreground"
        >
          <path
            d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z"
            fill="currentColor"
          />
        </svg>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ filter: "drop-shadow(0 0 4px rgba(16, 185, 129, 0.5))" }}
    >
      <svg viewBox="0 0 2000 2000" className="h-full w-full" fill="none">
        <path
          d={pathData}
          stroke="#10b981"
          strokeWidth={35}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={pathData}
          stroke="#6ee7b7"
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.5}
        />
      </svg>
    </div>
  )
}
