const seo = {
  title: "AI Productivity Optimizer: A Focus Plan",
  steps: [
    "Pick your Primary Role — Developer, Designer, Writer / Creator, Manager / Executive or Student — and your Biggest Distractor from Multitasking / Context Switching, Social Media / Phones, Emails / Slack Messages or Perfectionism / Overthinking.",
    "Set Peak Energy Time to Morning (Early Bird), Afternoon (Mid-day Sprinter) or Night (Night Owl), choose a Primary Goal such as \"Focus longer on deep work\", then press Generate AI Stack.",
    "The result names your profile and returns a Core Methodology, an Optimal Schedule built around that energy window and an AI Tool Stack list; Start Over takes you back to the four questions.",
  ],
  intro:
    "AI Productivity Optimizer turns four answers — your role, your peak energy window, your biggest distractor and your main goal — into a named focus method, a concrete daily schedule and a short tool list, using a fixed rule set rather than generic advice. Pick Morning and it returns 90-minute ultradian focus blocks with an Eat-the-Frog start at 8 AM; pick Night and it moves admin to the morning and deep creative work past 8 PM. It is a starting template for someone who has read about a dozen productivity systems and wants one picked for their chronotype.",
  useCases: [
    "You keep abandoning Pomodoro because 25 minutes is too short for your work, and you want to know which method fits a morning chronotype doing deep technical work",
    "Slack and email fragment your day and you want a specific batching rule to try — a fixed pair of check times rather than 'check less often'",
    "You are a night owl on a nine-to-five team and want a written schedule that puts admin in the morning and protects your late-evening focus window",
  ],
  benefits: [
    [
      "Chronotype drives the schedule",
      "Morning, afternoon and night answers produce genuinely different plans — 8 AM hardest-task-first versus post-8 PM creative blocks — not the same advice reworded.",
    ],
    [
      "Distractor changes the method, not just the tip",
      "Social media routes you to identity-based habit framing, email overload to fixed batch processing at 12 PM and 4 PM, and context switching to timed focus blocks.",
    ],
    [
      "Named frameworks you can go read about",
      "Every recommendation is an existing, documented method — Pomodoro, Eat the Frog, ultradian 90-minute blocks, time blocking, batch processing — so you can research it further.",
    ],
  ],
  faqs: [
    [
      "Is this actually using an AI model?",
      "No — it is a deterministic rule set, and the same four answers always produce the same plan. That is a feature for this kind of tool: the mapping from chronotype and distractor to method is explicit and repeatable rather than a different answer every time you ask.",
    ],
    [
      "How long should a focus block be?",
      "This tool defaults to 25 minutes of work and 5 minutes of break for the classic Pomodoro pattern, and switches to 90-minute blocks when you report a morning peak, following the ultradian rhythm idea that alertness runs in roughly 90-minute cycles. Start with whichever matches how long you can currently concentrate and extend from there.",
    ],
    [
      "How often should I check email if it keeps derailing me?",
      "The plan it generates for email-driven distraction is twice a day, at 12 PM and 4 PM, with the inbox closed in between. Two fixed windows work because the cost is the context switch, not the reading — batching removes dozens of switches without delaying anything by more than a few hours.",
    ],
    [
      "What inputs does it take?",
      "Four: one of 5 roles (developer, designer, writer/creator, manager/executive, student), one of 4 distractors, one of 3 peak energy windows, and one of 4 goals. Energy window and distractor do most of the work in choosing the method; role mainly shapes the suggested tool list.",
    ],
  ],
};

export default seo;
