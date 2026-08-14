const seo = {
  title: "Kerala University CGPA to Percentage Converter",
  metaDescription:
    "Convert Kerala University CGPA to percentage (CGPA x 10 on the 10-point scale), roll semester SGPAs into a weighted CGPA and plan a target SGPA.",
  steps: [
    "Pick the 'Grade point scale on your mark list', switch between the CGPA to percentage and Percentage to CGPA buttons, and type your value. [pages/index.jsx:146-220]",
    "Fill the 'CGPA from semester SGPAs' rows (Add semester extends the list) and the 'SGPA still needed for a target CGPA' fields - current CGPA, credits completed, credits remaining and target. [pages/index.jsx:291-341, 367-392]",
    "Read the Equivalent percentage with its Letter grade, the Credit weighted CGPA, and the 'Average SGPA needed on remaining credits', then press Copy result. [pages/index.jsx:236-288, 352-364, 403-421]",
  ],
  intro:
    "This converter reads a University of Kerala grade point average as a proportion of its scale: percentage of marks = CGPA divided by the scale maximum, times 100. On the 10 point mark list that reduces to CGPA x 10, so 7.6 is 76%, and setting the scale correctly is what keeps the answer right when an older mark list uses a lower ceiling. It also rolls semester SGPAs into a credit weighted CGPA and works out the average SGPA the remaining credits must carry to reach a target.",
  useCases: [
    "An application form wants a percentage and your Kerala mark list only prints an SGPA of 7.6 out of 10.",
    "You are two semesters from graduating at CGPA 7.0 and want to know what the last 40 credits must average to finish at 7.5.",
    "Reading which letter grade a course mark falls into before deciding on an improvement attempt.",
  ],
  benefits: [
    ["Scale aware", "Pick the ceiling printed on your mark list so an older regulation is not read as a 10 point one."],
    ["Forward and reverse", "Convert a grade average to marks, or find the average a required percentage implies."],
    ["Target planning built in", "See the SGPA the remaining credits need, and whether the target is still reachable at all."],
  ],
  faqs: [
    [
      "How do I convert Kerala University CGPA to percentage?",
      "Divide the CGPA by the maximum of its scale and multiply by 100. On the current 10 point mark list that is just CGPA x 10, so a CGPA of 7.6 is 76% and 8.35 is 83.5%.",
    ],
    [
      "What SGPA do I need to raise my CGPA?",
      "Required SGPA = (target CGPA x total credits - current CGPA x credits completed) divided by credits remaining. At CGPA 7.0 over 80 credits with 40 left, reaching 7.5 needs an average of 8.5 across those last 40 credits.",
    ],
    [
      "What are the letter grades in the Kerala CBCS scheme?",
      "On the 10 point scale the grades run O at 10 points for 95 marks and above, A+ at 9, A at 8, B+ at 7, B at 6, C at 5, P at 4 for the pass band, and F at 0. Each band spans ten marks, which is why the grade point is a tenth of its band mid-point.",
    ],
    [
      "Is a Kerala University CGPA of 6 a first class?",
      "A CGPA of 6.0 on the 10 point scale converts to 60%, which most employers and admission boards read as a first class, but the university reports a letter grade rather than a division. If a form requires a certified statement, apply to the university for an equivalence certificate instead of submitting your own calculation.",
    ],
  ],
};

export default seo;
