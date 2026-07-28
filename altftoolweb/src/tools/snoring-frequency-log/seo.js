const seo = {
  intro:
    "The Snoring Frequency Log turns a nightly 0-3 loudness rating into a weekly snoring rate, an average severity score and a with-versus-without comparison for each trigger you tick. Weeks are grouped by ISO calendar week (Monday start), and a night counts as 'loud' at level 2 or above — snoring audible through a closed bedroom door. It is built for anyone told they snore who wants two weeks of structured evidence before a GP or sleep-clinic appointment.",
  useCases: [
    "Build a two-week record before a GP visit so you can show how many nights per week you snore rather than guessing.",
    "Test whether cutting evening alcohol changes your average severity by logging a week with it and a week without.",
    "Check whether back-sleeping is your worst position before spending money on a positional therapy device or wedge pillow.",
    "Track whether a nasal strip, saline rinse or allergy treatment actually lowers the loud-night count over a month.",
  ],
  benefits: [
    ["Trigger comparison, not a guess", "Shows average severity on nights with a trigger against nights without it, and hides the comparison until there are at least three nights on each side."],
    ["Weekly rate, not a single night", "ISO weekly buckets smooth out one unusually loud night so you see the actual habitual pattern."],
    ["Flags what clinicians ask about", "Witnessed breathing pauses are recorded separately because they are a recognised sleep-apnoea screening item."],
  ],
  faqs: [
    [
      "How many nights a week counts as habitual snoring?",
      "Snoring on three or more nights a week is the threshold most commonly used to define habitual snoring in sleep research. This log reports the exact percentage of logged nights with any snoring and the percentage at level 2 or louder, so you can see where you sit against that line.",
    ],
    [
      "Does sleeping on your back really make snoring worse?",
      "For many people, yes. Lying supine lets the tongue and soft palate fall back and narrow the airway, and positional obstructive sleep apnoea — where the apnoea-hypopnoea index at least doubles on the back compared with the side — is well documented. The position table here shows your own average severity per position rather than the population average.",
    ],
    [
      "Why does alcohol before bed increase snoring?",
      "Alcohol relaxes the muscles of the upper airway and the pharynx, so the airway collapses more easily and vibrates more when you breathe. It also suppresses arousal responses. Log a few alcohol-free nights and the trigger table will show the size of the difference for you.",
    ],
    [
      "When should snoring be checked by a doctor?",
      "See a doctor if snoring comes with witnessed breathing pauses, choking or gasping at night, unrefreshing sleep, morning headaches or daytime sleepiness — these point towards obstructive sleep apnoea, which needs a sleep study to diagnose. This log is informational only and cannot diagnose anything; take the exported summary with you rather than treating it as a result.",
    ],
  ],
};

export default seo;
