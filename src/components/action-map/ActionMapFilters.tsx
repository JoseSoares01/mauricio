"use client";

import type { ReactNode } from "react";
import type { ActionMapFilters as Filters } from "@/lib/action-map";

interface ActionMapFiltersProps {
  filters: Filters;
  years: string[];
  cities: string[];
  categories: string[];
  onChange: (filters: Filters) => void;
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="action-map-filter">
      <span className="action-map-filter-label">{label}</span>
      <select
        className="action-map-filter-select"
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
    <div className="action-map-filters">
      <FilterSelect label="Ano" value={filters.year} onChange={(year) => set({ year })}>
        <option value="">Todos</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect label="Cidade" value={filters.city} onChange={(city) => set({ city })}>
        <option value="">Todas</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
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
