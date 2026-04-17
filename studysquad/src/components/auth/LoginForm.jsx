import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Ghost from '../ui/Ghost'

export default function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login({ email, password })
      navigate(user.role === 'admin' ? '/dashboard/admin' : '/dashboard/student')
    } catch (currentError) {
      setError(currentError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-black text-white">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      >
        <source src="/background1.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />

      <div className="relative mx-auto flex min-h-screen max-w-md items-center px-6">
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <div className="flex flex-col items-center gap-3">
            <img src="/LogoChap.png" alt="StudySquad logo chap" className="h-14 w-auto" />
            <Ghost size="md" className="drop-shadow-[0_0_30px_rgba(223,37,49,0.25)]" />
            <h1 className="text-2xl font-bold">Connexion</h1>
          </div>

          <p className="text-sm text-white/70">Admin mock: `admin@test.com / admin`</p>
          <p className="text-sm text-white/70">Etudiant mock: `client@test.com / client`</p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2"
            required
          />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-red px-4 py-2 font-semibold disabled:opacity-60"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <p className="text-sm text-white/80">
            Pas encore de compte ?{' '}
            <Link className="text-brand-red underline" to="/signin">
              S'inscrire
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
