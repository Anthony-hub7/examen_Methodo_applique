import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import {
  checkSession,
  loginMember,
  logoutMember,
  signUpMember,
  type SignUpInput,
} from '../services/authService'
import { supabase } from '../services/supabaseClient'

type UseAuthState = {
  session: Session | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<UseAuthState>({
    session: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  })

  const refreshSession = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    const result = await checkSession()

    setState({
      session: result.session,
      isAuthenticated: result.isAuthenticated,
      loading: false,
      error: result.error,
    })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    const result = await loginMember(email, password)

    setState({
      session: result.session,
      isAuthenticated: result.success && Boolean(result.session),
      loading: false,
      error: result.error,
    })

    return result
  }, [])

  const signUp = useCallback(async (input: SignUpInput) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    const result = await signUpMember(input)

    setState({
      session: result.session,
      isAuthenticated: result.success && Boolean(result.session),
      loading: false,
      error: result.error,
    })

    return result
  }, [])

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    const result = await logoutMember()

    setState({
      session: null,
      isAuthenticated: false,
      loading: false,
      error: result.error,
    })

    return result
  }, [])

  useEffect(() => {
    void refreshSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({
        ...prev,
        session,
        isAuthenticated: Boolean(session),
      }))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [refreshSession])

  return {
    ...state,
    refreshSession,
    login,
    signUp,
    logout,
  }
}
