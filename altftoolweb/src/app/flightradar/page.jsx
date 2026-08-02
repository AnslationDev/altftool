// src/app/flightradar/page.jsx
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import ClientDashboardLoader from "./components/ClientDashboardLoader";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Flight Radar Simulator | AltFTool",
    // 168 characters, which trimMetaDescription cut to 153 ending "...with
    // aircraft specs and." — that dangling fragment is what /flightradar
    // serves today. Also "400+" overstated it: components/FlightRadarDashboard
    // calls useFlights(400), so the number is exactly 400. 149 characters,
    // under the 158 ceiling, and it says outright that the data is generated.
    description:
      "Watch 400 simulated flights follow great-circle routes on an interactive radar map, with per-aircraft detail. Generated data, not a live flight feed.",
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
