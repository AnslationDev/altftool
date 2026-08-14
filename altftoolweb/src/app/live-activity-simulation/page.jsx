// src/app/live-activity-simulation/page.jsx
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import ClientLoader from "./components/ClientLoader";

const PATH = "/live-activity-simulation";
// The entity name drops the " | AltFTool" the title carries for the SERP — the
// brand is the publisher of the node, not part of the application's name.
const NAME = "Live Activity & User Behavior Simulator";
// Each of the four event kinds named here is a real branch of `activityTypes`
// in App.jsx line 20: order, search, coupon, mystery.
const DESCRIPTION =
  "Observe real-time simulated user actions including food orders, search surges, coupon wins, and mystery drops on our neo-brutalist interactive dashboard.";

export async function generateMetadata() {
  return createPageMetadata({
    title: `${NAME} | AltFTool`,
    description: DESCRIPTION,
    path: PATH,
    keywords: [
      "activity simulator",
      "live activity",
      "social proof simulation",
      "real-time urgency engine",
      "user behavior storytelling",
    ],
    type: "website",
  });
}

export default function LiveActivitySimulationPage() {
  return (
    <>
      {/*
        WebApplication (via createToolJsonLd) + BreadcrumbList. One interactive
        dashboard at one URL.

        The description keeps the word "simulated" inside the entity, not only
        in the snippet: App.jsx generates every event from local arrays
        (activityTypes, foods, coupons, mysteryBoxes), so a node that said
        "live user activity" would be markup for a data feed that does not
        exist.

        No ItemList or InteractionCounter: the feed is regenerated on the client
        on every load, nothing has a URL, and the running counters the dashboard
        shows are outputs of the simulation rather than measured usage.
      */}
      <JsonLd
        id="live-activity-simulation-schema"
        data={[
          createToolJsonLd({
            slug: "live-activity-simulation",
            path: PATH,
            tool: {
              name: NAME,
              description: DESCRIPTION,
              category: ["Simulation", "Prototyping", "Data Visualization"],
            },
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: NAME, path: PATH },
          ]),
        ]}
      />
      <h1 className="sr-only">Live activity and user behavior simulation</h1>
      <ClientLoader />
    </>
  );
}
