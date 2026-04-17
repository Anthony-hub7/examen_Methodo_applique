import { useEffect, useMemo, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { useLocation } from 'react-router-dom'
import lofiTrack from '@/assets/audio/loop/chronopopofficial-lofi-sample-if-i-cant-have-you-330746.mp3'
import chillTrack from '@/assets/audio/loop/idoberg-ambient-pads-loop-296968.mp3'
import focusTrack from '@/assets/audio/loop/daydream0864-masseffect-ambient-196361.mp3'
import swedenTrack from '@/assets/audio/loop/Sweden.mp3'

const STORAGE_TRACK_KEY = 'studysquad:lofi-track'
const STORAGE_ENABLED_KEY = 'studysquad:lofi-enabled'

const AMBIANCES = [
  { id: 'lofi', label: 'Lo-fi Beats', source: lofiTrack },
  { id: 'chill', label: 'Chill', source: chillTrack },
  { id: 'focus', label: 'Focus Ambient', source: focusTrack },
  { id: 'sweden', label: 'Sweden', source: swedenTrack },
]

function readStoredValue(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export default function LofiMiniPlayer() {
  const location = useLocation()
  const audioRef = useRef(null)

  const [selectedTrackId, setSelectedTrackId] = useState(() => readStoredValue(STORAGE_TRACK_KEY, 'lofi'))
  const [isEnabled, setIsEnabled] = useState(() => readStoredValue(STORAGE_ENABLED_KEY, true))
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const [isAudioActive, setIsAudioActive] = useState(false)

  const isDashboardRoute = location.pathname.startsWith('/dashboard/')

  const selectedTrack = useMemo(() => {
    return AMBIANCES.find((item) => item.id === selectedTrackId) ?? AMBIANCES[0]
  }, [selectedTrackId])

  useEffect(() => {
    if (AMBIANCES.some((item) => item.id === selectedTrackId)) return
    setSelectedTrackId(AMBIANCES[0].id)
  }, [selectedTrackId])

  useEffect(() => {
    localStorage.setItem(STORAGE_TRACK_KEY, JSON.stringify(selectedTrackId))
  }, [selectedTrackId])

  useEffect(() => {
    localStorage.setItem(STORAGE_ENABLED_KEY, JSON.stringify(isEnabled))
  }, [isEnabled])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !isDashboardRoute) return

    audio.volume = 0.32

    if (!isEnabled) {
      audio.pause()
      return
    }

    const playPromise = audio.play()
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        setAutoplayBlocked(true)
        setIsAudioActive(false)
      })
    }
  }, [isDashboardRoute, isEnabled, selectedTrack.id])

  useEffect(() => {
    if (!autoplayBlocked || !isEnabled || !isDashboardRoute) return

    const tryResume = () => {
      const audio = audioRef.current
      if (!audio) return

      const playPromise = audio.play()
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(() => {
          setAutoplayBlocked(false)
          setIsAudioActive(true)
        }).catch(() => {
          // Keep waiting for a user gesture until autoplay is granted.
        })
      }
    }

    window.addEventListener('pointerdown', tryResume)
    window.addEventListener('keydown', tryResume)

    return () => {
      window.removeEventListener('pointerdown', tryResume)
      window.removeEventListener('keydown', tryResume)
    }
  }, [autoplayBlocked, isDashboardRoute, isEnabled])

  useEffect(() => {
    if (isDashboardRoute) return

    const audio = audioRef.current
    if (audio) {
      audio.pause()
      setIsAudioActive(false)
    }
  }, [isDashboardRoute])

  if (!isDashboardRoute) return null

  const handleToggle = () => {
    setIsEnabled((previous) => !previous)
  }

  return (
    <div className="fixed bottom-3 right-3 z-[75]">
      <audio
        ref={audioRef}
        src={selectedTrack.source}
        loop
        preload="auto"
        onPlay={() => {
          setIsAudioActive(true)
          setAutoplayBlocked(false)
        }}
        onPause={() => setIsAudioActive(false)}
      />

      <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-black/55 px-2.5 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <button
          type="button"
          aria-label={isEnabled ? 'Mettre en pause' : 'Lire'}
          onClick={handleToggle}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
        >
          <Icon icon={isEnabled ? 'solar:pause-bold' : 'solar:play-bold'} width={16} />
        </button>

        <div className="flex min-w-[132px] flex-col">
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-white/55">
            Lofi
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isAudioActive ? 'bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.95)]' : 'bg-white/25'
              }`}
            />
          </span>

          <select
            value={selectedTrack.id}
            onChange={(event) => setSelectedTrackId(event.target.value)}
            className="w-full appearance-none bg-transparent text-xs font-medium text-white outline-none"
            aria-label="Choisir une ambiance"
          >
            {AMBIANCES.map((ambiance) => (
              <option key={ambiance.id} value={ambiance.id} className="bg-[#111] text-white">
                {ambiance.label}
              </option>
            ))}
          </select>
        </div>

        <Icon icon="solar:alt-arrow-down-linear" width={14} className="pointer-events-none text-white/40" />
      </div>

      {autoplayBlocked ? (
        <p className="mt-1 text-[10px] text-white/55">Clique une fois pour lancer l'audio.</p>
      ) : null}
    </div>
  )
}
