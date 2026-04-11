import { useState, useEffect } from 'react'
import { X, Calendar, DollarSign } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../context/ToastContext'
import { formatBRL } from '../../lib/calendarEvents'

export default function WorkDayModal({ employee, onClose }) {
  const [dias, setDias]       = useState([])
  const [loading, setLoading] = useState(true)
  const [date, setDate]       = useState(new Date().toISOString().slice(0, 10))
  const [turno, setTurno]     = useState('integral')
  const [saving, setSaving]   = useState(false)
  const { toast }             = useToast()

  const currentMonth = new Date().toISOString().slice(0, 7)

  async function loadDias() {
    const { data, error } = await supabase
      .from('registros_trabalho')
      .select('*')
      .eq('funcionario_id', employee.id)
      .gte('data_trabalho', `${currentMonth}-01`)
      .lte('data_trabalho', `${currentMonth}-31`)
      .order('data_trabalho', { ascending: false })
    if (error) { toast(error.message, 'error'); return }
    setDias(data ?? [])
    setLoading(false)
  }
  useEffect(() => { loadDias() }, [employee.id])

  async function register() {
    setSaving(true)
    const { error } = await supabase.from('registros_trabalho').upsert({
      funcionario_id: employee.id,
      data_trabalho: date,
      turno,
    }, { onConflict: 'funcionario_id,data_trabalho' })
    setSaving(false)
    if (error) { toast(error.message, 'error'); return }
    toast(`Dia ${new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')} registrado!`, 'success')
    loadDias()
  }

  async function removeDia(id) {
    const { error } = await supabase.from('registros_trabalho').delete().eq('id', id)
    if (error) { toast(error.message, 'error'); return }
    toast('Registro removido.', 'warning')
    loadDias()
  }

  // Calcular valor estimado do mês
  const valorEstimado = employee.tipo_pagamento === 'diaria'
    ? dias.length * employee.valor_pagamento
    : employee.valor_pagamento

  const TURNO_LABEL = { integral: 'Integral', manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div className="glass p-6" style={{ width: '100%', maxWidth: 520, borderColor: 'rgba(244,196,48,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,196,48,0.5)', marginBottom: 3 }}>Registro de Ponto</p>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{employee.nome}</h3>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
              {employee.cargo ?? 'Sem cargo'} · {employee.tipo_pagamento === 'diaria' ? `${formatBRL(employee.valor_pagamento)}/dia` : `${formatBRL(employee.valor_pagamento)}/mês`}
            </p>
          </div>
          <button onClick={onClose} style={{ padding: 5, borderRadius: 7, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer' }}>
            <X size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </button>
        </div>

        {/* Valor estimado */}
        <div style={{ background: 'rgba(244,196,48,0.07)', border: '1px solid rgba(244,196,48,0.18)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <DollarSign size={16} style={{ color: '#F4C430' }} />
          <div>
            <p style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(244,196,48,0.5)' }}>
              {employee.tipo_pagamento === 'diaria' ? `${dias.length} dia(s) × ${formatBRL(employee.valor_pagamento)}` : 'Salário mensal fixo'}
            </p>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F4C430' }}>{formatBRL(valorEstimado)}</p>
          </div>
        </div>

        {/* Registrar novo dia */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>Registrar Dia</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: 5 }}>DATA</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                style={{ width: '100%', borderRadius: 7, padding: '8px 10px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', outline: 'none', colorScheme: 'dark' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginBottom: 5 }}>TURNO</label>
              <select value={turno} onChange={e => setTurno(e.target.value)}
                style={{ width: '100%', borderRadius: 7, padding: '8px 10px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', outline: 'none', colorScheme: 'dark' }}>
                <option value="integral">Integral</option>
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
              </select>
            </div>
          </div>
          <button onClick={register} disabled={saving} className="btn-grad" style={{ width: '100%', padding: '9px', fontSize: '0.82rem', opacity: saving ? 0.5 : 1 }}>
            {saving ? 'Registrando…' : '+ Registrar Dia'}
          </button>
        </div>

        {/* Lista do mês */}
        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 10 }}>
          Mês Atual — {dias.length} dia(s)
        </p>
        {loading ? <div className="animate-pulse" style={{ height: 60, borderRadius: 8, background: 'rgba(255,255,255,0.04)' }} /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {dias.length === 0 && (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.78rem', padding: '16px 0' }}>Nenhum dia registrado este mês.</p>
            )}
            {dias.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={13} style={{ color: '#F4C430' }} />
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                    {new Date(d.data_trabalho + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', padding: '2px 7px', borderRadius: 4 }}>
                    {TURNO_LABEL[d.turno] ?? d.turno}
                  </span>
                </div>
                {employee.tipo_pagamento === 'diaria' && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F4C430' }}>{formatBRL(employee.valor_pagamento)}</span>
                )}
                <button onClick={() => removeDia(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(248,113,113,0.5)', fontSize: '0.7rem', fontWeight: 600 }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
