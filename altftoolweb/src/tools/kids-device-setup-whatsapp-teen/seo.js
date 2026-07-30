const seo = {
  intro:
    "This guide lists the WhatsApp privacy settings that measurably reduce contact from strangers — group-add permission, silenced unknown callers, profile photo and status audience, two-step verification and live-location auditing — filtered to the phone a teenager uses and how they use groups. Each step names the exact menu path and the specific route it closes, and the checklist scores how much of that surface is covered. WhatsApp's minimum age is 13.",
  useCases: [
    "Setting up WhatsApp on a first phone at 13 and wanting the privacy settings right before the number circulates.",
    "Responding to a teen being added to a large group chat full of people they have never met.",
    "Stopping a run of scam and spam calls from unknown international numbers.",
    "Doing a yearly privacy review with an older teen who manages their own settings.",
  ],
  benefits: [
    ["Named menu paths", "Every item gives the Settings > Privacy path rather than telling you to 'check your privacy settings'."],
    ["Shows what is still open", "Unfinished steps are translated into the actual contact route they leave available."],
    ["iPhone and Android split", "Media-saving and app-lock steps differ by platform, so only the relevant version is shown."],
  ],
  faqs: [
    [
      "How do I stop people adding my teenager to WhatsApp groups?",
      "Go to Settings > Privacy > Groups and change it from Everyone to My contacts, or My contacts except. Anyone outside that list can then only send a private invite to join, and that invite expires after 72 hours if it is ignored.",
    ],
    [
      "What is the minimum age for WhatsApp?",
      "13, in every region — WhatsApp lowered the European minimum from 16 to 13 in 2024 to match the rest of the world. The age is self-declared and not verified, so it is a policy floor rather than a control.",
    ],
    [
      "How do I stop calls from unknown numbers on WhatsApp?",
      "Turn on Settings > Privacy > Calls > Silence unknown callers. Calls from numbers not in the contact list stop ringing but still appear in the call list and notifications, so a genuine caller is not lost.",
    ],
    [
      "Does two-step verification really matter on WhatsApp?",
      "Yes — it is the single setting that prevents account takeover. Without a two-step PIN, anyone who obtains the six-digit SMS registration code can move the account to their phone and message every contact while pretending to be your teenager. Set it under Settings > Account > Two-step verification and add a recovery email.",
    ],
  ],
};

export default seo;
