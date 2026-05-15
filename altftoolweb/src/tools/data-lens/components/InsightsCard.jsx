import React from "react";

const InsightsCard = ({ column, stats }) => {
  return (
    <div className="space-y-1">
      <p className="font-semibold text-[var(--foreground)]">{column}</p>
      <p className="text-sm text-[var(--muted-foreground)]">
        Type: {stats.type}
      </p>
      {stats.type === "numeric" ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          Mean: {stats.mean}
        </p>
      ) : (
        <p className="text-sm text-[var(--muted-foreground)]">
          Unique: {stats.uniqueCount}
        </p>
      )}
      <p className="text-sm text-[var(--muted-foreground)]">
        Nulls: {stats.nulls}
      </p>
    </div>
  );
};

export default InsightsCard;