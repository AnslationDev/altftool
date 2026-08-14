const seo = {
  title: "Gift Tax on Relatives: Section 56(2)(x) Checker",
  metaDescription:
    "Pick the relationship and see if a gift is exempt under section 56(2)(x), with the ₹50,000 aggregate cliff and 10% property safe harbour applied.",
  steps: [
    "Choose who received the gift, pick the giver from the \"The giver is my\" list, and set the occasion.",
    "Enter the total money received from everyone in the year, or the stamp duty value and the price you paid for property.",
    "Read the amount charged as income from other sources and the item of section 56(2)(x) it turns on, then press Copy result.",
  ],
  intro:
    "This checker applies the definition of \"relative\" in section 56(2)(x) of the Income-tax Act, 1961 to work out whether a gift is exempt or taxable in the hands of the person who received it. The definition is deliberately one-directional: an uncle is the brother of the receiver's parent and so a relative, which makes a gift from uncle to nephew exempt, while a nephew fits no item of the definition, which makes the same gift from nephew to uncle fully taxable. It also applies the ₹50,000 aggregate threshold on money, which is a cliff rather than an allowance, and the 10% safe harbour on immovable property bought below stamp duty value.",
  useCases: [
    "Someone receiving ₹3,00,000 from a nephew discovering that the whole amount is taxable as income from other sources, while the same sum from an uncle would have been exempt.",
    "A buyer purchasing a flat at ₹45,00,000 against a stamp duty value of ₹50,00,000 checking whether the ₹5,00,000 gap clears the safe harbour of the higher of ₹50,000 and 10% of the price.",
    "A family planning wedding gifts, confirming that the marriage exclusion covers gifts received on the occasion of the receiver's own marriage and not a child's or sibling's.",
  ],
  benefits: [
    ["Cites the exact item", "Every answer names the item of the statutory definition it turns on, so you can verify it."],
    ["Handles the cliff correctly", "Crossing ₹50,000 makes the whole aggregate taxable, not just the excess — a distinction most calculators get wrong."],
    ["Flags the cash trap", "Warns where section 269ST bites on a cash gift that is otherwise entirely exempt."],
  ],
  faqs: [
    [
      "Is a gift from my nephew taxable?",
      "Yes, in full. A nephew is not a lineal descendant of his uncle or aunt and fits no item in the definition of relative under section 56(2)(x), so the whole amount is taxable as income from other sources once it exceeds ₹50,000. The reverse is exempt — an uncle is the brother of the receiver's parent, which is expressly covered.",
    ],
    [
      "How much gift money is tax free in India?",
      "Up to ₹50,000 in aggregate in a financial year from all non-relatives combined. The figure is a cliff, not an allowance: if the aggregate reaches ₹50,001 the entire ₹50,001 is taxable, not the one rupee of excess. Gifts from relatives, on the occasion of your own marriage, or under a will or inheritance are outside the section altogether whatever their size.",
    ],
    [
      "Who counts as a relative for gift tax?",
      "For an individual: the spouse; brothers and sisters; the spouse's brothers and sisters; brothers and sisters of either parent; any lineal ascendant or descendant of the individual or of the spouse; and the spouse of any of those. Cousins are not relatives. For a Hindu undivided family, any member of the family is a relative — but note that works only when the family is the receiver, so a gift from an HUF to one of its members is taxable.",
    ],
    [
      "Do I pay tax if I buy property below the circle rate?",
      "Only if the gap is large enough. Under section 56(2)(x)(b) the difference between stamp duty value and price is taxable where it exceeds the higher of ₹50,000 and 10% of the consideration. The safe harbour was 5% until the Finance Act 2020 raised it to 10% from assessment year 2021-22. Below that margin nothing is added to your income.",
    ],
  ],
};

export default seo;
