const seo = {
  title: "Apple ID Two-Factor Setup: 15-Control Checklist",
  metaDescription:
    "Score your Apple Account on 15 weighted controls: 2FA, device passcode, two trusted numbers, recovery contact, Stolen Device Protection.",
  steps: [
    "Tick each control you have already set in the grouped checklist — every item shows its weight and four are badged 'Critical'.",
    "Set 'Target score (%)', which starts at 90, to get the shortest route there with the highest-impact control first.",
    "Read the 'Hardening score' percentage and band, 'Critical controls missing', and the 'Do these next' list, then press 'Copy result'.",
  ],
  "intro": "This guide is a weighted, 15-control checklist for an Apple Account: two-factor authentication, a passcode strong enough to guard the device that receives the codes, two trusted phone numbers, a recovery contact, Stolen Device Protection and a deliberate decision on Advanced Data Protection. Apple locks out permanently when every recovery path is gone, so recovery controls are scored as heavily as sign-in ones, and four controls are marked critical: the score stays at 69% until all four are done. Apple ID and Apple Account are the same thing under two names.",
  "useCases": [
    "Setting up a new iPhone properly, including the trusted numbers and recovery contact people usually skip during the rush.",
    "Preparing a phone before travel, when theft-with-shoulder-surfing of the passcode is the realistic attack.",
    "Auditing a parent's or grandparent's account so a lost phone does not mean a lost photo library.",
    "Deciding whether Advanced Data Protection or a recovery key is right for you before turning either on."
  ],
  "benefits": [
    [
      "Recovery paths scored, not assumed",
      "Trusted numbers and a recovery contact carry critical weight because an Apple lockout has no support workaround."
    ],
    [
      "Warns before the irreversible switches",
      "Recovery Key and Advanced Data Protection both remove Apple's ability to help you, and the checklist says so before you enable them."
    ],
    [
      "Nothing leaves the browser",
      "The page never asks for your Apple Account, password or a verification code, and stores no data about your account."
    ]
  ],
  "faqs": [
    [
      "How do I turn on two-factor authentication for my Apple ID?",
      "On iPhone or iPad go to Settings, tap your name, then Sign-In & Security > Two-Factor Authentication and turn it on. On a Mac use System Settings > your Apple Account > Sign-In & Security. Apple Accounts created in recent years have it enabled by default, so you may find it is already on."
    ],
    [
      "Can I turn two-factor authentication off again?",
      "Only for a short window. If you have just enabled it, Apple emails you a link to unenrol and that link stays valid for two weeks; after that the setting is permanent. Newer accounts require two-factor authentication from creation and cannot switch it off at all."
    ],
    [
      "What is an Apple recovery key and do I need one?",
      "It is a 28-character code you generate yourself that replaces Apple-assisted account recovery. It stops anyone talking Apple Support into resetting your account, but if you lose the key and all your trusted devices, nobody including Apple can restore access. Most people are better served by a recovery contact."
    ],
    [
      "Will Apple ever call me and ask for my verification code?",
      "No. Apple does not contact customers to ask for a verification code, an account password or remote access to a device, so any such call, message or email is a scam. Hang up, then check the account yourself at account.apple.com rather than through a link you were sent."
    ]
  ]
};

export default seo;
