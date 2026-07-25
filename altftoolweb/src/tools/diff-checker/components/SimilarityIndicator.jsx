"use client";

import React from "react";

const getColor = (score) => {
  if (score > 70) return "bg-(--success)";
  if (score > 40) return "bg-(--warning)";
  return "bg-(--danger)";
};

const SimilarityIndicator = ({ score }) => {
  const color = getColor(score);

  return (
    <div className="flex items-center gap-2 mb-3 text-sm text-(--muted-foreground)">
      
      {/* Dot */}
      <span className={`w-3 h-3 rounded-full ${color}`} />

      {/* Text */}
      <span>
        Similarity Score: <span className="font-medium">{score}%</span>
      </span>
    </div>
  );
};

export default SimilarityIndicator;