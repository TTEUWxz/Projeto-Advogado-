import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#0a0a0a', padding: 24,
        }}>
          <div style={{
            maxWidth: 420, width: '100%', padding: '32px 28px', borderRadius: 14,
            background: 'rgba(16,16,16,0.95)', border: '1px solid rgba(248,113,113,0.2)',
            textAlign: 'center',
          }}>
            <AlertTriangle size={36} style={{ color: '#f87171', marginBottom: 16 }} />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>
              Algo deu errado
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginBottom: 20, lineHeight: 1.5 }}>
              {this.state.error?.message ?? 'Erro inesperado.'}
            </p>
            <button
              onClick={() => { this.setState({ error: null }); window.location.href = '/' }}
              style={{
                padding: '9px 20px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 700,
                background: 'linear-gradient(135deg,#F4C430,#c9970a)', color: '#0a0a0a',
                border: 'none', cursor: 'pointer',
              }}
            >
              Voltar ao início
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
