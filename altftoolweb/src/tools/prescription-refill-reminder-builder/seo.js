const seo = {
  title: "Prescription Refill Reminder and Fill Date Builder",
  metaDescription:
    "Turn quantity dispensed, daily dose and repeats into every fill date plus a reminder 5 days early, with fills past the expiry flagged.",
  steps: [
    "Enter Quantity dispensed each fill, Amount taken per day, the First fill date and Repeats authorised after the first fill.",
    "Set Remind me this many days early and a Prescription expires on date, or pick a validity rule to fill that date for you.",
    "Read every fill date with its reminder date and the leftover units, check any fills flagged past the expiry, then press Copy schedule.",
  ],
  intro:
    "The Prescription Refill Reminder Builder converts the three numbers on a dispensing label — quantity dispensed, amount taken per day, and repeats authorised — into every fill date and a reminder date a set number of days before each one, using days supply = floor(quantity ÷ daily dose) and fill n = first fill + (n − 1) x days supply. It is for anyone managing a repeat prescription, or a carer running several, who wants the calendar dates rather than a vague sense that the pack is running low. Enter the prescription's expiry and any fill that would fall after it is flagged before you plan around it.",
  useCases: [
    "You collect 90 tablets at two a day with five repeats authorised, and want the six collection dates and the date cover finally runs out written down in one place.",
    "You care for a parent on four medicines with different pack sizes and need each one's reminder date so trips to the pharmacy can be combined rather than made weekly.",
    "Your prescription was written in March and expires in six months, and you want to see which of the later repeats fall past that date so you can book a review appointment in time.",
  ],
  benefits: [
    [
      "Part days are not counted as cover",
      "Days supply uses floor division, so 100 tablets at three a day gives 33 days of cover with 1 tablet left over — the remainder is reported separately instead of being rounded into an extra day.",
    ],
    [
      "Reminder dates, not just fill dates",
      "Every fill after the first gets its own reminder date at your chosen lead time, defaulting to 5 days before, so there is time to order and collect.",
    ],
    [
      "Expiry is checked against each fill",
      "Enter an expiry date and the builder marks every fill that falls after it and names the first one, rather than laying out a schedule you cannot actually use.",
    ],
  ],
  faqs: [
    [
      "How do I work out how many days a prescription will last?",
      "Divide the quantity dispensed by the amount taken per day and round down: 60 tablets at 1.5 per day is 40 days of cover. Rounding down matters because a leftover part-dose is not a full day of medicine — the builder reports the leftover units separately.",
    ],
    [
      "How long is a prescription valid?",
      "It depends on where you are, which is why expiry is an input here rather than a fixed rule. In the United States a non-controlled prescription is generally valid for one year from the date written, and Schedule III-V controlled substances for six months with at most five refills; an NHS prescription in the UK is normally valid for six months from the appropriate date. Confirm the rule that applies to you with your pharmacist.",
    ],
    [
      "How many refills can I schedule at once?",
      "Up to 24 fills in one schedule — the original dispense plus 23 repeats. Enter the repeats authorised on your label and the total fills come out as repeats + 1.",
    ],
    [
      "Can I use this to decide when to change my dose?",
      "No. This is a date-arithmetic tool for planning collections, not medical guidance — it takes your daily dose as given and never suggests one. Any change to a dose, a switch between medicines, or a missed-dose question is for your prescriber or pharmacist, and the schedule it produces should be checked against the label on the pack.",
    ],
  ],
};

export default seo;
