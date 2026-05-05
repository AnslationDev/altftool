"use client";

import React from "react";
import ClockCard from "./ClockCard";

const ClockGrid = ({ selectedTimezones, onRemoveTimezone }) => {
  // Show only first 3 clocks
  const clocksToShow = selectedTimezones.slice(0, 3);

  if (clocksToShow.length === 0) {
    return (
      <section id="clocks" className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="heading">⏰ No Clocks Added Yet</h2>

          <p className="description">
            Use the search bar above to add countries or cities to track their
            local time.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="clocks" className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="heading">⏰ Your Clocks</h2>
        </div>

        {/* Grid */}
        <div className="flex flex-wrap justify-center gap-6">
          {clocksToShow.map((timezone) => (
            <div key={timezone} className="w-full sm:w-[320px]">
              <ClockCard
                timezone={timezone}
                onRemove={() => onRemoveTimezone(timezone)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClockGrid;
