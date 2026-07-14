"use client";

import { motion } from "framer-motion";

// Reusable empty-state block with an optional call to action.
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-(--border) bg-(--card) px-6 py-14 text-center"
    >
      {Icon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-(--muted) text-(--primary)">
          <Icon className="h-7 w-7" />
        </div>
      ) : null}
      <h3 className="text-lg font-semibold text-(--foreground)">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-6 text-(--muted-foreground)">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </motion.div>
  );
}
