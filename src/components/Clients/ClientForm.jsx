import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../context/ToastContext'

const INITIAL = { nome: '', cnpj_cpf: '', telefone: '', email: '', dia_vencimento: '', valor_contrato: '', recorrente: false }

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

export default function ClientForm({ onClose, onSaved }) {
  const [form, setForm]     = useState(INITIAL)
  const [saving, setSaving] = useState(false)
  const { toast }           = useToast()

  const set = f => e => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(p => ({ ...p, [f]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('clientes').insert({
      ...form,
      dia_vencimento: form.dia_vencimento ? parseInt(form.dia_vencimento) : null,
      valor_contrato: form.valor_contrato  ? parseFloat(form.valor_contrato) : null,
    })
    setSaving(false)
    if (error) { toast(error.message, 'error'); return }
    toast('Cliente cadastrado com sucesso!', 'success')
    onSaved()
  }

  return (
    <div className="glass p-6" style={{ borderColor: 'rgba(244,196,48,0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,196,48,0.5)', marginBottom: 3 }}>Cadastro</p>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Novo Cliente</h3>
        </div>
        <button onClick={onClose} style={{ padding: 5, borderRadius: 7, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer' }}>
          <X size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Nome *"         value={form.nome}           onChange={set('nome')}           required placeholder="Nome ou razão social" />
        <Field label="CPF / CNPJ"     value={form.cnpj_cpf}       onChange={set('cnpj_cpf')}       placeholder="000.000.000-00" />
        <Field label="Telefone"       value={form.telefone}       onChange={set('telefone')}       placeholder="(00) 00000-0000" />
        <Field label="E-mail"         value={form.email}          onChange={set('email')}   type="email" placeholder="email@exemplo.com" />
        <Field label="Dia de Venc."   value={form.dia_vencimento} onChange={set('dia_vencimento')} type="number" min="1" max="31" placeholder="Ex: 10" />
        <Field label="Valor do Contrato (R$)" value={form.valor_contrato} onChange={set('valor_contrato')} type="number" step="0.01" placeholder="0,00" />

        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10 }}>
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
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>Pagamento recorrente mensal</span>
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 6 }}>
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
  const s = { width: '100%', borderRadius: 8, padding: '9px 13px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', outline: 'none' }
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>{label}</label>
      <input {...props} style={s} />
    </div>
  )
}
