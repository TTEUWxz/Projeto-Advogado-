import { useEffect, useState, useCallback, useMemo } from 'react'
import { MessageCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatBRL } from '../lib/calendarEvents'
import { useToast } from '../context/ToastContext'
import { useDebounce } from '../lib/hooks'
import CobrancaModal from '../components/Cobrancas/CobrancaModal'

export default function Cobrancas() {
  const [clientes,   setClientes]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [selected,   setSelected]   = useState(null) // client being charged
  const { toast } = useToast()

  const debouncedSearch = useDebounce(search, 250)

  const load = useCallback(async () => {
    setLoading(true)

    // Fetch all active clients
    const { data: allClients, error: cErr } = await supabase
      .from('clientes')
      .select('*')
      .eq('ativo', true)
      .order('nome')

    if (cErr) { toast(cErr.message, 'error'); setLoading(false); return }

    // Fetch all pending/overdue recebimentos
    const { data: recebimentos, error: rErr } = await supabase
      .from('recebimentos')
      .select('cliente_id, valor, data_vencimento, status')
      .in('status', ['pendente', 'atrasado'])

    if (rErr) { toast(rErr.message, 'error'); setLoading(false); return }

    // Group recebimentos by client
    const map = {}
    for (const r of recebimentos ?? []) {
      if (!map[r.cliente_id]) map[r.cliente_id] = []
      map[r.cliente_id].push(r)
    }

    // Merge — include only clients with pending items OR past due day
    const today = new Date()
    const enriched = (allClients ?? [])
      .map(c => {
        const recs = map[c.id] ?? []
        const totalPendente = recs.reduce((s, r) => s + (r.valor ?? 0), 0)
        const maisAntigo = recs.sort((a, b) => a.data_vencimento.localeCompare(b.data_vencimento))[0]
        const diasAtraso = maisAntigo
          ? Math.max(0, Math.floor((today - new Date(maisAntigo.data_vencimento + 'T00:00:00')) / 86400000))
          : 0
        return { ...c, _recs: recs, _total: totalPendente, _diasAtraso: diasAtraso }
      })
      .filter(c => c._recs.length > 0)  // only clients with actual pending records

    setClientes(enriched)
    setLoading(false)
  }, [toast])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    if (!q) return clientes
    return clientes.filter(c =>
      c.nome.toLowerCase().includes(q) ||
      (c.telefone ?? '').includes(q)
    )
  }, [debouncedSearch, clientes])

  const totalGeral = useMemo(() => clientes.reduce((s, c) => s + c._total, 0), [clientes])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p style={{ fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,196,48,0.5)', marginBottom: 4 }}>Módulo</p>
          <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#fff' }}>Cobranças</h2>
        </div>

        {!loading && clientes.length > 0 && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '8px 16px', textAlign: 'right' }}>
            <p style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(248,113,113,0.6)', marginBottom: 2 }}>Total em Aberto</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f87171' }}>{formatBRL(totalGeral)}</p>
          </div>
        )}
      </div>

      {/* Search */}
      {!loading && clientes.length > 0 && (
        <div style={{ position: 'relative' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou telefone…"
            style={{
              width: '100%', borderRadius: 10, padding: '10px 14px 10px 38px',
              fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', outline: 'none',
            }}
          />
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>🔍</span>
        </div>
      )}

      {loading ? (
        <div className="glass h-48 animate-pulse" />
      ) : clientes.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center py-20 gap-3">
          <AlertCircle size={34} style={{ color: 'rgba(34,197,94,0.3)' }} />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', fontWeight: 600 }}>Nenhuma pendência encontrada!</p>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem' }}>Todos os clientes estão em dia.</p>
        </div>
      ) : (
        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse', minWidth: 580 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(244,196,48,0.1)' }}>
                  {['Cliente', 'Telefone', 'Pendências', 'Valor em Aberto', 'Atraso', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(244,196,48,0.45)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="dark-row">
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>{c.nome}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>{c.telefone ?? '—'}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                        {c._recs.length} {c._recs.length === 1 ? 'parcela' : 'parcelas'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800, color: '#f87171', whiteSpace: 'nowrap' }}>{formatBRL(c._total)}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      {c._diasAtraso > 0 ? (
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                          {c._diasAtraso} dias
                        </span>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem' }}>A vencer</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => setSelected(c)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          fontSize: '0.72rem', fontWeight: 700, padding: '6px 12px', borderRadius: 8,
                          background: 'linear-gradient(135deg, #25D366, #128C7E)',
                          border: 'none', color: '#fff', cursor: 'pointer',
                        }}
                      >
                        <MessageCircle size={12} /> Cobrar
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && search && (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.82rem' }}>
                      Nenhum resultado para "{search}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <CobrancaModal client={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
