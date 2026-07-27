const seo = {
  intro:
    "The Newsletter Prompt Builder writes an AI drafting prompt for one newsletter edition, built around your audience segment, sending cadence and a single primary CTA. It allocates the word count across the opening note, each item and the sign-off, and embeds the deliverability limits that matter in practice: a roughly 40-character mobile subject line, a 40-100 character preheader, and a rule that the one CTA appears at most twice.",
  useCases: [
    "A solo creator drafting a weekly 600-word edition splits it into four items of about 128 words each, with three subject-line options generated per send.",
    "A marketing team briefs the same prompt to different segments — trial users versus paying customers — changing only the segment line so every edition stays targeted.",
    "A founder moving from monthly to weekly sends uses the cadence ceilings to see that the old 1,400-word format needs to shrink before the switch.",
  ],
  benefits: [
    [
      "One CTA, enforced",
      "The prompt names a single ask and caps it at two appearances, so drafts stop arriving with five competing links.",
    ],
    [
      "Cadence-aware length",
      "Daily, weekly, fortnightly and monthly presets carry word ceilings (300 / 800 / 1,200 / 1,500) and warn when your target exceeds them.",
    ],
    [
      "Inbox-ready limits",
      "Subject-line and preheader character limits are written into the prompt, so what the model drafts survives mobile truncation.",
    ],
  ],
  faqs: [
    [
      "How long should a newsletter subject line be?",
      "Keep it to about 40 characters. Mobile mail clients — where most opens happen — truncate subject lines around 30 to 40 characters, with iPhone Mail in portrait being the usual worst case. This tool writes that 40-character ceiling directly into the drafting prompt.",
    ],
    [
      "How many words should a newsletter be?",
      "It depends on cadence: roughly up to 300 words for a daily send, 800 for weekly, 1,200 for fortnightly and 1,500 for monthly are workable ceilings. The more often you land in the inbox, the shorter each email must be — this tool warns when your target length exceeds the ceiling for your chosen cadence.",
    ],
    [
      "Should a newsletter have more than one call to action?",
      "One primary CTA per email is the safer rule — multiple competing asks split clicks and muddy what the edition is for. The generated prompt allows the single CTA to appear at most twice: once mid-email and once restated in the sign-off.",
    ],
    [
      "What is preheader text and how long should it be?",
      "The preheader is the preview line mail clients show next to or under the subject, and 40 to 100 characters is the practical range. Shorter than about 40 characters, many clients pad the slot with whatever stray text opens your email — often an unsubscribe link or 'view in browser'.",
    ],
  ],
};

export default seo;
