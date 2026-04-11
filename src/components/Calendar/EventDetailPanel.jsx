import { X } from 'lucide-react'
import { EVENT_COLORS, formatBRL } from '../../lib/calendarEvents'

const TYPE_LABEL = {
  escala_trabalho:       'Escala de Trabalho',
  pagamento_funcionario: 'Pagamento Funcionário',
  recebimento_cliente:   'Recebimento Cliente',
  saida_gasto:           'Saída / Gasto',
}

const STATUS_STYLE = {
  pendente:  { bg: 'rgba(244,196,48,0.10)', color: '#F4C430',             border: 'rgba(244,196,48,0.25)' },
  pago:      { bg: 'rgba(34,197,94,0.08)',  color: '#4ade80',             border: 'rgba(34,197,94,0.2)'  },
  recebido:  { bg: 'rgba(34,197,94,0.08)',  color: '#4ade80',             border: 'rgba(34,197,94,0.2)'  },
  atrasado:  { bg: 'rgba(239,68,68,0.08)',  color: '#f87171',             border: 'rgba(239,68,68,0.2)'  },
  cancelado: { bg: 'rgba(255,255,255,0.04)',color: 'rgba(255,255,255,0.3)', border: 'rgba(255,255,255,0.08)' },
  ativo:     { bg: 'rgba(244,196,48,0.08)', color: '#F4C430',             border: 'rgba(244,196,48,0.2)' },
}

export default function EventDetailPanel({ event, onClose }) {
  const props  = event.extendedProps ?? {}
  const colors = EVENT_COLORS[props.type] ?? {}
  const s      = STATUS_STYLE[props.status] ?? STATUS_STYLE.pendente
  const date   = event.start
    ? new Date(event.start).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    : '—'

  return (
    <div className="glass overflow-hidden" style={{ borderColor: 'rgba(244,196,48,0.15)' }}>
      {/* Gold strip header */}
      <div style={{
        padding: '12px 16px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        background: 'rgba(244,196,48,0.06)',
        borderBottom: '1px solid rgba(244,196,48,0.12)',
      }}>
        <div>
          <p style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,196,48,0.6)', marginBottom: 3 }}>
            {TYPE_LABEL[props.type] ?? 'Evento'}
          </p>
          <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{event.title}</p>
        </div>
        <button onClick={onClose} style={{ padding: 4, borderRadius: 6, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', flexShrink: 0, marginLeft: 8 }}>
          <X size={12} style={{ color: 'rgba(255,255,255,0.35)' }} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        <Row label="Data"        value={date} />
        {props.responsavel && <Row label="Responsável"  value={props.responsavel} />}
        {props.turno       && <Row label="Turno"        value={props.turno} />}
        {props.telefone    && <Row label="Telefone"     value={props.telefone} />}
        {props.categoria   && <Row label="Categoria"    value={props.categoria} />}
        {props.valor != null && (
          <Row label="Valor" value={<strong style={{ color: '#F4C430', fontWeight: 700 }}>{formatBRL(props.valor)}</strong>} />
        )}
        {props.status && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', width: 72, flexShrink: 0 }}>Status</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 9px', borderRadius: 5, textTransform: 'capitalize', background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
              {props.status}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', width: 72, flexShrink: 0, paddingTop: 1 }}>{label}</span>
      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>{value}</span>
    </div>
  )
}
