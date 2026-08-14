const seo = {
  title: "Multi Time Zone Clock — Live World Times",
  h1: "Multi Time Zone Clock",
  metaDescription:
    "Track live local time in up to 12 browser-supported IANA zones. Search city or region identifiers, switch 12/24-hour format, and see DST-aware UTC offsets.",
  intro:
    "The Multi Time Zone Clock puts the current local time for several IANA zones side by side. It uses the time-zone rules built into your browser to list supported identifiers and format each real instant in the region you picked. The display refreshes once per second, daylight-saving transitions follow the browser's current rule data, and no selected zone or clock reading is sent to a third-party time service.",
  useCases: [
    "Remote teams checking whether it is still working hours in London, New York, or Tokyo before pinging a colleague",
    "Travellers and expats keeping an eye on the time and date back home while abroad",
    "Anyone booking a cross-border call who needs to compare dates across selected city or region zones",
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
      "What is a multi time zone clock?",
      "It's one screen showing the current local time in several IANA zones at once, instead of converting one zone at a time. This one opens with New York, London, Tokyo, and Sydney identifiers already running and lists the zones supported by your browser.",
    ],
    [
      "How many clocks can I show at once?",
      "Up to 12. Every selected zone renders as a clock card and the responsive grid wraps to fit them. Once you reach the limit, remove a clock with the x in its corner before adding another.",
    ],
    [
      "How do I add a city or region zone to the clock?",
      "Type part of an IANA identifier such as London, Tokyo, or America, then click a result to add it. The search matches the identifier plus a small set of legacy city aliases and lists the first 50 matches; it is not a general country-name directory.",
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
      "Is the multi time zone clock free to use?",
      "Yes — free, with no signup, no account, and no usage limit. Zone discovery, time formatting, dates, DST state and UTC offsets are calculated locally by your browser.",
    ],
    [
      "Do my selected clocks stay saved after I close the tab?",
      "No. Your selections live in the page's state only and are not written to your browser or an account, so a refresh returns to the default New York, London, Tokyo, and Sydney set.",
    ],
    [
      "Can I see the date as well as the time for each zone?",
      "Yes. Each clock shows the weekday, month, and day for that zone next to the time, plus the zone's current UTC offset — that's how you spot that Sydney is already on tomorrow's date while New York is still on today's.",
    ],
    [
      "Can I switch between 12-hour and 24-hour time?",
      "Yes. The 12-Hour / 24-Hour toggle changes the hero clock and every selected zone clock together. The 24-hour formatter uses a midnight-safe hour cycle, so midnight displays as 00:00:00 rather than 24:00:00.",
    ],
  ],
  steps: [
    "Type an IANA city or region fragment into the search box — try London, Tokyo, or America.",
    "Click a result to add that zone; its card appears with the live time, weekday, and date for that identifier.",
    "Choose 12-hour or 24-hour time, and remove clocks with the x in their corners when you no longer need them.",
  ],
};

export default seo;
