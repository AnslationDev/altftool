const seo = {
  intro:
    "A leave register is the record an employer keeps of how much annual leave with wages each worker has earned, taken and still holds, and this generator builds it using the rules in Chapter VIII of the Factories Act 1948. Leave is earned at one day for every 20 days worked by an adult and one day for every 15 days worked by a young person, the 240-day qualifying test is applied, and the 30-day carry-forward cap in section 79(5) is enforced. HR staff and small employers get a running-balance register they can copy into a spreadsheet or file.",
  useCases: [
    "Preparing the leave with wages register a factory inspector asks to see for the previous calendar year",
    "Telling a worker who joined in July how many leave days they will earn next year under the two-thirds test",
    "Settling a full-and-final where the unused leave balance has to be valued at the average daily wage",
  ],
  benefits: [
    ["Correct earning rate", "Applies the 1-in-20 (adult) and 1-in-15 (young person) rates with the statutory half-day rounding."],
    ["Carry-forward cap applied", "Shows exactly how many days carry to next year and how many lapse at 30 days."],
    ["Running balance per spell", "Every leave spell shows the balance left after it, so overdrawn leave is obvious."],
  ],
  faqs: [
    [
      "How many days of earned leave does a worker get under the Factories Act?",
      "An adult worker who has worked 240 days or more in a calendar year earns one day of leave with wages for every 20 days worked in that year, so a worker with 260 days earns 13 days. A child or young person earns at the faster rate of one day for every 15 days worked.",
    ],
    [
      "How much earned leave can be carried forward to the next year?",
      "Section 79(5) of the Factories Act 1948 allows untaken leave to be carried forward up to 30 days for an adult and 40 days for a child. Leave that the worker applied for and the employer refused is carried forward over and above that ceiling.",
    ],
    [
      "What happens if a worker joins in the middle of the year?",
      "Section 79(2) replaces the 240-day test with a two-thirds test: the worker earns leave at the normal rate if they worked at least two-thirds of the calendar days remaining in the year after joining. Someone joining with 180 days left in the year needs 120 days of work.",
    ],
    [
      "What has to be written in a leave register?",
      "The register records the worker's name and category, leave brought forward, leave earned for the year, each spell of leave with its from and to dates and days debited, the balance after each spell and the closing balance. Most state factory rules prescribe this as Form 15 and require it to be kept for the previous year as well; check your state rules or ask a labour law adviser.",
    ],
  ],
};

export default seo;
