"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"
import { PARTICLE_COLOR } from "@/lib/particle-config"

/* ═══════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════ */

const GRID_LINES = 10
const GRID_SPACING = 0.25
const HALF = ((GRID_LINES - 1) * GRID_SPACING) / 2
const RUNNER_COUNT = 12
const RUNNER_SPEED = 0.8

/* ═══════════════════════════════════════════════
   Grid geometry — lines on X/Z plane, viewed at 45deg
   ═══════════════════════════════════════════════ */

function makeGridGeometry(
  lines: number,
  spacing: number,
): THREE.BufferGeometry {
  const h = ((lines - 1) * spacing) / 2
  const pts: number[] = []

  for (let i = 0; i < lines; i++) {
    const offset = -h + i * spacing
    // Horizontal line (along X)
    pts.push(-h, 0, offset, h, 0, offset)
    // Vertical line (along Z)
    pts.push(offset, 0, -h, offset, 0, h)
  }

  const g = new THREE.BufferGeometry()
  g.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(pts), 3),
  )
  return g
}

/* ═══════════════════════════════════════════════
   Runner state — particles travelling along grid lines
   ═══════════════════════════════════════════════ */

interface Runner {
  /** true = moves along X, false = moves along Z */
  axisX: boolean
  /** Fixed coordinate on the other axis */
  lane: number
  /** Current position along movement axis */
  pos: number
  /** Direction: 1 or -1 */
  dir: number
  /** Speed multiplier */
  speed: number
}

function spawnRunner(): Runner {
  const axisX = Math.random() > 0.5
  const laneIdx = Math.floor(Math.random() * GRID_LINES)
  const lane = -HALF + laneIdx * GRID_SPACING

  return {
    axisX,
    lane,
    pos: (Math.random() - 0.5) * HALF * 2,
    dir: Math.random() > 0.5 ? 1 : -1,
    speed: 0.6 + Math.random() * 0.6,
  }
}

/* ═══════════════════════════════════════════════
   ClusterScene — goes inside a <Canvas>
   ═══════════════════════════════════════════════ */

export function ClusterScene(): React.JSX.Element {
  const groupRef = useRef<THREE.Group>(null)
  const runnersRef = useRef<THREE.Group>(null)
  const matsRef = useRef<THREE.MeshBasicMaterial[]>([])

  const gridGeom = useMemo(
    () => makeGridGeometry(GRID_LINES, GRID_SPACING),
    [],
  )

  const runners = useMemo(
    () => Array.from({ length: RUNNER_COUNT }, spawnRunner),
    [],
  )

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const time = state.clock.getElapsedTime()

    // Subtle float
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 0.4) * 0.04
    }

    if (!runnersRef.current) return

    for (let i = 0; i < runners.length; i++) {
      const r = runners[i]
      const mesh = runnersRef.current.children[i] as THREE.Mesh
      const mat = matsRef.current[i]

      // Advance along grid line
      r.pos += r.dir * r.speed * RUNNER_SPEED * dt

      // Bounce at grid edges
      if (r.pos > HALF) {
        r.pos = HALF
        r.dir = -1
      } else if (r.pos < -HALF) {
        r.pos = -HALF
        r.dir = 1
      }

      // Set world position
      if (r.axisX) {
        mesh.position.set(r.pos, 0, r.lane)
      } else {
        mesh.position.set(r.lane, 0, r.pos)
      }

      // Pulsing opacity
      if (mat) {
        mat.opacity = 0.5 + 0.4 * Math.abs(Math.sin(time * 1.5 + i * 2.1))
      }
    }
  })

  return (
    <>
    <group
      ref={groupRef}
      rotation={[Math.PI / 5, Math.PI / 4, 0]}
    >
      {/* Grid lines */}
      <lineSegments geometry={gridGeom}>
        <lineBasicMaterial
          color={PARTICLE_COLOR}
          transparent
          opacity={0.25}
        />
      </lineSegments>

      {/* Node dots at intersections */}
      {useMemo(() => {
        const nodes: [number, number, number][] = []
        for (let x = 0; x < GRID_LINES; x++) {
          for (let z = 0; z < GRID_LINES; z++) {
            nodes.push([
              -HALF + x * GRID_SPACING,
              0,
              -HALF + z * GRID_SPACING,
            ])
          }
        }
        return nodes.map((pos, i) => (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial
              color={PARTICLE_COLOR}
              transparent
              opacity={0.4}
            />
          </mesh>
        ))
      }, [])}

      {/* Runners — particles travelling along grid lines */}
      <group ref={runnersRef}>
        {runners.map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.04, 10, 10]} />
            <meshBasicMaterial
              ref={(el: THREE.MeshBasicMaterial | null) => {
                if (el) matsRef.current[i] = el
              }}
              color={PARTICLE_COLOR}
              transparent
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>

      <EffectComposer enableNormalPass={false}>
        <Bloom
          luminanceThreshold={0.1}
          mipmapBlur
          intensity={1.2}
          radius={0.4}
        />
      </EffectComposer>
    </>
  )
}

export default ClusterScene
