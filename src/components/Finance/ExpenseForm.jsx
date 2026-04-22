import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../context/ToastContext'

const INITIAL = { categoria_id: '', descricao: '', valor: '', data_vencimento: '', recorrente: false, recorrencia: 'mensal' }

const inputStyle = {
  width: '100%', borderRadius: 8, padding: '9px 13px', fontSize: '0.82rem',
  color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)', outline: 'none',
}

const labelStyle = {
  display: 'block', fontSize: '0.68rem', fontWeight: 600,
  letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.35)', marginBottom: 6,
}

export default function ExpenseForm({ onClose, onSaved }) {
  const [form, setForm]   = useState(INITIAL)
  const [cats, setCats]   = useState([])
  const [saving, setSaving] = useState(false)
  const { toast }         = useToast()

  useEffect(() => {
    supabase.from('categorias_gasto').select('*').order('nome')
      .then(({ data, error }) => {
        if (error) { toast(error.message, 'error'); return }
        setCats(data ?? [])
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const set = f => e => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(p => ({ ...p, [f]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true)
    const { error } = await supabase.from('gastos').insert({
      ...form, valor: parseFloat(form.valor),
      recorrencia: form.recorrente ? form.recorrencia : null,
    })
    setSaving(false)
    if (error) { toast(error.message, 'error'); return }
    toast('Gasto registrado com sucesso!', 'success')
    onSaved()
  }

  return (
    <div className="glass p-5 sm:p-6" style={{ borderColor: 'rgba(244,196,48,0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,196,48,0.5)', marginBottom: 3 }}>Cadastro</p>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Novo Gasto</h3>
        </div>
        <button onClick={onClose} style={{ padding: 5, borderRadius: 7, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer' }}>
          <X size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label style={labelStyle}>Categoria *</label>
          <select value={form.categoria_id} onChange={set('categoria_id')} required style={{ ...inputStyle, colorScheme: 'dark' }}>
            <option value="">Selecione…</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.nome} ({c.tipo})</option>)}
          </select>
        </div>

        <Field label="Descrição *"  value={form.descricao}       onChange={set('descricao')}       required placeholder="Ex: Conta de luz" />
        <Field label="Valor (R$) *" type="number" step="0.01" value={form.valor} onChange={set('valor')} required placeholder="0,00" />
        <Field label="Vencimento *" type="date"   value={form.data_vencimento} onChange={set('data_vencimento')} required />

        <div className="col-span-1 sm:col-span-2 flex flex-wrap items-center gap-3 sm:gap-4">
          <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer' }}>
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, recorrente: !p.recorrente }))}
              style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: form.recorrente ? '#F4C430' : 'rgba(255,255,255,0.06)',
                border: `1.5px solid ${form.recorrente ? '#F4C430' : 'rgba(255,255,255,0.12)'}`,
                cursor: 'pointer',
              }}
            >
              {form.recorrente && <span style={{ fontSize: 9, fontWeight: 900, color: '#0a0a0a' }}>✓</span>}
            </button>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>Gasto recorrente</span>
          </label>
          {form.recorrente && (
            <select value={form.recorrencia} onChange={set('recorrencia')} style={{ ...inputStyle, width: 'auto', minWidth: 120, colorScheme: 'dark' }}>
              <option value="mensal">Mensal</option>
              <option value="semanal">Semanal</option>
              <option value="anual">Anual</option>
            </select>
          )}
        </div>

        <div className="col-span-1 sm:col-span-2 flex justify-end gap-2.5 pt-2">
          <button type="button" onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: 8, fontSize: '0.8rem', background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-grad" style={{ padding: '8px 20px', fontSize: '0.8rem', opacity: saving ? 0.5 : 1 }}>
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, ...props }) {
  const s = {
    width: '100%', borderRadius: 8, padding: '9px 13px', fontSize: '0.82rem',
    color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', outline: 'none',
  }
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>{label}</label>
      <input {...props} style={s} />
    </div>
  )
}
