"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

interface GreenLinkOrbProps {
  className?: string
}

export function GreenLinkOrb({ className = "" }: GreenLinkOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
    camera.position.z = 6

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(300, 300)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    // Orb wireframe sphere
    const orbGeometry = new THREE.IcosahedronGeometry(1.8, 3)
    const orbMaterial = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    })
    const orb = new THREE.Mesh(orbGeometry, orbMaterial)
    scene.add(orb)

    // Glowing nodes at vertices
    const nodeGeometry = new THREE.SphereGeometry(0.04, 8, 8)
    const nodeMaterial = new THREE.MeshBasicMaterial({
      color: 0x6ee7b7,
      transparent: true,
      opacity: 0.9,
    })

    const positions = orbGeometry.attributes.position
    const nodesGroup = new THREE.Group()
    const nodeRefs: THREE.Mesh[] = []
    const uniquePositions = new Map<string, THREE.Vector3>()

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      const z = positions.getZ(i)
      const key = `${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}`
      if (!uniquePositions.has(key)) {
        uniquePositions.set(key, new THREE.Vector3(x, y, z))
      }
    }

    uniquePositions.forEach((pos) => {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone())
      node.position.copy(pos)
      nodesGroup.add(node)
      nodeRefs.push(node)
    })
    scene.add(nodesGroup)

    // Floating particles around the orb
    interface Particle {
      mesh: THREE.Mesh
      velocity: THREE.Vector3
      basePos: THREE.Vector3
      phase: number
      attracted: boolean
      targetNode: THREE.Mesh | null
      attractSpeed: number
    }

    const particles: Particle[] = []
    const particleGeometry = new THREE.SphereGeometry(0.03, 6, 6)
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.7,
    })

    for (let i = 0; i < 100; i++) {
      const mesh = new THREE.Mesh(particleGeometry, particleMaterial.clone())
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = 3.5 + Math.random() * 3

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      mesh.position.set(x, y, z)
      scene.add(mesh)

      particles.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.005
        ),
        basePos: new THREE.Vector3(x, y, z),
        phase: Math.random() * Math.PI * 2,
        attracted: false,
        targetNode: null,
        attractSpeed: 0,
      })
    }

    // Glow pulses on nodes
    interface GlowPulse {
      node: THREE.Mesh
      startTime: number
      duration: number
    }
    const glowPulses: GlowPulse[] = []

    let animationId: number
    const clock = new THREE.Clock()
    let cameraAngle = 0

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      // Rotate orb
      orb.rotation.y += 0.002
      orb.rotation.x += 0.0005
      nodesGroup.rotation.y = orb.rotation.y
      nodesGroup.rotation.x = orb.rotation.x

      // Mouse parallax
      const targetRotX = mouseRef.current.y * 0.1
      const targetRotZ = -mouseRef.current.x * 0.1
      orb.rotation.x += (targetRotX - orb.rotation.x) * 0.02
      orb.rotation.z += (targetRotZ - orb.rotation.z) * 0.02
      nodesGroup.rotation.x = orb.rotation.x
      nodesGroup.rotation.z = orb.rotation.z

      // Subtle camera orbit
      cameraAngle += 0.0003
      camera.position.x = Math.sin(cameraAngle) * 0.3
      camera.position.y = Math.cos(cameraAngle * 0.7) * 0.2
      camera.lookAt(0, 0, 0)

      // Update particles
      for (const particle of particles) {
        if (particle.attracted && particle.targetNode) {
          const worldPos = new THREE.Vector3()
          particle.targetNode.getWorldPosition(worldPos)

          const dir = worldPos.clone().sub(particle.mesh.position)
          const dist = dir.length()

          particle.attractSpeed = Math.min(particle.attractSpeed + 0.002, 0.15)
          dir.normalize().multiplyScalar(particle.attractSpeed)
          particle.mesh.position.add(dir)

          const mat = particle.mesh.material as THREE.MeshBasicMaterial
          mat.opacity = Math.min(1, 0.7 + (1 - dist / 3) * 0.5)
          particle.mesh.scale.setScalar(1 + (1 - dist / 3) * 0.5)

          // Absorption on contact
          if (dist < 0.15) {
            glowPulses.push({
              node: particle.targetNode,
              startTime: elapsed,
              duration: 0.5,
            })

            // Respawn particle
            const t = Math.random() * Math.PI * 2
            const p = Math.acos(2 * Math.random() - 1)
            const r = 4 + Math.random() * 3

            particle.mesh.position.set(
              r * Math.sin(p) * Math.cos(t),
              r * Math.sin(p) * Math.sin(t),
              r * Math.cos(p)
            )
            particle.basePos.copy(particle.mesh.position)
            particle.attracted = false
            particle.targetNode = null
            particle.attractSpeed = 0
            mat.opacity = 0.7
            particle.mesh.scale.setScalar(1)
          }
        } else {
          // Floating motion
          particle.phase += 0.01
          particle.mesh.position.x = particle.basePos.x + Math.sin(particle.phase) * 0.1
          particle.mesh.position.y = particle.basePos.y + Math.cos(particle.phase * 0.7) * 0.1
          particle.mesh.position.z = particle.basePos.z + Math.sin(particle.phase * 0.5) * 0.08

          particle.basePos.add(particle.velocity)

          // Check attraction zone
          const dist = particle.mesh.position.length()
          if (dist < 3) {
            let minDist = Infinity
            let nearestNode: THREE.Mesh | null = null
            for (const node of nodeRefs) {
              const wp = new THREE.Vector3()
              node.getWorldPosition(wp)
              const d = particle.mesh.position.distanceTo(wp)
              if (d < minDist) {
                minDist = d
                nearestNode = node
              }
            }
            if (nearestNode) {
              particle.attracted = true
              particle.targetNode = nearestNode
              particle.attractSpeed = 0.01
            }
          }

          // Bounce off outer boundary
          if (dist > 7) {
            particle.velocity.multiplyScalar(-1)
            const t = Math.random() * Math.PI * 2
            const p = Math.acos(2 * Math.random() - 1)
            const r = 4 + Math.random() * 2
            particle.basePos.set(
              r * Math.sin(p) * Math.cos(t),
              r * Math.sin(p) * Math.sin(t),
              r * Math.cos(p)
            )
          }
        }
      }

      // Update glow pulses
      for (let i = glowPulses.length - 1; i >= 0; i--) {
        const pulse = glowPulses[i]
        const progress = (elapsed - pulse.startTime) / pulse.duration

        if (progress >= 1) {
          const mat = pulse.node.material as THREE.MeshBasicMaterial
          mat.opacity = 0.9
          pulse.node.scale.setScalar(1)
          glowPulses.splice(i, 1)
        } else {
          const intensity = 1 - progress
          const mat = pulse.node.material as THREE.MeshBasicMaterial
          mat.opacity = 0.9 + intensity * 0.5
          pulse.node.scale.setScalar(1 + intensity * 1.5)
        }
      }

      renderer.render(scene, camera)
    }

    animate()

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      mouseRef.current.x = (e.clientX - centerX) / (rect.width / 2)
      mouseRef.current.y = (e.clientY - centerY) / (rect.height / 2)
    }

    window.addEventListener("mousemove", handleMouseMove)

    const handleResize = () => {
      renderer.setSize(300, 300)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
      renderer.dispose()
      orbGeometry.dispose()
      orbMaterial.dispose()
      nodeGeometry.dispose()
      nodeMaterial.dispose()
      particleGeometry.dispose()
      particleMaterial.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width: 300, height: 300 }}
    />
  )
}
