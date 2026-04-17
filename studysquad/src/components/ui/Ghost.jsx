import { useId, useMemo, useState } from 'react'

const SIZE_MAP = {
  sm: 120,
  md: 148,
  lg: 176,
}

const clamp = (value, min, max) => Math.max(min, Math.min(value, max))

export default function Ghost({ size = 'md', className = '' }) {
  const [look, setLook] = useState({ x: 0, y: 0, active: false })
  const ghostId = useId()

  const id = useMemo(() => ghostId.replace(/[^a-zA-Z0-9_-]/g, ''), [ghostId])
  const auraGradientId = `ghost-aura-${id}`
  const bodyGradientId = `ghost-body-${id}`
  const eyeGlowId = `ghost-eye-glow-${id}`

  const dimension = typeof size === 'number' ? size : SIZE_MAP[size] ?? SIZE_MAP.md
  const height = Math.round(dimension * 1.22)

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const relativeX = (event.clientX - rect.left) / rect.width
    const relativeY = (event.clientY - rect.top) / rect.height

    setLook({
      x: clamp((relativeX - 0.5) * 2, -1, 1),
      y: clamp((relativeY - 0.5) * 2, -1, 1),
      active: true,
    })
  }

  const resetLook = () => {
    setLook({ x: 0, y: 0, active: false })
  }

  const pupilX = clamp(look.x * 4.5, -4.5, 4.5)
  const pupilY = clamp(look.y * 4.5, -4.5, 4.5)
  const mouthPath = look.active ? 'M78 123 Q100 133 122 123' : 'M81 123 Q100 115 119 123'

  return (
    <div
      className={className}
      style={{ width: `${dimension}px`, height: `${height}px` }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setLook((current) => ({ ...current, active: true }))}
      onMouseLeave={resetLook}
      aria-hidden="true"
    >
      <style>{`
        @keyframes ghostMascotFloat {
          0%, 100% { transform: translateY(0px) rotate(-1.2deg); }
          50% { transform: translateY(-8px) rotate(1.2deg); }
        }

        @keyframes ghostMascotAura {
          0%, 100% { opacity: 0.34; transform: scale(1); }
          50% { opacity: 0.62; transform: scale(1.06); }
        }
      `}</style>

      <svg
        viewBox="0 0 200 220"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          overflow: 'visible',
        }}
      >
        <defs>
          <radialGradient id={auraGradientId} cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="rgba(223, 37, 49, 0.46)" />
            <stop offset="65%" stopColor="rgba(223, 37, 49, 0.2)" />
            <stop offset="100%" stopColor="rgba(223, 37, 49, 0)" />
          </radialGradient>

          <linearGradient id={bodyGradientId} x1="50%" y1="8%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#fff9f9" />
            <stop offset="68%" stopColor="#f5eded" />
            <stop offset="100%" stopColor="#e8dddd" />
          </linearGradient>

          <filter id={eyeGlowId}>
            <feGaussianBlur stdDeviation="1.2" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g style={{ animation: 'ghostMascotAura 3.2s ease-in-out infinite', transformOrigin: '100px 110px' }}>
          <ellipse cx="100" cy="112" rx="86" ry="78" fill={`url(#${auraGradientId})`} />
        </g>

        <g style={{ animation: 'ghostMascotFloat 4s ease-in-out infinite', transformOrigin: '100px 112px' }}>
          <path
            d="
              M100 22
              C60 22, 36 53, 36 93
              C36 126, 42 147, 42 169
              C42 182, 34 191, 34 202
              C44 198, 52 186, 62 202
              C71 186, 80 189, 88 202
              C95 188, 105 188, 112 202
              C120 189, 129 186, 138 202
              C148 186, 156 198, 166 202
              C166 191, 158 182, 158 169
              C158 147, 164 126, 164 93
              C164 53, 140 22, 100 22
              Z
            "
            fill={`url(#${bodyGradientId})`}
            stroke="rgba(255, 235, 235, 0.75)"
            strokeWidth="1.8"
          />

          <path
            d="
              M100 34
              C72 34, 54 58, 54 89
              C54 99, 56 108, 58 114
              C70 90, 87 75, 100 75
              C113 75, 130 90, 142 114
              C144 108, 146 99, 146 89
              C146 58, 128 34, 100 34
              Z
            "
            fill="rgba(255, 255, 255, 0.45)"
          />

          <ellipse cx="74" cy="98" rx="13" ry="16" fill="#0a0a0a" />
          <ellipse cx="126" cy="98" rx="13" ry="16" fill="#0a0a0a" />

          <circle cx={74 + pupilX} cy={98 + pupilY} r="5.1" fill="#df2531" filter={`url(#${eyeGlowId})`} />
          <circle cx={126 + pupilX} cy={98 + pupilY} r="5.1" fill="#df2531" filter={`url(#${eyeGlowId})`} />

          <circle cx={76 + pupilX} cy={96 + pupilY} r="1.9" fill="rgba(255, 255, 255, 0.95)" />
          <circle cx={128 + pupilX} cy={96 + pupilY} r="1.9" fill="rgba(255, 255, 255, 0.95)" />

          <path d={mouthPath} stroke="#1a1a1a" strokeWidth="3.5" fill="none" strokeLinecap="round" />

          <ellipse cx="60" cy="118" rx="7.5" ry="4.5" fill="rgba(223, 37, 49, 0.35)" />
          <ellipse cx="140" cy="118" rx="7.5" ry="4.5" fill="rgba(223, 37, 49, 0.35)" />
        </g>
      </svg>
    </div>
  )
}
