const seo = {
  title: "Subject Strength Radar Chart for Exam Marks",
  metaDescription:
    "Plot 3-10 subjects on a radar chart, each scored as a % of its own maximum marks. See your strongest and weakest subjects and how balanced you are.",
  steps: [
    "Enter each subject's Marks obtained and Maximum marks — 3 to 10 subjects, added with the Add subject button.",
    "Read the radar chart, where every score is plotted as a percentage of its own maximum so unequal totals share one scale.",
    "Check the Balance across subjects grade with strongest, weakest, spread and standard deviation, then click Copy result.",
  ],
  intro:
    "This tool plots subject-wise marks on a radar (spider) chart by normalising every score to a percentage of its own maximum, so unequal totals like 100-mark and 80-mark papers share one scale. It also computes the standard deviation of your percentages to grade how balanced your profile is, and names your strongest and weakest subjects. It is meant for students planning revision time and for parents and mentors reviewing a report card at a glance.",
  useCases: [
    "A Class 10 student plotting five board subjects to decide which two deserve the most revision hours",
    "An engineering aspirant checking whether Physics, Chemistry and Maths are balanced enough for a rank-based exam",
    "A tutor turning a term report into a visual for a parent meeting instead of a table of raw marks",
  ],
  benefits: [
    ["One scale for all subjects", "Marks are converted to percentages of each paper's maximum before plotting."],
    ["Balance is quantified", "Standard deviation across subjects classifies the profile as balanced, moderate or uneven."],
    ["Instant weak-spot detection", "The shortest spoke of the radar is your weakest subject — no table reading needed."],
  ],
  faqs: [
    [
      "What is a subject strength radar chart?",
      "It is a polygon chart with one axis per subject, where the distance from the centre shows the percentage scored in that subject. A large, even polygon means uniformly strong performance; a dented polygon points at specific weak subjects.",
    ],
    [
      "How do I compare subjects with different maximum marks?",
      "Convert each to a percentage first: a 68/80 in one paper is 85%, which beats 82/100. This tool does that conversion automatically before plotting, so every axis runs 0-100%.",
    ],
    [
      "How is subject balance measured?",
      "By the population standard deviation of your subject percentages. Under 8 points is treated as well balanced, 8-15 as moderately uneven, and above 15 as clearly lopsided — bands chosen because common grade slabs are about 10 points wide.",
    ],
    [
      "How many subjects do I need for the radar?",
      "At least 3, because a radar chart needs three axes to enclose an area, and this tool plots up to 10. With only two subjects a simple side-by-side comparison is more readable than a radar.",
    ],
  ],
};

export default seo;
