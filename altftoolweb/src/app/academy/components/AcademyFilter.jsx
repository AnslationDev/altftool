"use client";

import { motion, LayoutGroup } from "framer-motion";

export default function AcademyFilter({ categories, active, onChange }) {
  const all = categories;

  return (

    <LayoutGroup>
      <div
        role="tablist"
        className="
      flex gap-1.5 sm:gap-2
      overflow-x-auto
      whitespace-nowrap
      no-scrollbar
        p-1.5 sm:p-2

    "
      >



        {all.map((item) => {
          const isActive = active === item;

          return (
            <button
              key={item}
              onClick={() => onChange(item)}
              className="
            relative isolate overflow-hidden
            px-4 py-1.5 text-md font-medium
            rounded-md
            flex-shrink-0
            transition-colors
            cursor-pointer
          "
            >
              {isActive && (
                <motion.span
                  layoutId="academy-filter-active"
                  className="
                absolute inset-0 -z-10 rounded-md
                bg-gradient-to-r
                from-indigo-500 via-blue-500 to-cyan-400
              "
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}

              <span
                className={
                  isActive
                    ? "text-white"
                    : "text-(--muted-foreground) hover:text-(--muted-foreground)/80"
                }
              >
                {item}
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
