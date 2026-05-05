"use client";

import { ChevronRight, X } from "lucide-react";
import { settingsData } from "../data/settingData";

const SettingsSidebar = ({ activeId, onSelect, onClose }) => {
  return (
    <aside
      className="
        w-72 h-full overflow-y-auto
        bg-(--card)
        border-r border-(--border)
        shadow-lg md:shadow-none
      "
      aria-label="Settings navigation"
    >

      {/* Header */}
      <div
        className="
          p-5 pb-3 flex items-center justify-between
          bg-(--card)
          sticky top-0 z-10
          border-b border-(--border)
        "
      >
        <h2 className="text-lg font-bold text-(--foreground)">
          Explore Settings
        </h2>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="
            md:hidden p-2
            rounded-lg
            hover:bg-(--muted)
            transition active:scale-95 cursor-pointer
          "
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5 text-(--muted-foreground)" />
        </button>
      </div>

      {/* Navigation */}
      <nav
        className="
          px-3 py-4
          bg-(--background)
        "
        aria-label="Settings categories"
      >

        {settingsData.map((item) => {
          const isActive = activeId === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              aria-label={`${item.title} settings`}
              aria-current={isActive ? "page" : undefined}
              className={`
                w-full flex items-center gap-3
                px-3 py-2.5 mb-1
                rounded-md text-sm text-left
                transition-all duration-200
                group border-l-2 cursor-pointer

                ${
                  isActive
                    ? `
                      bg-(--primary)/10
                      text-(--primary)
                      font-medium
                      border-(--primary)
                      shadow-sm
                    `
                    : `
                      text-(--muted-foreground)
                      border-transparent
                      hover:bg-(--muted)
                      hover:text-(--primary)
                    `
                }
              `}
            >

              {/* Icon */}
              <item.icon
                className={`
                  h-4 w-4 shrink-0 transition-colors duration-200
                  ${
                    isActive
                      ? "text-(--primary)"
                      : "text-(--muted-foreground) group-hover:text-(--primary)"
                  }
                `}
              />

              {/* Title */}
              <span className="flex-1">
                {item.title}
              </span>

              {/* Arrow */}
              <ChevronRight
                className={`
                  h-4 w-4 shrink-0 transition-all duration-200
                  ${
                    isActive
                      ? "text-(--primary) rotate-90"
                      : "text-(--muted-foreground) opacity-0 group-hover:opacity-100 group-hover:text-(--primary)"
                  }
                `}
              />

            </button>
          );
        })}

      </nav>

    </aside>
  );
};

export default SettingsSidebar;
