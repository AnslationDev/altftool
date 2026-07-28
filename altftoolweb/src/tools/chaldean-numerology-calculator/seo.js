const seo = {
  intro:
    "The Chaldean Numerology Calculator converts a written name into its Chaldean compound number and single-digit root, and a date of birth into psychic (moolank) and destiny (bhagyank) numbers. It uses the classical Chaldean letter table in which letters take values 1 to 8 and 9 is never assigned, which is what separates it from the Pythagorean A=1 to Z=26 method. The unreduced compound total is shown alongside Cheiro's published reading for numbers 10 to 52, so you can see the working rather than a single unexplained figure.",
  useCases: [
    "Checking the compound and root number of a spelling before settling on how a child's name will be written on official records.",
    "Comparing two spellings of the same name — such as Aditya and Adithya — to see how the letter totals differ.",
    "Working out the psychic number from the day of the month and the destiny number from the full date of birth without hand arithmetic.",
    "Understanding why a Chaldean total differs from a Pythagorean one when two calculators disagree.",
  ],
  benefits: [
    ["Authentic 1–8 table", "Uses the Chaldean values where 9 is never assigned to a letter, not a relabelled Pythagorean chart."],
    ["Compound number kept visible", "The unreduced total and its classical 10–52 reading are shown, not just the reduced digit."],
    ["Real calendar validation", "Dates are checked against the Gregorian leap rule, so 29 February 1900 is correctly rejected."],
  ],
  faqs: [
    [
      "What is the difference between Chaldean and Pythagorean numerology?",
      "Chaldean assigns letters values 1 to 8 only and never uses 9, while Pythagorean maps A–I to 1–9, J–R to 1–9 and S–Z to 1–8. Chaldean also keeps the unreduced compound total as meaningful; Pythagorean usually reads only the reduced digit.",
    ],
    [
      "Why is 9 not given to any letter in the Chaldean system?",
      "In the Chaldean tradition 9 was treated as sacred and set apart from the letters, so no letter carries it. The number 9 can still appear as a root number after reduction — it simply never comes directly from a letter value.",
    ],
    [
      "How do you calculate the psychic and destiny numbers?",
      "The psychic number is the day of the month reduced to one digit — 29 becomes 2+9=11, then 1+1=2. The destiny number sums every digit of the full date; 29 February 2000 gives 2+9+0+2+2+0+0+0=15, which reduces to 6.",
    ],
    [
      "Does the name number change if I add a middle name or a title?",
      "Yes. The total is the sum of every scored letter, so adding a middle name, changing a surname or altering a spelling changes the compound number and can change the root. Treat all of this as cultural tradition and entertainment — it is not evidence-based and should not guide medical, legal or financial choices.",
    ],
  ],
};

export default seo;
