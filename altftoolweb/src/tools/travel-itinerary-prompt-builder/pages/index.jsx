"use client";

import QuickToolPage from "../../_shared/QuickToolPage";
import { buildItineraryPrompt, PACES, SEASONS, TRIP_STYLES, STAY_TYPES, CURRENCIES } from "../lib";

const fields = [
  { key: "destination", label: "Destination", placeholder: "Tokyo, Jaipur, Bali" },
  { key: "days", label: "Trip length (days)", placeholder: "7", inputMode: "numeric" },
  {
    key: "cities",
    label: "Number of bases",
    placeholder: "2",
    inputMode: "numeric",
    hint: "How many different places you'll stay overnight — each change of base costs about half a day.",
  },
  { key: "travellers", label: "Travellers", placeholder: "2", inputMode: "numeric" },
  {
    key: "pace",
    label: "Pace",
    type: "select",
    options: PACES.map((entry) => ({ value: entry.key, label: entry.label })),
  },
  {
    key: "season",
    label: "Season",
    type: "select",
    options: SEASONS.map((entry) => ({ value: entry, label: entry })),
  },
  {
    key: "style",
    label: "Trip style",
    type: "select",
    options: TRIP_STYLES.map((entry) => ({ value: entry, label: entry })),
  },
  {
    key: "stayType",
    label: "Accommodation type",
    type: "select",
    options: STAY_TYPES.map((entry) => ({ value: entry, label: entry })),
  },
  {
    key: "totalBudget",
    label: "Total on-the-ground budget",
    placeholder: "1500",
    inputMode: "decimal",
    hint: "On-the-ground spend only (flights excluded). Leave as 0 to skip the budget split.",
  },
  {
    key: "currency",
    label: "Currency",
    type: "select",
    options: CURRENCIES.map((entry) => ({ value: entry.key, label: entry.label })),
  },
  { key: "mustSee", label: "Must-see anchors", placeholder: "One per line or comma-separated", multiline: true, full: true },
  { key: "avoid", label: "Do not include", placeholder: "One per line or comma-separated", multiline: true, full: true },
  {
    key: "mobility",
    label: "Access needs (optional)",
    placeholder: "step-free access, no long walks",
    multiline: true,
    full: true,
  },
  {
    key: "arrivalNote",
    label: "Arrival / departure note (optional)",
    placeholder: "Landing 6pm day 1, leaving early morning on the last day",
    full: true,
  },
];

const defaults = {
  destination: "Tokyo",
  days: "7",
  cities: "4",
  travellers: "2",
  pace: "moderate",
  season: "Shoulder season",
  style: "Sightseeing and landmarks",
  stayType: "Mid-range hotel",
  totalBudget: "1500",
  currency: "USD",
  mustSee: "",
  avoid: "",
  mobility: "",
  arrivalNote: "",
};

function buildOutput(values) {
  const result = buildItineraryPrompt({
    destination: values.destination,
    days: values.days,
    cities: values.cities,
    travellers: values.travellers,
    pace: values.pace,
    season: values.season,
    style: values.style,
    stayType: values.stayType,
    totalBudget: values.totalBudget,
    currency: values.currency,
    mustSeeRaw: values.mustSee,
    avoidRaw: values.avoid,
    mobilityRaw: values.mobility,
    arrivalNote: values.arrivalNote,
    includeRestDay: true,
  });
  if (result.error) return `Unable to generate prompt: ${result.error}`;
  return result.prompt;
}

export default function TravelItineraryPromptBuilderPage() {
  return (
    <QuickToolPage
      title="Travel Itinerary Prompt Builder"
      description="Create an AI trip-planning prompt with a realistic activity capacity for your pace and city hops, plus a per-day budget split across stay, food and travel."
      fields={fields}
      defaults={defaults}
      buildOutput={buildOutput}
      outputLabel="Itinerary prompt"
    />
  );
}
