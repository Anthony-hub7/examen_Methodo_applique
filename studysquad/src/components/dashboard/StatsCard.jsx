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
import { Icon } from "@iconify/react"
import { Link } from "react-router-dom"

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

  // DOUGHNUT
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

  // BAR GLOBAL
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

  // EVOLUTION
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

        borderColor: "#df2531",
        backgroundColor: "rgba(223,37,49,0.18)",
        tension: 0.4,
        fill: true
      }
    ]
  }

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

  // Ajuste palette doughnut aux couleurs du theme (futuriste rouge/noir)
  const themedDoughnutData = {
    ...doughnutData,
    datasets: doughnutData.datasets.map((d) => ({
      ...d,
      backgroundColor: ["#22c55e", "#df2531", "#facc15"]
    }))
  }

  const themedBarData = {
    ...barData,
    datasets: barData.datasets.map((d) => ({
      ...d,
      backgroundColor: ["rgba(223,37,49,0.9)", "rgba(255,255,255,0.25)", "rgba(162,28,175,0.35)", "rgba(126,235,37,0.25)"]
    }))
  }

  return (
    <div className="dashboard-page-shell">
      <div className="dashboard-page-content">
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-red/75">Vue administrateur</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white">Dashboard Admin</h2>
            <Link
              to="/dashboard/admin/notifications"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-brand-red/40 bg-brand-red/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-red/25"
            >
              <Icon icon="solar:bell-bing-bold-duotone" width={18} />
              Voir les notifications
            </Link>
          </div>
        </div>

        {/* TOP STATS */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="dashboard-panel p-5">
            <h3 className="mb-3 text-base font-semibold text-white/95">Vue globale</h3>
            <div className="relative h-72 sm:h-80">
              <Bar options={commonChartOptions} data={themedBarData} />
            </div>
          </div>

          <div className="dashboard-panel p-5">
            <h3 className="mb-3 text-base font-semibold text-white/95">État des devoirs</h3>
            <div className="relative h-72 sm:h-80">
              <Doughnut options={commonChartOptions} data={themedDoughnutData} />
            </div>
          </div>
        </div>

        {/* SWITCH + LINE */}
        <div className="dashboard-panel mt-4 p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setView("semaine")}
                className={
                  "rounded-xl border px-3 py-2 text-sm transition " +
                  (view === "semaine"
                    ? "border-brand-red/60 bg-brand-red/20 text-white"
                    : "border-white/10 bg-brand-soft/70 text-white/80 hover:border-brand-red/40")
                }
              >
                Semaine
              </button>
              <button
                type="button"
                onClick={() => setView("mois")}
                className={
                  "rounded-xl border px-3 py-2 text-sm transition " +
                  (view === "mois"
                    ? "border-brand-red/60 bg-brand-red/20 text-white"
                    : "border-white/10 bg-brand-soft/70 text-white/80 hover:border-brand-red/40")
                }
              >
                Mois
              </button>
            </div>
          </div>

          <div className="relative h-64 sm:h-72 md:h-80">
            <Line options={lineChartOptions} data={lineData} />
          </div>
        </div>
      </div>
    </div>
  )
}
