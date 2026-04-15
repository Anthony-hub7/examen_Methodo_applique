import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

export type CheckSessionResult = {
  isAuthenticated: boolean
  session: Session | null
  error: string | null
}

export type SignUpInput = {
  name: string
  email: string
  password: string
  niveauEtude?: string
}

export type AuthResult = {
  success: boolean
  session: Session | null
  error: string | null
}

export async function checkSession(): Promise<CheckSessionResult> {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    return {
      isAuthenticated: false,
      session: null,
      error: error.message,
    }
  }

  return {
    isAuthenticated: Boolean(data.session),
    session: data.session,
    error: null,
  }
}

export async function signUpMember(input: SignUpInput): Promise<AuthResult> {
  const { name, email, password, niveauEtude } = input

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })

  if (authError) {
    return {
      success: false,
      session: null,
      error: authError.message,
    }
  }

  const userId = authData.user?.id

  if (!userId) {
    return {
      success: false,
      session: authData.session ?? null,
      error: 'Utilisateur non retourne par Supabase lors de l inscription.',
    }
  }

  const { error: memberError } = await supabase.from('members').upsert(
    {
      id: userId,
      name,
      email,
      niveau_etude: niveauEtude ?? null,
    },
    { onConflict: 'id' },
  )

  if (memberError) {
    return {
      success: false,
      session: authData.session ?? null,
      error: memberError.message,
    }
  }

  return {
    success: true,
    session: authData.session ?? null,
    error: null,
  }
}

export async function loginMember(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      success: false,
      session: null,
      error: error.message,
    }
  }

  return {
    success: true,
    session: data.session,
    error: null,
  }
}

export async function logoutMember(): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}
