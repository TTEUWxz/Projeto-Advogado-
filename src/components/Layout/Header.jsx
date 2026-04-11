import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'

const TITLES = {
  '/dashboard':    { title: 'Dashboard',    sub: 'Visão geral do negócio' },
  '/funcionarios': { title: 'Funcionários', sub: 'Gestão de colaboradores' },
  '/financeiro':   { title: 'Financeiro',   sub: 'Controle de saídas' },
  '/calendario':   { title: 'Calendário',   sub: 'Pagamentos e escalas' },
  '/clientes':     { title: 'Clientes',     sub: 'Gestão de clientes' },
}

export default function Header({ session }) {
  const { pathname } = useLocation()
  const info = TITLES[pathname] ?? { title: 'B&C Sistema', sub: '' }
  const email = session?.user?.email ?? ''
  const initials = email.slice(0, 2).toUpperCase()

  return (
    <header style={{
      height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1.5rem', flexShrink: 0,
      background: 'rgba(10,10,10,0.9)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      backdropFilter: 'blur(12px)',
    }}>
      <div>
        <h1 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'rgba(255,255,255,0.88)', letterSpacing: '0.02em' }}>
          {info.title}
        </h1>
        <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.07em', textTransform: 'uppercase', marginTop: 1 }}>
          {info.sub}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 8,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Search size={13} style={{ color: 'rgba(255,255,255,0.22)' }} />
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em' }}>Buscar…</span>
        </div>

        <button style={{
          position: 'relative', padding: 7, borderRadius: 8, cursor: 'pointer',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Bell size={15} style={{ color: 'rgba(255,255,255,0.4)' }} />
          <span style={{
            position: 'absolute', top: 6, right: 6, width: 6, height: 6,
            borderRadius: '50%', background: '#F4C430', boxShadow: '0 0 6px rgba(244,196,48,0.8)',
          }} />
        </button>

        {/* User avatar */}
        {email && (
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(244,196,48,0.15)', border: '1px solid rgba(244,196,48,0.3)',
            fontSize: '0.68rem', fontWeight: 700, color: '#F4C430',
          }}>
            {initials}
          </div>
        )}
      </div>
    </header>
  )
}
