import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Users, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { formatBRL } from '../lib/calendarEvents'

const CARDS = [
  {
    key: 'entradas',
    label: 'A Receber',
    sub: 'Este mês',
    icon: TrendingUp,
    arrow: ArrowUpRight,
    accent: '#22c55e',
    dimBg: 'rgba(34,197,94,0.06)',
    dimBorder: 'rgba(34,197,94,0.18)',
  },
  {
    key: 'saidas',
    label: 'A Pagar',
    sub: 'Este mês',
    icon: TrendingDown,
    arrow: ArrowDownRight,
    accent: '#ef4444',
    dimBg: 'rgba(239,68,68,0.06)',
    dimBorder: 'rgba(239,68,68,0.18)',
  },
  {
    key: 'saldo',
    label: 'Saldo Projetado',
    sub: 'Entradas − Saídas',
    icon: TrendingUp,
    arrow: ArrowUpRight,
    accent: '#F4C430',
    dimBg: 'rgba(244,196,48,0.07)',
    dimBorder: 'rgba(244,196,48,0.22)',
  },
  {
    key: 'funcionarios',
    label: 'Colaboradores',
    sub: 'Ativos',
    icon: Users,
    arrow: ArrowUpRight,
    accent: '#C8C8C8',
    dimBg: 'rgba(200,200,200,0.05)',
    dimBorder: 'rgba(200,200,200,0.15)',
  },
]

export default function Dashboard() {
  const [kpis, setKpis]   = useState({ entradas: 0, saidas: 0, saldo: 0, funcionarios: 0, atrasados: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
      const now   = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
      const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10)

      const [rec, gas, func, atras] = await Promise.all([
        supabase.from('recebimentos').select('valor').gte('data_vencimento', start).lte('data_vencimento', end).eq('status', 'pendente'),
        supabase.from('gastos').select('valor').gte('data_vencimento', start).lte('data_vencimento', end).eq('status', 'pendente'),
        supabase.from('funcionarios').select('id', { count: 'exact' }).eq('ativo', true),
        supabase.from('recebimentos').select('id', { count: 'exact' }).eq('status', 'atrasado'),
      ])

      if (rec.error)  console.error('[Dashboard] recebimentos:', rec.error.message)
      if (gas.error)  console.error('[Dashboard] gastos:',       gas.error.message)
      if (func.error) console.error('[Dashboard] funcionarios:', func.error.message)
      if (atras.error) console.error('[Dashboard] atrasados:',   atras.error.message)

      const entradas = rec.data?.reduce((s, r) => s + (r.valor ?? 0), 0) ?? 0
      const saidas   = gas.data?.reduce((s, r) => s + (r.valor ?? 0), 0) ?? 0
      setKpis({ entradas, saidas, saldo: entradas - saidas, funcionarios: func.count ?? 0, atrasados: atras.count ?? 0 })
      } catch (err) {
        console.error('[Dashboard] load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Greeting */}
      <div>
        <p style={{ fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,196,48,0.5)', marginBottom: 6 }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.75rem)', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
          Bem-vindo de volta
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'rgba(200,200,200,0.4)', marginTop: 4 }}>
          SEV7N Company — resumo financeiro do período.
        </p>
      </div>

      {/* KPIs */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass h-32 sm:h-36 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {CARDS.map(({ key, label, sub, icon: Icon, arrow: Arrow, accent, dimBg, dimBorder }) => (
            <div
              key={key}
              className="glass glass-hover p-4 sm:p-5 flex flex-col gap-3 sm:gap-4"
              style={{ background: dimBg, borderColor: dimBorder }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                  width: 30, height: 30,
                  borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${accent}18`,
                  border: `1px solid ${accent}30`,
                }}>
                  <Icon size={13} style={{ color: accent }} />
                </div>
                <Arrow size={13} style={{ color: accent, opacity: 0.6 }} />
              </div>
              <div>
                <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.7rem)', fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                  {key === 'funcionarios' ? kpis[key] : formatBRL(kpis[key])}
                </p>
                <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginTop: 5, fontWeight: 600, letterSpacing: '0.04em' }}>{label}</p>
                <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alert */}
      {kpis.atrasados > 0 && (
        <div className="glass flex items-center gap-3 px-4 sm:px-5 py-4"
          style={{ borderColor: 'rgba(244,196,48,0.3)', background: 'rgba(244,196,48,0.06)' }}>
          <AlertTriangle size={17} style={{ color: '#F4C430', flexShrink: 0 }} />
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
            <strong style={{ color: '#F4C430' }}>{kpis.atrasados} recebimento(s)</strong> em atraso. Verifique o calendário.
          </p>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Taxa de Saída',          value: kpis.entradas > 0 ? `${Math.round((kpis.saidas / kpis.entradas) * 100)}%` : '—', desc: 'Saídas / Entradas' },
          { label: 'Saldo Líquido',          value: formatBRL(Math.abs(kpis.saldo)), desc: kpis.saldo >= 0 ? 'Positivo este mês' : 'Negativo este mês' },
          { label: 'Média por Colaborador',  value: kpis.funcionarios > 0 ? formatBRL(kpis.saidas / kpis.funcionarios) : '—', desc: 'Custo médio mensal' },
        ].map(({ label, value, desc }) => (
          <div key={label} className="glass p-4" style={{ borderColor: 'rgba(244,196,48,0.1)' }}>
            <p style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,196,48,0.5)', marginBottom: 6 }}>{label}</p>
            <p className="grad-text" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.35rem)', fontWeight: 800 }}>{value}</p>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
