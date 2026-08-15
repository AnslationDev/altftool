const seo = {
  title: "Thai Baht Cash Planner: Notes vs Card, GST",
  metaDescription:
    "Size your baht float, price the changer markup and GST against Thai ATM withdrawals at ~฿220 a time, and check the RBI USD 3,000 note limit.",
  steps: [
    "Under The trip set Trip length (days), Travellers and On-ground spend per person per day (THB) — or tap the Budget, Mid-range or Comfortable chip — plus one-off cash costs, the cash share of daily spend and the Emergency buffer on the cash (%).",
    "In Rates and fees enter the Mid-market rate (₹ per 1 THB), the Money changer's markup on notes (%), the Card foreign-currency markup (%), your Typical ATM withdrawal (THB) and any LRS already used this financial year (₹); the plan recalculates on every keystroke.",
    "Read Carry in baht with its all-in rupee cost, the 'Buy notes in India' versus 'Withdraw at destination ATMs' comparison with the fee count, the 'Ask for these notes' denomination split and the RBI / LRS / TCS limits, then press Copy plan.",
  ],
  intro:
    "This planner sizes the baht float for a Thailand trip and prices it against the card alternative. It applies the money changer's markup and the GST that Rule 32(2)(b) of the CGST Rules charges on buying foreign exchange, then compares that with drawing the same baht from Thai ATMs — where local banks add a flat fee of roughly ฿220 to every foreign-card withdrawal, which is what makes several small withdrawals expensive. It also flags the RBI limit of USD 3,000 in currency notes per visit and the ₹10,00,000 LRS threshold for TCS.",
  useCases: [
    "Working out the cash float for two weeks across Bangkok and the islands, where street food and boats take notes only.",
    "Deciding how many ATM withdrawals to plan for once the flat ฿220 per-transaction fee is counted.",
    "Splitting a group's baht between what each person carries and what stays on a forex card.",
  ],
  benefits: [
    ["Counts the per-withdrawal fee", "The comparison between buying notes in India and using Thai ATMs turns on a flat fee, and the planner counts the number of withdrawals rather than assuming one."],
    ["Realistic cash share", "Defaults to a cash-heavy split because street kitchens, songthaews and island guesthouses do not take cards."],
    ["Denomination guidance", "Breaks the float into notes, so you do not arrive with a wallet of ฿1,000s nobody can change."],
  ],
  faqs: [
    [
      "How much cash should I carry for a trip to Thailand?",
      "Plan for around half to two-thirds of your on-ground spend in baht. At mid-range spending of about ฿2,000 per person per day, ten days works out near ฿11,000 to ฿14,000 per person in notes, with hotels, malls and chain restaurants left on the card.",
    ],
    [
      "How much do Thai ATMs charge foreign cards?",
      "Thai banks levy a flat fee of about ฿220 per withdrawal on foreign cards, regardless of the amount, and that is separate from your Indian bank's own charge and its foreign-currency markup. Because the fee is per transaction, withdrawing ฿20,000 once costs the same fee as withdrawing ฿2,000 once.",
    ],
    [
      "Should I take Indian rupees to Thailand and exchange there?",
      "It is generally a poor idea. Rupees are not a freely traded currency in Thailand and few changers quote a competitive rate for them, so you lose more on the spread than you save. Buying baht in India, or carrying US dollars and changing them at a Bangkok exchange booth, both work better — and paying by card where cards are accepted usually costs less than either.",
    ],
    [
      "What does GST add when I buy baht in India?",
      "GST is charged on the value of the money-changing service, not on the currency. Rule 32(2)(b) of the CGST Rules sets that value at 1% of the gross amount up to ₹1,00,000, subject to a minimum of ₹250, so ₹50,000 of baht carries GST of 18% on ₹500 — that is ₹90. The slab tapers above ₹1,00,000, and this is informational rather than tax advice.",
    ],
  ],
};

export default seo;
