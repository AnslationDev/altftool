"use client";

import React from "react";
import ClockCard from "./ClockCard";

const ClockGrid = ({ selectedTimezones, onRemoveTimezone, hour12 = true }) => {
  if (selectedTimezones.length === 0) {
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
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="heading">⏰ Your Clocks</h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {selectedTimezones.map((timezone) => (
            <ClockCard
              key={timezone}
              timezone={timezone}
              onRemove={() => onRemoveTimezone(timezone)}
              hour12={hour12}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClockGrid;
