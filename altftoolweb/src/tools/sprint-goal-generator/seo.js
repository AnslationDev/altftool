const seo = {
  title: "Sprint Goal Generator with Velocity Sanity Check",
  metaDescription:
    "Draft a one-sentence Sprint Goal, compute focused capacity via a focus factor, and check committed points against 0.8-1.1x of average velocity.",
  steps: [
    "Fill in 'The goal' — Sprint name, Who benefits, 'The one outcome', the Metric that proves it, and its Baseline and Target values.",
    "Enter 'Capacity and commitment': Sprint length (weeks) from 1 to 4, Developers on the team, Nominal hours per day, Focus factor (0-1), Average velocity (points) and Committed points, plus the in-scope, not-this-Sprint and risks lists.",
    "Read the Sprint goal focus score out of 100, the Pass/Fix results under Goal checks, and the commitment ratio band, then press Copy sheet to copy the full markdown sheet.",
  ],
  intro:
    "A Sprint Goal is the single objective for one Sprint — the 2020 Scrum Guide's words — and this generator drafts it as one sentence, attaches a baseline-to-target measure, and checks the commitment against the team's average velocity. Focused capacity is computed as developers × working days × hours per day × focus factor, and a commitment between 0.8x and 1.1x of average velocity is treated as healthy. It is for Scrum teams who want the goal on a card, not buried in a backlog.",
  useCases: [
    "Draft the Sprint Goal in Sprint Planning and immediately see whether 32 committed points against a 34-point average is realistic",
    "Write down the non-goals so the team has something concrete to drop when an urgent request lands mid-Sprint",
    "Hand the Sprint Review a fixed set of prompts, starting with the only question that matters: did we meet the goal, yes or no",
  ],
  benefits: [
    ["One objective, enforced", "The tool flags a goal that has turned into a task list or run past 30 words."],
    ["Capacity in real hours", "Nominal hours are multiplied by a focus factor, so ceremonies and support are not counted as delivery time."],
    ["Commitment sanity check", "Committed points divided by average velocity, banded under 0.8x, 0.8-1.1x and over 1.1x."],
  ],
  faqs: [
    [
      "What is a Sprint Goal in Scrum?",
      "It is the single objective for the Sprint, committed to in the Sprint Backlog. The 2020 Scrum Guide is explicit that there is one Sprint Goal per Sprint: it gives the Developers flexibility over which Product Backlog items they use to reach it, and it is what they protect when scope has to flex mid-Sprint.",
    ],
    [
      "How many story points should we commit to?",
      "Between 0.8 and 1.1 times your average velocity. Committing 32 points against a 34-point average is 0.94x, which is healthy; below 0.8x you are leaving capacity idle and above 1.1x you are promising more than the team has ever delivered. Use the average of the last three to five Sprints, not your best one.",
    ],
    [
      "What is a focus factor and what value should I use?",
      "It is the share of nominal working hours that actually goes to Sprint Backlog work once planning, review, retrospective, support and interruptions are removed. 0.8 is the usual starting default; teams carrying an on-call rota often measure nearer 0.6. Six developers × 10 working days × 6 hours × 0.8 gives 288 focused hours in a two-week Sprint.",
    ],
    [
      "How long can a Sprint be?",
      "One month or less, per the Scrum Guide — this generator accepts 1 to 4 weeks. Shorter Sprints produce more learning cycles per quarter and limit the cost of a Sprint that misses its goal; two weeks is the most common choice.",
    ],
  ],
};

export default seo;
