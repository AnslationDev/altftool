"use client";

import { useState } from "react";
import { Users, ChevronDown, ChevronUp } from "lucide-react";

export default function VoterSystem({
  pollOptions,
  voters,
  isAnonymous,
}) {
  const [expandedOptions, setExpandedOptions] = useState({});

  // Anonymous ON → kuch show nahi hoga
  if (isAnonymous) return null;

  const toggleExpand = (index) => {
    setExpandedOptions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="mt-6">
      {/* Title */}
      <h3 className="flex items-center gap-2 font-semibold mb-2 text-(--foreground)">
        <Users size={18} className="text-(--primary)" />
        Voters
      </h3>

      {/* Options mapping */}
      {pollOptions.map((option, index) => {
        const optionVoters = voters[index] || [];
        const isExpanded = expandedOptions[index];

        const visibleVoters = isExpanded
          ? optionVoters
          : optionVoters.slice(0, 5);

        return (
          <div key={index} className="mb-4">
            {/* Option name */}
            <p className="font-medium">{option}</p>

            {/* Voters UI */}
            <div className="mt-2">
              {optionVoters.length > 0 ? (
                <>
                  {/* Chips */}
                  <div className="flex flex-wrap gap-2">
                    {visibleVoters.map((name, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 text-xs rounded-lg bg-(--muted) text-(--foreground) whitespace-nowrap"
                      >
                        {name}
                      </span>
                    ))}
                  </div>

                  {/* Toggle */}
                  {optionVoters.length > 5 && (
                    <button
                      onClick={() => toggleExpand(index)}
                      className="flex items-center gap-1 mt-2 text-sm text-(--primary)"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp size={16} />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          View All ({optionVoters.length})
                        </>
                      )}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-sm text-(--muted-foreground)">
                  No votes yet
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
