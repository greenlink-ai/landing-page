"use client"

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

      {/* Emerald radial glow from right side */}
      <div
        className="absolute -right-1/4 top-1/2 -translate-y-1/2 h-200 w-200 rounded-full opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, #10b981 0%, transparent 70%)",
        }}
      />
    </div>
  )
}
