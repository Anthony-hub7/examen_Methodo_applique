import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from "chart.js"

import { Doughnut, Bar, Line } from "react-chartjs-2"
import { useState } from "react"

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
)

export default function Dashboard() {

  const [view, setView] = useState("semaine")

  const stats = {
    nbr_clients: 77,
    nbr_devoir: 12,
    nbr_groupe_participation: 5,
    nbr_devoir_sans_groupe: 3,
    nbr_devoir_termine: 7,
    nbr_devoir_en_retard: 2,
  }

  // 🍩 DOUGHNUT
  const doughnutData = {
    labels: ["Terminés", "En retard", "En cours"],
    datasets: [{
      data: [
        stats.nbr_devoir_termine,
        stats.nbr_devoir_en_retard,
        stats.nbr_devoir - (stats.nbr_devoir_termine + stats.nbr_devoir_en_retard)
      ],
      backgroundColor: ["#22c55e", "#ef4444", "#facc15"],
      borderWidth: 0
    }]
  }

  // 📊 BAR GLOBAL
  const barData = {
    labels: ["Clients", "Devoirs", "Groupes", "devoir sans groupe"],
    datasets: [{
      label: "Stats globales",
      data: [
        stats.nbr_clients,
        stats.nbr_devoir,
        stats.nbr_groupe_participation,
        stats.nbr_devoir_sans_groupe
      ],
      backgroundColor: ["#631319", "#2563eb", "#a21caf", "#7eeb25"],
      borderRadius: 12
    }]
  }

  // 📈 EVOLUTION
  const lineData = {
    labels:
      view === "semaine"
        ? ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
        : ["S1", "S2", "S3", "S4", "S5", "S6"],

    datasets: [
      {
        label: "Devoirs réalisés",
        data:
          view === "semaine"
            ? [2, 4, 3, 5, 6, 4, 7]
            : [10, 12, 9, 15, 18, 20],

        borderColor: "#631319",
        backgroundColor: "rgba(99,19,25,0.2)",
        tension: 0.4,
        fill: true
      }
    ]
  }

  return (
    <div style={styles.container}>

      <h2 style={styles.title}>📊 Dashboard Admin</h2>

      {/* TOP STATS */}
      <div style={styles.grid}>

        <div style={styles.card}>
          <h3>Vue globale</h3>
          <Bar data={barData} />
        </div>

        <div style={styles.card}>
          <h3>État des devoirs</h3>
          <Doughnut data={doughnutData} />
        </div>

      </div>

      {/* SWITCH + LINE */}
      <div style={styles.bottomCard}>

        <div style={styles.switch}>
          <button onClick={() => setView("semaine")}>
            Semaine
          </button>

          <button onClick={() => setView("mois")}>
            Mois
          </button>
        </div>

        <Line data={lineData} />
      </div>

    </div>
  )
}
const styles = {
  container: {
    padding: "20px",
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #111, #000)",
    color: "white",
    fontFamily: "Poppins"
  },

  title: {
    marginBottom: "20px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px"
  },

  card: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "20px",
    backdropFilter: "blur(12px)"
  },

  bottomCard: {
    marginTop: "20px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "20px",
    padding: "20px",
    border: "1px solid rgba(255,255,255,0.1)"
  },

  switch: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px"
  }
}