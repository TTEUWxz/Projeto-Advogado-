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
import Login from './pages/Login'

function AppShell() {
  const [session, setSession]   = useState(undefined) // undefined = loading
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    getSession().then(s => setSession(s ?? null))
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s ?? null))
      return () => subscription.unsubscribe()
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
      <div className="blob w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] top-[-120px] left-[-80px]"
           style={{ background: 'rgba(244,196,48,0.05)' }} />
      <div className="blob w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] bottom-[-80px] right-[-60px]"
           style={{ background: 'rgba(200,200,200,0.03)' }} />

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
