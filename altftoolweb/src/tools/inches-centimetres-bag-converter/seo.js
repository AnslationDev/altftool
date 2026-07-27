const seo = {
  intro:
    "This converter turns bag dimensions between inches and centimetres at the exact rate of 1 inch = 2.54 cm, then tests whether the bag fits a chosen cabin or checked allowance. The fit test sorts your three dimensions and the allowance's three dimensions from largest to smallest and compares them pairwise, which is the correct check for whether a rectangular case will pass a rectangular gauge in any orientation. It also reports the linear total — length plus width plus height — against the 62 linear inch (158 cm) checked-bag limit most airlines publish.",
  useCases: [
    "Checking a suitcase advertised as 22 × 14 × 9 inches against a European airline that publishes 55 × 40 × 20 cm.",
    "Working out how much a bag overhangs the cabin gauge before deciding whether to gate-check it.",
    "Confirming a large checked case stays inside the 158 cm linear allowance before paying an oversize fee.",
  ],
  benefits: [
    ["Exact, not rounded", "Uses 2.54 cm per inch exactly, so a borderline bag is not wrongly cleared or wrongly failed."],
    ["Orientation-aware fit test", "Compares sorted dimensions, so turning the bag on its side is accounted for."],
    ["Linear total included", "Handles the airlines that publish a single length + width + height figure instead of three."],
  ],
  faqs: [
    [
      "What is 22 x 14 x 9 inches in centimetres?",
      "55.88 × 35.56 × 22.86 cm, a linear total of 114.3 cm. That is the classic US carry-on size and it is slightly longer than the 55 cm many European and Asian carriers allow, which is why the same case passes in one region and not the other.",
    ],
    [
      "What does 62 linear inches mean for a checked bag?",
      "It is the sum of length, width and height, and 62 inches equals 157.48 cm — usually published as 158 cm. A 77 × 52 × 28 cm case totals 157 cm and just clears it; exceeding the total triggers an oversize fee even when no single side looks unusual.",
    ],
    [
      "Do wheels and handles count towards the cabin bag size?",
      "Yes. Airlines measure the bag at its widest points, including wheels, telescopic handle housings, side pockets and anything strapped to the outside, and the sizer at the gate is a hard box with no give. Buy or pack a bag a couple of centimetres inside the stated limit rather than exactly on it.",
    ],
    [
      "How many centimetres is 1 inch?",
      "Exactly 2.54 cm. The figure has been definitional since the 1959 international yard and pound agreement fixed the yard at 0.9144 m, so it is not a rounded approximation.",
    ],
  ],
};

export default seo;
