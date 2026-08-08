const seo = {
  title: "Telegram Privacy Settings Checklist: 26 Controls",
  metaDescription:
    "Score your Telegram account against 26 weighted privacy controls — number visibility, group adds, call IP leaks. Six critical ones cap it at 69%.",
  steps: [
    "Pick your situation in the \"Who are you locking this down for?\" menu — from Private personal account to Channel or community admin — and set the Target score (%) field, which starts at 90.",
    "Tick each of the 26 Telegram settings you have already applied in the grouped cards, or use Mark all applied and Clear all; every row shows its \"Where\" Settings path and its point weight.",
    "Read the Protection score with Critical settings still open and Remaining exposure by area — the score is held at 69% while any critical setting is open — then press Copy result.",
  ],
  "intro": "This checklist scores your Telegram account against 26 real privacy and security controls — phone number visibility, who can find you by number, group and channel adds, peer-to-peer call routing, forward links, story audience, active sessions and two-step verification — and weights each one by how much exposure it actually closes rather than treating every toggle as equal. Pick a risk profile and the same checklist re-scores itself: a channel admin who must stay findable is graded on message and session controls, while someone leaving an unsafe situation is graded hardest on discoverability. Six controls are marked critical and cap the score at 69% while any of them is still open, because a hidden bio means nothing next to a number a stranger can search.",
  "useCases": [
    "Lock down a Telegram account after your number leaked in a data breach and strangers started adding you to crypto groups.",
    "Audit a work or community account that has to keep a public @username but should not leak your personal mobile number.",
    "Check whether the person you are about to accept a Telegram call from can see your IP address, before you answer.",
    "Do a session and login sweep after selling a phone or leaving a shared household, and confirm nothing is still logged in."
  ],
  "benefits": [
    [
      "Weighted, not counted",
      "Each control carries a share of 100 points sized to the exposure it removes, so ticking easy toggles does not fake a good score."
    ],
    [
      "Re-scores for your situation",
      "Five risk profiles re-weight the five exposure axes, because a public admin and someone hiding need opposite settings."
    ],
    [
      "Nothing leaves the tab",
      "The checklist runs entirely in your browser and never asks for a phone number, password or login code."
    ]
  ],
  "faqs": [
    [
      "Are Telegram messages end-to-end encrypted?",
      "Only Secret Chats are. Ordinary cloud chats, group chats and channels are encrypted in transit and at rest, but Telegram holds the keys and can technically read them, which is why they can be restored on a new device. A Secret Chat has to be started manually from a contact's profile, works only one-to-one, and lives on the two devices rather than in the cloud."
    ],
    [
      "How do I hide my phone number on Telegram?",
      "Two settings, both under Settings > Privacy and Security > Phone Number. Set “Who can see my phone number” to Nobody so it is not shown on your profile, and set “Who can find me by my number” to My Contacts so someone who already has the number cannot pull up your profile. Changing only the first one leaves you findable."
    ],
    [
      "Can someone get my IP address from a Telegram call?",
      "Yes, if peer-to-peer calling is enabled for them. A P2P call connects the two devices directly, so each side sees the other's IP address and can derive an approximate city and the internet provider. Setting Settings > Privacy and Security > Calls > Peer-to-peer to Nobody routes every call through Telegram's servers instead, which costs a little latency and removes the leak."
    ],
    [
      "How do I stop strangers adding me to Telegram groups?",
      "Set Settings > Privacy and Security > Groups & Channels to My Contacts, and add named exceptions for anyone who genuinely needs to add you. Anyone outside that list then has to send you an invite link you can decline, which removes the main delivery route for investment and crypto spam on Telegram."
    ]
  ]
};

export default seo;
