const seo = {
  title: "Smart Meter Interval Analyzer: kWh by Tariff Band",
  steps: [
    "Paste your readings into Interval energy rows, one line each as timestamp | kWh | tariff label; a missing third column is grouped under Unlabelled.",
    "Set High interval threshold (kWh), which starts at 2, to the draw you want flagged.",
    "Read the total kWh, the Average and Maximum interval, the Tariff label / kWh / Share table and the top ten high intervals, then Copy or Download.",
  ],
  intro:
    "The Smart-Meter Interval Analyzer reads a list of half-hourly or hourly meter readings in the form \"timestamp | kWh | tariff label\" and returns total consumption, the average and maximum interval, a per-tariff kWh breakdown with each label's percentage share, and the intervals that hit or exceed a threshold you set (2 kWh by default). It is for householders and small-site owners who have downloaded their interval data and want to see where the load actually sits before switching to a time-of-use plan. The arithmetic is a straight sum and share calculation over the rows you paste, so it reflects your own meter rather than a modelled profile.",
  useCases: [
    "Your supplier offers a time-of-use tariff and you want to know what percentage of your kWh already falls in the off-peak window before you agree to the switch.",
    "Your bill jumped and you want to find which specific half-hours went over 2 kWh, so you can match them against the dishwasher, the immersion heater or an EV charge session.",
    "You are sizing a home battery and need the maximum single-interval draw and the average interval from your own data instead of a generic household figure.",
  ],
  benefits: [
    ["Share by tariff label, not just a total", "Every distinct label in the third column gets its own kWh subtotal and percentage of the whole, so peak versus off-peak splits fall out directly."],
    ["A threshold you choose", "The high-interval list is driven by your own kWh cut-off, so you can start at 2 kWh and tighten it until only the appliances you care about remain."],
    ["Ranked worst intervals", "The high intervals are sorted largest first and the top ten are listed with their timestamps, so the biggest offender is the first line you read."],
  ],
  faqs: [
    [
      "What format does my interval data need to be in?",
      "One reading per line as timestamp, then kWh, then tariff label, separated by pipe characters — for example 2026-07-20 18:00 | 2.2 | peak. The timestamp is treated as a label and is echoed back untouched, so any date format your supplier exports will work; only the kWh column has to be a number, and rows whose kWh will not parse are skipped.",
    ],
    [
      "What counts as a high interval?",
      "Any reading greater than or equal to the threshold you enter, which starts at 2 kWh. On half-hourly data a 2 kWh interval means an average draw of about 4 kW across those thirty minutes, roughly an electric shower, an oven or a slow EV charge running the whole time.",
    ],
    [
      "What if my export has no tariff column?",
      "Rows with a missing third column are grouped under the label Unlabelled, so the totals and averages still work. To get a peak versus off-peak split you need to add the labels yourself, using the time bands printed on your tariff sheet.",
    ],
    [
      "Will this tell me how much money I would save?",
      "No — it reports energy in kWh and the share each tariff label takes, not currency. Multiply each label's kWh by that band's unit rate from your own bill to get a cost comparison, and treat the result as an estimate, since standing charges, taxes and rate changes are not included.",
    ],
  ],
};

export default seo;
