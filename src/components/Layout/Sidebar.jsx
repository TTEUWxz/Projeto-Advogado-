import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Wallet, CalendarDays, UserSquare2, LogOut, X } from 'lucide-react'
import { signOut } from '../../lib/auth'

const NAV = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/clientes',     label: 'Clientes',     icon: UserSquare2 },
  { to: '/funcionarios', label: 'Funcionários',  icon: Users },
  { to: '/financeiro',   label: 'Financeiro',    icon: Wallet },
  { to: '/calendario',   label: 'Calendário',    icon: CalendarDays },
]

function BCLogo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '22px 16px 18px' }}>
      <div style={{
        position: 'relative', width: 56, height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid rgba(200,200,200,0.45)',
        background: '#0a0a0a',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.05)',
        marginBottom: 10,
      }}>
        <span style={{ position: 'absolute', inset: 4, border: '1px solid rgba(200,200,200,0.15)', pointerEvents: 'none' }} />
        <span style={{
          fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.35rem', letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg,#e8e8e8,#ffffff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>BC</span>
      </div>
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
      {/* Sidebar — mobile: fixed overlay slide-in; desktop: static */}
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

        <BCLogo />
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
