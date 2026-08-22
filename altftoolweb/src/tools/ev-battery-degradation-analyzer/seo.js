const seo = {
  title: "EV Battery Degradation: kWh Lost per 10,000 km",
  metaDescription:
    "Paste dated capacity readings (date | usable kWh | range | odometer) and track state of health as % of new, with kWh lost per 10,000 km driven.",
  steps: [
    "Paste one reading per line into Battery observations as date | estimated usable kWh | displayed range km | odometer km, and set New usable capacity (kWh)",
    "The analyzer converts every row to a percentage of the new capacity and tabulates Date, Usable kWh, % of new, Range km and Odometer",
    "Read the latest capacity percentage plus the Capacity change, Odometer span and Change per 10,000 km rows, then use Copy or Download to save the summary",
  ],
  intro:
    "This analyzer turns a log of your own EV battery observations — date, usable kWh, displayed range and odometer reading — into a state-of-health trend: each entry is expressed as a percentage of the pack's new usable capacity, and the first and last entries give the total kWh lost and the loss normalised per 10,000 km driven. It is for owners tracking whether their pack is fading faster than expected, using their own repeated readings rather than a one-off dashboard number.",
  useCases: [
    "You are three years into ownership and want to know whether the 4 kWh you appear to have lost is spread evenly or has accelerated in the last year",
    "Preparing to sell a used EV and needing a dated record of capacity against odometer that a buyer can look at",
    "Checking a pack against a capacity warranty threshold before the warranty period runs out, so you know whether to book a dealer diagnostic",
  ],
  benefits: [
    ["Loss per distance, not just per year", "The kWh change is divided by the odometer span and reported per 10,000 km, which is the figure that compares meaningfully between cars driven differently."],
    ["Every reading kept as a row", "The table shows each observation with its capacity, its percentage of new, its displayed range and the odometer, so you can spot the outlier reading rather than average it away."],
    ["Range and capacity side by side", "Displayed range often falls faster than true capacity; keeping both columns makes it obvious when the drop is seasonal driving rather than the pack."],
  ],
  faqs: [
    [
      "What do I enter for usable kWh?",
      "The pack's estimated usable energy at that date, one line per observation in the form date | usable kWh | displayed range km | odometer km. Take it the same way every time — a full charge reading, an app-reported figure, or an OBD scan — because mixing sources produces a trend that reflects your method rather than the battery.",
    ],
    [
      "How much degradation is normal for an EV battery?",
      "There is no single number, but the widely used industry benchmark is that packs are expected to retain roughly 70% of original capacity over the warranty term, which for most manufacturers is 8 years or 160,000 km, whichever comes first. Check your own warranty document for the exact threshold, because both the percentage and the term vary by maker.",
    ],
    [
      "Why did my displayed range drop more than my capacity?",
      "Because the range estimate is computed from recent driving efficiency, not from the pack alone. Cold weather, faster driving, roof boxes and winter tyres all cut km per kWh, so range can fall 20% or more in winter while usable capacity is essentially unchanged — which is why both columns are tracked separately here.",
    ],
    [
      "Can this replace a dealer battery health test?",
      "No. This is a trend estimate built entirely from the numbers you type in, with no access to cell-level voltages, balancing data or fault codes. Use it to decide whether a professional state-of-health diagnostic is worth booking, and rely on the official test for a warranty claim.",
    ],
  ],
};

export default seo;
