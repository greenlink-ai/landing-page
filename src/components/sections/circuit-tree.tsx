"use client"

import { motion } from "framer-motion"
import { useEffect, useRef, useState, useMemo } from "react"

/* ─── Tree SVG file ─── */
const TREE_SVG_URL = "/tree_edited.svg"

/* ─── Seeded PRNG for deterministic "random" values (avoids hydration mismatch) ─── */
function createSeededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/* ─── Derive a deterministic pseudo-random from numeric props ─── */
function deterministicRandom(a: number, b: number, c: number = 0): number {
  const s = Math.sin(a * 12.9898 + b * 78.233 + c * 45.164) * 43758.5453
  return s - Math.floor(s)
}

/* ─── Parse a single sub-path to find its lowest Y (highest Y value = bottom) ─── */
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

/* ─── Estimate a path's drawn length from coordinate pairs ─── */
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

/* ─── Get endpoint of a sub-path (last coordinate pair) ─── */
function getEndpoint(pathD: string): { x: number; y: number } {
  const nums = pathD.match(/[\d.]+/g)
  if (!nums || nums.length < 2) return { x: 1000, y: 1000 }
  return {
    x: parseFloat(nums[nums.length - 2]),
    y: parseFloat(nums[nums.length - 1]),
  }
}

/* ─── Split a compound SVG path into sub-paths by M commands ─── */
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

/* ─── Randomized pulsing glow node (post-draw) ─── */
function PulsingNode({ cx, cy, r = 8, delay = 0 }: { cx: number; cy: number; r?: number; delay?: number }) {
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
      {/* Outer glow halo - pulses randomly */}
      <motion.circle
        cx={cx}
        cy={cy}
        fill="#10b981"
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
        fill="#10b981"
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
      <circle cx={cx} cy={cy} r={r} fill="#10b981" opacity={0.9} />
      <circle cx={cx} cy={cy} r={r * 0.4} fill="#6ee7b7" />
    </motion.g>
  )
}

/* ─── Background star-like particle ─── */
function StarParticle({ x, y, r, delay }: { x: number; y: number; r: number; delay: number }) {
  const duration = 4 + deterministicRandom(x, y, r) * 4
  return (
    <motion.circle
      cx={x}
      cy={y}
      r={r}
      fill="#6ee7b7" // Cor mais clara (Emerald-300) para parecer o núcleo da estrela
      filter="url(#neon-glow)" // Reutiliza o filtro de brilho da árvore
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0, 0.8, 0], // Aumentamos a opacidade máxima para 0.8
        scale: [0.8, 1.2, 0.8] // Adicionamos um pulsar de tamanho
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

/* ─── Canvas particles (random drift + twinkle) ─── */
function useParticleCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    interface FloatingParticle {
      x: number; y: number
      vx: number; vy: number
      size: number; opacity: number; fadeDir: number
    }

    const particles: FloatingParticle[] = []
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.3,
        fadeDir: Math.random() > 0.5 ? 1 : -1,
      })
    }

    let animId: number
    function animate() {
      ctx!.clearRect(0, 0, rect.width, rect.height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.opacity += p.fadeDir * 0.005 // Twinkle um pouco mais rápido

        if (p.opacity >= 0.8) p.fadeDir = -1 // Máximo brilho aumentado
        if (p.opacity <= 0.05) p.fadeDir = 1

        if (p.x < 0 || p.x > rect.width) p.vx *= -1
        if (p.y < 0 || p.y > rect.height) p.vy *= -1

        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)

        // Efeito de brilho (Bloom)
        ctx!.shadowBlur = 8;
        ctx!.shadowColor = "#10b981";

        // Cor do núcleo mais brilhante
        ctx!.fillStyle = `rgba(110, 231, 183, ${p.opacity})`;
        ctx!.fill()

        // Reset do shadow para não afetar a próxima partícula desnecessariamente
        ctx!.shadowBlur = 0;
      }
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animId)
  }, [canvasRef])
}

/* ═══════════════════════════════════════════════
   Main CircuitTree
   ═══════════════════════════════════════════════ */
export function CircuitTree() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pathEntries, setPathEntries] = useState<
    { d: string; delay: number; duration: number }[]
  >([])
  const [nodeEntries, setNodeEntries] = useState<
    { x: number; y: number; delay: number }[]
  >([])
  const [totalTime, setTotalTime] = useState(6)
  const [, setDrawDone] = useState(false)

  useParticleCanvas(canvasRef)

  /* Fetch SVG, split into sub-paths, sort bottom-to-top, compute uniform velocity */
  useEffect(() => {
    fetch(TREE_SVG_URL)
      .then((r) => r.text())
      .then((text) => {
        const match = text.match(/\bd="([\s\S]*?)"/)
        if (!match) return
        const fullD = match[1].replace(/[\r\n]+/g, " ").trim()
        const segments = splitPath(fullD)

        /* Sort by lowest Y descending (bottom segments first) */
        const sorted = segments
          .map((d) => ({
            d,
            bottomY: getLowestY(d),
            length: estimatePathLength(d),
          }))
          .sort((a, b) => b.bottomY - a.bottomY)

        /* Compute uniform drawing speed:
           All paths draw at the same pixels/second.
           Total budget: ~8s for the whole tree. */
        const totalLength = sorted.reduce((sum, s) => sum + s.length, 0)

        // 1. Pixels p/second
        const PIXELS_PER_SECOND = totalLength / 8

        let elapsed = 0
        const entries = sorted.map((s) => {
          const duration = Math.max(s.length / PIXELS_PER_SECOND, 0.5)
          const delay = elapsed

          // 2. Facto de sobreposição = 0.4 
          // Isto faz com que as linhas esperem umas pelas outras, criando o efeito de "crescimento"
          // em vez de aparecer tudo quase ao mesmo tempo.
          elapsed += duration * 0.4

          return { d: s.d, delay, duration }
        })

        /* Node data: endpoint of every Nth path, appears when its path finishes */
        const nodes = entries
          .filter((_, i) => i % 3 === 0)
          .map((entry) => {
            const ep = getEndpoint(entry.d)
            return { x: ep.x, y: ep.y, delay: entry.delay + entry.duration }
          })

        const lastEntry = entries[entries.length - 1]
        const computedTotal = lastEntry ? lastEntry.delay + lastEntry.duration + 0.5 : 6

        setPathEntries(entries)
        setNodeEntries(nodes)
        setTotalTime(computedTotal)
      })
      .catch(() => { })
  }, [])

  /* SVG star particles scattered across the 2000x2000 viewBox */
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

  /* Mark draw as complete once last path would have finished */
  useEffect(() => {
    if (pathEntries.length === 0) return
    const timer = setTimeout(() => setDrawDone(true), totalTime * 1000)
    return () => clearTimeout(timer)
  }, [pathEntries, totalTime])

  return (
    <div className="relative h-full w-full" aria-hidden="true">
      {/* Canvas for floating particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Emerald glow aura */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: "60%",
          height: "60%",
          background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* SVG tree container -- stationary */}
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 2000 2000"
          className="absolute inset-0 h-full w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Neon glow filter */}
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              {/* Brilho mais focado e intenso */}
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="node-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Self-drawing sub-paths (bottom-to-top, uniform velocity) ── */}
          <g filter="url(#neon-glow)">
            {pathEntries.map((entry, i) => (
              <g key={i}>
                {/* Wide glow stroke */}
                <motion.path
                  d={entry.d}
                  stroke="#10b981"
                  strokeWidth={7}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.15 }}
                  transition={{ duration: entry.duration, delay: entry.delay, ease: "linear" }}
                />
                {/* Main visible stroke */}
                <motion.path
                  d={entry.d}
                  stroke="#10b981"
                  strokeWidth={3.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.9 }}
                  transition={{ duration: entry.duration, delay: entry.delay, ease: "linear" }}
                />
                {/* Bright inner core */}
                <motion.path
                  d={entry.d}
                  stroke="#6ee7b7"
                  strokeWidth={1}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: entry.duration, delay: entry.delay + 0.1, ease: "linear" }}
                />
              </g>
            ))}
          </g>

          {/* ── Circuit activation nodes (appear when branch finishes drawing) ── */}
          <g filter="url(#node-glow)">
            {nodeEntries.map((node, i) => (
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
            <StarParticle key={`star-${i}`} x={s.x} y={s.y} r={s.r} delay={s.delay} />
          ))}
        </svg>
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
      .catch(() => { })
  }, [])

  if (!pathData) {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-primary ${className}`}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary-foreground">
          <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="currentColor" />
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
