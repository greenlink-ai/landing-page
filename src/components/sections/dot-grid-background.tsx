"use client"

/**
 * Full-page dot grid background with alternating emerald glows
 * between section boundaries.
 *
 * Glow positions (top %) approximate the transitions between sections:
 *   1→2  Hero → Features        ~17%  right
 *   2→3  Features → UseCases    ~33%  left
 *   3→4  UseCases → Pricing     ~50%  right
 *   4→5  Pricing → About        ~67%  left
 *   5→6  About → Contact        ~83%  right
 */

const glows = [
  { top: "17%", side: "right" },
  { top: "33%", side: "left" },
  { top: "50%", side: "right" },
  { top: "67%", side: "left" },
  { top: "83%", side: "right" },
] as const

export function DotGridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Dot grid pattern */}
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="dot-grid"
            x="0"
            y="0"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="0.8" fill="#27272a" opacity="0.5" />
          </pattern>
          <radialGradient id="fade-mask" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="70%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="radial-fade">
            <rect width="100%" height="100%" fill="url(#fade-mask)" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#dot-grid)"
          mask="url(#radial-fade)"
        />
      </svg>

      {/* Alternating emerald glows between sections */}
      {glows.map((glow, i) => (
        <div
          key={i}
          className="absolute h-[800px] w-[800px] rounded-full opacity-[0.07]"
          style={{
            top: glow.top,
            [glow.side]: "-15%",
            transform: "translateY(-50%)",
            background: "radial-gradient(circle, #10b981 0%, transparent 70%)",
          }}
        />
      ))}
    </div>
  )
}
