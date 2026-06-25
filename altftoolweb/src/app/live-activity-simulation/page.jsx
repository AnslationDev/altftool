// src/app/live-activity-simulation/page.jsx
import ClientLoader from "./components/ClientLoader";

export const metadata = {
  title: "Live Activity Simulation – Real-Time User Behavior Simulator",
  description:
    "Observe real-time simulated user actions including food orders, search surges, coupon wins, and mystery drops on our neo-brutalist interactive dashboard.",
  keywords: [
    "activity simulator",
    "live activity",
    "social proof simulation",
    "real-time urgency engine",
    "user behavior storytelling",
  ],
  alternates: {
    canonical: "/live-activity-simulation",
  },
  openGraph: {
    title: "Live Activity Simulation – Real-Time User Behavior Simulator",
    description:
      "Playful interactive social proof engine demonstrating live simulated orders, search intent spikes, and reward unlocks.",
    url: "/live-activity-simulation",
    type: "website",
  },
  twitter: {
    title: "Live Activity Simulation – Real-Time User Behavior Simulator",
    description: "Playful interactive social proof and urgency engine.",
  },
};

export default function LiveActivitySimulationPage() {
  return <ClientLoader />;
}
