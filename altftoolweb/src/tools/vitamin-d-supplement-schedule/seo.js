const seo = {
  intro:
    "This scheduler converts an intermittent vitamin D instruction — 60,000 IU once a week, 50,000 IU weekly, one sachet a month — into the exact calendar dates the doses fall on, and divides the course total by the days it covers to give the average daily intake in IU and micrograms. That average is compared against the Institute of Medicine reference values quoted by the NIH: an RDA of 600 IU a day for ages 1 to 70, 800 IU from 71, and a tolerable upper intake level of 4,000 IU a day for adults. It is a planning and understanding aid for a dose someone has already been given, not a dose recommendation.",
  useCases: [
    "Marking the eight Sunday dates for a 60,000 IU weekly loading course so none are missed",
    "Working out what a monthly 60,000 IU sachet averages out to per day before a follow-up 25(OH)D test",
    "Converting a label written in micrograms (25 mcg) into the IU figure a prescription is written in",
  ],
  benefits: [
    ["Real dates, not counting", "Weekly, fortnightly and calendar-monthly doses laid out as dates you can transfer to a calendar."],
    ["IU and microgram side by side", "Uses the standard 1 mcg = 40 IU conversion so label and prescription units match up."],
    ["Reference values attached", "Shows the average daily equivalent against the 600 IU RDA and the 4,000 IU adult upper limit."],
  ],
  faqs: [
    [
      "How many IU is 60,000 IU weekly per day?",
      "About 8,571 IU a day — 60,000 divided by 7. Over an eight-week course that is 480,000 IU in total, which is why weekly high-dose regimens are prescribed for a fixed number of weeks rather than continued indefinitely.",
    ],
    [
      "How do I convert mcg of vitamin D to IU?",
      "Multiply micrograms by 40: 1 mcg of cholecalciferol equals 40 IU. So 25 mcg is 1,000 IU, 50 mcg is 2,000 IU, and the 15 mcg RDA for adults up to 70 is the same as 600 IU.",
    ],
    [
      "Is 60,000 IU of vitamin D a week too much?",
      "It is well above the 4,000 IU per day upper intake level as a long-term average, which is exactly why it is normally prescribed as a short loading course of six to eight weeks and then stepped down to a maintenance dose. Whether it is appropriate depends on your blood 25(OH)D level and your prescriber's plan, so do not start or repeat that dose on your own.",
    ],
    [
      "What if I miss a weekly vitamin D dose?",
      "Vitamin D is stored in body fat and has a long half-life, so a single missed weekly dose is not an emergency, but the right correction depends on the regimen and how late you are. Ask a pharmacist or the prescriber rather than doubling up, and use this scheduler to re-lay the remaining dates from the day you actually restart.",
    ],
  ],
};

export default seo;
