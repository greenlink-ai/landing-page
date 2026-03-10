import type { BrandLogoPaths } from '@/lib/use-brand-logo'

interface BrandLogoProps {
  paths: BrandLogoPaths
  /** Enable emerald glow filter on the tree. Default: false */
  glow?: boolean
  className?: string
  style?: React.CSSProperties
}

/** Inline SVG render of the GreenLink brand logo (tree + wordmark). */
export function BrandLogo({ paths, glow = false, className, style }: BrandLogoProps) {
  const glowId = 'brand-glow'

  return (
    <svg
      viewBox="0 0 3500 1500"
      className={className}
      style={style}
      fill="none"
      aria-label="GreenLink"
    >
      {glow && (
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}

      {/* Tree — emerald stroke */}
      <g filter={glow ? `url(#${glowId})` : undefined}>
        <path
          d={paths.tree}
          stroke="#10b981"
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {glow && (
          <path
            d={paths.tree}
            stroke="#6ee7b7"
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.5}
          />
        )}
      </g>

      {/* "Green" text */}
      <path d={paths.green} fill="#fafafa" />
      {/* "Link" text */}
      <path d={paths.link} fill="#fafafa" />
    </svg>
  )
}
