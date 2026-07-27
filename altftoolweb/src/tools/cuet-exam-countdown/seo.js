const seo = {
  intro:
    "This CUET countdown scores each of your subject papers on readiness rather than coverage alone: readiness is the fraction of the syllabus you have studied multiplied by an Ebbinghaus retention term, e raised to minus days-since-revision divided by memory stability. A chapter list finished in March but untouched since is therefore shown as weak, and the tool tells you the date each subject's revision falls due. It also projects marks under the CUET scheme of +5 for a correct answer and -1 for a wrong one, which is why a badly retained paper can project a negative score.",
  useCases: [
    "Spotting that Accountancy has quietly decayed to 11 percent readiness because it was last revised a month ago",
    "Deciding which of five CUET subjects to revise this weekend when all of them are partly covered",
    "Seeing the projected mark total move as you tick subjects off as revised today",
  ],
  benefits: [
    ["Recency counts", "Coverage alone hides the subject you finished first and never went back to."],
    ["Dated revision alerts", "Each subject gets the calendar date its next revision falls due, not a vague reminder."],
    ["Real marking scheme", "Projections use +5 and -1, so weak papers correctly show up as loss-making."],
  ],
  faqs: [
    [
      "What is the CUET marking scheme?",
      "Each correct answer earns 5 marks and each wrong answer loses 1, with unattempted questions costing nothing. Guessing therefore breaks even at a one-in-six chance of being right, which is why blind guessing on a four-option question is slightly positive but guessing on a subject you have not studied is not.",
    ],
    [
      "How many subjects can I take in CUET UG?",
      "NTA has capped a CUET UG candidate at 5 subject papers in recent cycles, down from earlier limits, and universities specify which combination each programme accepts. Check the eligibility table of every university you are applying to before locking your subject choices, since a missing domain paper can make an otherwise strong score unusable.",
    ],
    [
      "How often should I revise each CUET subject?",
      "This tool derives the interval from the forgetting curve: with a memory stability of 21 days and a retention floor of 0.75, revision falls due about 7 days after the last pass. Raise the stability for subjects you have drilled heavily and lower it for ones you read once, and the due dates shift accordingly.",
    ],
    [
      "Does finishing the syllabus mean I am ready for CUET?",
      "No. Readiness here is coverage multiplied by retention, so a fully covered subject last revised 30 days ago scores about 24 percent rather than 100. Finishing the syllabus is the point at which useful preparation starts, not the point at which it ends.",
    ],
  ],
};

export default seo;
