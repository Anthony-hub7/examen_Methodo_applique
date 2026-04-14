import { useEffect, useState } from 'react'
import { supabase } from './services/supabaseClient'

function App() {
  const [status, setStatus] = useState('Test en cours...')

  useEffect(() => {
    async function testSupabase() {
      setStatus('Test en cours...')
      const { error } = await supabase.auth.getUser()
      console.log('Supabase test auth.getUser:', { error })

      if (error) {
        if (error.message.toLowerCase().includes('auth session missing')) {
          setStatus('Connexion Supabase OK (pas d utilisateur connecté).')
          return
        }
        console.error('Supabase erreur de connexion :', error.message)
        setStatus(`Erreur Supabase: ${error.message}`)
      } else {
        console.log('Supabase : connexion OK (requête envoyée)')
        setStatus('Connexion Supabase OK.')
      }
    }

    testSupabase()
  }, [])

  return (
    <main className="p-8">
      <h1>Test de connexion Supabase</h1>
      <p>{status}</p>
    </main>
  )
}

export default App
