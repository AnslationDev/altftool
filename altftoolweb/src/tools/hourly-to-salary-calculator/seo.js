const seo = {
  intro:
    "An hourly wage becomes an annual salary by multiplying rate × hours per week × weeks per year, and this calculator does exactly that, then splits the result into monthly (annual ÷ 12), weekly and daily figures. Enter your rate, your usual weekly hours and how many weeks you actually work — 52 if you are paid through your holiday, fewer if you are not — and you get the gross equivalent salary in one step. Contractors, hourly employees and anyone comparing a wage offer against a salaried one get a like-for-like number.",
  useCases: [
    "You have an offer at $25 an hour and another at a flat salary, and you need both expressed the same way before you can tell which pays more",
    "A freelancer setting a day rate who wants to know what hourly figure supports the annual income they are targeting, after subtracting unpaid weeks",
    "Working out whether dropping from 40 to 32 hours a week is affordable, by seeing the monthly figure the rent has to come out of",
  ],
  benefits: [
    ["Weeks per year is yours to set", "Unpaid leave, term-time work or a 48-week contract change the answer materially, so the weeks figure is an input rather than a hardcoded 52."],
    ["Four pay periods from one entry", "Annual, monthly, weekly and daily appear together, which is what you need when a job ad quotes one and your budget uses another."],
    ["Daily pay assumes a five-day week", "The daily figure divides your weekly hours across 5 days, so it reflects a real working day rather than an 8-hour assumption that may not match your schedule."],
  ],
  faqs: [
    [
      "How do I convert my hourly rate to an annual salary?",
      "Multiply the hourly rate by hours worked per week, then by weeks worked per year. At $25 an hour for 40 hours across 52 weeks that is 25 × 40 × 52 = $52,000 a year, or about $4,333 a month.",
    ],
    [
      "Should I use 52 weeks or fewer?",
      "Use 52 if your paid time off is included in your hourly arrangement, and fewer if unpaid weeks reduce what you actually earn. A worker with two unpaid weeks should enter 50, which at $25 for 40 hours gives $50,000 rather than $52,000 — a $2,000 difference.",
    ],
    [
      "Is the result before or after tax?",
      "Before. Every figure here is gross pay, with no income tax, national insurance or social security, retirement contributions, or health premiums deducted, and no overtime premium applied. Your take-home will be lower, and how much lower depends on your jurisdiction and circumstances — check with a payroll or tax professional for your own position.",
    ],
    [
      "How is the daily figure worked out?",
      "It is your hourly rate multiplied by your weekly hours divided by 5, i.e. one fifth of a week's pay. On 40 hours at $25 that is 25 × 8 = $200 a day; on a 30-hour week the same rate gives 25 × 6 = $150.",
    ],
  ],
};

export default seo;
