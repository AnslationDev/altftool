const seo = {
  title: "Textbook Buy vs Rent Calculator with Break-Even",
  metaDescription:
    "Compare buying a textbook net of resale value against per-term rent plus fees, and get the break-even number of terms where buying starts to win.",
  steps: [
    "Enter Price to buy and Expected resale value after the course, plus Rent per term and how many terms you need the book (1-24).",
    "Add Non-refundable rental fees; the Refundable rental deposit is reported as locked-up cash, not counted as rental cost.",
    "Read the verdict with the cost difference and break-even terms of use, or click Copy result.",
  ],
  intro:
    "This calculator compares the net cost of buying a textbook — purchase price minus what you expect to resell it for — against renting it per term for as long as your course needs it, including non-refundable rental fees. It also computes the break-even point (net buying cost ÷ rent per term): use the book for more terms than that and buying wins. Built for students deciding between the campus bookshop, a rental service and the second-hand market.",
  useCases: [
    "An engineering student deciding whether a Rs 3,000 reference book used across 4 semesters beats renting it at Rs 400 per semester",
    "A medical student estimating resale value on standard texts before committing to buying the whole first-year set",
    "A student comparing a rental service's per-term price plus delivery fee against a second-hand purchase they can resell",
  ],
  benefits: [
    ["Resale counted", "Buying is costed net of the amount you recover by selling the book after the course."],
    ["Break-even shown", "One number tells you how many terms of use make buying the better deal."],
    ["Deposits handled right", "Refundable rental deposits are shown as locked-up cash, not added to the rental cost."],
  ],
  faqs: [
    [
      "Is it cheaper to rent or buy textbooks?",
      "It depends on how long you need the book: renting wins for short use, buying wins once cumulative rent crosses the net buying cost. The break-even is net buying cost divided by rent per term — for a Rs 3,000 book resellable at Rs 1,200 and rentable at Rs 400 a term, that is 4.5 terms, so a 4-semester need favours renting and a 5-semester need favours buying.",
    ],
    [
      "How much can I resell a used textbook for?",
      "Commonly somewhere between a quarter and half of the purchase price for a standard text in good condition, but it collapses toward zero if a new edition releases or the book is heavily marked. Because resale is the swing factor in the buy-side maths, estimate it conservatively and re-run the comparison.",
    ],
    [
      "What extra costs come with renting a textbook?",
      "Delivery charges, damage-waiver or platform fees, and late-return penalties — all non-refundable, so this calculator adds them to the rental cost. The security deposit is different: it is refundable cash you must lock up, which the tool reports separately rather than counting as spending.",
    ],
    [
      "When does buying a textbook clearly beat renting?",
      "When you need the book across many terms, when it doubles as an exam-preparation or reference text you will keep after the course, or when the resale market for it is strong. Renting clearly wins for single-term electives and books whose editions change every year, since resale value on an old edition is minimal.",
    ],
  ],
};

export default seo;
