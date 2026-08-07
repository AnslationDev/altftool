const seo = {
  title: "Multi Country Clock — Live World Times",
  h1: "Multi Country Clock",
  metaDescription:
    "Track live local time in up to 12 countries at once. Search browser-supported IANA time zones, switch 12/24-hour format, and see DST-aware UTC offsets.",
  intro:
    "The Multi Country Clock puts the current local time for several countries side by side on one screen. It uses the IANA time-zone rules built into your browser to list supported zones and format each real instant in the region you picked. The display refreshes once per second, daylight-saving transitions follow the browser's current rule data, and no selected zone or clock reading is sent to a third-party time service.",
  useCases: [
    "Remote teams checking whether it is still working hours in London, New York, or Tokyo before pinging a colleague",
    "Travellers and expats keeping an eye on the time and date back home while abroad",
    "Anyone booking a cross-border call who needs to see which country has already rolled over to the next day",
  ],
  benefits: [
    [
      "Browser-native IANA zone data",
      "The searchable list comes from your browser's supported IANA identifiers rather than a hardcoded offset table, and can be filtered by city or region name.",
    ],
    [
      "Daylight saving is applied automatically",
      "Every tick formats the real current instant with the selected zone's IANA rules, so a clock follows seasonal offset changes without manual arithmetic or a page reload.",
    ],
    [
      "Ticks live without re-polling",
      "After the first reading, the seconds advance locally on a one-second interval — the clocks stay live without repeated network calls, and a page reload resyncs them all.",
    ],
    [
      "Free, no signup, nothing stored",
      "No account and no personal data. Selected zones stay only in page state, while all clock and UTC-offset formatting happens locally in your browser.",
    ],
  ],
  faqs: [
    [
      "What is a multi country clock?",
      "It's one screen showing the current local time in several countries at the same time, instead of converting one zone at a time. This one opens with New York, London, Tokyo, and Sydney already running, and lets you search the IANA time zones supported by your browser.",
    ],
    [
      "How many clocks can I show at once?",
      "Up to 12. Every selected zone renders as a clock card and the responsive grid wraps to fit them. Once you reach the limit, remove a clock with the x in its corner before adding another.",
    ],
    [
      "How do I add a country or city to the clock?",
      "Type into the search box — a city, region, or partial zone name such as London, Tokyo, or America — then click any result to add it. The search matches anywhere in the IANA identifier and lists the first 50 matches, so narrow the term when you search a whole region.",
    ],
    [
      "Does the world clock adjust for daylight saving time automatically?",
      "Yes. Every clock formats the real current instant with your browser's IANA rules for that zone. Its UTC offset and seasonal DST label are recalculated while the page remains open, so the time and offset move together across a transition.",
    ],
    [
      "How accurate is the time shown?",
      "Every tick starts from your device's current clock and formats that instant for the selected zone, so it does not accumulate interval drift. Its accuracy therefore matches your device clock and the IANA time-zone data installed in your browser.",
    ],
    [
      "Is the multi country clock free to use?",
      "Yes — free, with no signup, no account, and no usage limit. Zone discovery, time formatting, dates, DST state and UTC offsets are calculated locally by your browser.",
    ],
    [
      "Do my selected clocks stay saved after I close the tab?",
      "No. Your selections live in the page's state only and are not written to your browser or an account, so a refresh returns to the default New York, London, Tokyo, and Sydney set.",
    ],
    [
      "Can I see the date as well as the time for each country?",
      "Yes. Each clock shows the weekday, month, and day for that zone next to the time, plus the zone's current UTC offset — that's how you spot that Sydney is already on tomorrow's date while New York is still on today's.",
    ],
    [
      "Can I switch between 12-hour and 24-hour time?",
      "Yes. The 12-Hour / 24-Hour toggle changes the hero clock and every selected country clock together. The 24-hour formatter uses a midnight-safe hour cycle, so midnight displays as 00:00:00 rather than 24:00:00.",
    ],
  ],
  steps: [
    "Type a city, region, or partial zone name into the search box — try London, Tokyo, or America.",
    "Click a result to add that zone; its card appears with the live time, weekday, and date for that country.",
    "Choose 12-hour or 24-hour time, and remove clocks with the x in their corners when you no longer need them.",
  ],
};

export default seo;
