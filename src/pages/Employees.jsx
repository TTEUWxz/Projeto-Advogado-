import { useEffect, useState } from 'react'
import { Plus, UserCheck, UserX, Users, CalendarDays } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatBRL } from '../lib/calendarEvents'
import { useToast } from '../context/ToastContext'
import EmployeeForm from '../components/Employees/EmployeeForm'
import WorkDayModal from '../components/Employees/WorkDayModal'

const TIPO = { diaria: 'Diária', semanal: 'Semanal', mensal: 'Mensal' }
const badge = (bg, color, border) => ({ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.04em', padding: '3px 10px', borderRadius: 6, background: bg, color, border: `1px solid ${border}` })

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [filtered,  setFiltered]  = useState([])
  const [search,    setSearch]    = useState('')
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [workEmp,   setWorkEmp]   = useState(null)
  const { toast } = useToast()

  async function load() {
    const { data, error } = await supabase.from('funcionarios').select('*').order('nome')
    if (error) { toast(error.message, 'error'); return }
    setEmployees(data ?? [])
    setFiltered(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(employees.filter(e =>
      e.nome.toLowerCase().includes(q) ||
      (e.cargo ?? '').toLowerCase().includes(q) ||
      (e.cpf ?? '').includes(q)
    ))
  }, [search, employees])

  return (
    <div className="space-y-6">
      {workEmp && <WorkDayModal employee={workEmp} onClose={() => setWorkEmp(null)} />}

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,196,48,0.5)', marginBottom: 4 }}>Módulo</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>Colaboradores</h2>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-grad flex items-center gap-2 px-4 py-2.5 text-sm">
          <Plus size={14} /> Novo Funcionário
        </button>
      </div>

      {showForm && <EmployeeForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load() }} />}

      {employees.length > 0 && (
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome, cargo ou CPF…"
          style={{ width: '100%', borderRadius: 10, padding: '10px 14px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', outline: 'none' }}
        />
      )}

      {loading ? (
        <div className="glass h-48 animate-pulse" />
      ) : employees.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center py-20 gap-3">
          <Users size={34} style={{ color: 'rgba(244,196,48,0.18)' }} />
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>Nenhum colaborador cadastrado.</p>
          <button onClick={() => setShowForm(true)} className="btn-grad px-4 py-2 text-xs mt-1">Cadastrar primeiro</button>
        </div>
      ) : (
        <div className="glass overflow-hidden">
          <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(244,196,48,0.1)' }}>
                {['Nome', 'Cargo', 'Tipo', 'Valor', 'Admissão', 'Status', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(244,196,48,0.45)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id} className="dark-row">
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: '#fff' }}>{emp.nome}</td>
                  <td style={{ padding: '14px 20px', color: 'rgba(255,255,255,0.35)' }}>{emp.cargo ?? '—'}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={badge('rgba(244,196,48,0.08)', '#F4C430', 'rgba(244,196,48,0.2)')}>{TIPO[emp.tipo_pagamento]}</span>
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{formatBRL(emp.valor_pagamento)}</td>
                  <td style={{ padding: '14px 20px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>{new Date(emp.data_admissao).toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding: '14px 20px' }}>
                    {emp.ativo
                      ? <span style={badge('rgba(34,197,94,0.08)', '#4ade80', 'rgba(34,197,94,0.2)')}><UserCheck size={10} />Ativo</span>
                      : <span style={badge('rgba(255,255,255,0.04)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.08)')}><UserX size={10} />Inativo</span>
                    }
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button
                      onClick={() => setWorkEmp(emp)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', fontWeight: 600, color: '#F4C430', background: 'rgba(244,196,48,0.08)', border: '1px solid rgba(244,196,48,0.18)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}
                    >
                      <CalendarDays size={11} /> Ponto
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '28px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.82rem' }}>Nenhum resultado para "{search}"</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
