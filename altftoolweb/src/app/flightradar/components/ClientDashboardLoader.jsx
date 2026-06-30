// src/app/flightradar/components/ClientDashboardLoader.jsx
"use client";

import dynamic from "next/dynamic";

const FlightRadarDashboard = dynamic(
  () => import("./FlightRadarDashboard"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-card text-primary">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent border-primary" />
        <span className="animate-pulse text-lg font-sans font-semibold tracking-wider">
          CALIBRATING AERO SCANNER...
        </span>
      </div>
    ),
  }
);

export default function ClientDashboardLoader() {
  return <FlightRadarDashboard />;
}
