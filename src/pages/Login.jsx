import { useState } from 'react'
import { signIn } from '../lib/auth'
import { useToast } from '../context/ToastContext'

export default function Login({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) { toast(error.message, 'error'); return }
    onLogin()
  }

  const inputStyle = {
    width: '100%', borderRadius: 9, padding: '11px 14px', fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.82)', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.09)', outline: 'none',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0a', padding: '16px',
    }}>
      {/* Blobs */}
      <div style={{ position: 'fixed', top: -100, left: -80, width: 'clamp(200px, 40vw, 500px)', height: 'clamp(200px, 40vw, 500px)', borderRadius: '50%', background: 'rgba(244,196,48,0.06)', filter: 'blur(140px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -80, right: -60, width: 'clamp(160px, 30vw, 400px)', height: 'clamp(160px, 30vw, 400px)', borderRadius: '50%', background: 'rgba(200,200,200,0.04)', filter: 'blur(140px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 380 }}>
        {/* Single card */}
        <div style={{
          background: 'rgba(16,16,16,0.92)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16,
          padding: 'clamp(24px, 6vw, 36px) clamp(18px, 5vw, 28px)',
        }}>
          {/* Logo inside card */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              position: 'relative', width: 58, height: 58, margin: '0 auto 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid rgba(200,200,200,0.45)',
              background: '#0a0a0a',
            }}>
              <span style={{ position: 'absolute', inset: 4, border: '1px solid rgba(200,200,200,0.14)', pointerEvents: 'none' }} />
              <span style={{
                fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.45rem', letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg,#e8e8e8,#ffffff)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>BC</span>
            </div>
            <p style={{ fontWeight: 800, fontSize: '0.95rem', color: '#F4C430', letterSpacing: '0.01em' }}>Batista &amp; Calzolari</p>
            <p style={{ fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(200,200,200,0.38)', marginTop: 3 }}>Advogados Associados</p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(244,196,48,0.3),transparent)', marginBottom: 24 }} />

          <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,196,48,0.45)', marginBottom: 18 }}>
            Acesso ao Sistema
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>E-mail</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Senha</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
            </div>

            <button type="submit" disabled={loading} className="btn-grad"
              style={{ width: '100%', padding: '11px', fontSize: '0.85rem', fontWeight: 700, marginTop: 4, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          {/* Test credentials */}
          <div style={{
            marginTop: 20, padding: '10px 14px', borderRadius: 8,
            background: 'rgba(244,196,48,0.06)', border: '1px solid rgba(244,196,48,0.15)',
          }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(244,196,48,0.5)', marginBottom: 6 }}>
              Acesso de Teste
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>
                <span style={{ color: 'rgba(255,255,255,0.25)' }}>email</span>{'  '}teste@bc.com.br
              </p>
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace' }}>
                <span style={{ color: 'rgba(255,255,255,0.25)' }}>senha</span>{'  '}teste123
              </p>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.58rem', color: 'rgba(255,255,255,0.1)', marginTop: 16, letterSpacing: '0.08em' }}>
            SISTEMA INTERNO v0.1 · USO RESTRITO
          </p>
        </div>
      </div>
    </div>
  )
}
