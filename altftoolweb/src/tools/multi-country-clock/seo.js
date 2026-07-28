const seo = {
  title: "Multi Country Clock — Live World Times Side by Side",
  h1: "Multi Country Clock",
  metaDescription:
    "Track live local time in three countries at once. Search close to 600 IANA time zones by city, country, or region — free, no signup, DST included.",
  intro:
    "The Multi Country Clock puts the current local time for several countries side by side on one screen. Each clock's first reading comes from the timeapi.io public time API — one endpoint supplies the searchable list of close to 600 IANA zone identifiers, from Africa/Abidjan to Pacific/Auckland, and another returns the current date and time for the zone you picked. The browser then advances the display with a one-second interval, so the seconds tick without re-polling the server, and because the reading is the zone's own local wall time, daylight-saving shifts are already applied.",
  useCases: [
    "Remote teams checking whether it is still working hours in London, New York, or Tokyo before pinging a colleague",
    "Travellers and expats keeping an eye on the time and date back home while abroad",
    "Anyone booking a cross-border call who needs to see which country has already rolled over to the next day",
  ],
  benefits: [
    [
      "Real zone data, not a hardcoded list",
      "The searchable list is fetched live from timeapi.io's available-zones endpoint — close to 600 IANA identifiers covering every region, searchable by city, country, or region name.",
    ],
    [
      "Daylight saving is already applied",
      "Each clock shows the zone's actual local wall time as returned by the time API, so you never have to work out which countries are currently on summer time.",
    ],
    [
      "Ticks live without re-polling",
      "After the first reading, the seconds advance locally on a one-second interval — the clocks stay live without repeated network calls, and a page reload resyncs them all.",
    ],
    [
      "Free, no signup, nothing stored",
      "No account and no personal data. The only thing that leaves your browser is the IANA zone name you selected, sent to the public time API to fetch that zone's current time.",
    ],
  ],
  faqs: [
    [
      "What is a multi country clock?",
      "It's one screen showing the current local time in several countries at the same time, instead of converting one zone at a time. This one opens with New York, London, and Tokyo already running, and you can swap in any of the close to 600 IANA time zones the search box covers.",
    ],
    [
      "How many clocks can I show at once?",
      "Three. The grid renders the first three zones in your list, so to watch a different country, remove one clock with the x in its corner and then add the new zone from search.",
    ],
    [
      "How do I add a country or city to the clock?",
      "Type into the search box — a country, city, region, or partial zone name such as London, Tokyo, or America — then click any result to add it. The search matches anywhere in the IANA identifier and lists the first 50 matches, so narrow the term when you search a whole region.",
    ],
    [
      "Does the world clock adjust for daylight saving time automatically?",
      "Yes. Every clock's time comes from the timeapi.io zone endpoint, which resolves the IANA rules for that zone, so a country currently on summer time shows its summer time. There is nothing to toggle.",
    ],
    [
      "How accurate is the time shown?",
      "The first reading for each clock is the server's exact time for that zone; after that your browser advances it with a one-second interval, so over a long session it can drift by a second or two against a reference clock. Reloading the page pulls a fresh reading for every clock.",
    ],
    [
      "Is the multi country clock free to use?",
      "Yes — free, with no signup, no account, and no usage limit. The only data sent anywhere is the IANA zone name, for example Asia/Tokyo, which goes to the public time API to look up that zone's current time.",
    ],
    [
      "Do my selected clocks stay saved after I close the tab?",
      "No. Your selections live in the page's state only and are not written to your browser or an account, so a refresh returns to the default New York, London, and Tokyo set.",
    ],
    [
      "Can I see the date as well as the time for each country?",
      "Yes. Each clock shows the weekday, month, and day for that zone next to the time — that's how you spot that Sydney is already on tomorrow's date while New York is still on today's.",
    ],
  ],
  steps: [
    "Type a country, city, or region into the search box — try London, Tokyo, or America.",
    "Click a result to add that zone; its card appears with the live time, weekday, and date for that country.",
    "Remove a clock with the x in its corner to free a slot, and reload the page any time to resync every clock with the time API.",
  ],
};

export default seo;
