import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Wallet, CalendarDays, UserSquare2, LogOut, X, MessageCircle } from 'lucide-react'
import { signOut } from '../../lib/auth'

const NAV = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/clientes',     label: 'Clientes',     icon: UserSquare2 },
  { to: '/funcionarios', label: 'Funcionários',  icon: Users },
  { to: '/financeiro',   label: 'Financeiro',    icon: Wallet },
  { to: '/calendario',   label: 'Calendário',    icon: CalendarDays },
  { to: '/cobrancas',    label: 'Cobranças',     icon: MessageCircle },
]

function SiteLogoSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 12px 16px' }}>
      {/* SEV7N logo */}
      <img
        src="/logo-sev7n.svg"
        alt="SEV7N Team"
        style={{
          width: 76, height: 76,
          marginBottom: 8,
          filter: 'drop-shadow(0 0 10px rgba(244,196,48,0.15))',
        }}
      />
      <p style={{ fontWeight: 800, fontSize: '0.76rem', color: '#F4C430', textAlign: 'center', lineHeight: 1.2 }}>
        Batista &amp; Calzolari
      </p>
      <p style={{ fontSize: '0.56rem', letterSpacing: '0.16em', color: 'rgba(200,200,200,0.38)', textTransform: 'uppercase', marginTop: 3 }}>
        Advogados Associados
      </p>
    </div>
  )
}

export default function Sidebar({ isOpen, onClose, onLogout }) {
  async function handleLogout() {
    await signOut()
    onLogout?.()
  }

  return (
    <>
      <aside
        className={[
          'flex flex-col flex-shrink-0 z-40',
          'fixed inset-y-0 left-0 transition-transform duration-300 ease-in-out',
          'md:static md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{
          width: 200,
          background: 'rgba(12,12,12,0.97)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 md:hidden p-1.5 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer' }}
        >
          <X size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
        </button>

        <SiteLogoSection />
        <div className="gold-line mx-4 mb-3" />

        <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '12px 10px 16px' }}>
          <div className="gold-line mb-3" />
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'none', color: 'rgba(255,255,255,0.25)', fontSize: '0.78rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; e.currentTarget.style.color = '#f87171' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.25)' }}
          >
            <LogOut size={14} />
            Sair
          </button>
          <p style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.12)', letterSpacing: '0.08em', paddingLeft: 10, marginTop: 4 }}>
            SISTEMA INTERNO v0.1
          </p>
        </div>
      </aside>
    </>
  )
}
