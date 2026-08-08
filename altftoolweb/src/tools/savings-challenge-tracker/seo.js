const seo = {
  title: "52-Week Savings Challenge Tracker & No-Spend Month",
  metaDescription:
    "Tick each week and watch the total build: base × 1,378 on the increasing style, plus streaks, projected finish date and a no-spend day grid.",
  steps: [
    "Pick 52-Week Challenge or No-Spend Challenge, then set Base amount from the 100 / 200 / 500 presets or type a Custom base amount.",
    "Choose a Challenge style — Increasing, Flat or Reverse — and tap each week cell in the grid as you save it.",
    "Saved so far tracks against Final target, with Weeks marked, Current streak and Projected finish; Copy progress exports the summary.",
  ],
  intro:
    "This is a tap-to-mark tracker for two savings habits: the classic 52-week challenge, where week n saves your base amount times n and the year totals base x 1,378, and a no-spend month calendar that counts the days you spent nothing. Choose a base amount and a style — increasing, flat or reverse — then tick each week or day as you follow through, and the grid keeps your running total, current streak, best streak and projected finish date. Everything is stored in this browser's localStorage, so the challenge survives a refresh without an account.",
  useCases: [
    "You want to start the 52-week challenge in January but the ramp to a large final week worries you, so you compare the increasing, flat and reverse styles before committing to one",
    "You have agreed a no-spend month with your partner and need a shared rule list of allowed essentials plus a day grid you can both point at when one of you wants a takeaway",
    "You are three months into a savings challenge, missed a couple of weeks, and want to see how much is still left and roughly what date you now finish on",
  ],
  benefits: [
    ["Three ramp styles, not just one", "Increasing saves base x week, flat saves the same figure all 52 weeks, and reverse front-loads the big amounts while motivation is high."],
    ["Streaks tracked two ways", "It shows your current unbroken run and your longest run separately, so one missed week does not erase the record of what you have already done."],
    ["A projected finish date", "Remaining unmarked weeks are converted to a calendar date, so you always know when the challenge actually ends at your current pace."],
  ],
  faqs: [
    [
      "How much do you save in a 52-week challenge?",
      "On the increasing style, the total is your base amount multiplied by 1,378 — that is the sum of 1 through 52. A base of 100 finishes at 137,800; a base of 20 finishes at 27,560. On the flat style the total is simply base x 52.",
    ],
    [
      "What is the reverse 52-week challenge and is it better?",
      "Reverse just flips the order: week 1 saves the largest amount (base x 52) and week 52 saves the smallest (base x 1). The yearly total is identical to the increasing version, but it puts the hardest weeks at the start while motivation is highest and leaves the cheapest weeks over the December holidays.",
    ],
    [
      "How does the no-spend month estimate what I saved?",
      "It multiplies your marked no-spend days by the daily spend figure you set, which starts at 400. That is a self-reported estimate of discretionary spending avoided, not a measured figure — it also ships with five default allowed essentials (groceries, rent and bills, medicines, commute, phone and internet) that you can edit.",
    ],
    [
      "Will I lose my progress if I close the browser?",
      "No, as long as you come back in the same browser on the same device. Marked weeks, marked days, your base amount and your rule list are written to localStorage, which means clearing site data, using private browsing or switching to another device or browser will start you from an empty grid.",
    ],
  ],
};

export default seo;
