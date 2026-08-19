const seo = {
  title: "D-Link Router Hardening Checklist: 22 Steps",
  metaDescription:
    "Score a DIR router on the blank admin password, WPS, remote management, UPnP and end-of-support firmware, with a WPS PIN attack timer.",
  steps: [
    "Choose What is this router carrying?, then tick each of the 22 checklist steps you have already applied at http://dlinkrouter.local or 192.168.0.1.",
    "Set PIN attempts per minute, Lockout after this many failures (0 = none) and Lockout length (seconds) to time the WPS PIN attack.",
    "Read the Hardening score, Critical steps still open and Worst case to recover the PIN, then press Copy result.",
  ],
  intro:
    "This D-Link hardening checklist runs a weighted 22-point pass over a DIR-series router — the admin password that many models ship blank, WPA2/WPA3 mode, WPS, remote management, UPnP, port forwards, SharePort USB sharing and firmware — and scores what is still open rather than counting ticks. It also asks the question that decides everything else on D-Link hardware: whether the model has been declared end-of-support, since the vendor states it will not patch reported flaws in those devices. A built-in WPS timer applies the split-half PIN flaw — 11,000 attempts instead of 10 million — to show how quickly the Wi-Fi key falls while WPS is enabled.",
  useCases: [
    "Auditing an older DIR router that has been running untouched for years, starting with whether it still receives firmware.",
    "Setting a real admin password on a unit that has been sitting with the factory blank one since installation.",
    "Checking a second-hand or landlord-supplied D-Link router for settings left behind by a previous owner.",
    "Showing a sceptical household why WPS must be switched off, in hours rather than in principle.",
  ],
  benefits: [
    ["Weighted, not counted", "Every step scores by exposure removed, and any open critical step holds the total at 60%."],
    ["End-of-support taken seriously", "Lifecycle is a scored, critical item because on D-Link hardware it often outranks any setting."],
    ["WPS attack in real hours", "Enter your model's attempt rate and lockout and see the worst-case and average time to recover the PIN."],
  ],
  faqs: [
    [
      "What is the default D-Link router password?",
      "Many DIR models ship with the username admin and no password at all, reachable at dlinkrouter.local or 192.168.0.1. Newer units print a unique password on the label under the router, and that label — including the Ax or Bx hardware revision — is the authoritative source for your device.",
    ],
    [
      "How long does it take to crack WPS on a router?",
      "In the worst case about 11,000 PIN attempts, because the WPS registrar confirms the first four digits before the rest are sent, collapsing a 10 million combination search. At 20 attempts a minute that is roughly nine hours, and on chipsets with predictable nonces the offline Pixie Dust attack recovers the PIN in seconds.",
    ],
    [
      "My D-Link router is end-of-life. Is it still safe to use?",
      "Treat it as unpatched. D-Link publishes end-of-support notices for older routers and states it will not issue fixes for flaws found in them, so any vulnerability disclosed after that date stays open permanently. Hardening the settings reduces the exposed surface but cannot close a code-execution bug, and replacement is the real fix.",
    ],
    [
      "Should I disable remote management on a D-Link router?",
      "Yes. Remote management publishes the DIR admin page on the internet, historically on port 8080, where mass scanners find it within hours of it appearing. Combined with the number of DIR models that no longer receive firmware, it turns a local weakness into an internet-facing one.",
    ],
  ],
};

export default seo;
