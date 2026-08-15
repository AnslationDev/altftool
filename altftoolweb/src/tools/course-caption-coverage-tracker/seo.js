const seo = {
  title: "Course Caption Coverage by Runtime, Not Lesson Count",
  metaDescription:
    "Tick captions and transcripts per lesson and see coverage by runtime as well as lesson count, plus hours left at your x-runtime editing pace. WCAG 1.2.2.",
  steps: [
    "Fill the Lessons table with a title and Minutes per row, ticking the Captions and Transcript boxes, and use Add lesson for anything missing.",
    "Set Captioning effort (x runtime) and Transcript effort (x runtime), or tap a preset such as Full ASR edit and timing (3x runtime).",
    "The Captioned runtime headline, Total runtime, Media still to caption and Total work remaining update live; press Copy summary to take them away.",
  ],
  intro:
    "A caption coverage tracker reports what share of an online course has captions and transcripts, measured both by lesson count and by runtime, and converts the unfinished media into an hours estimate using a multiple-of-runtime effort figure. Course creators and instructional designers use it because runtime coverage is the number that actually reflects learner experience — ten captioned two-minute intros do not offset one uncaptioned ninety-minute masterclass. It maps progress against WCAG 2.2 Success Criterion 1.2.2 Captions (Prerecorded), a Level A requirement.",
  useCases: [
    "Working out whether a 40-lesson course can be fully captioned before a launch date, given a 3x-runtime editing pace",
    "Reporting accessibility progress to a client or university department in percent-of-runtime terms",
    "Deciding which uncaptioned lessons to tackle first by sorting on duration rather than lesson number",
  ],
  benefits: [
    ["Runtime-weighted coverage", "Percentages reflect watch time, not just how many rows are ticked."],
    ["Effort in hours", "Remaining media is multiplied by your real captioning pace to give a schedule figure."],
    ["Standard-aware", "Progress is framed against the Level A WCAG criteria that apply to prerecorded video."],
  ],
  faqs: [
    [
      "Are captions legally required for online courses?",
      "Captions for prerecorded video are a Level A requirement under WCAG 2.2 Success Criterion 1.2.2, and many public-sector and education procurement rules reference WCAG directly. Whether that binds your specific course depends on your jurisdiction and who your learners are, so check with a legal or accessibility adviser before making a compliance claim.",
    ],
    [
      "How long does it take to caption one hour of video?",
      "Roughly 1.5 to 3 hours if you are correcting automatic speech recognition output, and 5 to 10 hours if you are captioning from scratch by hand. Technical material with jargon, accents or overlapping speakers pushes you toward the upper end of both ranges.",
    ],
    [
      "What is the difference between captions and a transcript?",
      "Captions are time-synchronised text displayed over the video; a transcript is the full text as a separate document with no timing. Under WCAG 2.2, captions satisfy SC 1.2.2, while a complete text alternative including relevant visual information is one accepted route to SC 1.2.3.",
    ],
    [
      "Should I measure caption coverage by lesson count or by runtime?",
      "By runtime, and report lesson count as a secondary figure. Runtime coverage tells you what proportion of the course a learner relying on captions can actually follow, which is why the tracker shows both and treats the runtime figure as the headline.",
    ],
  ],
};

export default seo;
