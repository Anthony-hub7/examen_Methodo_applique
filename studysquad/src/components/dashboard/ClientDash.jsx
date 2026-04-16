import { useState } from "react"
import { motion } from "framer-motion"

import {
  Bar,
  Doughnut,
  Line
} from "react-chartjs-2"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js"

import {
  Users,
  ClipboardList,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Trophy
} from "lucide-react"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)

export default function ClientDash() {

  const [filter, setFilter] = useState("semaine")

  const statsData = {
    jour: {
      groupes: { actifs: 2, inactifs: 1 },
      devoirs: { termines: 1, sans_groupe: 1, en_retard: 0 },
      chat: [5, 10, 3, 8, 12],
      devoirs_progress: [1, 2, 1, 3, 2]
    },

    semaine: {
      groupes: { actifs: 8, inactifs: 3 },
      devoirs: { termines: 12, sans_groupe: 5, en_retard: 2 },
      chat: [40, 70, 30, 90, 120],
      devoirs_progress: [5, 10, 4, 12, 8]
    },

    mois: {
      groupes: { actifs: 20, inactifs: 6 },
      devoirs: { termines: 45, sans_groupe: 12, en_retard: 6 },
      chat: [120, 200, 150, 300, 400],
      devoirs_progress: [20, 30, 25, 40, 35]
    },

    annee: {
      groupes: { actifs: 90, inactifs: 25 },
      devoirs: { termines: 180, sans_groupe: 40, en_retard: 15 },
      chat: [500, 800, 600, 900, 1200],
      devoirs_progress: [80, 120, 90, 150, 140]
    }
  }

  const current = statsData[filter]

  const topGroupes = [
    { name: "React Squad", score: 98 },
    { name: "Django Team", score: 85 },
    { name: "UI/UX Crew", score: 70 }
  ]

  return (
    <div style={styles.container}>

      <h2 style={styles.title}>Dashboard client</h2>

      {/* FILTER */}
      <div style={styles.filterBox}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={styles.select}
        >
          <option value="jour">Jour</option>
          <option value="semaine">Semaine</option>
          <option value="mois">Mois</option>
          <option value="annee">Année</option>
        </select>
      </div>

      {/* KPI */}
      <motion.div
        style={styles.kpiGrid}
        key={filter}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >

        <div style={styles.kpiCard}>
          <ClipboardList size={18} />
          <p>Devoirs terminés</p>
          <h3>{current.devoirs.termines}</h3>
        </div>

        <div style={styles.kpiCard}>
          <Users size={18} />
          <p>Groupes actifs</p>
          <h3>{current.groupes.actifs}</h3>
        </div>

        <div style={styles.kpiCard}>
          <AlertTriangle size={18} />
          <p>Sans groupe</p>
          <h3>{current.devoirs.sans_groupe}</h3>
        </div>

        <div style={styles.kpiCard}>
          <CheckCircle size={18} />
          <p>En retard</p>
          <h3>{current.devoirs.en_retard}</h3>
        </div>

      </motion.div>

      {/* DEVOIRS + GROUPES */}
      <div style={styles.row}>

        <motion.div
          style={styles.box}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h3>Statut des devoirs</h3>

          <Doughnut
            data={{
              labels: ["Terminés", "Sans groupe", "En retard"],
              datasets: [{
                data: [
                  current.devoirs.termines,
                  current.devoirs.sans_groupe,
                  current.devoirs.en_retard
                ],
                backgroundColor: ["#2ecc71", "#f1c40f", "#e74c3c"]
              }]
            }}
          />
        </motion.div>

        <motion.div
          style={styles.box}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h3>Groupes</h3>

          <Bar
            data={{
              labels: ["Actifs", "Inactifs"],
              datasets: [{
                data: [
                  current.groupes.actifs,
                  current.groupes.inactifs
                ],
                backgroundColor: ["#631319", "#333"]
              }]
            }}
          />
        </motion.div>

      </div>

      {/* CHAT + DEVOIRS ACTIVITY */}
      <motion.div
        style={styles.box}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >

        <div style={styles.titleRow}>
          <MessageSquare size={18} />
          <h3>Activité globale (Chat + Devoirs)</h3>
        </div>

        <Line
          data={{
            labels: ["Lun", "Mar", "Mer", "Jeu", "Ven"],
            datasets: [
              {
                label: "Chat",
                data: current.chat,
                borderColor: "#00bfff",
                tension: 0.4
              },
              {
                label: "Devoirs",
                data: current.devoirs_progress,
                borderColor: "#f1c40f",
                tension: 0.4
              }
            ]
          }}
        />
      </motion.div>

      {/* TOP GROUPES */}
      <motion.div
        style={styles.box}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >

        <div style={styles.titleRow}>
          <Trophy size={18} />
          <h3>Top groupes actifs</h3>
        </div>

        {topGroupes.map((g, i) => (
          <div key={i} style={styles.rankItem}>
            <span>#{i + 1} {g.name}</span>
            <b>{g.score}%</b>
          </div>
        ))}

      </motion.div>

    </div>
  )
}

/* STYLE */
const styles = {
  container: {
    padding: "20px",
    background: "#0f0f0f",
    color: "white",
    minHeight: "100vh"
  },

  title: {
    marginBottom: "10px"
  },

  filterBox: {
    marginBottom: "20px"
  },

  select: {
    padding: "10px",
    background: "#1c1c1c",
    color: "white",
    border: "1px solid #333",
    borderRadius: "10px"
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
    marginBottom: "20px"
  },

  kpiCard: {
    background: "#1c1c1c",
    padding: "15px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "5px"
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginBottom: "20px"
  },

  box: {
    background: "#1c1c1c",
    padding: "20px",
    borderRadius: "12px"
  },

  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px"
  },

  rankItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px",
    borderBottom: "1px solid #333"
  }
}