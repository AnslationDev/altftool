const seo = {
  intro:
    "This converter turns an Osmania University CGPA into the equivalent percentage of marks using the half point offset written into its CBCS regulations: percentage = (CGPA - 0.5) x 10. It reverses the same rule so you can see the CGPA a 60% or 70% cut-off demands, and it rolls semester SGPAs into a credit weighted CGPA when no consolidated memo has been issued yet. A straight ten-times option is included for the older schemes that print an unoffset figure.",
  useCases: [
    "A recruitment portal has a single percentage field and your Osmania memo prints CGPA 8.12.",
    "Confirming whether your CGPA clears a 60% eligibility bar before paying an application fee.",
    "Combining eight semester SGPAs and their credit loads into one cumulative figure for a resume.",
  ],
  benefits: [
    ["The offset Osmania uses", "Applies the 0.5 deduction its CBCS rules specify rather than a generic multiply-by-ten."],
    ["Both conventions, clearly labelled", "Switch to straight scaling if your own transcript uses it, and see the five mark gap between them."],
    ["Cut-off table included", "The exact CGPA that reaches 50%, 55%, 60%, 65%, 70% and 75%."],
  ],
  faqs: [
    [
      "How do I convert Osmania University CGPA to percentage?",
      "Subtract 0.5 from the CGPA and multiply by 10. A CGPA of 8.0 converts to (8.0 - 0.5) x 10 = 75%, and 7.0 converts to 65%. The same rule applies to a single semester SGPA.",
    ],
    [
      "What CGPA is 60 percent at Osmania University?",
      "6.5 under the CBCS rule, because reversing the formula gives CGPA = (percentage / 10) + 0.5. On the same basis 50% needs 5.5, 65% needs 7.0 and 75% needs 8.0.",
    ],
    [
      "Why do some Osmania students multiply CGPA by 10 instead?",
      "Older non-CBCS schemes and a few affiliated programmes print an unoffset equivalence. The two conventions differ by five marks at every CGPA, so use whichever your own memorandum of marks states and never average the two.",
    ],
    [
      "How is the Osmania CGPA calculated from semester SGPAs?",
      "Multiply each semester's SGPA by the credits registered in that semester, add the products, and divide by total credits. Semesters with more credits pull the cumulative figure further, which is why a heavy project semester matters more than a light one. For anything official, use the CGPA printed by the examination branch.",
    ],
  ],
};

export default seo;
