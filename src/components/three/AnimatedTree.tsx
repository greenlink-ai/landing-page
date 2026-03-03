"use client"

import { motion } from "framer-motion"
import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import { useParticleCanvas } from "@/hooks/use-particle-canvas"

/* ─── Design System Colors (DESIGN_SYSTEM.md §2.1) ─── */
const COLORS = {
  accent: "#10b981",       // emerald-500
  accentLight: "#34d399",  // emerald-400
  accentMuted: "#6ee7b7",  // emerald-300
  accentGlow: "rgba(16, 185, 129, 0.15)",
  accentGlowStrong: "rgba(16, 185, 129, 0.25)",
} as const

/* ─── Seeded PRNG for deterministic values (avoids hydration mismatch) ─── */
function deterministicRandom(a: number, b: number, c: number = 0): number {
  const s = Math.sin(a * 12.9898 + b * 78.233 + c * 45.164) * 43758.5453
  return s - Math.floor(s)
}

function createSeededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/* ─── Parse sub-path lowest Y (for bottom-to-top sorting) ─── */
function getLowestY(pathD: string): number {
  const nums = pathD.match(/[\d.]+/g)
  if (!nums) return 0
  let maxY = 0
  for (let i = 1; i < nums.length; i += 2) {
    const y = parseFloat(nums[i])
    if (y > maxY) maxY = y
  }
  return maxY
}

/* ─── Estimate path length from coordinate pairs ─── */
function estimatePathLength(pathD: string): number {
  const nums = pathD.match(/[\d.]+/g)
  if (!nums || nums.length < 4) return 10
  let total = 0
  for (let i = 2; i < nums.length - 1; i += 2) {
    const dx = parseFloat(nums[i]) - parseFloat(nums[i - 2])
    const dy = parseFloat(nums[i + 1]) - parseFloat(nums[i - 1])
    total += Math.sqrt(dx * dx + dy * dy)
  }
  return Math.max(total, 10)
}

/* ─── Split compound SVG path into sub-paths by M commands ─── */
function splitPath(fullD: string): string[] {
  const parts: string[] = []
  const re = /M[\s\S]*?(?=M|$)/g
  let match: RegExpExecArray | null
  while ((match = re.exec(fullD)) !== null) {
    const segment = match[0].trim()
    if (segment.length > 5) parts.push(segment)
  }
  return parts
}

/* ─── Calculate evenly spaced points along an SVG path using getPointAtLength ─── */
function computeNodePositions(
  pathData: string,
  nodeCount: number,
): { x: number; y: number }[] {
  if (typeof document === "undefined") return []

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
  svg.setAttribute("viewBox", "0 0 2000 2000")
  svg.style.position = "absolute"
  svg.style.width = "0"
  svg.style.height = "0"
  svg.style.overflow = "hidden"

  const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path")
  pathEl.setAttribute("d", pathData)
  svg.appendChild(pathEl)
  document.body.appendChild(svg)

  const totalLength = pathEl.getTotalLength()
  const points: { x: number; y: number }[] = []
  const step = totalLength / (nodeCount - 1)

  for (let i = 0; i < nodeCount; i++) {
    const distance = i * step
    const pt = pathEl.getPointAtLength(distance)
    points.push({ x: pt.x, y: pt.y })
  }

  document.body.removeChild(svg)
  return points
}

/* ─── Pulsing glow node ─── */
function PulsingNode({
  cx,
  cy,
  r = 7,
  delay = 0,
}: {
  cx: number
  cy: number
  r?: number
  delay?: number
}) {
  const randomDuration = 2 + deterministicRandom(cx, cy, 1) * 3
  const randomIntensity = 0.4 + deterministicRandom(cx, cy, 2) * 0.6
  const delayOffset1 = deterministicRandom(cx, cy, 3) * 2
  const delayOffset2 = deterministicRandom(cx, cy, 4) * 1.5

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {/* Outer glow halo */}
      <motion.circle
        cx={cx}
        cy={cy}
        fill={COLORS.accent}
        initial={{ r: r * 3, opacity: 0.05 }}
        animate={{
          opacity: [0.05, 0.15 * randomIntensity, 0.05],
          r: [r * 2.5, r * 3.5, r * 2.5],
        }}
        transition={{
          duration: randomDuration,
          repeat: Infinity,
          delay: delay + delayOffset1,
          ease: "easeInOut",
        }}
      />
      {/* Mid glow */}
      <motion.circle
        cx={cx}
        cy={cy}
        fill={COLORS.accent}
        initial={{ r: r * 1.6, opacity: 0.1 }}
        animate={{
          opacity: [0.1, 0.3 * randomIntensity, 0.1],
        }}
        transition={{
          duration: randomDuration * 0.8,
          repeat: Infinity,
          delay: delay + delayOffset2,
          ease: "easeInOut",
        }}
      />
      {/* Core dot */}
      <circle cx={cx} cy={cy} r={r} fill={COLORS.accent} opacity={0.9} />
      <circle cx={cx} cy={cy} r={r * 0.4} fill={COLORS.accentMuted} />
    </motion.g>
  )
}

/* ─── Background star particle ─── */
function StarParticle({
  x,
  y,
  r,
  delay,
}: {
  x: number
  y: number
  r: number
  delay: number
}) {
  const duration = 4 + deterministicRandom(x, y, r) * 4
  return (
    <motion.circle
      cx={x}
      cy={y}
      r={r}
      fill={COLORS.accentMuted}
      filter="url(#tree-neon-glow)"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0, 0.8, 0],
        scale: [0.8, 1.2, 0.8],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}

/* ═══════════════════════════════════════════════
   AnimatedTree — Main component
   ═══════════════════════════════════════════════ */

interface AnimatedTreeProps {
  pathData: string
  particleCount?: number
  drawDuration?: number
  nodeCount?: number
  className?: string
}

export default function AnimatedTree({
  pathData,
  particleCount = 50,
  drawDuration = 5,
  nodeCount = 35,
  className = "",
}: AnimatedTreeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [pathEntries, setPathEntries] = useState<
    { d: string; delay: number; duration: number }[]
  >([])

  const [nodePositions, setNodePositions] = useState<
    { x: number; y: number; delay: number }[]
  >([])

  useParticleCanvas(canvasRef, particleCount)

  /* Split path, sort bottom-to-top, compute draw timing */
  const computePaths = useCallback(() => {
    const segments = splitPath(pathData)

    const sorted = segments
      .map((d) => ({
        d,
        bottomY: getLowestY(d),
        length: estimatePathLength(d),
      }))
      .sort((a, b) => b.bottomY - a.bottomY)

    const totalLength = sorted.reduce((sum, s) => sum + s.length, 0)
    const pixelsPerSecond = totalLength / drawDuration

    let elapsed = 0
    const entries = sorted.map((s) => {
      const duration = Math.max(s.length / pixelsPerSecond, 0.5)
      const delay = elapsed
      elapsed += duration * 0.4
      return { d: s.d, delay, duration }
    })

    setPathEntries(entries)
  }, [pathData, drawDuration])

  /* Calculate evenly spaced node positions using getPointAtLength */
  const computeNodes = useCallback(() => {
    const points = computeNodePositions(pathData, nodeCount)
    if (points.length === 0) return

    /* Compute total draw time so we can space node appearances */
    const segments = splitPath(pathData)
    const sorted = segments
      .map((d) => ({
        d,
        bottomY: getLowestY(d),
        length: estimatePathLength(d),
      }))
      .sort((a, b) => b.bottomY - a.bottomY)

    const totalLength = sorted.reduce((sum, s) => sum + s.length, 0)
    const pixelsPerSecond = totalLength / drawDuration
    let elapsed = 0
    for (const s of sorted) {
      const dur = Math.max(s.length / pixelsPerSecond, 0.5)
      elapsed += dur * 0.4
    }
    const lastSorted = sorted[sorted.length - 1]
    const lastDur = lastSorted
      ? Math.max(lastSorted.length / pixelsPerSecond, 0.5)
      : 1
    const totalDrawTime = elapsed - lastDur * 0.4 + lastDur

    /* Distribute node appearance delays across the draw time */
    const nodes = points.map((pt, i) => ({
      x: pt.x,
      y: pt.y,
      delay: (i / (points.length - 1)) * totalDrawTime * 0.8 + 0.5,
    }))

    setNodePositions(nodes)
  }, [pathData, nodeCount, drawDuration])

  useEffect(() => {
    computePaths()
    computeNodes()
  }, [computePaths, computeNodes])

  /* SVG star particles scattered across the viewBox */
  const starPositions = useMemo(() => {
    const rand = createSeededRandom(42)
    const stars = []
    for (let i = 0; i < 20; i++) {
      stars.push({
        x: rand() * 1800 + 100,
        y: rand() * 1800 + 100,
        r: rand() * 4 + 1.5,
        delay: rand() * 4,
      })
    }
    return stars
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* Canvas for floating particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ width: "100%", height: "100%" }}
      />

      {/* SVG tree */}
      <svg
        viewBox="0 0 2000 2000"
        className="absolute inset-0 h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            id="tree-neon-glow"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="4"
              result="blur1"
            />
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="1.5"
              result="blur2"
            />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id="tree-node-glow"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Self-drawing sub-paths (bottom-to-top, uniform velocity) ── */}
        <g filter="url(#tree-neon-glow)">
          {pathEntries.map((entry, i) => (
            <g key={i}>
              {/* Wide glow stroke */}
              <motion.path
                d={entry.d}
                stroke={COLORS.accent}
                strokeWidth={7}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.15 }}
                transition={{
                  duration: entry.duration,
                  delay: entry.delay,
                  ease: "linear",
                }}
              />
              {/* Main visible stroke */}
              <motion.path
                d={entry.d}
                stroke={COLORS.accent}
                strokeWidth={3.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.9 }}
                transition={{
                  duration: entry.duration,
                  delay: entry.delay,
                  ease: "linear",
                }}
              />
              {/* Bright inner core */}
              <motion.path
                d={entry.d}
                stroke={COLORS.accentMuted}
                strokeWidth={1}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                transition={{
                  duration: entry.duration,
                  delay: entry.delay + 0.1,
                  ease: "linear",
                }}
              />
            </g>
          ))}
        </g>

        {/* ── Evenly spaced circuit nodes (appear progressively) ── */}
        <g filter="url(#tree-node-glow)">
          {nodePositions.map((node, i) => (
            <PulsingNode
              key={`node-${i}`}
              cx={node.x}
              cy={node.y}
              r={7}
              delay={node.delay}
            />
          ))}
        </g>

        {/* ── SVG star particles ── */}
        {starPositions.map((s, i) => (
          <StarParticle
            key={`star-${i}`}
            x={s.x}
            y={s.y}
            r={s.r}
            delay={s.delay}
          />
        ))}
      </svg>
    </div>
  )
}
