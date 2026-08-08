const seo = {
  title: "Freelance Rate Converter: Hourly to Day, Year, Project",
  metaDescription:
    "Converts a freelance rate between hourly, daily, monthly, annual and project figures using real billable hours, plus take-home after costs and tax.",
  steps: [
    "Under Your rate enter the Rate figure, pick Quoted per and Currency, and add Hours in the fixed-fee project if you want a project fee back.",
    "Set Billable capacity — Hours a working day, Days a week, Weeks worked a year (52 minus leave) and Utilisation (% of hours that are billable), or tap one of the utilisation percentage chips below those fields.",
    "Read Equivalent hourly rate with the Per day, Per week, Per month, Per year and Fixed project fee rows, then fill What you actually keep and Rate needed to replace a salary before pressing Copy rates or Reset.",
  ],
  intro:
    "This converter moves a freelance rate between hourly, daily, weekly, monthly, annual and fixed-project figures by routing all of them through one anchor: billable hours a year, calculated as hours a day × utilisation × days a week × weeks actually worked. Because it uses working weeks rather than 52 and applies a utilisation percentage to unpaid admin and pitching time, the annual figure it shows is the one you could really bill. It also converts billings into take-home after business costs and tax, and works out the rate needed to replace a salaried package.",
  useCases: [
    "Turn a client's offer of a monthly retainer into the hourly rate it really represents.",
    "Price a fixed-fee project from your hourly rate and an honest estimate of the hours.",
    "Check whether a day rate leaving a permanent job actually replaces the salary plus employer contributions.",
  ],
  benefits: [
    ["Capacity, not 2,080 hours", "Uses weeks you actually work and a utilisation rate, so holidays and unbilled admin are priced in."],
    ["Every basis at once", "One rate produces hourly, daily, weekly, monthly, annual and project figures that stay consistent."],
    ["Take-home, not just billings", "Applies business costs and tax on profit to show what lands in your account."],
  ],
  faqs: [
    [
      "How do I convert an hourly rate to an annual rate?",
      "Multiply the hourly rate by your billable hours a year, not by 2,080. At 8 hours a day, 5 days a week and 46 working weeks that is 1,840 hours, so a rate of 50 an hour is 92,000 a year before costs and tax.",
    ],
    [
      "What utilisation rate should a freelancer assume?",
      "Between 60% and 80% of scheduled hours is realistic for most independents, because selling, admin, invoicing and learning are unpaid. Assuming 100% is the single most common reason a freelance rate turns out not to cover the year.",
    ],
    [
      "How do I set a day rate from an hourly rate?",
      "Multiply the hourly rate by the billable hours in a day, which is your scheduled hours times utilisation — 8 hours at 70% gives 5.6 billable hours, so 50 an hour is a 280 day rate. Many freelancers instead quote a full 8-hour day and cover admin by raising the hourly figure.",
    ],
    [
      "What hourly rate replaces a salary?",
      "Add the employer contributions and benefits you now fund yourself, plus your business costs, then divide by billable hours. Replacing a 60,000 salary with 15% on-costs and 9,000 of business costs needs 78,000 of billings, which is about 42 an hour across 1,840 billable hours.",
    ],
  ],
};

export default seo;
