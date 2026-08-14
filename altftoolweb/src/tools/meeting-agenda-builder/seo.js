const seo = {
  title: "Meeting Agenda Builder with Time Slots & Cost",
  metaDescription:
    "Give each agenda item an owner and minutes; get a running order with clock slots, an end time, a 10% buffer and the cost from attendees × hourly rate.",
  steps: [
    "Fill in the Meeting details — title, date, 'Start time (24-hour)', attendees and the 'Loaded cost per attendee per hour (INR)'.",
    "Give each agenda item a Topic, Owner, Minutes and Purpose; 'Add item' appends more rows and the up/down arrows reorder the running order.",
    "Read the Running order table with clock slots, the end time with its 10% buffer and the estimated meeting cost, then click 'Copy agenda' for the invite.",
  ],
  intro:
    "The Meeting Agenda Builder converts a list of topics, owners and time allocations into a timed running order — every item gets a clock start and end derived from the meeting start time, and the meeting gets a total length, an end time and a cost. Meeting cost uses the standard loaded-cost formula: attendees × hourly cost per attendee × (total minutes ÷ 60). It is built for chairs, scrum masters and project managers who want an agenda that fits the calendar slot before the invite goes out.",
  useCases: [
    "Build a 45-minute weekly release sync where each of five topics has an owner and a fixed slot, then paste the running order into the calendar invite.",
    "Show a leadership team that a 90-minute all-hands with 30 attendees at ₹1,500 an hour costs ₹67,500 of salaried time.",
    "Reorder agenda items and see instantly whether the decision item still lands before the hard stop at the top of the hour.",
  ],
  benefits: [
    ["Clock slots, not guesses", "Each item shows its real start and end time, so you know exactly when the decision point arrives."],
    ["Cost of the room", "Applies attendees × hourly cost × hours so an over-long meeting shows up as money, not just minutes."],
    ["Built-in 10% buffer", "Adds the usual planning slack so a meeting that overruns slightly does not collide with the next slot."],
  ],
  faqs: [
    [
      "How do I calculate the cost of a meeting?",
      "Multiply the number of attendees by the fully loaded hourly cost of each attendee, then by the meeting length in hours. Six people at ₹1,500 an hour for 45 minutes costs 6 × 1,500 × 0.75 = ₹6,750.",
    ],
    [
      "How long should a meeting agenda be?",
      "Keep a working meeting at 60 minutes or less — this builder warns you above that. Calendar systems default to 30-minute slots, and a status meeting that needs more than an hour usually contains two meetings that should be split.",
    ],
    [
      "How much buffer should I leave at the end of a meeting?",
      "About 10% of the scheduled time, which this tool adds automatically — roughly 5 minutes on a 45-minute meeting. That slack absorbs a late start or one item that runs over without pushing into the next booking.",
    ],
    [
      "Does the agenda leave my browser?",
      "No. The agenda, attendee count and cost figures are calculated entirely in your browser and nothing is uploaded or stored on a server. Use the copy button to move the finished agenda into your calendar invite or notes.",
    ],
  ],
};

export default seo;
