const seo = {
  intro:
    "JNTU calculates SGPA as the sum of each subject's credits multiplied by its grade point, divided by the total credits registered that semester, on an absolute 10-point scale where 90 marks and above earn 10 points and anything below 40 earns none. This calculator applies that formula from either your letter grades or your raw marks, converts the result with JNTU's published equivalence of percentage = (CGPA − 0.75) × 10, and shows the class the average falls in. It covers JNTU Hyderabad, Kakinada and Anantapur, including the R13 letter set (S, A, B, C, D, E) and the R16 onwards set (O, A+, A, B+, B, C).",
  useCases: [
    "Converting a JNTU memo full of letter grades into an SGPA before the university publishes the consolidated result",
    "Checking whether the current CGPA is still above the 7.75 needed for a first class with distinction",
    "Working out how many credits a failed lab removes from the earned total ahead of a supplementary exam",
  ],
  benefits: [
    ["Marks or grades", "Enter whichever the memo gives you; the mark bands map to grade points automatically."],
    ["Regulation aware", "Switches between the R13 and R16-onwards letter sets without changing the arithmetic."],
    ["Class and percentage together", "Reports the CGPA, its percentage equivalent and the division that CGPA sits in."],
  ],
  faqs: [
    [
      "How is SGPA calculated in JNTU?",
      "SGPA = Σ(credits × grade points) ÷ Σ(credits) for that semester. Subjects of 3, 3, 4, 2 and 1.5 credits scoring 10, 9, 8, 7 and 5 points give 110.5 credit points over 13.5 credits, an SGPA of 8.19.",
    ],
    [
      "How do I convert JNTU CGPA into percentage?",
      "JNTU's equivalence is percentage = (CGPA − 0.75) × 10, so a CGPA of 8.19 becomes 74.4% and a CGPA of 7.00 becomes 62.5%. Apply it to the overall CGPA, not to one semester's SGPA, when a recruiter asks for your aggregate percentage.",
    ],
    [
      "What CGPA is needed for a first class with distinction in JNTU?",
      "A CGPA of 7.75 or above, which is 70% on the standard conversion. First class starts at 6.75, second class at 5.75 and pass class at 5.00. Distinction is normally withheld if any subject was cleared through a supplementary attempt, so check your regulation's wording.",
    ],
    [
      "What grade points do JNTU letters carry?",
      "Under R16 onwards, O carries 10 points, A+ 9, A 8, B+ 7, B 6, C 5 and F 0, for mark bands of 90+, 80–89, 70–79, 60–69, 50–59, 40–49 and below 40. R13 printed the same point values as S, A, B, C, D and E, so an old memo converts to exactly the same SGPA.",
    ],
  ],
};

export default seo;
