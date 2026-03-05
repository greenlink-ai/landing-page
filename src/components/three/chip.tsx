"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js"
import {
  PARTICLE_COLOR,
  VELOCITY_SPREAD,
  FADE_STEP,
  OPACITY_MAX,
  OPACITY_MIN,
} from "@/lib/particle-config"

/* ═══════════════════════════════════════════════
   SVG chip path data (from public/gpu/GPU chip.svg)
   viewBox 0 0 48 48 — chip body spans 7.5→40.5 (33 units)
   ═══════════════════════════════════════════════ */

const CHIP_SVG_PATH = `M29.92041,7.5H7.5v33h33v-33H29.92041z M38.5,18.61621v10.76807l1,0.26807v9.84766h-9.84814l-0.26807-1
H18.61572l-0.26807,1H8.49999v-9.84863l1-0.26758V18.61573l-1-0.26807V8.5h9.84814l0.26807,1h10.76807l0.26807-1H39.5v9.84863
C39.5,18.34863,38.5,18.61621,38.5,18.61621z M12.5,12.5h2v2h-2V12.5z M15.5,12.5h2v2h-2V12.5z M18.5,12.5h2v2h-2V12.5z M21.5,12.5
h2v2h-2V12.5z M24.5,12.5h2v2h-2V12.5z M27.5,12.5h2v2h-2V12.5z M30.5,12.5h2v2h-2V12.5z M33.5,12.5h2v2h-2V12.5z M12.5,15.5h2v2h-2
C12.5,17.5,12.5,15.5,12.5,15.5z M15.5,15.5h2v2h-2C15.5,17.5,15.5,15.5,15.5,15.5z M18.5,15.5h2v2h-2
C18.5,17.5,18.5,15.5,18.5,15.5z M21.5,15.5h2v2h-2C21.5,17.5,21.5,15.5,21.5,15.5z M24.5,15.5h2v2h-2
C24.5,17.5,24.5,15.5,24.5,15.5z M27.5,15.5h2v2h-2C27.5,17.5,27.5,15.5,27.5,15.5z M30.5,15.5h2v2h-2
C30.5,17.5,30.5,15.5,30.5,15.5z M33.5,15.5h2v2h-2C33.5,17.5,33.5,15.5,33.5,15.5z M12.5,18.5h2v2h-2V18.5z M15.5,18.5h2v2h-2V18.5
z M18.5,18.5h2v2h-2V18.5z M21.5,18.5h2v2h-2V18.5z M24.5,18.5h2v2h-2V18.5z M27.5,18.5h2v2h-2V18.5z M30.5,18.5h2v2h-2V18.5z
 M33.5,18.5h2v2h-2V18.5z M12.5,21.5h2v2h-2V21.5z M15.5,21.5h2v2h-2V21.5z M18.5,21.5h2v2h-2V21.5z M21.5,21.5h2v2h-2V21.5z
 M24.5,21.5h2v2h-2V21.5z M27.5,21.5h2v2h-2V21.5z M30.5,21.5h2v2h-2V21.5z M33.5,21.5h2v2h-2V21.5z M12.5,24.5h2v2h-2V24.5z
 M15.5,24.5h2v2h-2V24.5z M18.5,24.5h2v2h-2V24.5z M21.5,24.5h2v2h-2V24.5z M24.5,24.5h2v2h-2V24.5z M27.5,24.5h2v2h-2V24.5z
 M30.5,24.5h2v2h-2V24.5z M33.5,24.5h2v2h-2V24.5z M12.5,27.5h2v2h-2V27.5z M15.5,27.5h2v2h-2V27.5z M18.5,27.5h2v2h-2V27.5z
 M21.5,27.5h2v2h-2V27.5z M24.5,27.5h2v2h-2V27.5z M27.5,27.5h2v2h-2V27.5z M30.5,27.5h2v2h-2V27.5z M33.5,27.5h2v2h-2V27.5z
 M12.5,30.5h2v2h-2V30.5z M15.5,30.5h2v2h-2V30.5z M18.5,30.5h2v2h-2V30.5z M21.5,30.5h2v2h-2V30.5z M24.5,30.5h2v2h-2V30.5z
 M27.5,30.5h2v2h-2V30.5z M30.5,30.5h2v2h-2V30.5z M33.5,30.5h2v2h-2V30.5z M12.5,33.5h2v2h-2V33.5z M15.5,33.5h2v2h-2V33.5z
 M18.5,33.5h2v2h-2V33.5z M21.5,33.5h2v2h-2V33.5z M24.5,33.5h2v2h-2V33.5z M27.5,33.5h2v2h-2V33.5z M30.5,33.5h2v2h-2V33.5z
 M33.5,33.5h2v2h-2V33.5z`

/* ═══════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════ */

const CHIP_SIZE = 2.2
const SVG_BODY = 33 // chip body spans 33 units in SVG (7.5 → 40.5)
const SVG_CENTER = 24 // center of 48×48 viewBox
const CHIP_SCALE = CHIP_SIZE / SVG_BODY
const CHIP_ROTATION_Y = -Math.PI / 6

const ATTRACT_RADIUS = 1.2
const ATTRACT_RADIUS_SQ = ATTRACT_RADIUS * ATTRACT_RADIUS
const LERP_SPEED = 0.01
const SNAP_DIST = 0.06
const BOUND_XY = 3
const BOUND_Z = 1
const VELOCITY_3D = VELOCITY_SPREAD * 0.02
const PARTICLE_COUNT = 8

/* ═══════════════════════════════════════════════
   SVG → Three.js geometry
   ═══════════════════════════════════════════════ */

function parseChipEdgeGeometries(): THREE.BufferGeometry[] {
  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="${CHIP_SVG_PATH}"/></svg>`
  const loader = new SVGLoader()
  const data = loader.parse(svgMarkup)
  const geometries: THREE.BufferGeometry[] = []

  for (const path of data.paths) {
    const shapes = SVGLoader.createShapes(path)
    for (const shape of shapes) {
      const shapeGeom = new THREE.ShapeGeometry(shape)
      // Extract edges from the triangulated shape
      const edgeGeom = new THREE.EdgesGeometry(shapeGeom, 1)
      // Center at origin, flip Y (SVG Y goes down), scale to world units
      edgeGeom.translate(-SVG_CENTER, -SVG_CENTER, 0)
      edgeGeom.scale(CHIP_SCALE, -CHIP_SCALE, CHIP_SCALE)
      geometries.push(edgeGeom)
      shapeGeom.dispose()
    }
  }

  return geometries
}

/* ═══════════════════════════════════════════════
   Edge targets for magnetic attraction
   Sample points along the chip's outer boundary
   ═══════════════════════════════════════════════ */

function sampleSquareEdge(size: number, perEdge: number): THREE.Vector3[] {
  const h = size / 2
  const pts: THREE.Vector3[] = []
  for (let i = 0; i < perEdge; i++) {
    const t = i / perEdge
    pts.push(new THREE.Vector3(-h + t * size,  h, 0))
    pts.push(new THREE.Vector3( h, h - t * size, 0))
    pts.push(new THREE.Vector3( h - t * size, -h, 0))
    pts.push(new THREE.Vector3(-h, -h + t * size, 0))
  }
  return pts
}

/* ═══════════════════════════════════════════════
   Particle state
   ═══════════════════════════════════════════════ */

interface Particle {
  pos: THREE.Vector3
  vel: THREE.Vector3
  opacity: number
  fadeDir: number
  target: THREE.Vector3 | null
}

function spawnParticle(): Particle {
  return {
    pos: new THREE.Vector3(
      (Math.random() - 0.5) * BOUND_XY * 2,
      (Math.random() - 0.5) * BOUND_XY * 2,
      (Math.random() - 0.5) * BOUND_Z * 2,
    ),
    vel: new THREE.Vector3(
      (Math.random() - 0.5) * VELOCITY_3D,
      (Math.random() - 0.5) * VELOCITY_3D,
      (Math.random() - 0.5) * VELOCITY_3D * 0.5,
    ),
    opacity: Math.random() * 0.4,
    fadeDir: Math.random() > 0.5 ? 1 : -1,
    target: null,
  }
}

function respawn(p: Particle): void {
  p.pos.set(
    (Math.random() - 0.5) * BOUND_XY * 2,
    (Math.random() - 0.5) * BOUND_XY * 2,
    (Math.random() - 0.5) * BOUND_Z * 2,
  )
  p.vel.set(
    (Math.random() - 0.5) * VELOCITY_3D,
    (Math.random() - 0.5) * VELOCITY_3D,
    (Math.random() - 0.5) * VELOCITY_3D * 0.5,
  )
  p.opacity = OPACITY_MIN
  p.fadeDir = 1
  p.target = null
}

/* ═══════════════════════════════════════════════
   ChipScene — goes inside a <Canvas>
   ═══════════════════════════════════════════════ */

export function ChipScene(): React.JSX.Element {
  const chipRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Group>(null)
  const matsRef = useRef<THREE.MeshBasicMaterial[]>([])

  // Parse SVG into wireframe edge geometries
  const chipEdgeGeometries = useMemo(() => parseChipEdgeGeometries(), [])

  // Edge snap targets — pre-rotated to world space
  const edgeTargets = useMemo(() => {
    const rot = new THREE.Matrix4().makeRotationY(CHIP_ROTATION_Y)
    const raw = sampleSquareEdge(CHIP_SIZE, 20)
    return raw.map((p) => p.applyMatrix4(rot))
  }, [])

  // Particle pool
  const particles = useMemo(
    () => Array.from({ length: PARTICLE_COUNT }, spawnParticle),
    [],
  )

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    // Chip subtle levitation
    if (chipRef.current) {
      chipRef.current.position.y = Math.sin(time * 0.5) * 0.05
      chipRef.current.rotation.x = Math.sin(time * 0.3) * 0.02
    }

    if (!particlesRef.current) return

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      const mesh = particlesRef.current.children[i] as THREE.Mesh
      const mat = matsRef.current[i]

      if (p.target) {
        p.pos.lerp(p.target, LERP_SPEED)
        p.opacity = Math.min(p.opacity + 0.015, 0.9)

        if (p.pos.distanceTo(p.target) < SNAP_DIST) {
          respawn(p)
        }
      } else {
        p.pos.add(p.vel)

        if (p.pos.x > BOUND_XY || p.pos.x < -BOUND_XY) p.vel.x *= -1
        if (p.pos.y > BOUND_XY || p.pos.y < -BOUND_XY) p.vel.y *= -1
        if (p.pos.z > BOUND_Z || p.pos.z < -BOUND_Z) p.vel.z *= -1

        p.opacity += p.fadeDir * FADE_STEP
        if (p.opacity >= OPACITY_MAX) p.fadeDir = -1
        if (p.opacity <= OPACITY_MIN) p.fadeDir = 1

        let minSq = Infinity
        let nearest: THREE.Vector3 | null = null
        for (const t of edgeTargets) {
          const sq = p.pos.distanceToSquared(t)
          if (sq < minSq) {
            minSq = sq
            nearest = t
          }
        }

        if (minSq < ATTRACT_RADIUS_SQ) {
          p.target = nearest
        }
      }

      mesh.position.copy(p.pos)
      if (mat) mat.opacity = p.opacity
    }
  })

  return (
    <>
      {/* GPU chip wireframe from SVG — rotated slightly left */}
      <group ref={chipRef} rotation={[0, CHIP_ROTATION_Y, 0]}>
        {chipEdgeGeometries.map((geom, i) => (
          <lineSegments key={i} geometry={geom}>
            <lineBasicMaterial
              color={PARTICLE_COLOR}
              transparent
              opacity={0.9}
            />
          </lineSegments>
        ))}
      </group>

      {/* Particles — world space, magnetically attracted to chip */}
      <group ref={particlesRef}>
        {particles.map((p, i) => (
          <mesh key={i} position={p.pos}>
            <sphereGeometry args={[0.025, 12, 12]} />
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

      {/* Glow post-processing */}
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

export default ChipScene
