const seo = {
  title: "Travel Phone Setup Checklist with Readiness",
  metaDescription:
    "A phone checklist for one trip: tasks filter by roaming pack, eSIM, local SIM or Wi-Fi only, and readiness weights critical 3, recommended 2, optional 1.",
  steps: [
    "Enter Days until departure and pick \"How you will get mobile data\": Home carrier roaming pack, Travel eSIM, Local SIM bought on arrival, or Wi-Fi only.",
    "Tick \"Leaving the country\", \"Flying\" and \"Driving there\" to filter the task list, then tick off each task as you finish it.",
    "Watch the Phone readiness percentage — critical tasks count 3, recommended 2, optional 1 — and press Copy result to take the outstanding items with you.",
  ],
  intro:
    "This tool builds the phone setup checklist for one specific trip and scores how ready you are, weighting each task by priority rather than counting ticks: readiness % = weight of ticked items ÷ weight of all items, where critical counts 3, recommended 2 and optional 1. It filters the catalogue by your connectivity plan (roaming pack, travel eSIM, local SIM or Wi-Fi only) and by whether you are flying, driving or staying domestic, and flags each task as due now once the days left to departure fall to its lead time.",
  useCases: [
    "Two days before an international flight, checking that the eSIM is installed and the home line is still enabled for bank SMS one-time passcodes.",
    "Before a road trip, making sure the offline map covers the whole route rather than just the cities at each end.",
    "Packing for a flight and confirming the power bank is in carry-on, since IATA rules keep lithium batteries out of the hold.",
  ],
  benefits: [
    [
      "The list matches your trip",
      "Choosing Wi-Fi only swaps roaming-pack tasks for a hard 'data roaming off' item; unticking Flying drops the boarding-pass tasks.",
    ],
    [
      "Weighted, not counted",
      "A missed critical task costs three times an optional one, so 90% with a critical item left never reads as ready.",
    ],
    [
      "Lead times, not vague advice",
      "Carrier unlocking is flagged 7 days out; backup verification 1 day out — so nothing lands too late to fix.",
    ],
  ],
  faqs: [
    [
      "What should I do to my phone before travelling abroad?",
      "Four things matter most: run and verify a full backup, download offline maps and your bookings, sort out data before you fly (eSIM installed or roaming pack activated), and set a six-digit passcode with Find My switched on and tested. The checklist adds the rest for your trip type — SIM PIN, Medical ID, two-factor backup codes stored off the phone, and a plug adapter for the destination.",
    ],
    [
      "Should I turn off data roaming when travelling?",
      "Only if you have no data plan for the destination — then yes, turn it off entirely, because a single background photo sync on out-of-bundle roaming is what produces three-figure bills. With a roaming pack or travel eSIM, leave roaming on but set a mobile-data warning below your pack size, turn off background app refresh on mobile data, and set photo and video backup to Wi-Fi only; video alone runs about 60 MB per minute at 1080p and 190 MB per minute at 4K.",
    ],
    [
      "Can I put a power bank in checked luggage?",
      "No. Lithium-ion batteries must travel in the cabin, not the hold. Power banks up to 100 Wh are generally accepted without asking, 100–160 Wh need airline approval, and above 160 Wh they are not allowed in passenger baggage at all. Check your airline's page before you fly, since carriers apply the rules with their own limits on quantity.",
    ],
    [
      "Will my bank one-time passcodes still arrive if I use a travel eSIM?",
      "Yes, provided you keep the home SIM or eSIM enabled for calls and texts and set the travel eSIM only as the data line. SMS one-time passcodes are delivered to your home number, so disabling that line to avoid roaming charges is the most common way travellers lock themselves out of banking. Receiving an SMS while roaming is usually free; it is outgoing calls, texts and data that are charged.",
    ],
  ],
};

export default seo;
