const seo = {
  "intro": "This checklist covers the 27 WhatsApp settings that decide what someone with your number can see, who can add you to groups, what traces your messages leave and whether your cloud backup is readable by anyone but you. Message content is end-to-end encrypted by default; last seen, the online indicator, your profile photo, group membership, link previews, call IP address and the iCloud or Google Drive backup are not, and each has its own control. Pick the risk profile that matches your situation and the score re-weights accordingly.",
  "useCases": [
    "Stop an ex or a persistent contact watching your online status and last-seen time in real time.",
    "Turn on end-to-end encrypted backup so a cloud provider cannot hand over your message history.",
    "Cut off international spam calls and bulk scam messages from numbers you have never spoken to.",
    "Check for a WhatsApp Web session someone else linked on a shared computer and remove it."
  ],
  "benefits": [
    [
      "Separates encryption from exposure",
      "Messages are encrypted; presence, group membership and backups are not — the checklist treats them separately."
    ],
    [
      "Includes the advanced controls",
      "IP protection in calls, link-preview blocking and unknown-account blocking sit under Advanced, where most people never look."
    ],
    [
      "Weighted for your situation",
      "Someone protecting a source and someone hiding from an ex get different orderings from the same 27 settings."
    ]
  ],
  "faqs": [
    [
      "How do I hide my last seen and online status on WhatsApp?",
      "Settings > Privacy > Last seen and online, then set last seen to My contacts or Nobody. The online indicator is a separate row and only offers Everyone or 'Same as last seen', so restricting last seen is the only way to hide the live indicator as well. Hiding last seen also hides other people's from you."
    ],
    [
      "Is my WhatsApp backup encrypted?",
      "Not unless you switch it on. Messages are end-to-end encrypted in transit by default, but the iCloud or Google Drive backup is stored unencrypted until you enable end-to-end encrypted backup in Settings > Chats > Chat backup. That option, available since 2021, protects the backup with a 64-digit key or a password that nobody — including WhatsApp — can recover for you."
    ],
    [
      "How do I stop strangers adding me to WhatsApp groups?",
      "Settings > Privacy > Groups, then choose My contacts or 'My contacts except...'. Anyone outside that set has to send an invite you can decline. This matters because every member of a group can see the phone number and profile photo of everyone else in it."
    ],
    [
      "Can WhatsApp read my messages?",
      "It cannot read message content, which is end-to-end encrypted, but it does hold metadata: your number, profile, groups, linked devices and when the account is active. Settings > Account > Request account info generates a report of what is held, which takes around three days to arrive."
    ]
  ]
};

export default seo;
