"use client";

import { motion } from "framer-motion";
import { formatActionDate } from "@/lib/action-map";
import type { ActionVisit } from "@/lib/types";

interface ActionMapJourneyBarProps {
  visit: ActionVisit | null;
  index: number;
  total: number;
}

export default function ActionMapJourneyBar({ visit, index, total }: ActionMapJourneyBarProps) {
  if (!visit) return null;

  const progress = total > 0 ? ((index + 1) / total) * 100 : 0;
  const year = visit.date.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[#0071B7]/20 bg-white p-4 shadow-sm"
    >
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-[#0071B7]">
        <span>Modo jornada</span>
        <span>
          {index + 1} / {total}
        </span>
      </div>
      <p className="text-sm font-bold text-gray-900">{visit.title}</p>
      <p className="mt-1 text-sm text-gray-600">
        {visit.city} · {formatActionDate(visit.date)} · {year}
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
        <motion.div
          className="h-full rounded-full bg-[#129547]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.45 }}
        />
      </div>
    </motion.div>
  );
}
