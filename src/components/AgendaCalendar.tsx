"use client";

import { useState, useMemo } from "react";
import type { AgendaEvent } from "@/lib/types";
import { ChevronLeft, ChevronRight, MapPin, Clock, X } from "lucide-react";

interface AgendaCalendarProps {
  events: AgendaEvent[];
}

const TYPE_COLORS: Record<string, string> = {
  reuniao: "#0071B7",
  visita: "#129547",
  evento: "#FDCE27",
  debate: "#6B46C1",
  caminhada: "#E53E3E",
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
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function EventChip({
  event,
  compact,
  onSelect,
}: {
  event: AgendaEvent;
  compact?: boolean;
  onSelect: (event: AgendaEvent) => void;
}) {
  const color = TYPE_COLORS[event.type] || "var(--color-primary)";

  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className={`w-full text-left text-white rounded transition-opacity hover:opacity-90 cursor-pointer ${
        compact ? "text-[10px] px-1 py-0.5 mt-0.5 truncate" : "text-xs p-1.5 mb-1"
      }`}
      style={{ backgroundColor: color }}
      title={event.title}
    >
      {compact ? (
        <>
          {event.time} {event.title}
        </>
      ) : (
        <>
          <div className="font-semibold">{event.time}</div>
          <div className="truncate">{event.title}</div>
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
  const color = TYPE_COLORS[event.type] || "var(--color-primary)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-detail-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 text-gray-500"
          aria-label="Fechar"
        >
          <X size={20} />
        </button>

        <span
          className="text-xs font-medium text-white px-2 py-0.5 rounded"
          style={{ backgroundColor: color }}
        >
          {TYPE_LABELS[event.type] || event.type}
        </span>

        <h3
          id="event-detail-title"
          className="text-xl font-semibold mt-3 pr-8"
          style={{ color: "var(--color-primary)" }}
        >
          {event.title}
        </h3>

        {event.description && (
          <p className="text-gray-600 mt-3 leading-relaxed">{event.description}</p>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600 mt-4">
          <Clock size={16} className="shrink-0" />
          <span>
            {new Date(event.date + "T12:00:00").toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            às {event.time}
          </span>
        </div>

        {event.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
            <MapPin size={16} className="shrink-0" />
            <span>{event.location}</span>
          </div>
        )}
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

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return events
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [events]);

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

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <>
    {selectedEvent && (
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    )}
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button onClick={prev} className="p-2 rounded-lg hover:bg-gray-100">
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-xl font-semibold" style={{ color: "var(--color-primary)" }}>
                {view === "month"
                  ? `${MONTHS[month]} ${year}`
                  : `Semana de ${weekDays[0].getDate()}/${weekDays[0].getMonth() + 1}`}
              </h3>
              <button onClick={next} className="p-2 rounded-lg hover:bg-gray-100">
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView("month")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  view === "month" ? "text-white" : "bg-gray-100"
                }`}
                style={view === "month" ? { backgroundColor: "var(--color-primary)" } : {}}
              >
                Mês
              </button>
              <button
                onClick={() => setView("week")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  view === "week" ? "text-white" : "bg-gray-100"
                }`}
                style={view === "week" ? { backgroundColor: "var(--color-primary)" } : {}}
              >
                Semana
              </button>
            </div>
          </div>

          {view === "month" ? (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-sm font-semibold text-gray-500 py-2">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} />;
                  const key = dateKey(year, month, day);
                  const dayEvents = eventsByDate[key] || [];
                  const isToday = key === todayStr;
                  return (
                    <div
                      key={key}
                      className={`min-h-[80px] p-1 rounded-lg border ${
                        isToday ? "border-[var(--color-primary)] bg-blue-50" : "border-gray-100"
                      }`}
                    >
                      <span className={`text-sm font-medium ${isToday ? "text-[var(--color-primary)]" : ""}`}>
                        {day}
                      </span>
                      {dayEvents.map((e) => (
                        <EventChip
                          key={e.id}
                          event={e}
                          compact
                          onSelect={setSelectedEvent}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
              {weekDays.map((d) => {
                const key = d.toISOString().split("T")[0];
                const dayEvents = eventsByDate[key] || [];
                const isToday = key === todayStr;
                return (
                  <div
                    key={key}
                    className={`rounded-lg border p-3 min-h-[200px] ${
                      isToday ? "border-[var(--color-primary)] bg-blue-50" : "border-gray-100"
                    }`}
                  >
                    <div className="text-center mb-2">
                      <div className="text-xs text-gray-500">{WEEKDAYS[d.getDay()]}</div>
                      <div className={`text-lg font-bold ${isToday ? "text-[var(--color-primary)]" : ""}`}>
                        {d.getDate()}
                      </div>
                    </div>
                    {dayEvents.map((e) => (
                      <EventChip key={e.id} event={e} onSelect={setSelectedEvent} />
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--color-primary)" }}>
            Próximos Eventos
          </h3>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-500">Nenhum evento programado.</p>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setSelectedEvent(e)}
                  className="w-full text-left border-l-4 pl-4 py-2 rounded-r-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  style={{ borderColor: TYPE_COLORS[e.type] }}
                >
                  <span
                    className="text-xs font-medium text-white px-2 py-0.5 rounded"
                    style={{ backgroundColor: TYPE_COLORS[e.type] }}
                  >
                    {TYPE_LABELS[e.type] || e.type}
                  </span>
                  <h4 className="font-semibold mt-1" style={{ color: "var(--color-primary)" }}>
                    {e.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{e.description}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                    <Clock size={12} />
                    {new Date(e.date + "T12:00:00").toLocaleDateString("pt-BR")} às {e.time}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MapPin size={12} />
                    {e.location}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
