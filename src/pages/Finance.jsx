import { useEffect, useState, useCallback, useMemo } from 'react'
import { Plus, Wallet } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatBRL } from '../lib/calendarEvents'
import { useToast } from '../context/ToastContext'
import { useDebounce } from '../lib/hooks'
import ExpenseForm from '../components/Finance/ExpenseForm'

const STATUS = {
  pendente:  { bg: 'rgba(244,196,48,0.08)', color: '#F4C430',                border: 'rgba(244,196,48,0.2)' },
  pago:      { bg: 'rgba(34,197,94,0.08)',  color: '#4ade80',                border: 'rgba(34,197,94,0.2)'  },
  atrasado:  { bg: 'rgba(239,68,68,0.08)',  color: '#f87171',                border: 'rgba(239,68,68,0.2)'  },
  cancelado: { bg: 'rgba(255,255,255,0.03)',color: 'rgba(255,255,255,0.25)', border: 'rgba(255,255,255,0.06)' },
}
const badge = (s) => {
  const { bg, color, border } = STATUS[s] ?? STATUS.pendente
  return { fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.04em', padding: '3px 10px', borderRadius: 6, display: 'inline-block', background: bg, color, border: `1px solid ${border}` }
}

export default function Finance() {
  const [gastos,   setGastos]   = useState([])
  const [search,   setSearch]   = useState('')
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()

  const debouncedSearch = useDebounce(search, 250)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('gastos').select('*, categorias_gasto(nome,tipo)').order('data_vencimento')
    if (error) { toast(error.message, 'error'); setLoading(false); return }
    setGastos(data ?? [])
    setLoading(false)
  }, [toast])

  useEffect(() => { load() }, [load])

  // Memoized filtered list
  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    if (!q) return gastos
    return gastos.filter(g =>
      g.descricao.toLowerCase().includes(q) ||
      (g.categorias_gasto?.nome ?? '').toLowerCase().includes(q)
    )
  }, [debouncedSearch, gastos])

  // Memoized total — doesn't recalculate on every render
  const totalPendente = useMemo(
    () => gastos.filter(g => g.status === 'pendente').reduce((s, g) => s + (g.valor ?? 0), 0),
    [gastos]
  )

  async function markPaid(id) {
    const { error } = await supabase.from('gastos').update({ status: 'pago', data_pagamento: new Date().toISOString().slice(0, 10) }).eq('id', id)
    if (error) { toast(error.message, 'error'); return }
    toast('Pagamento confirmado!', 'success')
    load()
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p style={{ fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,196,48,0.5)', marginBottom: 4 }}>Módulo</p>
          <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#fff' }}>Saídas Financeiras</h2>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-grad flex items-center gap-2 px-4 py-2.5 text-sm self-start sm:self-auto">
          <Plus size={14} /> Novo Gasto
        </button>
      </div>

      {/* Summary bar */}
      {!loading && gastos.length > 0 && (
        <div className="glass p-4 flex flex-row flex-wrap items-center gap-4 sm:gap-6" style={{ borderColor: 'rgba(244,196,48,0.12)' }}>
          <div>
            <p style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(244,196,48,0.45)', marginBottom: 4 }}>Total pendente</p>
            <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.35rem)', fontWeight: 800, color: '#F4C430' }}>{formatBRL(totalPendente)}</p>
          </div>
          <div className="hidden sm:block" style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.07)' }} />
          <div>
            <p style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 4 }}>Registros</p>
            <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.35rem)', fontWeight: 800, color: 'rgba(255,255,255,0.7)' }}>{gastos.length}</p>
          </div>
        </div>
      )}

      {showForm && <ExpenseForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load() }} />}

      {gastos.length > 0 && (
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por descrição ou categoria…"
          style={{ width: '100%', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', outline: 'none' }}
        />
      )}

      {loading ? (
        <div className="glass h-48 animate-pulse" />
      ) : gastos.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center py-20 gap-3">
          <Wallet size={34} style={{ color: 'rgba(244,196,48,0.18)' }} />
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>Nenhum gasto cadastrado.</p>
        </div>
      ) : (
        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(244,196,48,0.1)' }}>
                  {['Descrição', 'Categoria', 'Tipo', 'Vencimento', 'Valor', 'Status', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(244,196,48,0.45)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(g => (
                  <tr key={g.id} className="dark-row">
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.descricao}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>{g.categorias_gasto?.nome ?? '—'}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 600, padding: '3px 10px', borderRadius: 6, display: 'inline-block',
                        ...(g.categorias_gasto?.tipo === 'fixo'
                          ? { background: 'rgba(200,200,200,0.07)', color: '#C8C8C8', border: '1px solid rgba(200,200,200,0.15)' }
                          : { background: 'rgba(244,196,48,0.07)', color: '#F4C430', border: '1px solid rgba(244,196,48,0.18)' })
                      }}>
                        {g.categorias_gasto?.tipo === 'fixo' ? 'Fixo' : 'Variável'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
                      {new Date(g.data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>{formatBRL(g.valor)}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={badge(g.status)}>{g.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      {g.status === 'pendente' && (
                        <button onClick={() => markPaid(g.id)}
                          style={{ fontSize: '0.72rem', fontWeight: 600, color: '#F4C430', background: 'none', border: 'none', cursor: 'pointer' }}>
                          Marcar pago →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && search && (
                  <tr><td colSpan={7} style={{ padding: '28px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.82rem' }}>Nenhum resultado para "{search}"</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
