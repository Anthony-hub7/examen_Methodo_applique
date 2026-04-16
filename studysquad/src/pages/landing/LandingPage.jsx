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

const inclusivityPillars = [
  {
    icon: 'solar:eye-bold',
    title: 'Lisibilite renforcée',
    text: 'Contraste eleve, typographie claire et tailles de texte adaptatives.',
  },
  {
    icon: 'solar:users-group-two-rounded-bold',
    title: 'Design inclusif',
    text: 'Parcours simple et compréhensible pour tous les profils d utilisateurs.',
  },
  {
    icon: 'solar:smartphone-2-bold',
    title: 'Mobile-first',
    text: 'Experience fluide sur telephone, tablette et grand ecran.',
  },
]

const footerLinks = [
  { label: 'Fonctionnalites', href: '#fonctionnalites' },
  { label: 'Experience', href: '#experience' },
  { label: 'Accessibilite', href: '#accessibilite' },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src="/Logo.png" alt="StudySquad logo" className="h-10 w-10 rounded-xl border border-white/15 object-cover" />
            <span className="text-lg font-bold tracking-wide sm:text-xl">StudySquad</span>
          </Link>

          <nav className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={toggleAudio}
              className="flex items-center gap-2 rounded-full border border-brand-red/60 bg-brand-red/20 px-3 py-2 text-xs font-semibold transition hover:bg-brand-red/35 sm:px-4 sm:text-sm"
            >
              <Icon icon={audioEnabled ? 'solar:music-note-bold' : 'solar:music-notes-bold'} width={18} />
              {audioEnabled ? 'Couper ambiance' : 'Activer ambiance'}
            </button>
            <Link
              to="/dashboard"
              className="rounded-full bg-brand-red px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 sm:px-5 sm:text-sm"
            >
              Explorer
            </Link>
          </nav>

          <button
            type="button"
            aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="rounded-xl border border-white/20 bg-white/5 p-2 text-white transition hover:border-brand-red/60 md:hidden"
          >
            <Icon icon={isMobileMenuOpen ? 'solar:close-circle-bold' : 'solar:hamburger-menu-bold'} width={24} />
          </button>
        </div>

        <motion.nav
          initial={false}
          animate={{
            height: isMobileMenuOpen ? 'auto' : 0,
            opacity: isMobileMenuOpen ? 1 : 0,
          }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden border-t border-white/10 md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6">
            <a
              href="#fonctionnalites"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90"
            >
              Fonctionnalites
            </a>
            <a
              href="#experience"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90"
            >
              Experience
            </a>
            <a
              href="#accessibilite"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90"
            >
              Accessibilite
            </a>
            <button
              type="button"
              onClick={toggleAudio}
              className="flex items-center justify-center gap-2 rounded-xl border border-brand-red/60 bg-brand-red/20 px-4 py-2 text-sm font-semibold text-white"
            >
              <Icon icon={audioEnabled ? 'solar:music-note-bold' : 'solar:music-notes-bold'} width={18} />
              {audioEnabled ? 'Couper ambiance' : 'Activer ambiance'}
            </button>
            <Link
              to="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-xl bg-brand-red px-4 py-2 text-center text-sm font-semibold text-white"
            >
              Explorer
            </Link>
          </div>
        </motion.nav>
      </header>

      <main>
        <section className="relative min-h-screen overflow-hidden pt-32 sm:pt-28">
          <video className="absolute inset-0 h-full w-full object-cover opacity-50" autoPlay muted loop playsInline>
            <source src={heroVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(223,37,49,0.25),transparent_30%),radial-gradient(circle_at_85%_65%,rgba(223,37,49,0.2),transparent_35%)]" />

          <motion.div
            aria-hidden="true"
            className="absolute left-[6%] top-[16%] h-20 w-20 overflow-hidden rounded-full bg-[radial-gradient(circle_at_30%_28%,#ff9aa1_0%,#ff5d66_18%,#df2531_42%,#5d0a14_78%,#180203_100%)] shadow-glow sm:h-24 sm:w-24"
            animate={{ y: [0, -14, 0], x: [0, 6, 0], rotate: [0, 6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="absolute inset-[16%] rounded-full border border-white/10 opacity-30" />
            <div className="absolute left-[12%] top-[18%] h-4 w-4 rounded-full bg-black/25 blur-[1px] sm:h-5 sm:w-5" />
            <div className="absolute right-[18%] top-[32%] h-3 w-3 rounded-full bg-black/30 sm:h-4 sm:w-4" />
            <div className="absolute bottom-[18%] left-[28%] h-5 w-5 rounded-full border border-[#2a0508] bg-[#7d111b]/70 sm:h-6 sm:w-6" />
            <div className="absolute inset-y-[38%] left-[-8%] right-[-8%] rounded-full border-t border-white/10 border-b border-black/15 opacity-45" />
            <div className="absolute left-[18%] top-[14%] h-8 w-4 rotate-[-20deg] rounded-full bg-white/20 blur-md" />
          </motion.div>
          <motion.div
            aria-hidden="true"
            className="absolute right-[8%] top-[24%] h-16 w-16 overflow-hidden rounded-full border border-white/20 bg-[radial-gradient(circle_at_35%_35%,#fafafa_0%,#d9d9d9_18%,#9d9d9d_42%,#5d5d5d_72%,#252525_100%)] backdrop-blur-md sm:h-20 sm:w-20"
            animate={{ y: [0, 12, 0], x: [0, -8, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="absolute left-[18%] top-[22%] h-3 w-3 rounded-full border border-black/15 bg-black/20 sm:h-4 sm:w-4" />
            <div className="absolute right-[20%] top-[45%] h-2.5 w-2.5 rounded-full bg-black/20 sm:h-3 sm:w-3" />
            <div className="absolute bottom-[16%] left-[30%] h-4 w-4 rounded-full border border-black/10 bg-black/15 sm:h-5 sm:w-5" />
            <div className="absolute inset-y-[40%] left-[8%] right-[8%] rounded-full border-t border-white/15 opacity-30" />
            <div className="absolute left-[20%] top-[10%] h-6 w-3 rotate-[-18deg] rounded-full bg-white/35 blur-md" />
          </motion.div>
          <motion.div
            aria-hidden="true"
            className="absolute bottom-[16%] right-[18%] hidden h-32 w-32 overflow-hidden rounded-full border border-[#df2531]/60 bg-[radial-gradient(circle_at_30%_30%,#ff5c75_0%,#a51523_24%,#34050b_58%,#050505_100%)] shadow-glow md:block"
            animate={{ y: [0, -16, 0], x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="absolute inset-[8%] rounded-full border border-white/10 opacity-25" />
            <div className="absolute inset-y-[48%] left-[-10%] right-[-10%] rotate-[-8deg] rounded-full border-t border-[#ff7a85]/50" />
            <div className="absolute left-[18%] top-[18%] h-7 w-7 rounded-full border border-black/20 bg-black/25" />
            <div className="absolute right-[22%] top-[28%] h-4 w-4 rounded-full bg-[#250307]/80" />
            <div className="absolute bottom-[18%] left-[26%] h-9 w-9 rounded-full border border-[#210306] bg-[#6c0d18]/60" />
            <div className="absolute left-[24%] top-[12%] h-10 w-5 rotate-[-22deg] rounded-full bg-white/15 blur-lg" />
          </motion.div>
          <motion.div
            aria-hidden="true"
            className="absolute bottom-[24%] left-[12%] hidden h-12 w-12 rounded-full bg-[#df2531]/80 blur-[1px] sm:block"
            animate={{ y: [0, 10, 0], x: [0, 5, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative mx-auto grid min-h-[75vh] max-w-7xl items-center gap-8 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-2 lg:gap-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <p className="inline-flex rounded-full border border-brand-red/50 bg-brand-red/10 px-4 py-1 text-xs font-semibold text-brand-red sm:text-sm">
                Application de Suivi de Devoirs
              </p>
              <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
                Organise tes devoirs.
                <span className="block text-brand-red">Collabore. Demande de l aide.</span>
              </h1>
              <p className="max-w-xl text-base text-white/85 sm:text-lg">
                StudySquad permet aux eleves et etudiants de suivre leurs devoirs en mode solo ou groupe, avec chat,
                rappels automatiques et bouton SOS pour demander de l aide rapidement.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/signup"
                  className="rounded-full bg-brand-red px-5 py-3 text-sm font-semibold text-white shadow-glow sm:px-6 sm:text-base"
                >
                  Commencer maintenant
                </Link>
                <Link
                  to="/login"
                  className="rounded-full border border-white/30 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 sm:px-6 sm:text-base"
                >
                  Se connecter
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="rounded-3xl border border-white/10 bg-black/45 p-5 shadow-2xl backdrop-blur-md sm:p-6"
              id="fonctionnalites"
            >
              <h2 className="mb-5 text-lg font-bold sm:text-xl">Fonctionnalites essentielles</h2>
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

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20" id="experience">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center text-2xl font-bold sm:text-3xl md:text-4xl"
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
                className="overflow-hidden rounded-3xl border border-white/10 bg-brand-soft transition duration-300 hover:-translate-y-1 hover:border-brand-red/40"
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

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20" id="accessibilite">
          <div className="mb-8 grid gap-5 md:grid-cols-3">
            {inclusivityPillars.map((pillar) => (
              <article key={pillar.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <Icon icon={pillar.icon} width={24} className="mb-3 text-brand-red" />
                <h3 className="text-lg font-semibold">{pillar.title}</h3>
                <p className="mt-2 text-sm text-white/75">{pillar.text}</p>
              </article>
            ))}
          </div>

          <div className="rounded-3xl border border-brand-red/40 bg-gradient-to-r from-brand-red/25 to-black p-6 text-center sm:p-8">
            <h2 className="text-2xl font-bold sm:text-3xl">Pret a booster ton organisation ?</h2>
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

      <footer className="border-t border-white/10 bg-black/80">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <img src="/Logo.png" alt="Logo StudySquad" className="h-10 w-10 rounded-xl border border-white/15 object-cover" />
              <p className="text-lg font-bold">StudySquad</p>
            </div>
            <p className="max-w-sm text-sm text-white/70">
              Plateforme futuriste de suivi de devoirs, pensée pour une collaboration simple, efficace et inclusive.
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-white">Navigation</h3>
            <ul className="space-y-2 text-sm text-white/75">
              {footerLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="transition hover:text-brand-red">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold text-white">Contact</h3>
            <p className="text-sm text-white/75">support@studysquad.app</p>
            <p className="mt-2 text-sm text-white/75">Disponible pour eleves et etudiants, solo ou en groupe.</p>
            <div className="mt-4 flex items-center gap-3">
              <a href="#" aria-label="Instagram" className="rounded-full border border-white/20 p-2 hover:border-brand-red/60">
                <Icon icon="mdi:instagram" width={18} />
              </a>
              <a href="#" aria-label="Discord" className="rounded-full border border-white/20 p-2 hover:border-brand-red/60">
                <Icon icon="mdi:discord" width={18} />
              </a>
              <a href="#" aria-label="X" className="rounded-full border border-white/20 p-2 hover:border-brand-red/60">
                <Icon icon="mdi:twitter" width={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/60 sm:px-6">
          © {new Date().getFullYear()} StudySquad. Tous droits reserves.
        </div>
      </footer>
    </div>
  )
}
