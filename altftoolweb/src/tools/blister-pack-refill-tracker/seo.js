const seo = {
  title: "Blister Pack Refill Tracker: Run-Out & Reorder",
  metaDescription:
    "Count your strips once to get the run-out date, a reorder-by date from lead time plus safety buffer, and how many packs the next order needs.",
  steps: [
    "Enter the strip count — Unopened strips left, Tablets on a full strip and Tablets left on part-used strips — plus the Date you counted them, Tablets per dose and Doses per day.",
    "Set Days from ordering to receiving, Safety buffer in days and the Days of cover the next order should give; the tracker recalculates as you type, with no submit button.",
    "Read the 'Supply runs out on' date, the Reorder by date and the packs to order, then press Copy plan to put the full refill plan on your clipboard.",
  ],
  intro:
    "This tracker turns a physical tablet count into dates: divide the tablets you have on hand by the tablets you take a day to get the full days of cover, add that to the day you counted for the run-out date, then subtract the delivery lead time and a safety buffer to get the day the order has to be placed. It also works out how many whole packs the next order needs for a chosen period of cover. Count the strips once and you know both dates instead of discovering an empty strip on a Sunday evening.",
  useCases: [
    "Counting what is left mid-month on a twice-daily blood pressure tablet before the next pharmacy visit",
    "Planning a repeat prescription so it clears the surgery and the courier before the current strip empties",
    "Working out how many strips to carry for a three-week trip abroad",
  ],
  benefits: [
    ["Two dates, not one", "Separates the day you run out from the day you must order to avoid running out."],
    ["Counts part-used strips", "Loose tablets are included, and a leftover part-day is reported rather than rounded up."],
    ["Order quantity included", "Converts the cover you want into whole packs, the way a pharmacy dispenses them."],
  ],
  faqs: [
    [
      "How do I work out how long my tablets will last?",
      "Divide the number of tablets you have by the number you take each day. Twenty tablets at two a day is ten days of cover, so if you count them on the 26th the last fully covered day is the 4th and you are out on the 5th.",
    ],
    [
      "When should I reorder a repeat prescription?",
      "Work back from the run-out date by the time it takes to get the medicine in your hand, plus a few spare days. With a three-day turnaround and a two-day buffer you order five days before the run-out date, and if the prescription needs a doctor's authorisation add that time too.",
    ],
    [
      "How many tablets are on a blister strip?",
      "It varies by product and market: 10 and 15 are the most common strip sizes in India, while 7, 14, 28 and 30 are common elsewhere because they map onto whole weeks or a month. Count one full strip yourself rather than assuming, because the same molecule is packed differently by different manufacturers.",
    ],
    [
      "What should I do if I am about to run out of medicine?",
      "Contact the pharmacy or prescriber straight away — many can supply an emergency few days' worth while a repeat is authorised. Do not skip doses or halve tablets to make the strip stretch; for some medicines, including blood pressure, epilepsy and thyroid treatment, an interruption matters.",
    ],
  ],
};

export default seo;
