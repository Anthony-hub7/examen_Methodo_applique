import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { useRef, useState } from "react"
import * as THREE from "three"

// ORBITE
function Orbit({ radius }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.03, radius + 0.03, 128]} />
      <meshBasicMaterial
        color="white"
        transparent
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// PLANETE
function Planet({ data, onSelect }) {
  const ref = useRef()
  const angle = useRef(Math.random() * Math.PI * 2)

  useFrame((_, delta) => {
    angle.current += data.speed * delta

    const x = Math.cos(angle.current) * data.distance
    const z = Math.sin(angle.current) * data.distance

    ref.current.position.set(x, 0, z)
    ref.current.rotation.y += 0.01
  })

  return (
    <>
      <Orbit radius={data.distance} />

      <mesh ref={ref} onClick={() => onSelect(data)}>
        <sphereGeometry args={[data.size, 32, 32]} />
        <meshStandardMaterial color={data.color} />
      </mesh>
    </>
  )
}

// SOLEIL
function Sun() {
  return (
    <>
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="#ffaa00" />
      </mesh>

      <mesh>
        <sphereGeometry args={[3.2, 32, 32]} />
        <meshBasicMaterial transparent opacity={0.25} color="#ffae00" />
      </mesh>

      <pointLight intensity={5} distance={200} decay={2} />
    </>
  )
}

export default function DevoirRetard() {
  const [selected, setSelected] = useState(null)

  const planets = [
    {
      name: "Mercure",
      size: 0.3,
      distance: 4,
      speed: 1.6,
      color: "#a9a9a9",
      info: "La plus proche du soleil"
    },
    {
      name: "Vénus",
      size: 0.5,
      distance: 6,
      speed: 1.2,
      color: "#eccc68",
      info: "Atmosphère très dense"
    },
    {
      name: "Terre",
      size: 0.55,
      distance: 8,
      speed: 1,
      color: "#1e90ff",
      info: "Notre planète"
    },
    {
      name: "Mars",
      size: 0.4,
      distance: 10,
      speed: 0.8,
      color: "#ff6b6b",
      info: "Planète rouge"
    },
    {
      name: "Jupiter",
      size: 1.3,
      distance: 14,
      speed: 0.5,
      color: "#d2b48c",
      info: "Plus grosse planète"
    },
    {
      name: "Saturne",
      size: 1.1,
      distance: 18,
      speed: 0.4,
      color: "#f5deb3",
      info: "Connue pour ses anneaux"
    },
    {
      name: "Uranus",
      size: 0.9,
      distance: 22,
      speed: 0.3,
      color: "#7fffd4",
      info: "Planète glacée"
    },
    {
      name: "Neptune",
      size: 0.9,
      distance: 26,
      speed: 0.25,
      color: "#4169e1",
      info: "Très éloignée"
    }
  ]

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <Canvas camera={{ position: [0, 15, 30], fov: 60 }}>
        {/* ambiance */}
        <color attach="background" args={["#050510"]} />
        <fog attach="fog" args={["#050510", 20, 100]} />

        <ambientLight intensity={0.2} />

        <Sun />

        {planets.map((p, i) => (
          <Planet key={i} data={p} onSelect={setSelected} />
        ))}

        <Stars radius={300} depth={150} count={10000} factor={6} fade />

        <OrbitControls enablePan={false} />
      </Canvas>

      {selected && (
        <div style={styles.panel}>
          <h2>{selected.name}</h2>
          <p>{selected.info}</p>
        </div>
      )}
    </div>
  )
}

const styles = {
  panel: {
    position: "absolute",
    bottom: 20,
    left: 20,
    background: "rgba(0,0,0,0.85)",
    color: "white",
    padding: "15px",
    borderRadius: "10px"
  }
}