const seo = {
  title: "Windows 11 Privacy Settings Checklist: 28",
  metaDescription:
    "Score a Windows 11 PC on 28 weighted settings — advertising ID, diagnostic data, Recall snapshots, activity and clipboard history, OneDrive, BitLocker.",
  steps: [
    "Pick the machine you are hardening in \"Who are you locking this down for?\" — Personal laptop, Shared or family PC, Handling confidential work — and set the Target score (%) field.",
    "Tick the 28 Windows 11 settings you have already changed in the grouped cards, or use Mark all applied and Clear all to start from either end.",
    "Read the Protection score, Remaining exposure by area and \"Shortest route to your target\", then press Copy result; the score is held at 69% while any critical setting is still open.",
  ],
  "intro": "This checklist scores a Windows 11 PC against 28 real privacy and security settings — the advertising ID, diagnostic data level, Recall snapshots, activity and clipboard history, cloud content search, OneDrive folder backup, location and microphone permissions, and BitLocker device encryption — weighting each by how much data it actually stops leaving the machine or sitting readable on it. Four settings are marked critical and hold the score at 69% while any of them is open, because an unencrypted disk or a fully enabled Recall index outweighs any number of minor toggles. Five risk profiles re-score the same list, so a shared family PC is graded on local recording while a machine you want quiet on the network is graded on telemetry and cloud sync.",
  "useCases": [
    "Harden a new Windows 11 laptop straight out of the setup wizard, before it starts reporting defaults you never chose.",
    "Set up a shared family PC so filenames, activity history and clipboard contents do not surface for the next person who sits down.",
    "Prepare a machine that handles client, legal or medical files, with the emphasis on encryption and on nothing being recorded or synced.",
    "Re-run the audit after a Windows feature update, which can quietly reset privacy toggles to their defaults."
  ],
  "benefits": [
    [
      "Weighted by real leakage",
      "Disk encryption and the diagnostic data level carry far more points than cosmetic toggles, because that is where the exposure actually is."
    ],
    [
      "Covers Recall properly",
      "Both the off switch and the app and website exclusions are scored, since a filtered Recall is a very different risk from an unfiltered one."
    ],
    [
      "Nothing leaves the tab",
      "The checklist runs entirely in your browser, reads nothing from your PC, and never asks for a Microsoft account or password."
    ]
  ],
  "faqs": [
    [
      "How do I turn off Recall in Windows 11?",
      "Open Settings > Privacy & security > Recall & snapshots and turn off snapshot saving. Recall is opt-in and only appears on qualifying Copilot+ PCs, so on most machines there is nothing to disable — check rather than assume. If you want to keep it, use the same page to exclude your password manager, banking sites and messaging apps and to cap how much history it stores."
    ],
    [
      "What is the Windows advertising ID and should I turn it off?",
      "It is a per-user identifier on your device that apps can read to link your activity across otherwise unrelated programs. Turning it off under Settings > Privacy & security > General resets the identifier and stops apps requesting it. You still see ads; they are simply no longer joined up by that shared ID."
    ],
    [
      "Does setting diagnostic data to Required stop all telemetry?",
      "No, and nothing in Windows does. Required-only keeps the minimum Microsoft uses to keep the device secure, up to date and working, and drops the optional tier — which is the one that includes browsing activity, detailed feature usage and enhanced error reports. Use the Delete diagnostic data button on the same page to clear what was collected before you changed the setting."
    ],
    [
      "Is BitLocker on by default in Windows 11?",
      "Not universally. Device encryption is enabled automatically on many modern machines that meet the hardware requirements and are signed in with a Microsoft account, but plenty of configurations ship without it. Check Settings > Privacy & security > Device encryption, and if you enable it, back up the recovery key somewhere you can reach without that computer."
    ]
  ]
};

export default seo;
