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

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "rgba(255,255,255,0.85)"
        }
      },
      tooltip: {
        backgroundColor: "#000",
        titleColor: "#fff",
        bodyColor: "#fff"
      }
    }
  }

  const lineChartOptions = {
    ...commonChartOptions,
    scales: {
      x: {
        ticks: { color: "rgba(255,255,255,0.75)" },
        grid: { color: "rgba(255,255,255,0.08)" }
      },
      y: {
        ticks: { color: "rgba(255,255,255,0.75)" },
        grid: { color: "rgba(255,255,255,0.08)" }
      }
    }
  }

  return (
    <div className="dashboard-page-shell">
      <div className="dashboard-page-content">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-brand-red/75">Vue etudiant</p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-white">Dashboard client</h2>
          </div>

          {/* FILTER */}
          <div className="flex items-center gap-2">
            <label htmlFor="dash-filter" className="sr-only">
              Filtrer
            </label>
            <select
              id="dash-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="dashboard-input px-3 py-2 text-sm text-white/90"
            >
              <option value="jour">Jour</option>
              <option value="semaine">Semaine</option>
              <option value="mois">Mois</option>
              <option value="annee">Année</option>
            </select>
          </div>
        </div>

        {/* KPI */}
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="dashboard-panel p-4">
            <ClipboardList className="text-brand-red" size={18} />
            <p className="mt-2 text-sm text-white/75">Devoirs terminés</p>
            <h3 className="mt-2 text-2xl font-bold">{current.devoirs.termines}</h3>
          </div>

          <div className="dashboard-panel p-4">
            <Users className="text-brand-red" size={18} />
            <p className="mt-2 text-sm text-white/75">Groupes actifs</p>
            <h3 className="mt-2 text-2xl font-bold">{current.groupes.actifs}</h3>
          </div>

          <div className="dashboard-panel p-4">
            <AlertTriangle className="text-brand-red" size={18} />
            <p className="mt-2 text-sm text-white/75">Sans groupe</p>
            <h3 className="mt-2 text-2xl font-bold">{current.devoirs.sans_groupe}</h3>
          </div>

          <div className="dashboard-panel p-4">
            <CheckCircle className="text-brand-red" size={18} />
            <p className="mt-2 text-sm text-white/75">En retard</p>
            <h3 className="mt-2 text-2xl font-bold">{current.devoirs.en_retard}</h3>
          </div>
        </motion.div>

        {/* DEVOIRS + GROUPES */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="dashboard-panel p-5"
          >
            <h3 className="mb-3 text-base font-semibold text-white/95">Statut des devoirs</h3>
            <div className="relative h-72 sm:h-80">
              <Doughnut
                options={commonChartOptions}
                data={{
                  labels: ["Terminés", "Sans groupe", "En retard"],
                  datasets: [
                    {
                      data: [current.devoirs.termines, current.devoirs.sans_groupe, current.devoirs.en_retard],
                      backgroundColor: ["#22c55e", "#facc15", "#df2531"]
                    }
                  ]
                }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="dashboard-panel p-5"
          >
            <h3 className="mb-3 text-base font-semibold text-white/95">Groupes</h3>
            <div className="relative h-72 sm:h-80">
              <Bar
                options={commonChartOptions}
                data={{
                  labels: ["Actifs", "Inactifs"],
                  datasets: [
                    {
                      data: [current.groupes.actifs, current.groupes.inactifs],
                      backgroundColor: ["rgba(223,37,49,0.9)", "rgba(255,255,255,0.25)"],
                      borderRadius: 10
                    }
                  ]
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* CHAT + DEVOIRS ACTIVITY */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="dashboard-panel mt-4 p-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <MessageSquare className="text-brand-red" size={18} />
            <h3 className="text-base font-semibold text-white/95">Activité globale (Chat + Devoirs)</h3>
          </div>

          <div className="relative h-64 sm:h-72 md:h-80">
            <Line
              options={lineChartOptions}
              data={{
                labels: ["Lun", "Mar", "Mer", "Jeu", "Ven"],
                datasets: [
                  {
                    label: "Chat",
                    data: current.chat,
                    borderColor: "#00bfff",
                    tension: 0.35
                  },
                  {
                    label: "Devoirs",
                    data: current.devoirs_progress,
                    borderColor: "#facc15",
                    tension: 0.35
                  }
                ]
              }}
            />
          </div>
        </motion.div>

        {/* TOP GROUPES */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="dashboard-panel mt-4 p-5"
        >
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="text-brand-red" size={18} />
            <h3 className="text-base font-semibold text-white/95">Top groupes actifs</h3>
          </div>

          <div className="divide-y divide-white/10">
            {topGroupes.map((g, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <span className="text-sm text-white/85">
                  #{i + 1} {g.name}
                </span>
                <b className="text-sm text-white/95">{g.score}%</b>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
