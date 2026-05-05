"use client";

import React from "react";

export default function TotalDisplay({ total }) {
  if (!total || Number(total) === 0) return null;

  return (
    <div className="mt-8 text-center">
      <h2 className="subheading mb-2">
        Total Price
      </h2>

      <p className="text-3xl font-bold text-(--primary)">
        ₹{Number(total).toFixed(2)}
      </p>
    </div>
  );
}
