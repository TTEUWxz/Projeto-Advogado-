import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'

const ToastContext = createContext(null)
let _counter = 0

const ICONS = {
  success: <CheckCircle size={15} style={{ color: '#4ade80', flexShrink: 0 }} />,
  error:   <XCircle    size={15} style={{ color: '#f87171', flexShrink: 0 }} />,
  warning: <AlertTriangle size={15} style={{ color: '#F4C430', flexShrink: 0 }} />,
}

const BORDER = { success: 'rgba(74,222,128,0.25)', error: 'rgba(248,113,113,0.25)', warning: 'rgba(244,196,48,0.3)' }

function ToastItem({ toast, onRemove }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '12px 14px', borderRadius: 10, minWidth: 260, maxWidth: 340,
        background: 'rgba(18,18,18,0.97)',
        border: `1px solid ${BORDER[toast.type] ?? BORDER.success}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(16px)',
        animation: 'slideIn 0.2s ease',
      }}
    >
      {ICONS[toast.type]}
      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.82)', flex: 1, lineHeight: 1.4 }}>{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
        <X size={13} style={{ color: 'rgba(255,255,255,0.3)' }} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++_counter
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration)
  }, [])

  const removeToast = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Portal */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999 }}>
        {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={removeToast} />)}
      </div>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
