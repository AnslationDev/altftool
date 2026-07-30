// src/app/live-activity-simulation/components/ClientLoader.jsx
"use client";

import dynamic from "next/dynamic";

const DynamicApp = dynamic(() => import("../App"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-(--page) text-(--foreground)">
      <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent border-(--foreground)" />
      <span className="animate-pulse text-lg font-extrabold uppercase tracking-widest font-heading">
        Initializing Engine...
      </span>
    </div>
  ),
});

export default function ClientLoader() {
  return <DynamicApp />;
}
