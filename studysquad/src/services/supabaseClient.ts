import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) {
  throw new Error(
    'Variables Supabase manquantes: vérifie VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env.local',
  )
}

export const supabase = createClient(url, key)