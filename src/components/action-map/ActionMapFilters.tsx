"use client";

import type { ActionMapFilters as Filters } from "@/lib/action-map";
import type { ActionVisitStatus } from "@/lib/types";

interface ActionMapFiltersProps {
  filters: Filters;
  years: string[];
  cities: string[];
  categories: string[];
  onChange: (filters: Filters) => void;
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
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-gray-700">Ano</span>
        <select
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          value={filters.year}
          onChange={(e) => set({ year: e.target.value })}
        >
          <option value="">Todos</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-gray-700">Cidade</span>
        <select
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          value={filters.city}
          onChange={(e) => set({ city: e.target.value })}
        >
          <option value="">Todas</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-gray-700">Categoria</span>
        <select
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          value={filters.category}
          onChange={(e) => set({ category: e.target.value })}
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-gray-700">Status</span>
        <select
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          value={filters.status}
          onChange={(e) => set({ status: e.target.value as "" | ActionVisitStatus })}
        >
          <option value="">Todos</option>
          <option value="realizada">Realizadas</option>
          <option value="agendada">Agendadas</option>
        </select>
      </label>
    </div>
  );
}
