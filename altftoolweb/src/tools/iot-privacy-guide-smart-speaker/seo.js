const seo = {
  title: "Smart Speaker Privacy Checklist: 16 Alexa & Nest Steps",
  metaDescription:
    "Harden an Alexa, Google or Siri speaker across 16 weighted controls, then see how many voice recordings your account holds at its retention setting.",
  steps: [
    "Tick the sixteen controls grouped under Microphone & camera control, Voice recordings & retention, Skills, actions & purchases and Account & sharing; each shows its point weight and the ones tagged Critical cap the score while they are missing.",
    "Under 'How much history you're actually building up' set Current retention setting — from 'Keep every recording until I delete it myself' to the 3-month window — plus 'Voice requests per day, roughly' and 'Months since setup, or since you last fully cleared the history'.",
    "Read the Hardening score with Controls completed, Weighted points and Critical controls missing, then Recordings stored right now, the Effective retention window and what switching to 3 months would remove, and press Copy result.",
  ],
  intro:
    "This checklist hardens an Alexa, Google or Siri speaker across sixteen weighted controls — microphone and camera muting, voice recording retention, skill and action permissions, and account protection — and any missing critical control caps the score. A second calculator turns your daily voice-request count and how long it has been since the account was last cleared into the actual number of recordings sitting in it under your current auto-delete setting, and what switching to the shortest window would remove. Written for anyone setting up a new smart speaker or auditing one that has been running unattended for years.",
  useCases: [
    "Setting up a new Echo, Nest or HomePod and wanting the mute button, retention and account settings right from day one.",
    "Realising the account still has years of voice history because the default 'keep forever' setting was never touched.",
    "Auditing which Alexa skills or Google Actions were enabled once and forgotten, and what they can still access.",
    "Deciding whether to trust voice purchasing on a speaker shared with children or house guests.",
  ],
  benefits: [
    ["Ranked by consequence", "Turning off recording storage and opting out of human review outrank cosmetic settings, and a missing critical control caps the score."],
    ["Shows the scale, not just a toggle", "The retention calculator turns daily usage into an actual recording count, so 'keep until I delete it' stops being an abstract choice."],
    ["Explains always-listening honestly", "The wake-word control spells out that the mic stays powered but only sends audio to the cloud after local wake-word recognition — not before."],
  ],
  faqs: [
    [
      "Is a smart speaker recording everything I say?",
      "No. The microphone is always powered, but it processes audio locally to listen for the wake word and only starts sending audio to the cloud once that word is recognised. What happens to that clip afterwards — stored indefinitely, auto-deleted, or reviewed by a human contractor — is set by your account's privacy settings, not by the always-on microphone itself.",
    ],
    [
      "Do Amazon and Google employees actually listen to Alexa or Google Assistant recordings?",
      "Reporting in 2019 confirmed that contractors for both companies routinely listened to short snippets of real recordings to improve transcription accuracy, including some that captured sensitive moments. Both companies responded by adding an explicit opt-out for human review, which is off by default in the sense that you have to find and enable it — check Alexa Privacy Settings and Google's Voice & Audio Activity to turn it off.",
    ],
    [
      "How long do Alexa and Google Assistant keep my voice recordings?",
      "Unless changed, many accounts default to keeping recordings until you delete them manually. Both platforms also offer rolling auto-delete at 3 or 18 months, and a full 'don't save recordings' option that discards each request right after it's answered. Changing the setting only affects new recordings — anything already stored needs a separate manual delete.",
    ],
    [
      "Should I turn off voice purchasing on a smart speaker?",
      "Turn it off, or require a spoken PIN, if children or guests can talk to the device unsupervised. Without a confirmation code, a mistaken command, a curious child, or even a similar-sounding phrase from the television can trigger a real purchase or reorder.",
    ],
  ],
};

export default seo;
