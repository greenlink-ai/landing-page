"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js"
import { PARTICLE_COLOR } from "@/lib/particle-config"

/* ═══════════════════════════════════════════════
   SVG NVMe path data (from public/nvme.svg)
   viewBox 0 0 16 16
   ═══════════════════════════════════════════════ */

const NVME_PATH_BODY = `M1.5 4.5A.5.5 0 0 1 2 4h13.5a.5.5 0 0 1 .5.5V7a.5.5 0 0 1-.5.5.5.5 0 0 0 0 1 .5.5 0 0 1 .5.5v2.5a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5h-1A.5.5 0 0 1 0 11V7.5A.5.5 0 0 1 .5 7h1a.25.25 0 0 0 0-.5h-1A.5.5 0 0 1 0 6V5a.5.5 0 0 1 .5-.5zm1 .5a.5.5 0 0 1-.5.5h-.5a1.25 1.25 0 1 1 0 2.5H1v2.5h1a.5.5 0 0 1 .5.5H15V9.415a1.5 1.5 0 0 1 0-2.83V5z`

const NVME_PATH_CHIPS = `M4 6.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5zM5 7v2h1V7zm3-.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5zM9 7v2h3V7z`

/* ═══════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════ */

const NVME_SCALE_FACTOR = 0.18
const SVG_CENTER_X = 8
const SVG_CENTER_Y = 8
const NVME_ROTATION_Y = Math.PI / 6

const RUNNER_COUNT = 14
const RUNNER_SPEED = 1.6

/* ═══════════════════════════════════════════════
   SVG → Three.js edge geometry
   ═══════════════════════════════════════════════ */

function parseNvmeEdgeGeometries(): {
  bodyGeometries: THREE.BufferGeometry[]
  chipGeometries: THREE.BufferGeometry[]
} {
  const bodyGeometries: THREE.BufferGeometry[] = []
  const chipGeometries: THREE.BufferGeometry[] = []

  const parsePath = (pathD: string, target: THREE.BufferGeometry[]): void => {
    const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="${pathD}"/></svg>`
    const loader = new SVGLoader()
    const data = loader.parse(svgMarkup)

    for (const path of data.paths) {
      const shapes = SVGLoader.createShapes(path)
      for (const shape of shapes) {
        const shapeGeom = new THREE.ShapeGeometry(shape)
        const edgeGeom = new THREE.EdgesGeometry(shapeGeom, 1)
        edgeGeom.translate(-SVG_CENTER_X, -SVG_CENTER_Y, 0)
        edgeGeom.scale(NVME_SCALE_FACTOR, -NVME_SCALE_FACTOR, NVME_SCALE_FACTOR)
        target.push(edgeGeom)
        shapeGeom.dispose()
      }
    }
  }

  parsePath(NVME_PATH_BODY, bodyGeometries)
  parsePath(NVME_PATH_CHIPS, chipGeometries)

  return { bodyGeometries, chipGeometries }
}

/* ═══════════════════════════════════════════════
   Data runners — particles orbiting along chip edges
   Two internal chip rectangles from the SVG:
     Chip 1 (outer): ~(4, 6) → (7, 10)   inner: ~(5, 7) → (6, 9)
     Chip 2 (outer): ~(8, 6) → (12.5, 10) inner: ~(9, 7) → (12, 9)
   ═══════════════════════════════════════════════ */

/** Convert SVG point to world space (centered + flipped Y + scaled) */
function svgToWorld(sx: number, sy: number): [number, number] {
  return [
    (sx - SVG_CENTER_X) * NVME_SCALE_FACTOR,
    -(sy - SVG_CENTER_Y) * NVME_SCALE_FACTOR,
  ]
}

/** Build a closed-loop circuit from SVG-space rectangle corners */
function makeCircuit(
  x0: number, y0: number, x1: number, y1: number,
): [number, number][] {
  return [
    svgToWorld(x0, y0),
    svgToWorld(x1, y0),
    svgToWorld(x1, y1),
    svgToWorld(x0, y1),
  ]
}

// Circuits matching the two chip outlines + their inner rectangles
const CIRCUITS: [number, number][][] = [
  makeCircuit(4.5, 6, 7, 10),     // chip 1 outer
  makeCircuit(5, 7, 6, 9),         // chip 1 inner
  makeCircuit(8.5, 6.5, 12.5, 10), // chip 2 outer
  makeCircuit(9, 7, 12, 9),        // chip 2 inner
]

interface DataRunner {
  /** Which circuit this runner follows */
  circuit: [number, number][]
  /** Perimeter of the circuit (sum of edge lengths) */
  perimeter: number
  /** Current progress 0→1 around the circuit */
  t: number
  /** Speed multiplier */
  speed: number
}

function createRunners(): DataRunner[] {
  const runners: DataRunner[] = []

  for (let i = 0; i < RUNNER_COUNT; i++) {
    const circuit = CIRCUITS[i % CIRCUITS.length]

    // Calculate perimeter
    let perimeter = 0
    for (let j = 0; j < circuit.length; j++) {
      const a = circuit[j]
      const b = circuit[(j + 1) % circuit.length]
      perimeter += Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2)
    }

    runners.push({
      circuit,
      perimeter,
      t: Math.random(),
      speed: 0.5 + Math.random() * 0.7,
    })
  }

  return runners
}

/** Get world-space position at progress t (0→1) around a circuit */
function getCircuitPosition(
  circuit: [number, number][],
  perimeter: number,
  t: number,
): [number, number] {
  const dist = (t % 1) * perimeter
  let accumulated = 0

  for (let j = 0; j < circuit.length; j++) {
    const a = circuit[j]
    const b = circuit[(j + 1) % circuit.length]
    const edgeLen = Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2)

    if (accumulated + edgeLen >= dist) {
      const frac = (dist - accumulated) / edgeLen
      return [
        a[0] + (b[0] - a[0]) * frac,
        a[1] + (b[1] - a[1]) * frac,
      ]
    }
    accumulated += edgeLen
  }

  return circuit[0]
}

/* ═══════════════════════════════════════════════
   StorageScene — goes inside a <Canvas>
   ═══════════════════════════════════════════════ */

export function StorageScene(): React.JSX.Element {
  const groupRef = useRef<THREE.Group>(null)
  const runnersRef = useRef<THREE.Group>(null)
  const matsRef = useRef<THREE.MeshBasicMaterial[]>([])

  const { bodyGeometries, chipGeometries } = useMemo(
    () => parseNvmeEdgeGeometries(),
    [],
  )

  const runners = useMemo(() => createRunners(), [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const time = state.clock.getElapsedTime()

    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 0.4) * 0.04
      groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.02
    }

    if (!runnersRef.current) return

    for (let i = 0; i < runners.length; i++) {
      const r = runners[i]
      const mesh = runnersRef.current.children[i] as THREE.Mesh
      const mat = matsRef.current[i]

      // Advance around circuit (continuous loop)
      r.t = (r.t + r.speed * RUNNER_SPEED * dt) % 1

      // Get position on circuit edge
      const [x, y] = getCircuitPosition(r.circuit, r.perimeter, r.t)
      mesh.position.set(x, y, 0)

      // Pulsing opacity
      if (mat) {
        mat.opacity = 0.4 + 0.5 * Math.abs(Math.sin(time * 2.0 + i * 1.7))
      }
    }
  })

  return (
    <>
      <group ref={groupRef} rotation={[0, NVME_ROTATION_Y, 0]}>
        {/* NVMe body wireframe */}
        {bodyGeometries.map((geom, i) => (
          <lineSegments key={`body-${i}`} geometry={geom}>
            <lineBasicMaterial
              color={PARTICLE_COLOR}
              transparent
              opacity={0.8}
            />
          </lineSegments>
        ))}

        {/* Internal chip outlines — brighter */}
        {chipGeometries.map((geom, i) => (
          <lineSegments key={`chip-${i}`} geometry={geom}>
            <lineBasicMaterial
              color={PARTICLE_COLOR}
              transparent
              opacity={0.9}
            />
          </lineSegments>
        ))}

        {/* Data runner particles */}
        <group ref={runnersRef}>
          {runners.map((_, i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.012, 8, 8]} />
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

export default StorageScene
