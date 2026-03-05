/**
 * Shared particle behaviour constants.
 *
 * Used by:
 *  - `useParticleCanvas` (2D canvas floating particles)
 *  - `FloatingParticles`  (Three.js floating particles inside chip scene)
 *
 * Keeping them in one place so visual tweaks stay in sync.
 */

export const PARTICLE_COLOR = "#10b981"
export const PARTICLE_COLOR_RGBA = "rgba(110, 231, 183,"

/** Velocity range: each axis gets `(Math.random() - 0.5) * VELOCITY_SPREAD` */
export const VELOCITY_SPREAD = 0.3

/** Size range: `Math.random() * SIZE_RANGE + SIZE_MIN` */
export const SIZE_MIN = 0.5
export const SIZE_RANGE = 2.0

/** Opacity fade increment per frame (~60fps) */
export const FADE_STEP = 0.006
export const OPACITY_MAX = 0.8
export const OPACITY_MIN = 0.05

/** 2D canvas glow */
export const SHADOW_BLUR = 8
