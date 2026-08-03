"use client";

import React from "react";
import { Plus, Check } from "lucide-react";

import { formatTimeZoneCity } from "../lib";

const TimezoneList = ({
  filteredTimezones,
  selectedTimezones,
  onAddTimezone,
  maxSelectedTimezones = 12,
}) => {
  const hasReachedLimit = selectedTimezones.length >= maxSelectedTimezones;

  const getRegion = (timezone) => {
    const parts = timezone.split("/");
    return parts[0];
  };

  if (filteredTimezones.length === 0) {
    return (
      <div id="timezone-results" className="max-w-4xl mx-auto py-8 px-4">
        <div className="p-4 rounded-xl bg-(--card) border border-(--border) text-(--muted-foreground)">
          No timezones found. Try a different search term.
        </div>
      </div>
    );
  }

  return (
    <section id="timezone-results" className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="subheading">
          📍 Search Results ({filteredTimezones.length})
        </h3>
        <p className="description mt-1">
          Add up to {maxSelectedTimezones} timezones to your clock list
        </p>
        {hasReachedLimit && (
          <p
            id="timezone-limit-message"
            role="status"
            className="mt-2 text-sm font-medium text-(--primary)"
          >
            Clock limit reached. Remove a clock before adding another.
          </p>
        )}
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
        {filteredTimezones.slice(0, 50).map((timezone) => {
          const isSelected = selectedTimezones.includes(timezone);
          const isDisabled = isSelected || hasReachedLimit;

          return (
            <button
              key={timezone}
              type="button"
              disabled={isDisabled}
              aria-pressed={isSelected}
              aria-describedby={
                hasReachedLimit && !isSelected
                  ? "timezone-limit-message"
                  : undefined
              }
              onClick={() => onAddTimezone(timezone)}
              className={`
                w-full text-left
                flex items-center justify-between
                min-h-11 px-4 py-3
                border-b border-(--border)
                last:border-b-0
                transition
                focus-visible:outline-none
                focus-visible:[box-shadow:var(--focus-ring)]
                motion-reduce:transition-none
                ${
                  isDisabled
                    ? "opacity-60 cursor-not-allowed"
                    : "cursor-pointer hover:bg-(--background)"
                }
              `}
            >
              <div className="flex flex-col gap-1 flex-1">
                {/* Top Row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-(--foreground)">
                    {formatTimeZoneCity(timezone)}
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
                  {!isSelected && hasReachedLimit && (
                    <span className="ml-auto text-xs text-(--muted-foreground)">
                      Limit reached
                    </span>
                  )}
                </div>

                {/* Full Timezone */}
                <span className="text-xs text-(--muted-foreground)">
                  {timezone}
                </span>
              </div>

              {!isDisabled && (
                <Plus
                  aria-hidden="true"
                  className="w-4 h-4 text-(--primary)"
                />
              )}
            </button>
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
