const seo = {
  intro:
    "The Podcast Release Calendar Planner turns a first-drop date, a cadence and your edit turnaround into a dated grid of every publish date plus the edit-lock and recording deadline that sits behind it. It works backwards from each release — recording deadline = publish date minus the scheduled-early buffer minus the edit turnaround — and groups episodes into batch recording sessions dated by the earliest deadline in each batch. Built for solo hosts and small production teams planning a season before the first guest is booked.",
  useCases: [
    "Map a 10-episode weekly season onto real dates before you start booking guests, so you know the last day each recording can happen.",
    "Work out how many batch recording days you need if you tape four episodes per session instead of one at a time.",
    "Slot a two-week mid-season break after episode six and see every later release date shift automatically.",
    "Check whether a launch date is still realistic when the edit turnaround is five days and you want files scheduled two days early.",
  ],
  benefits: [
    ["Backwards from air date", "Every recording and edit deadline is derived from the publish date, not guessed at."],
    ["Batch-aware", "Recording sessions are dated by the tightest deadline in the batch, so a session is never planned too late."],
    ["Break-safe", "A mid-season hiatus shifts the whole back half of the calendar instead of breaking the pattern."],
  ],
  faqs: [
    [
      "How far ahead should I record podcast episodes?",
      "Aim for a bank of three to four finished episodes before you launch, and stay at least two episodes ahead once you are running. That covers a sick week, a guest cancellation or a slow edit without breaking the release streak, which is what listeners and the platform charts respond to.",
    ],
    [
      "What is the best release day for a podcast?",
      "Tuesday and Wednesday mornings are the most common drop days because midweek commute listening is highest, but consistency matters more than the specific day. Pick one weekday, publish on it every time, and this planner keeps that weekday fixed across the whole season.",
    ],
    [
      "How long before release should an episode be uploaded?",
      "Upload and schedule the finished file at least 24 to 48 hours ahead. RSS feed changes take time to propagate to Apple Podcasts, Spotify and YouTube Music, and a buffer means a failed upload does not become a missed release.",
    ],
    [
      "Does this planner account for public holidays?",
      "No — it counts calendar days in UTC and does not skip holidays or weekends. If a recording deadline lands on a day nobody is working, move that session earlier by hand; the planner is a scheduling aid, not a substitute for your team's own availability.",
    ],
  ],
};

export default seo;
