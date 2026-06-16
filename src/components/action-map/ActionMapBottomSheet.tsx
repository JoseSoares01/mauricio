"use client";

import { AnimatePresence, motion, useDragControls, useMotionValue } from "framer-motion";
import type { ActionVisit, NewsItem } from "@/lib/types";
import ActionMapDetailPanel from "./ActionMapDetailPanel";

interface ActionMapBottomSheetProps {
  visit: ActionVisit | null;
  news: NewsItem[];
  onClose: () => void;
}

export default function ActionMapBottomSheet({ visit, news, onClose }: ActionMapBottomSheetProps) {
  const dragControls = useDragControls();
  const y = useMotionValue(0);

  return (
    <AnimatePresence>
      {visit && (
        <>
          <motion.button
            type="button"
            aria-label="Fechar painel"
            className="fixed inset-0 z-40 bg-black/35 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col rounded-t-3xl bg-white shadow-2xl md:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.12}
            style={{ y }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 500) onClose();
            }}
          >
            <div
              className="flex cursor-grab justify-center py-3 active:cursor-grabbing"
              onPointerDown={(event) => dragControls.start(event)}
            >
              <span className="h-1.5 w-12 rounded-full bg-gray-300" />
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <ActionMapDetailPanel visit={visit} news={news} onClose={onClose} compact />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
