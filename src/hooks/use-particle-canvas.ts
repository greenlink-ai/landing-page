"use client"

import { useEffect } from "react"

interface FloatingParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  fadeDir: number
}

export function useParticleCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  particleCount: number = 40,
): void {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      return rect
    }

    let rect = updateCanvasSize()

    const particles: FloatingParticle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4,
        fadeDir: Math.random() > 0.5 ? 1 : -1,
      })
    }

    let animId: number
    function animate() {
      ctx!.clearRect(0, 0, rect.width, rect.height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.opacity += p.fadeDir * 0.006

        if (p.opacity >= 0.8) p.fadeDir = -1
        if (p.opacity <= 0.05) p.fadeDir = 1

        if (p.x < 0 || p.x > rect.width) p.vx *= -1
        if (p.y < 0 || p.y > rect.height) p.vy *= -1

        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.shadowBlur = 8
        ctx!.shadowColor = "#10b981"
        ctx!.fillStyle = `rgba(110, 231, 183, ${p.opacity})`
        ctx!.fill()
        ctx!.shadowBlur = 0
      }
      animId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      rect = updateCanvasSize()
    }
    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", handleResize)
    }
  }, [canvasRef, particleCount])
}
