// src/app/flightradar/page.jsx
import ClientDashboardLoader from "./components/ClientDashboardLoader";

export const metadata = {
  title: "Live Flight Tracker – Real-Time Air Traffic Dashboard | Aero",
  description:
    "Explore global air traffic in real-time. Watch 400+ active flights traverse great-circle routes (Slerp) on our gorgeous wabi-sabi map, inspect aircraft specifications, and trace telemetry statistics.",
  keywords: [
    "flight tracker",
    "live flight tracking",
    "Aero radar",
    "Next.js flight radar",
    "real-time air traffic",
    "aviation visualizer",
  ],
  alternates: {
    canonical: "/flightradar",
  },
  openGraph: {
    title: "Aero Flight Tracker – Real-Time Air Traffic Simulation",
    description:
      "Organic wabi-sabi global flight tracking dashboard. Observe true headings, altitude profiles, and detailed telemetry.",
    url: "/flightradar",
    type: "website",
  },
  twitter: {
    title: "Aero Flight Tracker – Real-Time Air Traffic Simulation",
    description:
      "Organic, light-theme global air traffic visualizer.",
  },
};

export default function FlightRadarPage() {
  return <ClientDashboardLoader />;
}
