const seo = {
  title: "Editing Time Estimator: Post Hours by Task",
  metaDescription:
    "Adds up ingest, review, assembly, grade, graphics, mix and export from raw and finished runtime, then adds 15% of the base edit per revision round.",
  steps: [
    "Enter Raw footage minutes and Finished runtime minutes — they open at 180 and 8, and raw footage cannot be shorter than the finished runtime.",
    "Set Motion graphics count, Revision rounds and Hourly rate (4, 2 and 50 by default); the estimate recalculates on every keystroke, with each revision round adding 15% of the base edit.",
    "Read Total, Working days, Edit ratio and Cost across the top, then the per-task rows Ingest & transcode, Review & logging, Assembly & fine cut, Colour grade, Motion graphics, Audio clean-up & mix and Export, QC & delivery. Reset restores 180 / 8 / 4 / 2 / 50.",
  ],
  intro:
    "An editing time estimator predicts how many hours a video edit will take by adding up individual post-production tasks rather than applying one blanket edit ratio. It splits the work into ingest and transcode, reviewing rushes, assembly driven by cut density, colour grade, motion graphics, audio mix, export and QC, then adds a percentage of the base edit for each client revision round. Editors, agencies and in-house content teams use it to turn a vague brief into a schedule and a quotable number of hours.",
  useCases: [
    "Quote a three-minute brand film cut from two hours of rushes with four lower thirds and two revision rounds.",
    "Explain to a client why a 40:1 footage ratio costs more to edit than the same runtime shot 8:1.",
    "Decide whether a deadline is achievable at six focused editing hours a day before you accept the job.",
    "Price a fast-cut social edit at 30 cuts per minute against a slower interview cut at six.",
  ],
  benefits: [
    ["Task-level, not a guess", "Seven separate tasks are costed independently, so you can see which stage actually eats the schedule."],
    ["Revisions are priced", "Each round adds a set share of the base edit, which is the part most quotes forget."],
    ["Calibrate to your own speed", "Every rate is editable, so you can replace the defaults with hours you have actually logged."],
  ],
  faqs: [
    [
      "How long does it take to edit one minute of video?",
      "For a typical corporate or brand piece, budget roughly 2-3 hours of editing per finished minute once ingest, logging, grade, graphics, mix and one or two revision rounds are included. Fast social cuts with little grading can drop under an hour per finished minute; documentary work with a high footage ratio can exceed six.",
    ],
    [
      "What is a footage ratio and why does it matter?",
      "Footage ratio is raw runtime divided by finished runtime — two hours of rushes for a three-minute cut is 40:1. It matters because reviewing and logging scale with raw footage, not with the length of the final edit, so a high ratio adds hours before a single cut is made.",
    ],
    [
      "How many revision rounds should I include in a quote?",
      "Two rounds is the common default in freelance and agency contracts. Pricing each round at around 15% of the base edit makes the cost of a third or fourth round explicit, which is easier to discuss up front than to invoice later.",
    ],
    [
      "Does cut density really change edit time?",
      "Yes — assembly time scales with the number of cuts, not the runtime. A three-minute edit at 30 cuts per minute contains 90 cuts to select, trim and retime, roughly two and a half times the assembly work of the same runtime at 12 cuts per minute.",
    ],
  ],
};

export default seo;
