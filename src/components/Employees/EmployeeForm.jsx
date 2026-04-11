import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../context/ToastContext'

const INITIAL = { nome: '', cpf: '', telefone: '', cargo: '', tipo_pagamento: 'diaria', valor_pagamento: '', dia_pagamento: '', data_admissao: '' }

const inputStyle = {
  width: '100%', borderRadius: 8, padding: '9px 13px', fontSize: '0.82rem',
  color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)', outline: 'none', transition: 'border-color 0.2s',
}

export default function EmployeeForm({ onClose, onSaved }) {
  const [form, setForm]     = useState(INITIAL)
  const [saving, setSaving] = useState(false)
  const { toast }           = useToast()

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true)
    const { error } = await supabase.from('funcionarios').insert({
      ...form,
      valor_pagamento: parseFloat(form.valor_pagamento),
      dia_pagamento: form.dia_pagamento ? parseInt(form.dia_pagamento) : null,
    })
    setSaving(false)
    if (error) { toast(error.message, 'error'); return }
    toast('Funcionário cadastrado com sucesso!', 'success')
    onSaved()
  }

  return (
    <div className="glass p-5 sm:p-6" style={{ borderColor: 'rgba(244,196,48,0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,196,48,0.5)', marginBottom: 3 }}>Cadastro</p>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Novo Funcionário</h3>
        </div>
        <button onClick={onClose} style={{ padding: 5, borderRadius: 7, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer' }}>
          <X size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Field label="Nome *"           value={form.nome}           onChange={set('nome')}           required placeholder="Nome completo" />
        <Field label="Cargo"            value={form.cargo}          onChange={set('cargo')}          placeholder="Ex: Assistente" />
        <Field label="CPF"              value={form.cpf}            onChange={set('cpf')}            placeholder="000.000.000-00" />
        <Field label="Telefone"         value={form.telefone}       onChange={set('telefone')}       placeholder="(00) 00000-0000" />
        <Field label="Data de Admissão *" type="date" value={form.data_admissao} onChange={set('data_admissao')} required />

        <div>
          <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
            Tipo de Pagamento *
          </label>
          <select value={form.tipo_pagamento} onChange={set('tipo_pagamento')} style={{ ...inputStyle, colorScheme: 'dark' }}>
            <option value="diaria">Diária</option>
            <option value="semanal">Semanal</option>
            <option value="mensal">Mensal</option>
          </select>
        </div>

        <Field label="Valor (R$) *" type="number" step="0.01" value={form.valor_pagamento} onChange={set('valor_pagamento')} required placeholder="0,00" />
        {form.tipo_pagamento === 'mensal' && (
          <Field label="Dia de Pagamento" type="number" min="1" max="31" value={form.dia_pagamento} onChange={set('dia_pagamento')} placeholder="Ex: 5" />
        )}

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
