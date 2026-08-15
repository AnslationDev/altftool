const seo = {
  title: "Discord Privacy Checklist: 26 Settings",
  metaDescription:
    "Scores 26 Discord privacy and security controls by weight — including the per-server DM override the global toggle never touches.",
  steps: [
    "Pick a risk profile under 'Who are you locking this down for?' and set a 'Target score (%)'.",
    "Tick every control you have already applied across the five groups — Who can find you, Who can message you, What you broadcast, Data and personalisation, Account security — or press 'Mark all applied'.",
    "Read the 'Protection score' percentage with 'Remaining exposure by area' and 'Shortest route to your target', which lists the next settings and their weights, then press 'Copy result'.",
  ],
  "intro": "This checklist scores a Discord account against 26 real privacy and security controls — the safe direct-messaging filter, per-server DM overrides, friend-request sources, phone and email discovery, activity status, connections, authorised apps and two-factor authentication — weighting each by how much exposure it actually closes. It gives particular weight to the two settings Discord users most often get wrong: the DM default only applies to servers you join afterwards, and every server you already joined keeps its own override. Five risk profiles re-score the same list, and five controls are marked critical and cap the score at 69% while any of them is still open.",
  "useCases": [
    "Lock down a teenager's account so members of large public servers cannot DM or friend-request them.",
    "Stop unsolicited explicit images arriving in DMs after joining a big community server.",
    "Keep a gaming account from being connected to a professional identity through Connections, mutual servers and a reused handle.",
    "Audit a moderator account for stolen-token risk, live sessions and old bot authorisations before a community event."
  ],
  "benefits": [
    [
      "Catches the per-server trap",
      "The DM override that survives the global toggle is scored as its own critical item, because it is the single most common false sense of security on Discord."
    ],
    [
      "Re-scores for your situation",
      "Five profiles re-weight the five exposure axes, so a teen account and a server owner are not graded against the same priorities."
    ],
    [
      "Nothing leaves the tab",
      "The checklist runs entirely in your browser and never asks for a username, token, password or code."
    ]
  ],
  "faqs": [
    [
      "How do I stop strangers DMing me on Discord?",
      "Two settings, and both are needed. Turn off “Allow direct messages from server members” in User Settings > Privacy & Safety, which covers servers you join from then on, and then open each server you already belong to and switch off its own Privacy Settings > Direct Messages override. The global toggle does not retroactively change servers you already joined."
    ],
    [
      "Can people see my IP address on Discord?",
      "Not from a normal voice or video call — Discord routes voice through its own servers rather than connecting the two devices directly, so the other party sees Discord's address, not yours. The real leaks are screen sharing, which exposes window titles, notifications and file paths, and clicking links sent to you, where the destination site logs your address like any website would."
    ],
    [
      "Does deleting my Discord account delete my messages?",
      "No. Messages belong to the channel they were posted in, so they stay visible after deletion, reattributed to a Deleted User. If you want your text gone you have to delete the messages yourself before disabling the account, and messages in servers you were removed from cannot be reached at all."
    ],
    [
      "What is the biggest Discord security risk?",
      "Session token theft, not password guessing. Being talked into pasting a script into the browser console — usually framed as a free Nitro offer or a giveaway bot — hands over a token that grants full account access and bypasses two-factor authentication entirely. If you have ever done it, change your password immediately, which invalidates existing tokens."
    ]
  ]
};

export default seo;
