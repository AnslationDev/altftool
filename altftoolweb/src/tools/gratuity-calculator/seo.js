const seo = {
  title: "Gratuity Calculator: Payment of Gratuity Act Formula",
  metaDescription:
    "Applies (15 × basic + DA × years) ÷ 26 to your last drawn pay, with the 6-month rounding rule, 5-year eligibility and the ₹20 lakh tax-free ceiling.",
  steps: [
    "Enter your last drawn Monthly basic + DA (₹), then set Years of service and Extra months with the steppers.",
    "Leave the 'Covered under Payment of Gratuity Act, 1972' switch on for the ÷ 26 formula and 6-month rounding, or turn it off for the ÷ 30 basis.",
    "Read the payout, the rounding note and the split against the ₹20,00,000 exemption, then press Copy summary.",
  ],
  intro:
    "This gratuity calculator applies the Payment of Gratuity Act formula — (15 × last drawn basic + DA × completed years of service) ÷ 26 — and shows how the six-month rounding rule, the five-year eligibility condition and the ₹20 lakh tax-free ceiling change the payout. Enter your monthly basic plus dearness allowance and your exact service in years and months, and it returns the amount, the exempt portion and any taxable balance, with the formula it used spelled out. It is for employees checking a full-and-final settlement figure before they sign it, and it is informational only — your employer's own computation and a tax adviser settle the final number.",
  useCases: [
    "You are resigning after 12 years and 8 months and want to know whether those 8 months push your qualifying service to 13 years before HR sends the settlement sheet.",
    "Your full-and-final statement shows a gratuity figure and you want to reverse-check it against the statutory formula using your last drawn basic and DA, not your CTC.",
    "You are at 4 years and 7 months and deciding whether to stay past the 5-year mark, so you need to see that the entitlement is currently zero and what it becomes once you cross 60 months.",
  ],
  benefits: [
    [
      "Handles the rounding rule correctly",
      "Service of 6 months or more in the final year rounds up to a full year for covered establishments, and the tool states which way your months went and why.",
    ],
    [
      "Covers both covered and non-covered employers",
      "Switch the toggle and it recalculates on the ÷ 30 basis used outside the Act, where part-years never round up — the two results can differ noticeably.",
    ],
    [
      "Splits exempt from taxable up front",
      "The payout is shown against the ₹20,00,000 lifetime exemption so you can see immediately whether any part of it will be taxed.",
    ],
  ],
  faqs: [
    [
      "What is the gratuity formula under the Payment of Gratuity Act?",
      "Gratuity = (15 × last drawn monthly basic salary + dearness allowance × completed years of service) ÷ 26. The 26 represents working days in a month, and the 15 represents 15 days' wages for each completed year. On ₹50,000 basic + DA and 13 qualifying years that is (15 × 50,000 × 13) ÷ 26 = ₹3,75,000.",
    ],
    [
      "How many years do I need to be eligible for gratuity?",
      "Five years of continuous service, that is 60 months with the same employer. The only exceptions are death or disablement, where gratuity is payable regardless of length of service. Below 60 months the calculator shows how many of the 60 months you have completed instead of an amount.",
    ],
    [
      "Do extra months count towards gratuity?",
      "Under the Act, yes — 6 months or more in the final year counts as a full year, so 12 years 8 months is treated as 13 years while 12 years 4 months stays at 12. For employers not covered by the Act, the calculation uses completed years only on a ÷ 30 basis and part-years are ignored.",
    ],
    [
      "How much gratuity is tax-free?",
      "Up to ₹20,00,000 is exempt for non-government employees, and that ceiling is a lifetime limit across all employers, not per job. Anything above it is added to your taxable income. Rules and limits are revised from time to time, so confirm the current position with a tax professional before filing.",
    ],
  ],
};

export default seo;
