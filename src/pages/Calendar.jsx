import { useRef, useState, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import { buildCalendarEvents, EVENT_COLORS, formatBRL } from '../lib/calendarEvents'
import EventDetailPanel from '../components/Calendar/EventDetailPanel'

const LEGEND = [
  { type: 'escala_trabalho',       label: 'Escala' },
  { type: 'pagamento_funcionario', label: 'Pag. Funcionário' },
  { type: 'recebimento_cliente',   label: 'Recebimento' },
  { type: 'saida_gasto',           label: 'Saída' },
]

const FILTERS_DEFAULT = {
  escala_trabalho: true,
  pagamento_funcionario: true,
  recebimento_cliente: true,
  saida_gasto: true,
}

export default function Calendar() {
  const calRef                            = useRef(null)
  const [allEvents, setAllEvents]         = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [filters, setFilters]             = useState(FILTERS_DEFAULT)

  const fetchEvents = useCallback(async (info, successCb) => {
    try {
      const events = await buildCalendarEvents(info.startStr.slice(0, 10), info.endStr.slice(0, 10))
      setAllEvents(events)
      successCb(events)
    } catch (err) {
      console.error('[Calendar] Failed to load events:', err)
      successCb([])
    }
  }, [])

  function toggleFilter(type) {
    setFilters(f => ({ ...f, [type]: !f[type] }))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters row — horizontal scroll on mobile, vertical on lg */}
      <div className="flex flex-row flex-wrap gap-3 lg:hidden">
        {LEGEND.map(({ type, label }) => {
          const c = EVENT_COLORS[type]
          const on = filters[type]
          return (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              style={{
                background: on ? `${c.borderColor}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${on ? c.borderColor : 'rgba(255,255,255,0.1)'}`,
                color: on ? c.borderColor : 'rgba(255,255,255,0.3)',
              }}
            >
              <span className="w-2 h-2 rounded-sm" style={{ background: c.borderColor, opacity: on ? 1 : 0.3 }} />
              {label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-5" style={{ minHeight: 0 }}>
        {/* Sidebar — desktop only */}
        <aside className="hidden lg:flex lg:w-52 shrink-0 flex-col gap-4">
          {/* Filters */}
          <div className="glass p-4 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25">Filtros</p>
            {LEGEND.map(({ type, label }) => {
              const c = EVENT_COLORS[type]
              const on = filters[type]
              return (
                <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                  <button
                    onClick={() => toggleFilter(type)}
                    className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition"
                    style={{
                      background: on ? c.borderColor : 'rgba(255,255,255,0.07)',
                      border: `1.5px solid ${on ? c.borderColor : 'rgba(255,255,255,0.12)'}`,
                    }}
                  >
                    {on && <span className="text-white text-[9px] font-bold">✓</span>}
                  </button>
                  <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: c.borderColor, opacity: on ? 1 : 0.3 }} />
                  <span className={`text-xs transition ${on ? 'text-white/70' : 'text-white/25'}`}>{label}</span>
                </label>
              )
            })}
          </div>

          {/* Event detail */}
          {selectedEvent && (
            <EventDetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
          )}
        </aside>

        {/* Calendar */}
        <div className="glass flex-1 p-3 sm:p-4 min-w-0 overflow-hidden">
          <FullCalendar
            ref={calRef}
            plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            locale={ptBrLocale}
            headerToolbar={{ left: 'prev,next', center: 'title', right: 'today,listWeek' }}
            events={allEvents.filter(e => filters[e.extendedProps?.type])}
            datesSet={info => fetchEvents(info, evts => setAllEvents(evts))}
            eventClick={info => setSelectedEvent(info.event)}
            dayMaxEvents={2}
            height="auto"
          />
        </div>

        {/* Event detail — mobile, shown below calendar */}
        {selectedEvent && (
          <div className="lg:hidden">
            <EventDetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
          </div>
        )}
      </div>
    </div>
  )
}
