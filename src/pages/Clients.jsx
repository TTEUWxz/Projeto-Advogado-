import { useEffect, useState } from 'react'
import { Plus, Users, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatBRL } from '../lib/calendarEvents'
import { useToast } from '../context/ToastContext'
import ClientForm from '../components/Clients/ClientForm'

const badge = (bg, color, border, text) => (
  <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '3px 10px', borderRadius: 6, background: bg, color, border: `1px solid ${border}`, whiteSpace: 'nowrap' }}>{text}</span>
)

export default function Clients() {
  const [clients, setClients]   = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const { toast }               = useToast()

  async function load() {
    const { data, error } = await supabase.from('clientes').select('*').order('nome')
    if (error) { toast(error.message, 'error'); return }
    setClients(data ?? [])
    setFiltered(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(clients.filter(c =>
      c.nome.toLowerCase().includes(q) ||
      (c.cnpj_cpf ?? '').includes(q) ||
      (c.email ?? '').toLowerCase().includes(q)
    ))
  }, [search, clients])

  async function toggleActive(client) {
    const { error } = await supabase.from('clientes').update({ ativo: !client.ativo }).eq('id', client.id)
    if (error) { toast(error.message, 'error'); return }
    toast(client.ativo ? 'Cliente desativado.' : 'Cliente ativado!', client.ativo ? 'warning' : 'success')
    load()
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p style={{ fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,196,48,0.5)', marginBottom: 4 }}>Módulo</p>
          <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, color: '#fff' }}>Clientes</h2>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-grad flex items-center gap-2 px-4 py-2.5 text-sm self-start sm:self-auto">
          <Plus size={14} /> Novo Cliente
        </button>
      </div>

      {showForm && <ClientForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load() }} />}

      {/* Search */}
      {clients.length > 0 && (
        <div style={{ position: 'relative' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, CPF/CNPJ ou e-mail…"
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
      ) : clients.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center py-20 gap-3">
          <Users size={34} style={{ color: 'rgba(244,196,48,0.18)' }} />
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>Nenhum cliente cadastrado.</p>
          <button onClick={() => setShowForm(true)} className="btn-grad px-4 py-2 text-xs mt-1">Cadastrar primeiro</button>
        </div>
      ) : (
        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse', minWidth: 640 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(244,196,48,0.1)' }}>
                  {['Nome', 'CPF/CNPJ', 'Telefone', 'Venc.', 'Contrato', 'Recorrente', 'Status', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(244,196,48,0.45)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="dark-row">
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>{c.nome}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{c.cnpj_cpf ?? '—'}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>{c.telefone ?? '—'}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>{c.dia_vencimento ? `Dia ${c.dia_vencimento}` : '—'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>{c.valor_contrato ? formatBRL(c.valor_contrato) : '—'}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      {c.recorrente
                        ? badge('rgba(244,196,48,0.08)', '#F4C430', 'rgba(244,196,48,0.2)', 'Sim')
                        : badge('rgba(255,255,255,0.04)', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0.07)', 'Não')
                      }
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      {c.ativo
                        ? badge('rgba(34,197,94,0.08)', '#4ade80', 'rgba(34,197,94,0.2)', 'Ativo')
                        : badge('rgba(255,255,255,0.04)', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0.07)', 'Inativo')
                      }
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => toggleActive(c)}
                        style={{ fontSize: '0.72rem', fontWeight: 600, color: c.ativo ? 'rgba(248,113,113,0.7)' : '#F4C430', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        {c.ativo ? 'Desativar' : 'Ativar'} →
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: '32px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.82rem' }}>Nenhum resultado para "{search}"</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
