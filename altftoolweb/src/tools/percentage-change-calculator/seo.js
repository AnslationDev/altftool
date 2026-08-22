const seo = {
  title: "Percentage Change Calculator: Increase/Decrease",
  metaDescription:
    "Enter an original and new value to get the signed % change via ((new − original) ÷ original) × 100, plus absolute change and the value ratio.",
  steps: [
    "Type the Original Value and New Value in the Inputs panel — the result recalculates as you type.",
    "Read the signed percentage (e.g. +25.00%) with its Increase, Decrease or No Change label; an Original Value of 0 shows a dash instead of a number.",
    "Check the breakdown cards — Absolute Change, Value Ratio (e.g. 1.25×) and Change Amount — and click Copy for the full summary.",
  ],
  intro:
    "This calculator finds the percentage change between two numbers using ((new value − original value) ÷ original value) × 100, and labels the result an increase, a decrease or no change. Alongside the percentage it reports the absolute change and the ratio of new to original, rounded to two decimals. Useful whenever you need to say how much something moved rather than just what it moved to.",
  useCases: [
    "Your rent goes from 18,000 to 19,800 at renewal and you want the increase as a percentage before negotiating",
    "A stock closed at 80 and now sits at 100 — you need the gain (+25%) and the 1.25× ratio for a portfolio note",
    "Website sessions dropped from 42,000 to 36,540 month over month and you have to quantify the fall for a review",
  ],
  benefits: [
    ["Direction stated explicitly", "The result is labelled Increase, Decrease or No Change, so a signed number is never misread."],
    ["Absolute and relative together", "You get the raw difference, the percentage and the new/original ratio from one pair of inputs."],
    ["Safe with negative baselines", "The denominator uses the absolute value of the original, so a negative starting figure still yields a sensibly signed percentage."],
  ],
  faqs: [
    [
      "How do I calculate percentage increase between two numbers?",
      "Subtract the original from the new value, divide by the original, then multiply by 100. From 80 to 100 that is (100 − 80) ÷ 80 × 100 = +25.00%, which is what this calculator returns.",
    ],
    [
      "Why can't the original value be zero?",
      "Because percentage change divides by the original value, and division by zero is undefined — there is no meaningful percentage rise from nothing. The calculator shows a dash and a prompt instead of a number when you enter 0 as the original.",
    ],
    [
      "Is percentage change the same as percentage difference?",
      "No. Percentage change is directional and measured against the original value, so 80 to 100 is +25%. Percentage difference is symmetric and divides by the average of the two numbers, giving 22.22% for the same pair. This tool computes percentage change.",
    ],
    [
      "How do I reverse a percentage change to get the original value?",
      "Divide the new value by (1 + change ÷ 100). If a price is 19,800 after a 10% rise, the original was 19,800 ÷ 1.10 = 18,000. You can confirm it by entering 18,000 and 19,800 here and checking the result reads +10.00%.",
    ],
  ],
};

export default seo;
