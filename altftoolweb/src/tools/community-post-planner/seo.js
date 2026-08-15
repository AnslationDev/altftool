const seo = {
  title: "Community Post Planner - Dated Schedule Between Uploads",
  metaDescription:
    "Turn an upload cadence into dated community posts - polls, images, text, questions, clips - evenly spaced, with the longest silent gap and weekly minutes.",
  steps: [
    "Set the 'Start date (first upload day)', 'Plan length (days)', 'Days between uploads' and 'Community posts per week'. [pages/index.jsx:112-173]",
    "Weight the Content mix - Poll (5 min each), Image (10), Text update (8), Open question (4) and Clip or teaser (15). [pages/index.jsx:176-200; lib.js:33-83]",
    "Read the Schedule table of dated posts with Format, Role and Prompt columns, plus 'Longest silent gap' and 'Writing time per week', then press Copy plan. [pages/index.jsx:227-259, 286-315]",
  ],
  intro:
    "The Community Post Planner turns an upload cadence into a dated schedule of community posts, spacing each one evenly across the gap between videos. It apportions the post types you choose — polls, images, text updates, open questions and teaser clips — using the largest-remainder method, so the counts always add up to the total you asked for. You get the schedule, the format split, the longest silence in the window and the writing time the plan will actually cost per week.",
  useCases: [
    "Fill a two-week gap between long-form uploads with three community posts a week instead of going quiet.",
    "Decide how many polls versus image posts to run when you only have 40 minutes a week for the community tab.",
    "Find the longest silent stretch in next month's plan before your audience notices it.",
    "Hand a co-host or editor a dated list of posts with a prompt attached to each one.",
  ],
  benefits: [
    ["Evenly spaced, not clumped", "Posts land at calculated mid-points so no week gets four and the next gets none."],
    ["Mix that adds up", "Largest-remainder apportionment keeps the format counts exactly equal to the post total."],
    ["Honest time cost", "Each format carries a minutes-per-post estimate, totalled per week before you commit."],
  ],
  faqs: [
    [
      "How often should I post on the YouTube community tab?",
      "Two to four posts a week is the usual working range for a channel uploading weekly — enough to stay in the feed without training people to scroll past you. The number that matters more is the longest silent gap; keeping it under about five days is a more useful target than any fixed weekly count.",
    ],
    [
      "What is the best mix of polls, images and text posts?",
      "Polls carry the lowest effort and the highest reply rate, so most creators weight them heaviest, with images second and long text least. The planner defaults to a 3:3:2:1:1 ratio across polls, images, text updates, open questions and clips, and you can change every weight.",
    ],
    [
      "Does posting between uploads actually help?",
      "Community posts are a retention and recirculation signal rather than a discovery one — they mostly reach people already subscribed. Treat them as a way to keep an existing audience warm between uploads, not as a substitute for the uploads themselves.",
    ],
    [
      "How does the tool decide the posting dates?",
      "It divides the plan window into equal slices and puts each post at the mid-point of its slice, then labels any post falling within two days before an upload as a warm-up and within one day after as a follow-up. Uploads are placed on day zero and every upload-interval day after that.",
    ],
  ],
};

export default seo;
