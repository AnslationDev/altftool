"use client";

import { useEffect, useState } from "react";

export default function BlogTopBarLoader() {
  const [width, setWidth] = useState(20);

  useEffect(() => {
    const t1 = setTimeout(() => setWidth(50), 200);
    const t2 = setTimeout(() => setWidth(75), 600);
    const t3 = setTimeout(() => setWidth(90), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <>
      {/* ── Top progress bar ── */}
      <div
        style={{
          position: "fixed",
          top: "64px",
          left: 0,
          width: `${width}%`,
          height: "3px",
          background: "var(--primary)",
          transition: "width 0.4s ease",
          zIndex: 9999,
          borderRadius: "0 2px 2px 0",
          boxShadow: "0 0 8px var(--primary)",
        }}
      />

      {/* ── Full page skeleton to fill viewport & push footer down ── */}
      <div className="min-h-screen py-4 px-4 md:px-20"
        style={{ background: "var(--background)" }}
      >
        {/* Back button skeleton */}
        <div className="mb-6 h-14 w-full rounded-lg animate-pulse"
          style={{ background: "var(--muted)" }} />

        {/* Title skeleton */}
        <div className="h-8 w-3/4 rounded-md animate-pulse mb-3"
          style={{ background: "var(--muted)" }} />
        <div className="h-8 w-1/2 rounded-md animate-pulse mb-6"
          style={{ background: "var(--muted)" }} />

        {/* Meta row skeleton */}
        <div className="flex gap-3 mb-8">
          <div className="h-5 w-24 rounded animate-pulse"
            style={{ background: "var(--muted)" }} />
          <div className="h-5 w-24 rounded animate-pulse"
            style={{ background: "var(--muted)" }} />
          <div className="h-5 w-24 rounded animate-pulse"
            style={{ background: "var(--muted)" }} />
        </div>

        {/* 3-column layout skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_4fr_1fr] gap-8 mt-10">
          {/* TOC */}
          <div className="flex flex-col gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i}
                className="h-4 rounded animate-pulse"
                style={{ background: "var(--muted)", width: `${70 - i * 5}%` }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="flex flex-col gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i}
                className="h-4 w-full rounded animate-pulse"
                style={{ background: "var(--muted)", width: i % 3 === 2 ? "60%" : "100%" }}
              />
            ))}
          </div>

          {/* Ads */}
          <div className="h-48 rounded-lg animate-pulse"
            style={{ background: "var(--muted)" }} />
        </div>
      </div>
    </>
  );
}
