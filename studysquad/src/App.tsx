import { useEffect } from 'react'
import { supabase } from './services/supabaseClient'

function App() {
  useEffect(() => {
    async function testSupabase() {
      const { data, error } = await supabase.auth.getSession()
      console.log('Supabase test auth.getSession:', { data, error })

      if (error) {
        console.error('Supabase erreur de connexion :', error.message)
      } else {
        console.log('Supabase : connexion OK (requête envoyée)')
      }
    }

    testSupabase()
  }, [])

  return (
    <main className="p-8">
      <h1>Test de connexion Supabase</h1>
      <p>Ouvre la console du navigateur pour voir le résultat.</p>
    </main>
  )
}

export default App
