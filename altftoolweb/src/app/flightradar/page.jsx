// src/app/flightradar/page.jsx
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import ClientDashboardLoader from "./components/ClientDashboardLoader";

const PATH = "/flightradar";
// The entity name is the title without the " | AltFTool" the title carries for
// the SERP — the brand is already the publisher of the node, not part of the
// application's name. It matches packages/core experienceCatalog.js exactly.
const NAME = "Flight Radar Simulator";
const DESCRIPTION =
  "Watch 400 simulated flights follow great-circle routes on an interactive radar map, with per-aircraft detail. Generated data, not a live flight feed.";

export async function generateMetadata() {
  return createPageMetadata({
    title: `${NAME} | AltFTool`,
    // 168 characters, which trimMetaDescription cut to 153 ending "...with
    // aircraft specs and." — that dangling fragment is what /flightradar
    // serves today. Also "400+" overstated it: components/FlightRadarDashboard
    // calls useFlights(400), so the number is exactly 400. 149 characters,
    // under the 158 ceiling, and it says outright that the data is generated.
    description: DESCRIPTION,
    path: PATH,
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
      {/*
        WebApplication (via createToolJsonLd) + BreadcrumbList. This route is one
        interactive dashboard at one URL, not a listing: components/
        FlightRadarDashboard.jsx animates a single generated fleet and
        components/FlightSidebar.jsx opens the selected aircraft in place.

        The description keeps the "Generated data, not a live flight feed"
        sentence in the entity as well as the snippet — the node has to carry
        the same disclaimer the page does, or the markup reads as a live tracker.

        No ItemList of flights: the fleet is regenerated on every load by
        useFlights(400), so no flight has a stable identity or URL to list.
      */}
      <JsonLd
        id="flightradar-schema"
        data={[
          createToolJsonLd({
            slug: "flightradar",
            path: PATH,
            tool: {
              name: NAME,
              description: DESCRIPTION,
              category: ["Simulation", "Aviation", "Data Visualization"],
            },
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: NAME, path: PATH },
          ]),
        ]}
      />
      <h1 className="sr-only">Flight radar simulator — simulated global air traffic dashboard</h1>
      <ClientDashboardLoader />
    </>
  );
}
