import { supabase } from './supabase'

const DEV_EMAIL    = 'bcaiolrmos571@gmail.com'
const DEV_PASSWORD = 'B2006XXX'

function isDevMode() {
  const url = import.meta.env.VITE_SUPABASE_URL ?? ''
  return url.includes('placeholder') || url === '' || url === undefined
}

// Mock session used when Supabase is not yet configured
const DEV_SESSION = {
  user: { id: 'dev-user', email: DEV_EMAIL },
  access_token: 'dev-token',
}

export async function signIn(email, password) {
  // ── Pure offline/dev mode (no Supabase URL configured) ──────────────
  if (isDevMode()) {
    if (email === DEV_EMAIL && password === DEV_PASSWORD) {
      sessionStorage.setItem('dev_session', JSON.stringify(DEV_SESSION))
      return { data: DEV_SESSION, error: null }
    }
    return { data: null, error: { message: 'E-mail ou senha incorretos.' } }
  }

  // ── Real Supabase mode ───────────────────────────────────────────────
  // 1. Try to sign in normally
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (!error) return { data, error }

  const msg = error.message?.toLowerCase() ?? ''

  // 2. Email awaiting confirmation — advise user instead of looping
  if (msg.includes('email not confirmed')) {
    return { data: null, error: { message: 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.' } }
  }

  // 3. User doesn't exist yet — auto-register, then sign in
  //    (handles first-run with no users in the Supabase project)
  const isNotFound = msg.includes('invalid login') || msg.includes('user not found') || error.status === 400

  if (isNotFound) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    })

    if (signUpError) {
      console.error('[auth] signUp:', signUpError.message)
      return { data: null, error: signUpError }
    }

    // If Supabase returned a session right away (email confirmation disabled) sign in
    if (signUpData?.session) return { data: signUpData, error: null }

    // Otherwise email confirmation is required
    return {
      data: null,
      error: { message: 'Conta criada! Confirme seu e-mail para acessar o sistema.' },
    }
  }

  return { data: null, error }
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
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) { console.error('[auth] getSession:', error.message); return null }
    return session
  } catch (err) {
    console.error('[auth] getSession exception:', err)
    return null
  }
}
