// src/app/flightradar/page.jsx
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import ClientDashboardLoader from "./components/ClientDashboardLoader";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Flight Radar Simulator | AltFTool",
    description:
      "Explore simulated global air traffic: watch 400+ generated flights follow great-circle routes on an interactive radar-style map, with aircraft specs and simulated stats.",
    path: "/flightradar",
    keywords: [
      "flight radar simulator",
      "simulated flight tracking",
      "aero radar visualizer",
      "Next.js flight radar",
      "aviation visualizer",
    ],
    type: "website",
  });
}

export default function FlightRadarPage() {
  return (
    <>
      <h1 className="sr-only">Flight radar simulator — simulated global air traffic dashboard</h1>
      <ClientDashboardLoader />
    </>
  );
}
