const seo = {
  title: "FX Rate Alerter — ECB Reference Rate, Any Pair",
  metaDescription:
    "Type USD/INR or any pair for the ECB reference rate via Frankfurter, with the rate date attached. A benchmark, not a dealable quote.",
  steps: [
    "Type the currency pair into the Lookup box — it opens on USD/INR, and USD INR or USD-INR are parsed the same way.",
    "Press Get current result to fetch the European Central Bank reference rate from the Frankfurter API for that pair.",
    "The Current result panel shows '1 USD = … INR' with an Updated timestamp and rows for Base, Quote, Rate date and Rate, plus the note that this is a reference rate, not a tradable quote — banks and payment providers add spreads and fees.",
  ],
  intro:
    "FX Rate Alerter looks up the current reference exchange rate for any currency pair you type — for example USD/INR or EUR/GBP — using the Frankfurter API, which serves the European Central Bank's published foreign-exchange reference rates. Each check returns the rate, the base and quote codes, and the rate date the ECB stamped it with, so you can see how fresh the number is before acting on it. These are reference rates rather than dealable quotes: banks, card networks and remittance services add their own spread on top.",
  useCases: [
    "Watching USD/INR before a remittance and wanting the underlying reference rate to compare against what a transfer provider is offering you.",
    "Reconciling an invoice raised in euros against a sterling payment received, and needing the reference rate for the exact date the payment cleared.",
    "Checking whether a pair has crossed the level you had in mind before you commit to a booking or a purchase priced in another currency.",
  ],
  benefits: [
    ["Central-bank source, not a scraped quote", "Rates come from the ECB reference series via Frankfurter, so the number is the same one used for accounting and reporting benchmarks."],
    ["Shows the rate date, not just the rate", "Every result carries the date the rate belongs to, which tells you immediately whether you are looking at today's fix or Friday's."],
    ["Any pair in one field", "Type the pair as USD/INR, USD INR or USD-INR — the base and quote are parsed from whichever separator you use."],
  ],
  faqs: [
    [
      "How often do the rates update?",
      "The ECB reference rates behind this tool are published once per working day, at around 16:00 Central European Time. There is no weekend or public-holiday update, so a Saturday lookup returns Friday's rate with Friday's date attached.",
    ],
    [
      "Can I actually trade at the rate shown?",
      "No. It is a reference rate, and the note shown with every result says so — banks, brokers and payment providers apply a spread and fees, so the amount you receive will be below this figure. Use it as a benchmark for judging how much margin a provider is charging.",
    ],
    [
      "Which currencies are supported?",
      "The currency codes in the ECB reference set, which covers the major and most widely traded currencies as three-letter ISO codes such as USD, EUR, GBP, JPY and INR. A pair using a code outside that set returns no rate.",
    ],
    [
      "Does it alert me automatically when a rate is hit?",
      "No — each check is on demand: you enter the pair, request a current reading, and compare the returned rate against your own target. Nothing runs in the background and no rate is stored between visits.",
    ],
  ],
};

export default seo;
