const seo = {
  intro:
    "Conversion Rate Calculator divides conversions by visitors and multiplies by 100 to give the conversion rate to two decimal places, alongside the visitors-needed-per-conversion figure and, if you enter a value per conversion, the revenue those conversions produced. Enter 150 conversions from 5,000 visitors and it returns 3.00 percent and roughly one conversion every 33 visitors. It is for marketers, ecommerce owners and landing page owners who want the rate and its practical meaning in the same view.",
  useCases: [
    "A landing page got 5,000 sessions and 150 signups last month and you want the rate stated precisely before comparing it with the previous month's page.",
    "You are budgeting a paid campaign and need to know how many clicks you must buy for one sale, so the visitors-per-conversion number tells you what traffic volume the target implies.",
    "Each booking is worth 85 on average, and you want the revenue attached to the conversion count so a rate change can be discussed in money rather than percentages.",
  ],
  benefits: [
    ["Gives you the ratio, not just the percentage", "Alongside the rate it reports how many visitors it takes to earn one conversion, which is the number you actually plan traffic and ad spend against."],
    ["Revenue only appears when it is meaningful", "The value-per-conversion field is optional and the revenue row is added only when you enter a positive value, so the output stays clean for pure rate checks."],
    ["Two decimal places, deliberately", "Rates are reported to 0.01 percent because that is the resolution at which a real change on a mid-traffic page shows up at all."],
  ],
  faqs: [
    [
      "How do you calculate conversion rate?",
      "Divide conversions by visitors and multiply by 100. 150 conversions from 5,000 visitors is 150 ÷ 5,000 × 100 = 3.00 percent, which is the same as one conversion for every 33 visitors.",
    ],
    [
      "What is a good conversion rate?",
      "It depends almost entirely on the channel and what counts as a conversion — an email newsletter signup converts far higher than a checkout, and paid search converts differently from cold display traffic. The only reliable benchmark is your own page's previous rate on comparable traffic, which is why this calculator focuses on the arithmetic rather than an industry average.",
    ],
    [
      "Should I count visitors, sessions or unique users?",
      "Pick one definition and keep it constant, because switching between sessions and unique users can move the rate by a factor of two without anything changing on the page. Most analytics tools report session-based rates by default; note which one you used next to the result.",
    ],
    [
      "Why does the calculator show a dash instead of a rate?",
      "Because visitors is zero or blank — dividing by zero has no answer, so it prompts for a visitor count instead of printing a misleading figure. The visitors-per-conversion row behaves the same way when conversions is zero.",
    ],
  ],
};

export default seo;
