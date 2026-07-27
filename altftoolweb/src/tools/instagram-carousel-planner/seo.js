const seo = {
  intro:
    "Instagram Carousel Planner turns a slide count and a swipe-through rate into a finished slide-by-slide plan with roles, word budgets, read time and projected retention. It assigns every position a job — hook, promise, points, recap, call to action — then models drop-off geometrically, so if s is the share of viewers who swipe once, s^(n-1) reach slide n. Read time uses 238 words per minute, the mean silent reading rate reported by Brysbaert (2019).",
  useCases: [
    "Decide whether a 10-slide teaching carousel or a tight 6-slide version will get more people to the call-to-action.",
    "Set a realistic word budget per slide before designing, so no slide ends up with text too small to read on a phone.",
    "Feed your real per-slide drop-off from Instagram insights into the model to see where a recap slide would pay off.",
    "Brief a designer with slide numbers, roles and word counts instead of a vague 'make a carousel about X'.",
  ],
  benefits: [
    [
      "Roles, not guesswork",
      "Every slide position gets a defined job and a concrete instruction for what belongs on it.",
    ],
    [
      "Retention you can see",
      "A per-slide bar shows the share of viewers still present, so long carousels reveal their own cost.",
    ],
    [
      "Realistic pacing",
      "Word counts convert to read seconds at 238 wpm with a minimum glance time for image-led slides.",
    ],
  ],
  faqs: [
    [
      "How many slides can an Instagram carousel have?",
      "Up to 20 photos or videos in a single carousel post. Longer is not automatically better: at an 85% per-slide swipe rate only about 32% of viewers reach slide 8, and about 15% reach slide 13.",
    ],
    [
      "What size should Instagram carousel slides be?",
      "Use 1080 x 1350 px, a 4:5 portrait frame — the tallest ratio the feed shows without cropping, so it occupies the most screen. Keep every slide in the carousel at the same ratio, because Instagram crops the whole set to match the first one.",
    ],
    [
      "How many words should go on one carousel slide?",
      "Roughly 20-30 words on a standard point slide, which reads in about 5-8 seconds at 238 words per minute. A hook slide should be far shorter — under 10 words, set large enough to read at thumbnail size.",
    ],
    [
      "Does the last slide need a call to action?",
      "Only if you want one specific action, and it works best when the carousel already delivered the promise made on slide one. Saves and shares are influenced by many factors outside slide design, so treat any projection here as a planning estimate rather than a forecast.",
    ],
  ],
};

export default seo;
