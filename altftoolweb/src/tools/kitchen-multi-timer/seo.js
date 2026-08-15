const seo = {
  title: "Kitchen Multi-Timer with a Finish-Together Planner",
  metaDescription:
    "Run named, emoji-tagged timers for every dish and set a serve time — each staged dish gets its own start time so rice, dal and the roast finish together.",
  steps: [
    "Add each dish with a name, Minutes and Seconds — or tap one of 14 presets like Jammy eggs (9 min) or White rice (12 min) — using 'Add & start' to run it now or 'Stage for later'.",
    "Set the 'Everything ready at' time in the Finish-together planner.",
    "Follow the schedule: each staged dish shows 'Start at' its own computed time with a Start button, and dishes already cooking are flagged minutes early, late or on target.",
  ],
  intro:
    "The Kitchen Multi-Timer runs as many named, emoji-tagged countdowns as a meal needs at once, and works backwards from a serve time you set to tell you when each dish has to go on. Give it a target — say 7:30 — and every paused timer gets a start time computed as the serve time minus its own cook length, while running timers show how many minutes early or late they will land. It is for anyone cooking three things at different speeds who wants them all ready together instead of one dish going cold.",
  useCases: [
    "Rice, dal and a roast all have to hit the table at the same moment, and you need to know which to start first and when.",
    "You have eggs on the hob, pasta in a second pan and something in the oven, and one unlabelled phone timer is not enough to tell them apart.",
    "You want the pasta at exactly nine minutes for al dente rather than the vague guess you make when the timer is shared with the oven.",
  ],
  benefits: [
    ["Back-times from your serve time", "Enter when the meal should be ready and each waiting dish gets its own start time, so nothing is left finishing twenty minutes ahead of everything else."],
    ["Named timers, not numbered ones", "Every countdown carries the dish name and a food emoji, so the alert tells you which pan to deal with."],
    ["Accurate after a tab switch", "Countdowns are anchored to an end timestamp rather than a tick counter, so a backgrounded or throttled tab does not slow them down, and timers that finished while you were away come back marked done."],
  ],
  faqs: [
    [
      "How do I get several dishes ready at the same time?",
      "Add a timer for each dish with its own cook length, set the ready-by time, and start each one at the start time shown. The schedule is just serve time minus that dish's remaining minutes, so the 90-minute roast goes on long before the 9-minute pasta.",
    ],
    [
      "What cook times do the presets use?",
      "Fourteen common ones, including soft-boiled eggs at 7 minutes, jammy at 9 and hard-boiled at 12, pasta al dente at 9, white rice at 12, tea steep at 3, steamed vegetables at 8 and a roast chicken at 90. Tapping a preset adds it and starts the clock immediately at that length; once it's running you can adjust it with the +1 minute or Restart buttons, or set a custom time yourself in the dish-name/minutes/seconds form before adding it.",
    ],
    [
      "Will the timers keep running if I switch tabs or lock the phone?",
      "The countdown itself stays correct because each timer stores the clock time it should finish rather than counting ticks, so it is right the moment you come back. The chime, however, needs the page to be alive to play, so keep the tab open if you are relying on the sound.",
    ],
    [
      "Can I add a minute to something that needs longer?",
      "Yes — each timer has a +1 minute button that adds 60 seconds whether it is running, paused or already finished, restarting a finished one for that extra minute. There is also restart, which puts a timer back to its full original length.",
    ],
  ],
};

export default seo;
