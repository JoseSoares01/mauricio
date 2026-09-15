"use client";

import { useMemo, useState } from "react";
import type { AgendaEvent } from "@/lib/types";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface AgendaCalendarProps {
  events: AgendaEvent[];
}

const TYPE_COLORS: Record<string, string> = {
  reuniao: "var(--color-primary)",
  visita: "var(--color-secondary)",
  evento: "var(--color-accent)",
  debate: "var(--color-primary)",
  caminhada: "var(--color-secondary)",
};

const TYPE_LABELS: Record<string, string> = {
  reuniao: "Reunião",
  visita: "Visita",
  evento: "Evento",
  debate: "Debate",
  caminhada: "Caminhada",
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function typeColor(type: string) {
  return TYPE_COLORS[type] || "var(--color-primary)";
}

function isLightAccent(type: string) {
  return type === "evento";
}

function formatLongDate(date: string) {
  return new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(date: string) {
  return new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function EventChip({
  event,
  compact,
  onSelect,
}: {
  event: AgendaEvent;
  compact?: boolean;
  onSelect: (event: AgendaEvent) => void;
}) {
  const color = typeColor(event.type);
  const light = isLightAccent(event.type);

  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className={`agenda-chip${compact ? " agenda-chip--compact" : ""}`}
      style={{
        backgroundColor: color,
        color: light ? "var(--color-primary)" : "#fff",
      }}
      title={`${event.time} — ${event.title}`}
    >
      {compact ? (
        <span className="agenda-chip-line">
          <span className="agenda-chip-time">{event.time}</span>
          <span className="agenda-chip-title">{event.title}</span>
        </span>
      ) : (
        <>
          <span className="agenda-chip-time">{event.time}</span>
          <span className="agenda-chip-title">{event.title}</span>
        </>
      )}
    </button>
  );
}

function EventDetailModal({
  event,
  onClose,
}: {
  event: AgendaEvent;
  onClose: () => void;
}) {
  const color = typeColor(event.type);
  const light = isLightAccent(event.type);

  return (
    <div
      className="agenda-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="agenda-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-detail-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="agenda-modal-close"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <span
          className="agenda-type-badge"
          style={{
            backgroundColor: color,
            color: light ? "var(--color-primary)" : "#fff",
          }}
        >
          {TYPE_LABELS[event.type] || event.type}
        </span>

        <h3 id="event-detail-title" className="agenda-modal-title">
          {event.title}
        </h3>

        {event.description && (
          <p className="agenda-modal-desc">{event.description}</p>
        )}

        <dl className="agenda-modal-meta">
          <div>
            <dt>Quando</dt>
            <dd>
              {formatLongDate(event.date)} · {event.time}
            </dd>
          </div>
          {event.location?.trim() && (
            <div>
              <dt>Onde</dt>
              <dd>{event.location}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

export default function AgendaCalendar({ events }: AgendaCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const eventsByDate = useMemo(() => {
    const map: Record<string, AgendaEvent[]> = {};
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    Object.values(map).forEach((list) =>
      list.sort((a, b) => a.time.localeCompare(b.time))
    );
    return map;
  }, [events]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [year, month]);

  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const upcomingEvents = useMemo(() => {
    const future = events
      .filter((e) => e.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

    if (future.length > 0) return future.slice(0, 6);

    return [...events]
      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
      .slice(0, 6);
  }, [events, todayStr]);

  const highlightEvent = upcomingEvents[0] ?? null;
  const sidebarRest = upcomingEvents.slice(1);
  const showingPastFallback =
    upcomingEvents.length > 0 && upcomingEvents.every((e) => e.date < todayStr);

  const prev = () => {
    if (view === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
  };

  const next = () => {
    if (view === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
  };

  const dateKey = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <>
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      <div className="agenda-layout">
        <div className="agenda-calendar-panel">
          <div className="agenda-calendar-toolbar">
            <div className="agenda-calendar-nav">
              <button
                type="button"
                onClick={prev}
                className="agenda-nav-btn"
                aria-label={view === "month" ? "Mês anterior" : "Semana anterior"}
              >
                <ChevronLeft size={18} />
              </button>
              <h2 className="agenda-calendar-heading">
                {view === "month"
                  ? `${MONTHS[month]} ${year}`
                  : `Semana de ${weekDays[0].getDate()}/${weekDays[0].getMonth() + 1}`}
              </h2>
              <button
                type="button"
                onClick={next}
                className="agenda-nav-btn"
                aria-label={view === "month" ? "Próximo mês" : "Próxima semana"}
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="agenda-view-toggle" role="group" aria-label="Visualização">
              <button
                type="button"
                onClick={() => setView("month")}
                className={`agenda-view-btn${view === "month" ? " is-active" : ""}`}
              >
                Mês
              </button>
              <button
                type="button"
                onClick={() => setView("week")}
                className={`agenda-view-btn${view === "week" ? " is-active" : ""}`}
              >
                Semana
              </button>
            </div>
          </div>

          {view === "month" ? (
            <>
              <div className="agenda-weekday-row">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="agenda-weekday">
                    {d}
                  </div>
                ))}
              </div>
              <div className="agenda-month-grid">
                {calendarDays.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} className="agenda-day agenda-day--empty" />;
                  const key = dateKey(year, month, day);
                  const dayEvents = eventsByDate[key] || [];
                  const isToday = key === todayStr;
                  return (
                    <div
                      key={key}
                      className={`agenda-day${isToday ? " is-today" : ""}${
                        dayEvents.length ? " has-events" : ""
                      }`}
                    >
                      <span className="agenda-day-number">{day}</span>
                      <div className="agenda-day-events">
                        {dayEvents.map((e) => (
                          <EventChip
                            key={e.id}
                            event={e}
                            compact
                            onSelect={setSelectedEvent}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="agenda-week-grid">
              {weekDays.map((d) => {
                const key = d.toISOString().split("T")[0];
                const dayEvents = eventsByDate[key] || [];
                const isToday = key === todayStr;
                return (
                  <div
                    key={key}
                    className={`agenda-week-day${isToday ? " is-today" : ""}`}
                  >
                    <div className="agenda-week-day-head">
                      <span className="agenda-week-day-label">
                        {WEEKDAYS[d.getDay()]}
                      </span>
                      <span className="agenda-week-day-number">{d.getDate()}</span>
                    </div>
                    <div className="agenda-day-events">
                      {dayEvents.map((e) => (
                        <EventChip
                          key={e.id}
                          event={e}
                          onSelect={setSelectedEvent}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside className="agenda-sidebar">
          <p className="agenda-sidebar-label">
            {showingPastFallback ? "Compromissos recentes" : "Próximos compromissos"}
          </p>
          <h3 className="agenda-sidebar-title">Na agenda</h3>
          <div className="agenda-sidebar-rule" aria-hidden="true" />

          {upcomingEvents.length === 0 ? (
            <p className="agenda-sidebar-empty">Nenhum compromisso programado.</p>
          ) : (
            <div className="agenda-sidebar-list">
              {highlightEvent && (
                <button
                  type="button"
                  onClick={() => setSelectedEvent(highlightEvent)}
                  className="agenda-highlight"
                >
                  <div className="agenda-highlight-top">
                    <span
                      className="agenda-type-badge"
                      style={{
                        backgroundColor: typeColor(highlightEvent.type),
                        color: isLightAccent(highlightEvent.type)
                          ? "var(--color-primary)"
                          : "#fff",
                      }}
                    >
                      {TYPE_LABELS[highlightEvent.type] || highlightEvent.type}
                    </span>
                    <span className="agenda-highlight-kicker">
                      {highlightEvent.date === todayStr ? "Hoje" : "Em destaque"}
                    </span>
                  </div>
                  <h4 className="agenda-highlight-title">{highlightEvent.title}</h4>
                  {highlightEvent.description && (
                    <p className="agenda-highlight-desc">
                      {highlightEvent.description}
                    </p>
                  )}
                  <p className="agenda-highlight-meta">
                    {formatLongDate(highlightEvent.date)} · {highlightEvent.time}
                    {highlightEvent.location?.trim()
                      ? ` · ${highlightEvent.location}`
                      : ""}
                  </p>
                </button>
              )}

              {sidebarRest.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setSelectedEvent(e)}
                  className="agenda-side-item"
                >
                  <span
                    className="agenda-side-accent"
                    style={{ backgroundColor: typeColor(e.type) }}
                    aria-hidden="true"
                  />
                  <span className="agenda-side-content">
                    <span className="agenda-side-when">
                      {formatShortDate(e.date)} · {e.time}
                    </span>
                    <span className="agenda-side-name">{e.title}</span>
                    {e.location?.trim() && (
                      <span className="agenda-side-place">{e.location}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
