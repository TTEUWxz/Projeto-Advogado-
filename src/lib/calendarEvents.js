import { supabase } from './supabase'

/** Visual config per event type */
export const EVENT_COLORS = {
  escala_trabalho:       { backgroundColor: '#DBEAFE', textColor: '#1E40AF', borderColor: '#3B82F6' },
  pagamento_funcionario: { backgroundColor: '#FEF3C7', textColor: '#92400E', borderColor: '#F59E0B' },
  recebimento_cliente:   { backgroundColor: '#D1FAE5', textColor: '#065F46', borderColor: '#10B981' },
  saida_gasto:           { backgroundColor: '#FEE2E2', textColor: '#991B1B', borderColor: '#EF4444' },
}

/**
 * Fetches all calendar events for a given date range from Supabase
 * and normalises them into FullCalendar EventInput objects.
 */
export async function buildCalendarEvents(startDate, endDate) {
  const events = []

  let escalas, pagamentos, recebimentos, gastos
  try {
    ;[escalas, pagamentos, recebimentos, gastos] = await Promise.all([
    supabase
      .from('registros_trabalho')
      .select('*, funcionarios(nome, telefone)')
      .gte('data_trabalho', startDate)
      .lte('data_trabalho', endDate),

    supabase
      .from('pagamentos_funcionarios')
      .select('*, funcionarios(nome)')
      .gte('periodo_fim', startDate)
      .lte('periodo_fim', endDate),

    supabase
      .from('recebimentos')
      .select('*, clientes(nome, telefone)')
      .gte('data_vencimento', startDate)
      .lte('data_vencimento', endDate),

    supabase
      .from('gastos')
      .select('*, categorias_gasto(nome, icone)')
      .gte('data_vencimento', startDate)
      .lte('data_vencimento', endDate),
    ])
  } catch (err) {
    console.error('[calendarEvents] Query failed:', err)
    return []
  }

  if (escalas.error)     console.error('[calendarEvents] escalas:',     escalas.error.message)
  if (pagamentos.error)  console.error('[calendarEvents] pagamentos:',  pagamentos.error.message)
  if (recebimentos.error) console.error('[calendarEvents] recebimentos:', recebimentos.error.message)
  if (gastos.error)      console.error('[calendarEvents] gastos:',      gastos.error.message)

  escalas.data?.forEach(e => {
    events.push({
      id: `escala-${e.id}`,
      title: `Escala: ${e.funcionarios?.nome ?? '—'}`,
      start: e.data_trabalho,
      allDay: true,
      type: 'escala_trabalho',
      status: 'ativo',
      ...EVENT_COLORS.escala_trabalho,
      extendedProps: {
        type: 'escala_trabalho',
        responsavel: e.funcionarios?.nome,
        telefone: e.funcionarios?.telefone,
        turno: e.turno,
      },
    })
  })

  pagamentos.data?.forEach(p => {
    events.push({
      id: `pgto-func-${p.id}`,
      title: `Pagar: ${p.funcionarios?.nome ?? '—'}`,
      start: p.periodo_fim,
      allDay: true,
      type: 'pagamento_funcionario',
      status: p.status,
      ...EVENT_COLORS.pagamento_funcionario,
      extendedProps: {
        type: 'pagamento_funcionario',
        valor: p.valor_total,
        responsavel: p.funcionarios?.nome,
        status: p.status,
      },
    })
  })

  recebimentos.data?.forEach(r => {
    events.push({
      id: `receb-${r.id}`,
      title: `Receber: ${r.clientes?.nome ?? '—'}`,
      start: r.data_vencimento,
      allDay: true,
      type: 'recebimento_cliente',
      status: r.status,
      ...EVENT_COLORS.recebimento_cliente,
      extendedProps: {
        type: 'recebimento_cliente',
        valor: r.valor,
        responsavel: r.clientes?.nome,
        telefone: r.clientes?.telefone,
        status: r.status,
      },
    })
  })

  gastos.data?.forEach(g => {
    events.push({
      id: `gasto-${g.id}`,
      title: `${g.categorias_gasto?.nome ?? 'Gasto'}: ${g.descricao}`,
      start: g.data_vencimento,
      allDay: true,
      type: 'saida_gasto',
      status: g.status,
      ...EVENT_COLORS.saida_gasto,
      extendedProps: {
        type: 'saida_gasto',
        valor: g.valor,
        categoria: g.categorias_gasto?.nome,
        status: g.status,
      },
    })
  })

  return events
}

/** Format currency in BRL */
export const formatBRL = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0)
