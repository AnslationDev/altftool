const seo = {
  intro:
    "An EMOM timer runs a fixed interval on repeat — you start the prescribed reps at the top of every interval and the time left over is your rest. This tool turns interval length, rounds, reps and your own seconds-per-rep pace into the exact rest window inside each round, then runs the clock with a prep countdown and live round tracking. It also flags when the work spills past the interval, which is the point an EMOM stops working as designed.",
  useCases: [
    "Check before you start whether 12 rounds of 10 thrusters at 2.5 seconds per rep leaves enough rest inside a 60-second interval.",
    "Switch a session to E2MOM (120-second intervals) when the rep count needs more recovery than a minute allows.",
    "Plan a 20-minute skill EMOM where work fills only about a third of each interval, so technique stays clean.",
    "Compare two rep schemes on total working time and total rest before writing them into a training block.",
  ],
  benefits: [
    ["Rest is calculated, not guessed", "Rest per interval comes from your own rep pace, so the number reflects how you actually move."],
    ["Overload warning", "If reps times pace exceeds the interval, the plan says so and reports the overrun in seconds."],
    ["Any interval length", "Works for E30, EMOM, E90 and E2MOM formats from 10 seconds up to 10 minutes."],
  ],
  faqs: [
    [
      "What does EMOM mean in a workout?",
      "EMOM stands for Every Minute On the Minute: you begin a fixed set of reps at the start of each minute and rest for whatever time remains before the next minute begins. A 12-round EMOM therefore always takes exactly 12 minutes, regardless of how fast you finish each set.",
    ],
    [
      "How many reps should an EMOM have?",
      "Pick a rep count that finishes with at least about 30 percent of the interval left as rest — roughly 40 seconds of work in a 60-second interval at the very hardest. Skill and technique EMOMs usually sit nearer 20 seconds of work per minute so quality does not drop.",
    ],
    [
      "What is the difference between EMOM and E2MOM?",
      "Only the interval length. EMOM uses 60-second intervals; E2MOM uses 120 seconds, giving roughly double the rest for the same rep count and suiting heavier lifts such as cleans or squats. E90 and E30 are the same idea at 90 and 30 seconds.",
    ],
    [
      "What happens if I cannot finish the reps inside the minute?",
      "You have no rest and the next round starts while you are still working, so the session degrades round by round. Cut the reps, reduce the load, or lengthen the interval — this tool shows the overrun in seconds so you know how much to trim.",
    ],
  ],
};

export default seo;
