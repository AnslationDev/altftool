const seo = {
  title: "AI Seat Cost vs API: Break-Even Messages Per Day",
  metaDescription:
    "Cost per active user instead of per seat, idle-seat spend in currency, and the break-even messages per user per day against your API token prices.",
  steps: [
    "Enter Paid seats, Price per seat per month, People who actually used it, Annual-billing discount (%) and Messages per active user per day.",
    "Under Pay-as-you-go comparison, set Input tokens per message, Output tokens per message and the input and output price per 1M tokens.",
    "Read Cost per active user, the Idle seats row and Break-even usage in messages per user per day, then press Copy result.",
  ],
  intro:
    "The Team AI Seat Cost Calculator divides your per-seat AI subscription by the people who actually used it, so you see cost per active user rather than cost per licence, plus the idle spend sitting on unused seats. It then prices the same volume on pay-as-you-go API rates — (input tokens x input price + output tokens x output price) / 1,000,000 per message — and reports the break-even point: the number of messages per user per day at which usage billing costs exactly one seat. Every rate is yours to enter, so the answer reflects your contract rather than a generic list price.",
  useCases: [
    "Prepare a renewal conversation with evidence of how many seats went unused last quarter.",
    "Decide whether an internal tool should sit on team licences or on an API key with usage billing.",
    "Show finance the true cost per active user after a rollout where half the team never logged in.",
    "Set a fair internal chargeback rate per department based on messages actually sent.",
  ],
  benefits: [
    ["Cost per active user", "The number that matters at renewal, not the headline per-seat price."],
    ["Break-even in messages", "One figure that tells you when flat seats stop being the cheap option."],
    ["Idle spend in currency", "Unused seats converted into a monthly and annual number you can take to a renewal."],
  ],
  faqs: [
    [
      "How do I calculate the real cost per user of an AI subscription?",
      "Divide the total monthly subscription by the number of people who actually used it in that month, not by the number of seats you bought. Twenty-five seats at 30 a month is 750, but if only 14 people logged in the real cost is about 53.57 per active user — and the 11 idle seats are 330 a month of pure waste.",
    ],
    [
      "Is a per-seat AI plan or the API cheaper?",
      "It depends entirely on volume, and the crossover is the break-even message count. With 1,500 input and 700 output tokens per message at 3 and 15 per million tokens, one message costs 0.015, so a 30-a-month seat breaks even at roughly 95 messages per user per working day — light users are cheaper on the API, heavy users are cheaper on a seat.",
    ],
    [
      "What counts as an active user for AI licence purposes?",
      "Use your admin console's definition — usually someone who sent at least one message in the billing period — and be strict about it. Vendors report this differently, and a user who logged in once but sent nothing should count as idle when you are sizing next year's contract.",
    ],
    [
      "Can I reduce AI seats mid-contract?",
      "Usually only at renewal, because most annual agreements fix the seat count for the term and only allow additions. Check the reduction and true-up clauses in your order form before assuming the idle spend can be recovered this year, and take the utilisation figure into the renewal negotiation.",
    ],
  ],
};

export default seo;
