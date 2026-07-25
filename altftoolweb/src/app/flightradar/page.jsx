// src/app/flightradar/page.jsx
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import ClientDashboardLoader from "./components/ClientDashboardLoader";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Live Flight Tracker & Air Traffic | AltFTool",
    description:
      "Explore global air traffic in real-time. Watch 400+ active flights traverse great-circle routes (Slerp) on our gorgeous wabi-sabi map, inspect aircraft specifications, and trace telemetry statistics.",
    path: "/flightradar",
    keywords: [
      "flight tracker",
      "live flight tracking",
      "Aero radar",
      "Next.js flight radar",
      "real-time air traffic",
      "aviation visualizer",
    ],
    type: "website",
  });
}

export default function FlightRadarPage() {
  return (
    <>
      <h1 className="sr-only">Live flight tracker and air traffic dashboard</h1>
      <ClientDashboardLoader />
    </>
  );
}
