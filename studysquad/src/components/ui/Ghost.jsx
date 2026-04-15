import { useEffect, useState } from "react"

export default function Ghost() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [isOut, setIsOut] = useState(false)

  useEffect(() => {
    const move = (e) => setMouse({ x: e.clientX, y: e.clientY })

    const leave = () => setIsOut(true)
    const enter = () => setIsOut(false)

    window.addEventListener("mousemove", move)
    window.addEventListener("mouseleave", leave)
    window.addEventListener("mouseenter", enter)

    return () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("mouseleave", leave)
      window.removeEventListener("mouseenter", enter)
    }
  }, [])

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max))

  const eye = (strength = 18) => {
    const dx = mouse.x - window.innerWidth / 2
    const dy = mouse.y - window.innerHeight / 2

    const max = 7

    let x = dx / strength
    let y = dy / strength

    x = Math.max(-max, Math.min(max, x))
    y = Math.max(-max, Math.min(max, y))

    return { x, y }
  }

  const m = eye()

  // 👉 AJOUT : léger mouvement des yeux noirs
  const eyeOffset = {
    x: m.x * 0.1,
    y: m.y * 0.1,
  }

  return (
    <>
      <style>{`
        @keyframes floatGhost {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      <div style={styles.wrapper}>
        <div style={styles.float}>
          <svg width="120" height="150" viewBox="0 0 120 150">

            {/* BODY */}
            <path
              d="
                M60 20
                C35 20, 20 40, 20 65
                C20 95, 35 110, 35 125
                C35 135, 25 135, 25 145
                L40 135
                L50 145
                L60 135
                L70 145
                L80 135
                L95 145
                C95 135, 85 135, 85 125
                C85 110, 100 95, 100 65
                C100 40, 85 20, 60 20
                Z
              "
              fill="#ffffff46"
              style={{
                filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.2))"
              }}
            />

            {/* Eyes (maintenant ils bougent aussi) */}
            <circle cx={45 + eyeOffset.x} cy={60 + eyeOffset.y} r="8" fill="black" />
            <circle cx={75 + eyeOffset.x} cy={60 + eyeOffset.y} r="8" fill="black" />

            {/* Pupils */}
            <circle cx={45 + m.x * 0.3} cy={60 + m.y * 0.3} r="3" fill="white" />
            <circle cx={75 + m.x * 0.3} cy={60 + m.y * 0.3} r="3" fill="white" />

            {/* MOUTH */}
            {!isOut ? (
              <circle cx="60" cy="90" r="4" fill="black" />
            ) : (
              <path
                d="M52 92 Q60 100 68 92"
                stroke="black"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            )}

          </svg>
        </div>
      </div>
    </>
  )
}

const styles = {
  wrapper: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  float: {
    animation: "floatGhost 3s ease-in-out infinite",
  },
}