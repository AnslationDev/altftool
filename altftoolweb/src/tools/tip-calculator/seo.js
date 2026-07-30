const seo = {
  intro:
    "Tip Calculator works out the tip, the total and each person's share from a rupee bill amount, using tip = bill × tip% ÷ 100 and per person = (bill + tip) ÷ people. It is for the moment the bill lands and someone has to divide it — quick tip buttons from 5% to 25%, a 0–30% slider, and a split of up to 50 people. Turn on round-up and each share is rounded to the next whole rupee, with the effective tip percentage that creates shown back to you.",
  useCases: [
    "Splitting a ₹1,850 dinner three ways at 10%: the tip is ₹185, the total ₹2,035, and each person owes ₹678.33 — or ₹679 with round-up on, which nudges the real tip to 10.11%.",
    "Deciding what to leave when the restaurant bill already carries a service charge, using the built-in norms list rather than guessing whether you are double-tipping.",
    "Settling a group meal over chat: copy the summary, which lists the bill, the tip percentage picked, the head count, the per-person total and the total paid, and paste it into the thread so nobody re-does the arithmetic.",
  ],
  benefits: [
    [
      "Round-up that tells you the truth",
      "Rounding each share to the next rupee raises the tip, and the effective tip percentage is recalculated and displayed, so you know whether 10% quietly became 12%.",
    ],
    [
      "Per-person tip broken out separately",
      "You see each person's total and each person's share of the tip, which is what people actually argue about when one person is paying the card.",
    ],
    [
      "Regional norms alongside the maths",
      "Reference rates for Indian restaurants, delivery and salons plus US and European restaurants sit next to the result, so the percentage you pick has some grounding.",
    ],
  ],
  faqs: [
    [
      "How much should I tip at a restaurant in India?",
      "Around 5-10% of the bill is the common range, and it is normal to skip the tip entirely when a service charge is already printed on the bill. Service charge is not compulsory in India — you can ask for it to be removed if you did not agree to it.",
    ],
    [
      "How much do you tip in the US versus Europe?",
      "In the US, 15-20% of the pre-tax bill is the standard restaurant range, because tipped staff are often paid a lower base wage. In most of Europe service is included and 5-10%, or simply rounding the bill up, is normal.",
    ],
    [
      "How do you split a bill with a tip fairly?",
      "Add the tip to the bill first, then divide by the number of people: (bill + tip) ÷ people. Dividing the bill first and having each person tip separately produces the same total only if everyone picks the same percentage, which is where group splits usually go wrong.",
    ],
    [
      "What does the round-up option actually change?",
      "It rounds each person's share up to the next whole rupee and sends every rounded paisa into the tip, so the total collected is the rounded share times the head count. On a ₹2,035 total split three ways that turns ₹678.33 each into ₹679 each, adding ₹2 to the tip.",
    ],
  ],
};

export default seo;
