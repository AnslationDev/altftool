const seo = {
  title: "Tape Measure Fraction Reader: 3/8 in to mm and Back",
  metaDescription:
    "Type 5 3/8, 3/16 or 6 ft 2 1/2 in for decimal inches, mm, cm and metres, or snap a metric size to the nearest 1/16, 1/32 or 1/64 mark and see the error.",
  steps: [
    "Choose Tape reading, Millimetres, Centimetres or Decimal inches — the tape box accepts mixed numbers and foot marks such as 5 3/8 or 6' 2 1/2\".",
    "Set Finest mark on your tape to 1/2, 1/4, 1/8, 1/16, 1/32 or 1/64 inch.",
    "Read the headline conversion plus the Tape reading, Feet and inches, Decimal inches, Millimetres, Centimetres and Metres rows, with the mm the nearest mark is off by, then press Copy result.",
  ],
  intro:
    "This reader converts a tape measure mark written as a fraction — 5 3/8, 3/16, 6' 2 1/2\" — into decimal inches, millimetres, centimetres and metres, and converts back the other way by snapping a metric size onto the nearest mark your tape actually carries. It uses the exact 1959 international definition of the inch, 25.4 mm, and the power-of-two divisions a tape is printed with: halves, quarters, eighths, sixteenths, thirty-seconds and sixty-fourths. It also shows how far each snapped mark sits from the true size, so you know whether the rounding matters for the joint you are cutting.",
  useCases: [
    "Turn a 3/16 in gap read off a site tape into millimetres for a supplier who quotes only in metric.",
    "Find the closest tape mark for a 100 mm drawing dimension before cutting timber.",
    "Convert a 6' 2 1/2\" opening into a single decimal inch figure for a cut list or CNC file.",
  ],
  benefits: [
    ["Reads it the way you write it", "Accepts mixed numbers, bare fractions, foot marks and inch marks without reformatting."],
    ["Shows the rounding error", "Tells you in millimetres how far the nearest 1/16 or 1/32 mark is from the true size."],
    ["Full sixteenths chart", "Every mark from 1/16 to 1 inch with its decimal and metric value, for quick reference on site."],
  ],
  faqs: [
    [
      "How many millimetres is 3/8 of an inch?",
      "3/8 inch is 9.525 mm exactly. The inch is defined as exactly 25.4 mm, so 0.375 x 25.4 = 9.525 — there is no rounding involved in the conversion itself.",
    ],
    [
      "What are the small lines on a tape measure?",
      "On a standard tape the inch is halved repeatedly: the longest mark is 1/2, then 1/4, 1/8 and the shortest 1/16. Some tapes add 1/32 marks over the first inch or two. Counting the marks between the numbered inches tells you the denominator — 16 gaps means each small line is a sixteenth.",
    ],
    [
      "How do I convert a fraction of an inch to a decimal?",
      "Divide the top number by the bottom number and add the whole inches. So 5 3/8 is 3 divided by 8, which is 0.375, plus 5 — giving 5.375 inches, or 136.525 mm.",
    ],
    [
      "What is 100 mm on a tape measure?",
      "100 mm is 3.937 inches, which is just under 3 15/16 in. Marking 3 15/16 leaves you 0.0125 mm long — irrelevant for carpentry, but worth knowing if you are working to machining tolerances where a 1/64 tape or a caliper is the right tool.",
    ],
  ],
};

export default seo;
