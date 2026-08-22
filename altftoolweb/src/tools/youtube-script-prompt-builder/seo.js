const seo = {
  title: "YouTube Script Prompt Builder with Timed Chapters",
  metaDescription:
    "Turn a runtime into a full script prompt: word count at 150 wpm, a 15-second hook, timed chapters and retention beats every ~45 seconds.",
  steps: [
    "Describe the video in 'What the video is about' and 'Who is watching', then set 'Runtime (minutes)' and 'Chapters' — the defaults are a 10-minute video with 5 chapters.",
    "Pick a 'Video style' (Tutorial, Explainer, List or Story) and optionally add a 'CTA for the outro' and an extra instruction for the model.",
    "Review the plan rows — 15 s hook, per-chapter word budgets, retention beats every ~45 s — and click 'Copy prompt' to copy the generated script prompt.",
  ],
  intro:
    "The YouTube Script Prompt Builder converts a target runtime into a full script prompt: word count at the standard 150 words-per-minute narration pace, a 15-second hook, timed chapters with per-chapter word budgets, retention beats every ~45 seconds and a 20-second outro with a single CTA. It is built for creators and video teams who script before they shoot and want the draft to actually fit the runtime.",
  useCases: [
    "A tutorial channel scripting a 10-minute video gets a ~1,500-word plan: 38-word hook, five timed chapters of about 267 words, and 11 marked retention beats.",
    "An educator converts a lesson into an explainer script where every chapter carries a timestamp, so the edit matches the chapter markers uploaded to YouTube.",
    "A marketing team briefing a freelancer standardises scripts to spoken register with [bracketed] b-roll cues and [fact needed] markers instead of invented claims.",
  ],
  benefits: [
    [
      "Runtime you can trust",
      "Words are budgeted at 150 wpm spoken, so a 10-minute script arrives at roughly 1,500 words instead of an unrecordable 3,000.",
    ],
    [
      "Retention engineered in",
      "The prompt schedules a pattern interrupt every ~45 seconds and requires each one marked [BEAT] so the editor knows where the visual changes go.",
    ],
    [
      "Chapter timestamps included",
      "Each chapter gets a start time computed from the plan, ready to paste into the YouTube description as chapter markers.",
    ],
  ],
  faqs: [
    [
      "How many words is a 10-minute YouTube video script?",
      "About 1,500 words at the standard 150 words-per-minute conversational narration pace — the figure this tool uses. Fast narrators reach 160+ wpm and deliberate ones drop to 130, so treat 150 as the scripting baseline and adjust after a read-through.",
    ],
    [
      "How long should the hook of a YouTube video be?",
      "About 15 seconds — roughly 38 spoken words. YouTube's own creator guidance says viewers decide whether to keep watching within the first moments, so the generated prompt bans channel intros and 'welcome back' openers and puts the payoff or problem in the first line.",
    ],
    [
      "What is a retention beat or pattern interrupt in a video?",
      "A deliberate change that re-earns attention: a visual switch, an open question, or a preview of a payoff still coming. Practitioner guidance is one every 30-60 seconds; this tool schedules one every 45 seconds of body content and has the model mark each as [BEAT] in the script.",
    ],
    [
      "What is the character limit for a YouTube title?",
      "100 characters is YouTube's hard limit, though titles get cut around 60-70 characters in many search and suggested-video layouts. The generated prompt asks for three title options under 100 characters each, with the payoff stated early in the title.",
    ],
  ],
};

export default seo;
