const seo = {
  intro:
    "This calculator turns a list of semester SGPAs into a cumulative CGPA using the rule transcripts actually apply: CGPA = the sum of each SGPA multiplied by that semester's credits, divided by total credits. It also shows the plain average of the SGPAs beside it, so the error introduced by averaging semesters of unequal weight is visible rather than hidden, and prints the running cumulative after each semester the way a consolidated marks card does.",
  useCases: [
    "Six semester grade cards, each with a different credit load, and no consolidated CGPA issued yet.",
    "Checking whether a weak heavy-credit semester or a strong light one is driving your cumulative figure.",
    "Converting the final CGPA to a percentage under the specific rule your university publishes.",
  ],
  benefits: [
    ["Credit weighted, not averaged", "Semesters count in proportion to their credits, which is how the transcript computes it."],
    ["Shows the averaging error", "See exactly how many grade points a plain average of the SGPAs would have added or removed."],
    ["Running cumulative", "The CGPA after each semester, so a trend is obvious at a glance."],
  ],
  faqs: [
    [
      "How do I calculate CGPA from SGPA?",
      "Multiply each semester's SGPA by the credits earned in that semester, add the results, and divide by the total credits. SGPAs of 8.5, 7.2 and 9.0 over 20, 24 and 18 credits give 504.8 grade points over 62 credits, so the CGPA is 8.14.",
    ],
    [
      "Can I just average my SGPAs to get the CGPA?",
      "Only when every semester carries the same number of credits. In the example above the plain average is 8.23 against a true CGPA of 8.14, a difference of 0.09 caused entirely by the weak semester carrying the most credits.",
    ],
    [
      "How do I convert my CGPA to a percentage?",
      "Use the rule your own university publishes. Three are in wide use: CGPA x 10, (CGPA - 0.5) x 10 and (CGPA - 0.75) x 10. At a CGPA of 8.0 they give 80%, 75% and 72.5% respectively, so picking the wrong one can misstate a resume by 7.5 marks.",
    ],
    [
      "Do backlogs and repeated papers change the CGPA?",
      "Yes, and the treatment varies. Some universities replace the original grade with the improved one, others keep the first attempt in the calculation or cap the grade a repeat can earn. Check your own regulation, because this calculator uses whatever SGPA figures you enter.",
    ],
  ],
};

export default seo;
