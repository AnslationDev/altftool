const seo = {
  intro:
    "A video course lesson timer lays out every planned lesson with its length and returns the total runtime, the split across modules, the script word count at your speaking pace and an editing estimate. Lessons are graded against the engagement bands reported by Guo, Kim and Rubin at ACM Learning at Scale in 2014, where videos of six minutes or less were watched almost to the end and engagement fell steadily beyond that. For course creators deciding what to record before they record it.",
  useCases: [
    "Check whether a 40-lesson course really comes to the four hours the sales page claims.",
    "Find the lessons over six minutes and see how many parts each would need if split.",
    "Estimate how many script words a module needs at 140 words per minute before writing it.",
    "Balance modules so no single one carries half the runtime.",
  ],
  benefits: [
    ["Length graded, not guessed", "Each lesson is placed in an engagement band drawn from published MOOC research rather than a rule of thumb."],
    ["Script and edit time included", "Word count and editing hours are derived from the same runtime, so the production budget follows the plan."],
    ["Module balance visible", "Runtime share per module exposes the section that quietly grew to twice its neighbours."],
  ],
  faqs: [
    [
      "How long should a video lesson be?",
      "Six minutes or less is the strongest evidence-backed target: in the ACM Learning at Scale study of MOOC viewing, videos up to six minutes held near-complete engagement, while 9 to 12 minute videos retained roughly half the viewer. If a topic needs longer, split it at a natural boundary rather than trimming the explanation.",
    ],
    [
      "How many words is a 10-minute video script?",
      "About 1,400 words at an instructional pace of 140 words per minute. Instructional delivery runs slower than conversation because demonstrations need pauses, so 130 to 150 wpm is the usual planning range rather than the 150 to 160 used for audiobooks.",
    ],
    [
      "How long does it take to edit an online course video?",
      "A common planning figure is 3 to 5 hours of editing per finished minute for screencast-plus-talking-head lessons with graphics, callouts and captions. Simple single-camera talking head with light trimming can come in nearer one hour per finished minute.",
    ],
    [
      "How many hours should an online course be?",
      "There is no fixed answer, and total hours is a poor quality signal — completion rates fall as courses lengthen. Plan around the outcome the learner needs, keep individual lessons short, and use the module balance view to check that no section has grown out of proportion to its importance.",
    ],
  ],
};

export default seo;
