const seo = {
  title: "Creator Workload Calculator: 48h & 55h Risk Check",
  metaDescription:
    "Turn your posting schedule into weekly hours and score it against the 48-hour EU ceiling, the 55-hour WHO/ILO level and the 7-hour sleep floor.",
  steps: [
    "Under \"Weekly output\" set \"Pieces per week\" and \"Hours per piece\" for each format — \"Long-form video (8-15 min)\" starts at 9 hours, \"Short / Reel / vertical clip\" at 1.5.",
    "In \"Everything else\" add \"Admin, comms & brand deals (h/week)\", \"Full days off per week (0-6)\", \"Average sleep (h/night)\", \"Weeks since a full week off\" and your \"Target working week (h)\".",
    "The \"Weekly load score\" out of 100 lands in a band, and the rows give \"Total weekly hours\", \"Vs 55 h WHO/ILO threshold\", \"Weekly sleep debt\" and \"Gap to your target week\"; \"Copy result\" copies the breakdown.",
  ],
  intro:
    "The Creator Workload Burnout Calculator converts a content schedule into total weekly working hours and scores it against published working-time and sleep guidance. It multiplies each format's weekly output by the real hours it takes end to end, adds admin and community time, then compares the total with the 48-hour average ceiling in the EU Working Time Directive and the 55-hour mark the WHO/ILO links to raised stroke and heart-disease risk. It is built for solo creators, freelancers and small studios who want to know whether a posting calendar is physically sustainable before they commit to it.",
  useCases: [
    "Test whether adding a second long-form video a week pushes your schedule past 48 hours before you announce it.",
    "Show a manager or client the true hour cost of a 'just one more short a day' request, format by format.",
    "Work out which formats to trim to bring a 62-hour production week back down to a 40-hour target.",
    "Check whether a six-day posting week with six hours of sleep leaves any recovery margin at all.",
  ],
  benefits: [
    [
      "Anchored on real thresholds",
      "Hours are scored against the 48-hour directive ceiling and the 55-hour WHO/ILO risk level, not an invented scale.",
    ],
    [
      "Format-level breakdown",
      "See which format eats the largest share of the week and what output fits inside your target hours.",
    ],
    [
      "Recovery counted too",
      "Sleep below the 7-hour adult floor, missing rest days and months without a break all move the score.",
    ],
  ],
  faqs: [
    [
      "How many hours a week is too many for a content creator?",
      "Above 48 hours a week on average you are past the ceiling set by the EU Working Time Directive, and at 55 hours or more you reach the level the WHO/ILO 2021 joint estimates associate with higher risk of stroke and ischaemic heart disease. Creators often cross both without noticing because editing, replies and admin sit outside 'filming time'.",
    ],
    [
      "How long does it actually take to make one YouTube video?",
      "For a solo creator, an 8-15 minute edited video commonly takes 8-12 hours across scripting, filming, editing, thumbnail and upload — which is why two a week plus shorts already fills a full-time schedule. The calculator starts at 9 hours per long video and lets you replace it with your own measured timing.",
    ],
    [
      "Does sleep affect burnout risk for creators?",
      "Yes. The American Academy of Sleep Medicine and Sleep Research Society recommend adults sleep 7 or more hours a night, and a shortfall accumulates: sleeping 6 hours builds about 7 hours of sleep debt a week. The calculator treats a two-hour nightly shortfall as the point where the sleep component maxes out.",
    ],
    [
      "Is this a burnout diagnosis?",
      "No. It is a workload model that adds hours and recovery gaps, not a validated clinical instrument such as the Maslach Burnout Inventory. If exhaustion, cynicism about your work or a drop in performance is persisting, talk to a doctor or a qualified mental health professional.",
    ],
  ],
};

export default seo;
