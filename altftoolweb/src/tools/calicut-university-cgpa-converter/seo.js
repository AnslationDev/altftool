const seo = {
  intro:
    "This converter turns a University of Calicut CBCSS grade point average into an equivalent percentage of marks by scaling it directly: percentage = CGPA x 10. That works without an offset because the CBCSS scale is constructed so each grade point is one tenth of the mid-point of its marks band, so grade point 8 stands for the 75 to 85 band whose centre is 80. It also rebuilds a semester average from course letter grades and credits when you have a grade card but no printed SGPA.",
  useCases: [
    "A job portal accepts only a percentage and your Calicut consolidated grade card prints a CGPA of 7.6.",
    "Reconstructing an SGPA from a grade card that lists letter grades and credits but no computed average.",
    "Checking which CBCSS grade band a course mark falls into before an improvement or supplementary attempt.",
  ],
  benefits: [
    ["Matches the CBCSS scale", "Uses straight ten-times scaling, correct for Calicut, instead of an offset formula borrowed from another university."],
    ["Grades in, average out", "Letter grades and credits are enough; no marks needed."],
    ["Credit weighted, not averaged", "A four credit core course moves the result more than a two credit open course, as the regulation requires."],
  ],
  faqs: [
    [
      "How do I convert Calicut University CGPA to percentage?",
      "Multiply the CGPA by 10. A CGPA of 7.6 is equivalent to 76% and a CGPA of 8.45 is 84.5%. No number is subtracted first, unlike the RGPV or VTU formulas that use a 0.75 offset.",
    ],
    [
      "How is SGPA calculated at Calicut University?",
      "Multiply each course's grade point by its credits, add those products across the semester, and divide by the total credits. Four credits at grade A+ (9 points) plus three credits at B+ (7 points) gives (36 + 21) / 7 = 8.14.",
    ],
    [
      "What are the CBCSS grade points at Calicut University?",
      "O is 10, A+ is 9, A is 8, B+ is 7, B is 6, C is 5, P is 4 and F is 0. The bands step in tens from 95 and above for O down to 35 to below 45 for P, with the pass floor raised to 40 on some science and professional programmes.",
    ],
    [
      "Is a CGPA of 7 a first class at Calicut University?",
      "CBCSS reports a letter grade rather than a division, and 7.0 to below 8.0 carries the grade A. Employers that still ask for a division usually read the 70% equivalent as a first class, but the authoritative statement is the grade printed on your consolidated grade card.",
    ],
  ],
};

export default seo;
