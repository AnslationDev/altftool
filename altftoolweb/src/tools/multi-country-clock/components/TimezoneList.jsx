"use client";

import React from "react";
import { Plus, Check } from "lucide-react";

const TimezoneList = ({
  filteredTimezones,
  selectedTimezones,
  onAddTimezone,
}) => {
  const getCityName = (timezone) => {
    const parts = timezone.split("/");
    return parts[parts.length - 1].replace(/_/g, " ");
  };

  const getRegion = (timezone) => {
    const parts = timezone.split("/");
    return parts[0];
  };

  if (filteredTimezones.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="p-4 rounded-xl bg-(--card) border border-(--border) text-(--muted-foreground)">
          No timezones found. Try a different search term.
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="subheading">
          📍 Search Results ({filteredTimezones.length})
        </h3>
        <p className="description mt-1">
          Click to add a timezone to your clock list
        </p>
      </div>

      {/* Scrollable List */}
      <div
        className="
          max-h-100
          overflow-auto
          rounded-2xl
          bg-(--card)
          border border-(--border)
        "
      >
        {filteredTimezones.slice(0, 50).map((timezone, index) => {
          const isSelected = selectedTimezones.includes(timezone);

          return (
            <div
              key={timezone}
              className={`
                flex items-center justify-between
                px-4 py-3
                border-b border-(--border)
                last:border-b-0
                transition
                ${
                  isSelected
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer hover:bg-(--background)"
                }
              `}
              onClick={() => !isSelected && onAddTimezone(timezone)}
            >
              <div className="flex flex-col gap-1 flex-1">
                {/* Top Row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-(--foreground)">
                    {getCityName(timezone)}
                  </span>

                  {/* Region Badge */}
                  <span className="px-2 py-0.5 text-xs rounded-full border border-(--border) text-(--muted-foreground)">
                    {getRegion(timezone)}
                  </span>

                  {isSelected && (
                    <span className="ml-auto flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-(--primary) text-(--primary-foreground)">
                      <Check className="w-3 h-3" />
                      Added
                    </span>
                  )}
                </div>

                {/* Full Timezone */}
                <span className="text-xs text-(--muted-foreground)">
                  {timezone}
                </span>
              </div>

              {!isSelected && <Plus className="w-4 h-4 text-(--primary)" />}
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      {filteredTimezones.length > 50 && (
        <p className="text-center text-(--muted-foreground) text-xs mt-4">
          Showing first 50 results. Refine your search for more specific
          results.
        </p>
      )}
    </section>
  );
};

export default TimezoneList;
