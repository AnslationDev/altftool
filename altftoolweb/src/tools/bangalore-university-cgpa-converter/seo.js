const seo = {
  title: "Bangalore University CGPA to Percentage Converter",
  metaDescription:
    "Convert Bangalore University CGPA with percentage = (CGPA - 0.75) x 10, reverse it for cut-offs, and compare the 0.75, 0.5 and zero-offset rules.",
  steps: [
    "Pick a direction — \"CGPA to percentage\" or \"Percentage to CGPA\" — and enter your value in \"CGPA or SGPA (out of 10)\" or \"Percentage of marks\".",
    "Read the Equivalent percentage (or Equivalent CGPA) with its \"Calculated as\" formula line and the class under the common convention, based on the (CGPA - 0.75) x 10 rule Bangalore University uses.",
    "Press \"Copy result\" to copy the conversion summary, or roll semester SGPAs and credits into a credit-weighted CGPA via the semester SGPA table.",
  ],
  intro:
    "This converter applies the equivalence Bangalore University prints alongside its CBCS grade cards, percentage = (CGPA - 0.75) x 10, and reverses it so you can see the CGPA a stated cut-off requires. Because three different offsets are used across Indian universities, it also shows the same CGPA read under 0.75, 0.5 and no offset at all, which is the quickest way to identify the rule your own marks card followed. Semester SGPAs can be rolled into a credit weighted CGPA first.",
  useCases: [
    "A job application has one percentage field and your Bangalore University card prints CGPA 7.42.",
    "Working out the CGPA that reaches the 60% first class line before a postgraduate application closes.",
    "Your college quoted a percentage that does not match your own arithmetic, and you need to see which offset it used.",
  ],
  benefits: [
    ["The offset Bangalore uses", "Applies 0.75, not the 0.5 or zero offset that other universities use."],
    ["Formula comparison", "All three conversions side by side, so a mismatch on your marks card is easy to explain."],
    ["Threshold table", "The exact CGPA behind 40%, 50%, 60% and 70%."],
  ],
  faqs: [
    [
      "How do I convert Bangalore University CGPA to percentage?",
      "Subtract 0.75 from the CGPA and multiply by 10. A CGPA of 7.42 gives (7.42 - 0.75) x 10 = 66.7%, and a CGPA of 8.0 gives 72.5%.",
    ],
    [
      "What CGPA is 60 percent at Bangalore University?",
      "6.75. Reversing the rule gives CGPA = (percentage / 10) + 0.75, so 50% needs 5.75, 60% needs 6.75 and 70% needs 7.75.",
    ],
    [
      "Why do different websites give different percentages for the same CGPA?",
      "They use different offsets. At CGPA 8.0 the 0.75 rule gives 72.5%, the 0.5 rule gives 75% and straight scaling gives 80% - a spread of 7.5 marks. Only the rule your own university publishes is valid for your transcript.",
    ],
    [
      "Does Bangalore University issue a percentage certificate?",
      "The registrar (evaluation) can issue an equivalence or percentage statement on request, and that is what foreign universities and most government recruiters will insist on. A calculated figure is fine for a first-round application form but should not be presented as certified.",
    ],
  ],
};

export default seo;
