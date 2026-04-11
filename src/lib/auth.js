import { supabase } from './supabase'

const DEV_EMAIL    = 'teste@bc.com.br'
const DEV_PASSWORD = 'teste123'

// Mock session used when Supabase is not yet configured
const DEV_SESSION = {
  user: { id: 'dev-user', email: DEV_EMAIL },
  access_token: 'dev-token',
}

function isDevMode() {
  const url = import.meta.env.VITE_SUPABASE_URL ?? ''
  return url.includes('placeholder') || url === '' || url === undefined
}

export async function signIn(email, password) {
  if (isDevMode()) {
    if (email === DEV_EMAIL && password === DEV_PASSWORD) {
      sessionStorage.setItem('dev_session', JSON.stringify(DEV_SESSION))
      return { data: DEV_SESSION, error: null }
    }
    return { data: null, error: { message: 'E-mail ou senha incorretos.' } }
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signOut() {
  if (isDevMode()) {
    sessionStorage.removeItem('dev_session')
    return { error: null }
  }
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getSession() {
  if (isDevMode()) {
    const raw = sessionStorage.getItem('dev_session')
    return raw ? JSON.parse(raw) : null
  }
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
