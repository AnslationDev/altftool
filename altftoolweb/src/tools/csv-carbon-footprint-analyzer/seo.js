const seo = {
  title: "CSV Carbon Footprint Calculator: Custom Factors",
  metaDescription:
    "Paste rows as Activity | quantity | unit | kg CO₂e per unit to get the total in kg and tonnes CO₂e, a per-person split and a line-by-line breakdown.",
  steps: [
    "Enter one activity per line in Activity rows as Activity | quantity | unit | kg CO₂e per unit, for example Petrol | 180 | litre | 2.31.",
    "Set People sharing footprint to split the household total, or leave it at 1.",
    "Read the total kg CO₂e, the tonnes figure and the per-person split alongside the per-row contribution table, then use Download to save csv-carbon-footprint-analyzer.txt.",
  ],
  intro:
    "The CSV Carbon Footprint Analyzer totals estimated emissions from a pasted list of activity rows, each written as Activity | quantity | unit | kg CO₂e per unit, by multiplying quantity by the emission factor you supply and summing the results. It reports the total in kilograms and tonnes CO₂e, a per-person figure when a household is sharing the footprint, and a line-by-line table showing what each activity contributed. Because you provide the factors, the arithmetic follows whatever inventory or supplier disclosure you are working from rather than a fixed built-in dataset.",
  useCases: [
    "You have a year of electricity bills and fuel receipts in a spreadsheet and want to see which line dominates the total before deciding where cutting back is actually worth it.",
    "Two people share a flat and a car, and you need the household total split per person so each of you can report a comparable figure.",
    "A supplier sent you their published emission factors and you want to re-run your own consumption numbers against those factors instead of a generic calculator's hidden assumptions.",
  ],
  benefits: [
    ["You control the emission factors", "Each row carries its own kg CO₂e per unit, so you can use the factor for your country, grid year or fuel pathway instead of an unstated default."],
    ["Mixed units in one total", "kWh, litres and passenger-km can sit in the same list because the unit is only a label — the factor does the conversion to CO₂e."],
    ["Line-level attribution", "The output table shows the kg CO₂e each activity contributed, not just the sum, so the biggest contributor is obvious at a glance."],
  ],
  faqs: [
    [
      "What format do the activity rows need to be in?",
      "One activity per line, four fields separated by pipes: Activity | quantity | unit | kg CO₂e per unit — for example Petrol | 180 | litre | 2.31. Blank lines are ignored, and a missing or non-numeric quantity or factor is treated as zero.",
    ],
    [
      "Where do I get the emission factor for each activity?",
      "From a published inventory rather than from this tool — national greenhouse gas factor sets, your electricity supplier's disclosed grid intensity, or the standard your reporting framework names. Factors change every year and vary widely by country, so a figure that is right for one grid can be far off for another.",
    ],
    [
      "How is the per-person figure calculated?",
      "The total is divided by the number of people sharing the footprint, with a minimum of one. It is a flat split, so it does not weight anyone's share by how much of the electricity or driving they personally accounted for.",
    ],
    [
      "Can I use this result for official reporting?",
      "No — it is an informational estimate built from factors you enter, and it does not handle scope boundaries, radiative forcing uplift for aviation, or allocation rules. For a disclosure that will be audited or filed, work from an authoritative inventory and consult a qualified carbon accounting practitioner.",
    ],
  ],
};

export default seo;
