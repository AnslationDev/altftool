const seo = {
  title: "Slope Converter: Percent, Degrees, 1-in-X",
  metaDescription:
    "Percent grade is rise ÷ run x 100 and degrees is its arctangent, so 100% is 45°. Converts to 1-in-X, inches per foot, mm/m and roof pitch in twelfths.",
  steps: [
    "Under 'What do you have?' pick Percent grade (%), Degrees (°), Ratio 1 in X, Inches per foot, Millimetres per metre, Per mille or Rise and run.",
    "Type the value, or tap a preset such as 'ADA ramp 1:12' or 'Drain 1/4 in per ft', then set 'Run length (any unit)' under Fall over a run.",
    "Read the percent grade with the angle, the 1 in X ratio, in/ft, mm/m, roof pitch in 12 and the ADA 1:12 check, then press Copy result.",
  ],
  intro:
    "This converter takes a slope written in any one notation and gives you all the others: percent grade, angle in degrees, the 1-in-X ratio used in building codes, inches per foot, millimetres per metre and roof pitch in twelfths. It works from the single underlying ratio — percent grade is rise divided by run times 100, and the angle is the arctangent of that same ratio — which is why 100% grade is 45 degrees rather than vertical. It also gives the actual fall over a run you enter, the number you mark on a wall or set a pipe to.",
  useCases: [
    "Check that a wheelchair ramp drawn at 6% is inside the ADA 1:12 (8.33%) maximum running slope.",
    "Set a waste pipe to the 1/4 inch per foot fall a small drain needs and see it as 20.8 mm per metre for a metric level.",
    "Translate a surveyor's 12% grade into degrees for a machine that only accepts an angle.",
  ],
  benefits: [
    ["Every notation at once", "Percent, degrees, ratio, in/ft, mm/m and roof pitch from one entry, so nothing gets converted twice."],
    ["Fall over a real run", "Enter the length of the ramp or pipe and get the rise to mark, in the same unit."],
    ["Code thresholds beside your number", "ADA ramp and cross-slope limits and drain minimums shown as ratio, percent and degrees."],
  ],
  faqs: [
    [
      "What is 100% slope in degrees?",
      "45 degrees. A 100% grade means the rise equals the run, and the angle is arctan(1) = 45 degrees. Percent grade and degrees only track each other near zero — they are not interchangeable, and a vertical face has an infinite percent grade.",
    ],
    [
      "What is a 1 in 12 slope as a percentage?",
      "8.33%, which is 4.76 degrees. That is the maximum running slope the ADA Standards allow for a ramp (section 405.2), meaning 1 unit of rise for every 12 units of run — a 250 mm step needs 3 m of ramp.",
    ],
    [
      "What slope should a drain pipe have?",
      "The International Plumbing Code Table 704.1 sets a minimum fall of 1/4 inch per foot (2.08%, about 1 in 48) for drains 2 1/2 inches and smaller, and 1/8 inch per foot (1.04%, about 1 in 96) for 3 to 6 inch drains. Too little slope leaves solids behind; far too much lets water run away from them.",
    ],
    [
      "How do I convert percent grade to degrees?",
      "Divide the percent by 100 and take the arctangent: degrees = atan(percent / 100). So 6% becomes atan(0.06) = 3.43 degrees, and 25% becomes 14.04 degrees. To go the other way, degrees to percent, use tan(angle) x 100.",
    ],
  ],
};

export default seo;
