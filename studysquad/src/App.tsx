import { useEffect, useState } from 'react'
import {BrowserRouter,Routes,Route,Navigate} from "react-router-dom"
import { supabase } from './services/supabaseClient'
import Login from "./pages/auth/Login"
import Signup from './pages/auth/Signup'
import StatsCard from './components/dashboard/StatsCard'
import ClientDash from './components/dashboard/ClientDash'
// import Ghost from './components/ui/Ghost'

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
    <>
    {/* <main className="p-8">
      <h1>Test de connexion Supabase</h1>
      <p>{status}</p>
    </main> */}
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<Signup />} />
        <Route path="/card" element={<StatsCard />} />
        <Route path="/clientDash" element={<ClientDash />} />


        

      </Routes>
    </BrowserRouter>
    </>

  )
}

export default App
