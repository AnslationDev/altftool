// src/app/live-activity-simulation/page.jsx
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import ClientLoader from "./components/ClientLoader";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Live Activity & User Behavior Simulator | AltFTool",
    description:
      "Observe real-time simulated user actions including food orders, search surges, coupon wins, and mystery drops on our neo-brutalist interactive dashboard.",
    path: "/live-activity-simulation",
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
      <h1 className="sr-only">Live activity and user behavior simulation</h1>
      <ClientLoader />
    </>
  );
}
