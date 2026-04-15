import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { motion } from 'framer-motion'
import heroVideo from '../../assets/hero/vecteezy_red-energy-magic-digital-high-tech-waves-with-light-rays_40831776.mp4'
import ambienceSound from '../../assets/audio/loop/idoberg-ambient-pads-loop-296968.mp3'
import ideeImage from '../../assets/image/idee.jpg'
import etudeImage from '../../assets/image/étude.jpg'
import retrouverImage from '../../assets/image/retrouver.jpg'

const features = [
  {
    icon: 'solar:clipboard-list-bold',
    title: 'Gestion des devoirs',
    description: 'Creer, modifier, prioriser et suivre chaque devoir jusqu a completion.',
  },
  {
    icon: 'solar:users-group-rounded-bold',
    title: 'Modes Solo & Groupe',
    description: 'Bascule rapide entre travail personnel et devoirs partages.',
  },
  {
    icon: 'solar:chat-round-dots-bold',
    title: 'Collaboration instantanee',
    description: 'Chat de groupe, assignation de taches et suivi des membres.',
  },
  {
    icon: 'solar:siren-rounded-bold',
    title: "Aide SOS integree",
    description: "Demande d aide visible, compteur d aidants et reponses immediates.",
  },
]

const sections = [
  {
    title: 'Mode Solo',
    text: 'Concentre-toi sur tes devoirs personnels avec suivi des echeances et priorites.',
    image: etudeImage,
  },
  {
    title: 'Mode Groupe',
    text: 'Partage, organise et collabore avec ton groupe via code invitation.',
    image: retrouverImage,
  },
  {
    title: "Tableau de bord intelligent",
    text: 'Repere les retards, les devoirs termines et les demandes SOS en un seul ecran.',
    image: ideeImage,
  },
]

function SeoMeta() {
  useEffect(() => {
    document.title = 'StudySquad - Suivi de devoirs solo et groupe'

    const tags = [
      {
        selector: 'meta[name="description"]',
        attrs: {
          name: 'description',
          content:
            "StudySquad aide les eleves et etudiants a suivre leurs devoirs en solo ou en groupe, avec chat, rappels et bouton d aide SOS.",
        },
      },
      {
        selector: 'meta[name="keywords"]',
        attrs: {
          name: 'keywords',
          content:
            'StudySquad, suivi devoirs, application etudiant, devoir groupe, collaboration scolaire, aide SOS',
        },
      },
      {
        selector: 'meta[property="og:title"]',
        attrs: {
          property: 'og:title',
          content: 'StudySquad - Application de Suivi de Devoirs',
        },
      },
      {
        selector: 'meta[property="og:description"]',
        attrs: {
          property: 'og:description',
          content:
            "Organise tes devoirs, collabore en groupe et demande de l aide instantanee avec StudySquad.",
        },
      },
    ]

    tags.forEach(({ selector, attrs }) => {
      let meta = document.querySelector(selector)
      if (!meta) {
        meta = document.createElement('meta')
        document.head.appendChild(meta)
      }
      Object.entries(attrs).forEach(([key, value]) => meta.setAttribute(key, value))
    })
  }, [])

  return null
}

export default function LandingPage() {
  const audioRef = useRef(null)
  const [audioEnabled, setAudioEnabled] = useState(false)

  const toggleAudio = async () => {
    if (!audioRef.current) return
    if (audioEnabled) {
      audioRef.current.pause()
      setAudioEnabled(false)
      return
    }
    try {
      await audioRef.current.play()
      setAudioEnabled(true)
    } catch (error) {
      setAudioEnabled(false)
      console.error('Lecture audio bloquee par le navigateur:', error)
    }
  }

  return (
    <div className="bg-brand-black text-white">
      <SeoMeta />
      <audio ref={audioRef} src={ambienceSound} loop preload="auto" />

      <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src="/Logo.png" alt="StudySquad logo" className="h-10 w-10 rounded-xl border border-white/15 object-cover" />
            <span className="text-xl font-bold tracking-wide">StudySquad</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleAudio}
              className="flex items-center gap-2 rounded-full border border-brand-red/60 bg-brand-red/20 px-4 py-2 text-sm font-semibold transition hover:bg-brand-red/35"
            >
              <Icon icon={audioEnabled ? 'solar:music-note-bold' : 'solar:music-notes-bold'} width={18} />
              {audioEnabled ? 'Couper ambiance' : 'Activer ambiance'}
            </button>
            <Link
              to="/dashboard"
              className="rounded-full bg-brand-red px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Explorer
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-screen overflow-hidden pt-28">
          <video className="absolute inset-0 h-full w-full object-cover opacity-50" autoPlay muted loop playsInline>
            <source src={heroVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />

          <div className="relative mx-auto grid min-h-[75vh] max-w-7xl items-center gap-10 px-6 pb-12 pt-10 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <p className="inline-flex rounded-full border border-brand-red/50 bg-brand-red/10 px-4 py-1 text-sm font-semibold text-brand-red">
                Application de Suivi de Devoirs
              </p>
              <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
                Organise tes devoirs.
                <span className="block text-brand-red">Collabore. Demande de l aide.</span>
              </h1>
              <p className="max-w-xl text-lg text-white/80">
                StudySquad permet aux eleves et etudiants de suivre leurs devoirs en mode solo ou groupe, avec chat,
                rappels automatiques et bouton SOS pour demander de l aide rapidement.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/signup" className="rounded-full bg-brand-red px-6 py-3 font-semibold text-white shadow-glow">
                  Commencer maintenant
                </Link>
                <Link
                  to="/login"
                  className="rounded-full border border-white/30 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10"
                >
                  Se connecter
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="rounded-3xl border border-white/10 bg-black/45 p-6 shadow-2xl backdrop-blur-md"
            >
              <h2 className="mb-5 text-xl font-bold">Fonctionnalites essentielles</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {features.map((feature) => (
                  <div key={feature.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <Icon icon={feature.icon} width={26} className="mb-3 text-brand-red" />
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-white/75">{feature.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center text-3xl font-bold md:text-4xl"
          >
            Une experience claire pour tout ton flux de travail
          </motion.h2>

          <div className="grid gap-8 md:grid-cols-3">
            {sections.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="overflow-hidden rounded-3xl border border-white/10 bg-brand-soft"
              >
                <img src={item.image} alt={item.title} className="h-52 w-full object-cover" />
                <div className="space-y-3 p-6">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-white/75">{item.text}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-20">
          <div className="rounded-3xl border border-brand-red/40 bg-gradient-to-r from-brand-red/25 to-black p-8 text-center">
            <h2 className="text-3xl font-bold">Pret a booster ton organisation ?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/80">
              Suis tes devoirs, collabore avec ton groupe et active l aide SOS quand tu bloques sur un exercice.
            </p>
            <Link
              to="/signup"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-red px-6 py-3 font-semibold text-white shadow-glow"
            >
              Creer mon compte
              <Icon icon="solar:arrow-right-up-bold" width={18} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
