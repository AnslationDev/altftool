"use client";

import QuickToolPage from "../../_shared/QuickToolPage";

const fields = [
  { key: "destination", label: "Destination", placeholder: "Tokyo, Jaipur, Bali" },
  { key: "days", label: "Trip length", placeholder: "5 days" },
  { key: "travellers", label: "Travellers", placeholder: "couple, family with kids, solo" },
  { key: "preferences", label: "Preferences/budget", placeholder: "food, museums, low walking, mid-range", multiline: true, full: true },
];

const defaults = {
  destination: "Tokyo",
  days: "5 days",
  travellers: "couple",
  preferences: "food, neighborhoods, low-stress schedule, mid-range budget",
};

function buildOutput(values) {
  return [
    "Travel itinerary prompt",
    "",
    `Create a ${values.days || "multi-day"} itinerary for ${values.destination || "the destination"}.`,
    `Travellers: ${values.travellers || "travellers"}.`,
    `Preferences: ${values.preferences || "balanced sightseeing and food"}.`,
    "",
    "Return:",
    "- Day-by-day route with morning/afternoon/evening",
    "- Travel time assumptions",
    "- Food and rest breaks",
    "- Rainy-day backup",
    "- Budget watch-outs",
    "- Things to book in advance",
  ].join("\n");
}

export default function TravelItineraryPromptBuilderPage() {
  return (
    <QuickToolPage
      title="Travel Itinerary Prompt Builder"
      description="Create an AI prompt for a realistic day-by-day travel itinerary."
      fields={fields}
      defaults={defaults}
      buildOutput={buildOutput}
      outputLabel="Itinerary prompt"
    />
  );
}
