"use client";

import React from "react";
import DomainCard from "./DomainCard";

const DomainGrid = ({ suggestions = [], onSelect }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {suggestions.map((domain, index) => {
        const domainName = domain?.name || domain;

        return (
          <DomainCard
            key={domainName || index}
            domain={domain}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
};

export default DomainGrid;