const seo = {
  title: "Trip Itinerary Builder With Clash and Cost Checks",
  metaDescription:
    "Plan up to 21 days: overlapping activities are flagged, days past the 5, 7 or 9 hour pace cap are marked, and costs split per person. Copy or export CSV.",
  steps: [
    "Set Destination, Start date, Days (1–21), Travelers, Currency and a Pace of Relaxed, Balanced or Packed.",
    "In Add Activity give a title, place, category, start time, Duration min and Estimated cost, then press the Add To Day button.",
    "Watch the Day Timeline for Overlap badges and heavy days, then press Copy for a Markdown plan or CSV for itinerary-builder.csv.",
  ],
  intro:
    "The Itinerary Builder turns a list of trip activities into a day-by-day schedule with start times and durations, then flags every overlap where one activity's end time runs past the next one's start. Each entry carries a place, a category (Travel, Stay, Food, Sightseeing, Transport, Break or Shopping), a cost and a booked flag, so the plan doubles as a budget: totals are split per person and per day in INR, USD, EUR or GBP. A pace setting caps how many planned hours a day should hold — 5 for relaxed, 7 for balanced, 9 for packed — and any day above that cap is marked as overloaded.",
  useCases: [
    "You have booked flights and a hotel for a five-day trip and need to see whether the museum, the market and the sunset viewpoint actually fit into day two without colliding",
    "Two of you are splitting costs and you want the per-person figure before you commit to the paid tours rather than after the trip",
    "You are the one organising a group trip and need a clean day-wise plan to send round as Markdown or a CSV everyone can open in a spreadsheet",
  ],
  benefits: [
    ["Overlaps are detected, not eyeballed", "Any activity whose start plus duration runs into a later slot on the same day is flagged on both cards, even when a shorter activity sits between them in the schedule."],
    ["Pace caps catch over-planned days", "A day's planned minutes are measured against the 5, 7 or 9 hour cap for your chosen pace, so cramming shows up before you travel."],
    ["Cost split three ways", "The same activity costs roll up into a trip total, a per-person share and a per-day average, plus a breakdown by category."],
  ],
  faqs: [
    [
      "How does it know two activities clash?",
      "It sorts each day's activities chronologically, then compares every activity's end time — start plus duration in minutes — against the start time of every later activity that day, not only the one immediately after it. If an end time runs past a later start time, both cards are marked as conflicting, so a long block that overlaps a non-adjacent later activity is still caught, not just back-to-back pairs.",
    ],
    [
      "What do the relaxed, balanced and packed pace settings actually change?",
      "They set the daily hour cap: relaxed allows 5 planned hours a day, balanced 7 and packed 9. The tool adds up the durations on each day and counts any day over that cap as a heavy day, which is a planning warning rather than a hard limit.",
    ],
    [
      "Can I export the itinerary?",
      "Yes, in two formats. Markdown gives you a readable day-by-day list with time ranges, places, categories and costs that pastes into notes or chat; CSV gives one row per activity with start, end, duration, cost and booking status for a spreadsheet.",
    ],
    [
      "How is the per-person cost worked out?",
      "It is the sum of every activity cost divided by the number of travellers, which you can set from 1 to 20. Because it divides the whole trip evenly, activities only some of the group will do — a single paid tour, for instance — are still shared across everyone in that figure.",
    ],
  ],
};

export default seo;
