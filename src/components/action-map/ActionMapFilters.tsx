"use client";

import type { ReactNode } from "react";
import { Calendar, MapPin, Tag } from "lucide-react";
import type { ActionMapFilters as Filters } from "@/lib/action-map";

interface ActionMapFiltersProps {
  filters: Filters;
  years: string[];
  cities: string[];
  categories: string[];
  onChange: (filters: Filters) => void;
}

function FilterSelect({
  icon: Icon,
  label,
  value,
  onChange,
  children,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="group flex flex-col gap-1.5 text-sm">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Icon size={14} />
        {label}
      </span>
      <select
        className="rounded-[14px] border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition hover:border-slate-300 focus:border-[#0071B7]/40 focus:outline-none focus:ring-2 focus:ring-[#0071B7]/15"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

export default function ActionMapFilters({
  filters,
  years,
  cities,
  categories,
  onChange,
}: ActionMapFiltersProps) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <FilterSelect icon={Calendar} label="Ano" value={filters.year} onChange={(year) => set({ year })}>
        <option value="">Todos</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect icon={MapPin} label="Cidade" value={filters.city} onChange={(city) => set({ city })}>
        <option value="">Todas</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        icon={Tag}
        label="Categoria"
        value={filters.category}
        onChange={(category) => set({ category })}
      >
        <option value="">Todas</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </FilterSelect>
    </div>
  );
}
