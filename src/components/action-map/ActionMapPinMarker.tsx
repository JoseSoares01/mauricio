"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ACTION_MAP_PIN_SRC } from "@/lib/action-map";

interface ActionMapPinMarkerProps {
  selected?: boolean;
  pulsing?: boolean;
  size?: number;
  label?: string;
}

export default function ActionMapPinMarker({
  selected = false,
  pulsing = false,
  size = 44,
  label,
}: ActionMapPinMarkerProps) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        animate={
          pulsing
            ? { scale: [1, 1.12, 1], y: [0, -3, 0] }
            : { scale: selected ? 1.14 : 1, y: selected ? -4 : 0 }
        }
        transition={
          pulsing
            ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" }
            : { type: "spring", stiffness: 420, damping: 24 }
        }
        className="relative"
        style={{ width: size, height: size }}
      >
        {(selected || pulsing) && (
          <span className="absolute inset-0 -m-2 rounded-full bg-[#FDCE27]/40 blur-[2px]" />
        )}
        <Image
          src={ACTION_MAP_PIN_SRC}
          alt="Local de atuação"
          width={size}
          height={size}
          className="relative drop-shadow-[0_4px_10px_rgba(0,0,0,0.28)]"
          unoptimized
        />
      </motion.div>
      {label && (
        <span
          className={`mt-1 max-w-[120px] truncate rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm ${
            selected ? "bg-[#0071B7] text-white" : "bg-white/95 text-slate-700"
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
}
