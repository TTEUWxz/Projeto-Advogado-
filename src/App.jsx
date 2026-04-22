import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ToastProvider } from './context/ToastContext'
import { getSession } from './lib/auth'
import { supabase } from './lib/supabase'
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Finance from './pages/Finance'
import Calendar from './pages/Calendar'
import Clients from './pages/Clients'
import Cobrancas from './pages/Cobrancas'
import Login from './pages/Login'

function AppShell() {
  const [session, setSession]   = useState(undefined) // undefined = loading
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    getSession().then(s => setSession(s ?? null))
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s ?? null))
      return () => subscription?.unsubscribe?.()
    } catch {
      // Supabase not configured — dev mode handles auth via sessionStorage
    }
  }, [])

  // Loading state
  if (session === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
        <div className="spinner" />
      </div>
    )
  }

  if (!session) {
    return <Login onLogin={() => getSession().then(s => setSession(s))} />
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="blob w-[240px] h-[240px] sm:w-[420px] sm:h-[420px] top-[-100px] left-[-50px]"
           style={{ background: 'rgba(244,196,48,0.05)' }} />
      <div className="blob w-[160px] h-[160px] sm:w-[320px] sm:h-[320px] bottom-[-60px] right-0"
           style={{ background: 'rgba(200,200,200,0.03)' }} />

      {/* SEV7N logo — marca d'água centralizada no fundo */}
      <img
        src="/logo-sev7n.svg"
        alt=""
        aria-hidden="true"
        style={{
          position: 'fixed',
          bottom: '5%',
          right: '3%',
          width: 'clamp(140px, 20vw, 300px)',
          opacity: 0.055,
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'brightness(4)',
          userSelect: 'none',
        }}
      />

      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Mobile overlay backdrop */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 md:hidden"
            style={{ backdropFilter: 'blur(2px)' }}
            onClick={() => setMenuOpen(false)}
          />
        )}

        <Sidebar
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          onLogout={() => setSession(null)}
        />

        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <Header
            session={session}
            onLogout={() => setSession(null)}
            onMenuOpen={() => setMenuOpen(true)}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <Routes>
              <Route path="/"             element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"    element={<Dashboard />} />
              <Route path="/funcionarios" element={<Employees />} />
              <Route path="/financeiro"   element={<Finance />} />
              <Route path="/calendario"   element={<Calendar />} />
              <Route path="/clientes"     element={<Clients />} />
              <Route path="/cobrancas"    element={<Cobrancas />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  )
}
