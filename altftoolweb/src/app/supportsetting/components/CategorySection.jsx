"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import SettingCard from "./SettingCard";

const CategorySection = ({
  category,
  settings,
  detectedPlatform,
  autoExpandSteps,
  compactCards,
  showImages,
  defaultOpen = true,
  id,
  onVisit,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = category.icon;

  if (!settings.length) return null;

  return (
    <section id={id} className="support-category-section" aria-labelledby={`${id}-heading`}>
      <button
        type="button"
        className="support-category-header"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="support-category-header-left">
          <span className="support-category-icon" aria-hidden="true">
            <Icon className="h-5 w-5" />
          </span>
          <span>
            <h2 id={`${id}-heading`} className="support-category-title">
              {category.label}
            </h2>
            <p className="support-category-description">{category.description}</p>
          </span>
        </span>

        <span className="support-category-header-right">
          <span className="support-category-count">{settings.length}</span>
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open && (
        <div
          className={`support-card-grid ${compactCards ? "support-card-grid-compact" : ""}`}
        >
          {settings.map((setting) => (
            <SettingCard
              key={setting.id}
              setting={setting}
              detectedPlatform={detectedPlatform}
              autoExpand={autoExpandSteps}
              compact={compactCards}
              showImages={showImages}
              onVisit={onVisit}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CategorySection;
