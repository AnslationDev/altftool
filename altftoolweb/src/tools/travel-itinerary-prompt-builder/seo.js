const seo = {
  intro:
    "The Travel Itinerary Prompt Builder writes an AI trip-planning prompt that carries its own reality check: it charges half a day for every change of base, multiplies the usable days that remain by the activities your chosen pace allows, and tells the model exactly how many main activities the trip can hold. It also converts your total on-the-ground budget into a per-person-per-day figure and splits it 35 percent accommodation, 25 percent food, 15 percent activities, 10 percent local transport, 10 percent intercity travel and 5 percent buffer. It is for travellers who keep getting back impossibly packed AI itineraries and want the constraints stated before the model starts inventing days.",
  useCases: [
    "You asked a chatbot for a 7-day, 4-city itinerary and got 30 attractions; you want the prompt to say up front that four bases cost 1.5 days and only about 11 activities actually fit.",
    "You have a fixed spend for two people over ten days and want the prompt to hand the model a per-person-per-day ceiling and a category split, rather than letting it suggest things you cannot afford.",
    "Someone in your group has step-free access needs and a list of things to avoid, and you want those written into the prompt as hard constraints along with a rule to flag unverified opening hours.",
  ],
  benefits: [
    [
      "Capacity computed before the model plans",
      "Move days are subtracted first, so a 7-day trip across 3 bases is planned as 6 usable days — the arithmetic most AI itineraries skip.",
    ],
    [
      "Budget split that always adds up",
      "The six category amounts are allocated by the largest-remainder method, so the parts sum exactly to your rounded total instead of drifting after rounding.",
    ],
    [
      "Anti-hallucination rules built in",
      "The prompt instructs the model to mark every price, opening hour and transport time [VERIFY] with a source, and to name no restaurant or hotel it cannot vouch for.",
    ],
  ],
  faqs: [
    [
      "How many places should I visit on a one-week trip?",
      "Two or three bases at most. Each change of base costs roughly half a day to pack, travel and check in, so four bases in seven days burns 1.5 days before you see anything, and averaging under two nights per stop is flagged here as a packing-and-moving holiday rather than a trip.",
    ],
    [
      "How many activities can I fit into a day of sightseeing?",
      "Between one and four depending on pace, where a main activity is anything taking two hours or more once travel to it is counted. Two a day is the comfortable default; three leaves no slack, so a single delay collapses the day; four requires early starts and is only sustainable for a few days.",
    ],
    [
      "How should I split a travel budget by category?",
      "The conventional on-the-ground split used here is 35 percent accommodation, 25 percent food and drink, 15 percent activities and entry tickets, 10 percent local transport, 10 percent intercity travel and 5 percent buffer. International flights are deliberately excluded because they are usually booked separately and would swamp the daily figures.",
    ],
    [
      "Does this actually plan my trip?",
      "No — it produces the prompt, which you then paste into the AI assistant of your choice. The capacity and budget numbers are planning estimates, and anything the model returns about prices, opening hours, visas or timetables should be checked against the official source before you book.",
    ],
  ],
};

export default seo;
