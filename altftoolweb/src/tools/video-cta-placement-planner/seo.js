const seo = {
  title: "Video CTA Timing Planner With YouTube Card Limits",
  metaDescription:
    "Turns a video length into timestamped CTA slots: protects the opening hook, spaces mid-roll asks, and puts the end screen in the last 5-20 seconds.",
  steps: [
    "Set Length (minutes) and Length (seconds), Calls to action in total, and the Hook to keep clear (seconds).",
    "Pick a Placement style, then set End screen length (seconds) or clear 'Reserve the last slot for an end screen'.",
    "Read the Placement sheet of Time, Ask and How to deliver it rows, with Cards needed shown against the 5 YouTube allows; press Copy plan.",
  ],
  intro:
    "Video CTA Placement Planner turns a video's length into a timestamped list of call-to-action slots, keeping the opening hook free of any ask, spacing mid-roll asks across the body, and putting the end screen where YouTube actually allows it — in the final 5 to 20 seconds of a video at least 25 seconds long. It also counts the cards you would need against YouTube's limit of 5 per video and flags asks that land too close together. Useful for creators and editors who script CTAs before the edit rather than bolting them on afterwards.",
  useCases: [
    "Script a 10-minute tutorial with one soft mention mid-way, one direct ask after the payoff, and an end screen.",
    "Check whether a five-CTA plan on a three-minute video is crowding asks less than a minute apart.",
    "Move asks later for a how-to video where the result only lands in the last third.",
    "Hand an editor an exact timestamp sheet so cards and end screens are placed consistently across a series.",
  ],
  benefits: [
    ["Respects the hook", "No ask lands before the opening you set, which is where most viewers decide to stay or leave."],
    ["Platform limits built in", "End screens are only planned when the video is long enough, and cards are counted against the 5-card maximum."],
    ["Copy-ready sheet", "Every slot comes with a timestamp and a one-line delivery note you can paste into a script."],
  ],
  faqs: [
    [
      "Where should you put a call to action in a video?",
      "Put the first ask after the opening hook has delivered something useful — typically after the first 30 seconds — place any mid-roll ask right after a payoff moment, and reserve the last 5 to 20 seconds for the end screen. Asking before you have given the viewer a reason to stay is the most common cause of an early drop-off.",
    ],
    [
      "How long can a YouTube end screen be and when can it start?",
      "An end screen runs between 5 and 20 seconds and can only appear in the final 20 seconds of the video. The video itself must be at least 25 seconds long, so Shorts and very short clips need a spoken or on-screen CTA instead.",
    ],
    [
      "How many CTAs should a video have?",
      "Two or three is typical for a 10-minute video: one soft mention, one direct ask and the end screen. More than that and the asks start landing under a minute apart, which reads as relentless — the limit that actually binds is YouTube's maximum of 5 cards per video.",
    ],
    [
      "Do mid-roll calls to action hurt watch time?",
      "They can if they interrupt before a payoff, which is why placement matters more than count. Keep each ask under about 10 seconds, tie it to something the viewer just got, and check your retention graph afterwards — a visible dip at the CTA timestamp means it should move later or get shorter.",
    ],
  ],
};

export default seo;
