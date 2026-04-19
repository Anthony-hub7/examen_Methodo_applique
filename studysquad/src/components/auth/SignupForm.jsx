import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../../src/services/supabaseClient'
import Ghost from '../ui/Ghost'

export default function SignupForm() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    level: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)

    //version localStorage
   /* try {
      await signup({
        name: form.name,
        email: form.email,
        level: form.level,
        password: form.password,
      })
      navigate('/dashboard/student')
    } catch (currentError) {
      setError(currentError.message)
    } finally {
      setLoading(false)
    }*/

    //version supabase
    try {
      // creation de auth user dab
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      })
      if (authError) throw authError
      const user = data.user

      // insert dzns members 
      const { error: dbError } = await supabase.from('members').insert([
        {
          id: user.id,
          name: form.name,
          email: form.email,
          niveau_etude: form.level,
          role: 'student',
        },
      ])

      if (dbError) throw dbError
      navigate('/dashboard/student')
    } catch (err) {
      setError(err.message)
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
            <img src="/Logo.png" alt="StudySquad logo" className="h-14 w-auto" />
            <Ghost size="md" className="drop-shadow-[0_0_30px_rgba(223,37,49,0.25)]" />
            <h1 className="text-2xl font-bold">Inscription</h1>
          </div>

          <input
            name="name"
            type="text"
            placeholder="Nom complet"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2"
            required
          />
          <select
            name="level"
            value={form.level}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2"
            required
          >
            <option value="">Niveau</option>
            <option value="Lycee">Lycee</option>
            <option value="L1">L1</option>
            <option value="L2">L2</option>
            <option value="L3">L3</option>
            <option value="M1">M1</option>
            <option value="M2">M2</option>
          </select>
          <input
            name="password"
            type="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2"
            required
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirmer le mot de passe"
            value={form.confirmPassword}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2"
            required
          />

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-red px-4 py-2 font-semibold disabled:opacity-60"
          >
            {loading ? 'Creation...' : 'Creer un compte'}
          </button>

          <p className="text-sm text-white/80">
            Deja un compte ?{' '}
            <Link className="text-brand-red underline" to="/login">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
