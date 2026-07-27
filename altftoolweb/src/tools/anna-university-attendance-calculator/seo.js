const seo = {
  intro:
    "Attendance percentage is attended classes divided by classes held, times 100, and Anna University requires at least 75% in a course before a student is permitted to sit its end-semester examination. This calculator returns that percentage, places it against the 75% requirement and the 65% condonation floor, and solves the two questions that actually matter: how many classes in a row you must attend to climb back to 75%, and how many you can still miss without falling below it. Where you know the total classes planned for the term, it also reports the absolute number you must attend across the whole course.",
  useCases: [
    "Checking mid-semester whether a week of missed labs has pushed a course below the 75% line",
    "Finding the exact number of consecutive classes needed to climb from 70% back to 75%",
    "Seeing whether attending every remaining class can still reach 75% before the term ends",
  ],
  benefits: [
    ["Exact class counts, not estimates", "Solves the inequality rather than rounding a percentage gap."],
    ["Condonation band shown", "Separates a shortage that is normally condonable from one that is not."],
    ["Term-end feasibility", "Flags the point at which even perfect attendance can no longer reach 75%."],
  ],
  faqs: [
    [
      "What is the minimum attendance in Anna University?",
      "75% of the classes held in each course is the minimum for being permitted to write the end-semester examination. Attendance between 65% and just under 75% is normally condonable on payment of the prescribed fee with supporting documents; below 65% the course usually has to be redone.",
    ],
    [
      "How many classes do I need to attend to reach 75%?",
      "Attend n consecutive classes where n = (75 × classes held − 100 × classes attended) ÷ 25, rounded up. At 28 of 40 classes that is (3000 − 2800) ÷ 25 = 8 classes, which takes you to 36 of 48, exactly 75%.",
    ],
    [
      "How many classes can I miss and still keep 75%?",
      "You can miss up to (100 × attended ÷ 75) − held classes, rounded down. With 36 attended of 40 held, that is 48 − 40 = 8 more classes, after which you sit at 36 of 48 and exactly on the line.",
    ],
    [
      "Does attendance condonation cost money at Anna University?",
      "Yes — condonation for a shortage in the 65% to 75% band is granted against a prescribed condonation fee and supporting documents such as a medical certificate, processed through your college. The amount and the approval process are set by the college under the university regulation, so confirm both with your department office.",
    ],
  ],
};

export default seo;
