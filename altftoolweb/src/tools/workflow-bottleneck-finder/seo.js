const seo = {
  intro:
    "The Workflow Bottleneck Finder splits each step of a process into active minutes, wait minutes and rework minutes, adds them into a total per step, and names the step with the largest total as the bottleneck. Paste one line per step as name, active, wait, rework and you get the end-to-end cycle time, a bar for every step scaled against the worst one, and the share of each step that is pure waiting. It is the standard value-stream split of touch time versus queue time, done without a spreadsheet.",
  useCases: [
    "Your team says the approval stage is slow, and you want to show that it is 96 minutes of sitting in a queue against 10 minutes of actual work before you argue for a change",
    "A customer request takes four days end to end and nobody can say where the time goes, so you write the five steps out with their minutes and see the cycle time land where it actually does",
    "You are choosing between automating a task and removing a handoff, and want to compare the step with the most active minutes against the step with the highest wait share",
  ],
  benefits: [
    ["Separates working from waiting", "Every step reports a wait share as a percentage of its own total, which is what distinguishes a genuinely hard step from one stuck in a queue."],
    ["Rework counted as its own cost", "Time spent redoing a step is tracked separately instead of being buried in active time, so quality problems show up as time problems."],
    ["Steps ranked against the worst one", "Each bar is scaled to the largest step total, so the size of the gap between your bottleneck and everything else is visible at a glance."],
  ],
  faqs: [
    [
      "What format should I paste the steps in?",
      "One step per line as name, active minutes, wait minutes, rework minutes — for example \"Approval,10,96,8\". All four fields are required; lines missing a field are ignored, and any non-numeric value is read as 0.",
    ],
    [
      "How is the bottleneck chosen?",
      "It is the step with the highest total of active plus wait plus rework minutes. That means a step can be flagged as the bottleneck on queue time alone — in the sample, Approval carries 96 wait minutes against 10 active, a wait share of 84%.",
    ],
    [
      "Should I use average or worst-case minutes?",
      "Use typical or median minutes per step for a first pass, since averages get skewed by rare escalations. If you want to understand missed deadlines rather than everyday flow, run it a second time with the slow-case numbers and compare which step moves most.",
    ],
    [
      "Does the cycle time account for steps that run in parallel?",
      "No — the total is the straight sum of every line, so it models a strictly sequential process. If two steps genuinely run at the same time, enter them as a single combined line using the longer of the two, otherwise the cycle time will overstate the real elapsed duration.",
    ],
  ],
};

export default seo;
