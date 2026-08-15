const seo = {
  title: "EPF Calculator: Corpus, EPS Split and Year-Wise",
  metaDescription:
    "Projects EPF year by year with the 8.33% EPS diversion capped at ₹1,250 a month, a VPF comparison and the pensionable salary × service ÷ 70 estimate.",
  steps: [
    "Set Current age, Retirement age, Current basic + DA (monthly), Annual increase %, Interest rate % and Current EPF balance, or press a Quick presets button such as Mid-career, 32, basic 45,000",
    "Tick 'Restrict to ₹15,000 wage ceiling' if your employer caps PF at the statutory wage, and press a +5%, +10%, +15% or +20% VPF button under 'Consider VPF before any other debt option' to compare a voluntary top-up",
    "EPF corpus at age N heads the panel with Your contributions, Employer EPF share and Interest earned, and Year-wise projection lists Age, Monthly basic + DA, Your share, Employer EPF, EPS, Interest and Closing balance for every year; Copy summary copies the report and Reset restores the defaults",
  ],
  intro:
    "This EPF calculator projects your Employees' Provident Fund corpus year by year using the actual statutory split: 12% of basic plus DA from you, 12% from your employer, of which 8.33% of wages up to the ₹15,000 ceiling (a maximum of ₹1,250 a month) is diverted to EPS instead of EPF. It compounds each year's balance at the interest rate you set, grows your wage by your expected annual hike, and shows the EPS pension estimate from the standard pensionable salary × pensionable service ÷ 70 formula. It is for salaried employees in India who want to see how much of the final corpus is their own money and how much is interest.",
  useCases: [
    "Deciding whether to add 5%, 10% or more as VPF, by comparing the corpus with and without the extra deduction before you sign the form",
    "Checking what happens if your employer restricts PF to the ₹15,000 statutory ceiling instead of contributing on your full basic",
    "Working out roughly what monthly EPS pension you would draw at 58, and whether you will cross the 10-year service minimum needed to draw one at all",
  ],
  benefits: [
    ["Splits EPF from EPS correctly", "The 8.33% pension diversion capped at ₹1,250 a month is taken out before the employer's EPF share is credited, so the corpus is not overstated."],
    ["Year-wise schedule, not one number", "Every year shows opening balance, your contribution, employer EPF, interest credited and closing balance, so you can trace the compounding."],
    ["Side-by-side VPF comparison", "The extra corpus from a voluntary top-up is shown against the base plan, with the monthly deduction it costs you."],
  ],
  faqs: [
    [
      "How much of my employer's 12% actually goes into my EPF?",
      "Only the part left after EPS. Your employer's 8.33% of wages goes to the pension scheme, but it is capped at ₹15,000 of wages — a maximum of ₹1,250 a month — and everything above that stays in EPF. So on a ₹50,000 basic with contributions on full wages, ₹1,250 goes to EPS and about ₹4,750 to EPF.",
    ],
    [
      "How is the EPS pension amount calculated?",
      "Pensionable salary × pensionable service ÷ 70. Pensionable salary is the average of the last 60 months and is capped at ₹15,000 unless you hold a valid higher-pension option, which is why most members top out near ₹7,500 a month; service of 20 years or more gets a 2-year weightage added.",
    ],
    [
      "Is EPF really tax-free?",
      "It is EEE — exempt on contribution, on growth and on withdrawal — with two limits. Interest on your own contributions above ₹2.5 lakh in a year is taxable (₹5 lakh where the employer does not contribute), and withdrawal is tax-free only after five years of continuous service; below that, TDS applies on amounts of ₹50,000 or more. This is general information, so confirm your own position with a tax adviser.",
    ],
    [
      "Should I withdraw my EPF when I change jobs?",
      "Transferring is usually better than withdrawing, because a transfer keeps the five-year continuous-service clock running and leaves the balance compounding. Withdrawing before five years both breaks that clock and triggers TDS on ₹50,000 or more — 10% with PAN and higher without. Whether it suits your situation is a personal financial decision.",
    ],
  ],
};

export default seo;
