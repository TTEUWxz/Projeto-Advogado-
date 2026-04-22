import { useState, useEffect } from 'react'
import { X, Copy, MessageCircle, Check, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { formatBRL } from '../../lib/calendarEvents'
import { useToast } from '../../context/ToastContext'

// ── Message templates ─────────────────────────────────────────────────────────
const buildMessage = (tipo, client, valor, vencimento, diasAtraso) => {
  const nome = client.nome?.split(' ')[0] ?? client.nome // first name only

  if (tipo === 'amigavel') return `Olá, *${nome}*! 👋

Tudo bem? Aqui é da equipe *Batista & Calzolari Advogados Associados*.

Passamos para lembrar sobre um pagamento em aberto referente aos nossos serviços:

💼 *Serviço:* Honorários Advocatícios
💰 *Valor:* ${valor}
📅 *Vencimento:* ${vencimento}${diasAtraso > 0 ? `\n⚠️ *Em atraso:* ${diasAtraso} dia(s)` : ''}

Para regularizar ou tirar dúvidas, é só responder aqui! Estamos à disposição 😊

_Batista & Calzolari Advogados Associados_`

  if (tipo === 'formal') return `Prezado(a) *${client.nome}*,

Vimos por meio desta mensagem comunicar a existência de débito em aberto em seu nome:

• *Serviço:* Honorários Advocatícios
• *Valor:* ${valor}
• *Vencimento:* ${vencimento}${diasAtraso > 0 ? `\n• *Dias em atraso:* ${diasAtraso} dia(s)` : ''}

Solicitamos a regularização no prazo de *5 (cinco) dias úteis*, a fim de evitar medidas administrativas adicionais.

Para negociação ou dúvidas, entre em contato conosco.

Atenciosamente,
*Batista & Calzolari Advogados Associados*`

  // urgente
  return `⚠️ *AVISO DE COBRANÇA* ⚠️

*${client.nome}*, identificamos que seu pagamento encontra-se *EM ATRASO*.

━━━━━━━━━━━━━━━
❌ *Valor em aberto:* ${valor}
📅 *Vencimento:* ${vencimento}
🔴 *Dias em atraso:* ${diasAtraso} dia(s)
━━━━━━━━━━━━━━━

*Regularize para evitar:*
⚖️ Encargos e juros por atraso
🚫 Suspensão dos serviços
📋 Medidas judiciais

Entre em contato *imediatamente* para resolver essa situação.

*Batista & Calzolari Advogados Associados*`
}

const TIPOS = [
  { id: 'amigavel', label: '😊 Amigável', desc: 'Tom leve e cordial' },
  { id: 'formal',   label: '📋 Formal',   desc: 'Tom profissional' },
  { id: 'urgente',  label: '🚨 Urgente',  desc: 'Tom de alerta' },
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function CobrancaModal({ client, onClose }) {
  const [tipo,       setTipo]       = useState('amigavel')
  const [pendentes,  setPendentes]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [copied,     setCopied]     = useState(false)
  const [editavel,   setEditavel]   = useState('')
  const { toast } = useToast()

  // Close on ESC
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  // Fetch pending recebimentos for this client
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('recebimentos')
        .select('*')
        .eq('cliente_id', client.id)
        .in('status', ['pendente', 'atrasado'])
        .order('data_vencimento')
      setPendentes(data ?? [])
      setLoading(false)
    }
    load()
  }, [client.id])

  // Compute totals and build message
  const totalValor = pendentes.length > 0
    ? pendentes.reduce((s, r) => s + (r.valor ?? 0), 0)
    : (client.valor_contrato ?? 0)

  const vencimento = pendentes.length > 0
    ? new Date(pendentes[0].data_vencimento + 'T00:00:00').toLocaleDateString('pt-BR')
    : client.dia_vencimento ? `Dia ${client.dia_vencimento} do mês` : 'Não informado'

  const diasAtraso = pendentes.length > 0
    ? Math.max(0, Math.floor((new Date() - new Date(pendentes[0].data_vencimento + 'T00:00:00')) / 86400000))
    : 0

  const msgGerada = buildMessage(tipo, client, formatBRL(totalValor), vencimento, diasAtraso)

  // Reset editable when template or client changes
  useEffect(() => { setEditavel(msgGerada) }, [tipo, client.id, pendentes.length])

  function copiar() {
    navigator.clipboard.writeText(editavel)
    setCopied(true)
    toast('Mensagem copiada!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  function abrirWhatsApp() {
    const tel = client.telefone?.replace(/\D/g, '')
    if (!tel) { toast('Cliente sem telefone cadastrado.', 'warning'); return }
    const url = `https://wa.me/55${tel}?text=${encodeURIComponent(editavel)}`
    window.open(url, '_blank')
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="glass"
        style={{ width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto', borderColor: 'rgba(244,196,48,0.2)', padding: 'clamp(16px,4vw,28px)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,196,48,0.55)', marginBottom: 3 }}>Gerador de Cobrança</p>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{client.nome}</h3>
            {client.telefone && (
              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>📞 {client.telefone}</p>
            )}
          </div>
          <button onClick={onClose} style={{ padding: 5, borderRadius: 7, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <X size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </button>
        </div>

        {/* Summary */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 120, background: 'rgba(244,196,48,0.07)', border: '1px solid rgba(244,196,48,0.18)', borderRadius: 10, padding: '10px 14px' }}>
            <p style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(244,196,48,0.5)', marginBottom: 4 }}>Valor em Aberto</p>
            <p style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F4C430' }}>{formatBRL(totalValor)}</p>
          </div>
          <div style={{ flex: 1, minWidth: 120, background: diasAtraso > 0 ? 'rgba(239,68,68,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${diasAtraso > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10, padding: '10px 14px' }}>
            <p style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Dias em Atraso</p>
            <p style={{ fontSize: '1.15rem', fontWeight: 800, color: diasAtraso > 0 ? '#f87171' : 'rgba(255,255,255,0.5)' }}>
              {loading ? '…' : diasAtraso > 0 ? `${diasAtraso} dias` : 'Em dia'}
            </p>
          </div>
          <div style={{ flex: 1, minWidth: 120, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 14px' }}>
            <p style={{ fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Pendências</p>
            <p style={{ fontSize: '1.15rem', fontWeight: 800, color: 'rgba(255,255,255,0.6)' }}>
              {loading ? '…' : `${pendentes.length} ${pendentes.length === 1 ? 'parcela' : 'parcelas'}`}
            </p>
          </div>
        </div>

        {/* Template selector */}
        <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 10 }}>Tom da mensagem</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {TIPOS.map(t => (
            <button
              key={t.id}
              onClick={() => setTipo(t.id)}
              style={{
                flex: 1, minWidth: 100, padding: '8px 10px', borderRadius: 9, border: `1px solid ${tipo === t.id ? 'rgba(244,196,48,0.5)' : 'rgba(255,255,255,0.08)'}`,
                background: tipo === t.id ? 'rgba(244,196,48,0.1)' : 'rgba(255,255,255,0.03)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: tipo === t.id ? '#F4C430' : 'rgba(255,255,255,0.45)' }}>{t.label}</p>
              <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>{t.desc}</p>
            </button>
          ))}
        </div>

        {/* Editable message */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <p style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)' }}>Mensagem (editável)</p>
            <button onClick={() => setEditavel(msgGerada)} title="Restaurar mensagem original" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.65rem' }}>
              <RefreshCw size={11} /> Restaurar
            </button>
          </div>
          <textarea
            value={editavel}
            onChange={e => setEditavel(e.target.value)}
            rows={12}
            style={{
              width: '100%', borderRadius: 10, padding: '14px', fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.78)', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)', outline: 'none',
              lineHeight: 1.7, resize: 'vertical', fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={copiar}
            style={{
              flex: 1, minWidth: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              padding: '11px 16px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.07)',
              border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
              color: copied ? '#4ade80' : 'rgba(255,255,255,0.6)',
              transition: 'all 0.2s',
            }}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>

          <button
            onClick={abrirWhatsApp}
            style={{
              flex: 2, minWidth: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px 20px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              border: 'none', color: '#fff',
            }}
          >
            <MessageCircle size={16} />
            Enviar via WhatsApp
          </button>
        </div>

        {!client.telefone && (
          <p style={{ fontSize: '0.68rem', color: 'rgba(248,113,113,0.6)', marginTop: 10, textAlign: 'center' }}>
            ⚠️ Cliente sem telefone — WhatsApp indisponível. Cadastre o número para ativar.
          </p>
        )}
      </div>
    </div>
  )
}
