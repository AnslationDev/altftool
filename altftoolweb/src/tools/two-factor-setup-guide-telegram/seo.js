const seo = {
  title: "Telegram 2FA Setup: 15-Control Checklist",
  metaDescription:
    "Score your Telegram account across 15 weighted controls — cloud password, recovery email, session cleanup. Four are critical; the score caps at 69%.",
  steps: [
    "Tick each control you have already set across the four groups: Cloud password, Device security, Privacy exposure and Message handling.",
    "Set Target score (%), which starts at 90, to get the shortest route listed highest-impact control first.",
    "Read the hardening score with Controls completed and Critical controls missing, then press Copy result for the still-to-do list.",
  ],
  "intro": "This guide is a weighted, 15-control checklist for a Telegram account: the two-step verification cloud password, a confirmed recovery email, passcode lock, session cleanup, the privacy rules that hide your phone number, and an honest note on what Secret Chats do that ordinary chats do not. Telegram signs you in with a code sent to your phone number, so the cloud password is the only thing standing between a SIM swap and a full account takeover, which is why it carries the heaviest weight. Four controls are marked critical and the score stays at 69% until all four are complete.",
  "useCases": [
    "Adding the cloud password before travelling with a local SIM, when your usual number is unreachable.",
    "Stopping the flood of crypto and investment group adds by restricting who can add you.",
    "Cleaning up desktop sessions after using Telegram Web on a shared or work machine.",
    "Working out whether a conversation needs a Secret Chat rather than a normal one."
  ],
  "benefits": [
    [
      "Weighted to the real risk",
      "The cloud password carries the largest share because without it your phone number alone is the whole credential."
    ],
    [
      "Clear about encryption",
      "It states plainly that cloud chats are not end-to-end encrypted, so you can choose Secret Chats where it matters."
    ],
    [
      "Nothing is collected",
      "The checklist runs in your browser and never asks for your Telegram number, password or login code."
    ]
  ],
  "faqs": [
    [
      "How do I turn on two-factor authentication in Telegram?",
      "Open Settings > Privacy and Security > Two-Step Verification and set a cloud password, a hint and a recovery email. From then on, signing in on a new device needs the SMS or email login code plus that password, which is what stops a SIM swap from being enough."
    ],
    [
      "What happens if I forget my Telegram cloud password?",
      "If you set a recovery email, Telegram sends a reset link there. If you did not, the only option is to reset the account, which deletes its chats and contacts and takes effect after a seven-day waiting period, so add the recovery email when you set the password rather than later."
    ],
    [
      "Are Telegram messages end-to-end encrypted?",
      "Only Secret Chats are. Ordinary cloud chats, including groups and channels, are encrypted between your device and Telegram's servers so they can sync across your devices, which means Telegram holds the keys. Start a Secret Chat from the contact's profile for anything you would not want stored server-side."
    ],
    [
      "Can someone find my phone number on Telegram?",
      "Not if you change the setting. Under Privacy and Security > Phone Number, set who can see it to Nobody and who can find you by it to My Contacts, then share a public username instead. Until you do, anyone who already has your number in their contacts can link it to your profile."
    ]
  ]
};

export default seo;
