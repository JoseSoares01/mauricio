"use client";

import ActionMapControls from "./ActionMapControls";
import ActionMapFilters from "./ActionMapFilters";
import ActionMapTimeline from "./ActionMapTimeline";
import type { ActionMapFilters as Filters } from "@/lib/action-map";

interface ActionMapToolbarProps {
  filters: Filters;
  years: string[];
  cities: string[];
  categories: string[];
  selectedYear: string;
  showHeatmap: boolean;
  journeyActive: boolean;
  onChangeFilters: (filters: Filters) => void;
  onSelectYear: (year: string) => void;
  onToggleHeatmap: () => void;
  onStartJourney: () => void;
  onStopJourney: () => void;
  onExportCsv: () => void;
}

export default function ActionMapToolbar({
  filters,
  years,
  cities,
  categories,
  selectedYear,
  showHeatmap,
  journeyActive,
  onChangeFilters,
  onSelectYear,
  onToggleHeatmap,
  onStartJourney,
  onStopJourney,
  onExportCsv,
}: ActionMapToolbarProps) {
  return (
    <div className="space-y-3">
      <ActionMapFilters
        filters={filters}
        years={years}
        cities={cities}
        categories={categories}
        onChange={onChangeFilters}
      />
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <ActionMapTimeline years={years} selectedYear={selectedYear} onSelect={onSelectYear} />
        <ActionMapControls
          showHeatmap={showHeatmap}
          journeyActive={journeyActive}
          onToggleHeatmap={onToggleHeatmap}
          onStartJourney={onStartJourney}
          onStopJourney={onStopJourney}
          onExportCsv={onExportCsv}
        />
      </div>
    </div>
  );
}
