const seo = {
  title: "Xiaomi Router Security Checklist: 22 Weighted",
  metaDescription:
    "Audit a Mi or Redmi router on 192.168.31.1 against 22 weighted controls; seven critical ones cap the score at 60%. Plus a WPA2 crack-time check.",
  steps: [
    "Set What is this router carrying? to a risk profile, then open http://miwifi.com or 192.168.31.1 from a browser on the Wi-Fi.",
    "Tick the 22 steps as you complete them, using Mark all done or Clear all to move through the list quickly.",
    "Read the Hardening score and Critical steps still open, then enter a Wi-Fi passphrase and Attacking GPUs to see how long it survives.",
  ],
  intro:
    "The Xiaomi Router Hardening Checklist scores a Mi or Redmi router against 22 weighted security controls and shows exactly which settings are still open. Each step carries a weight based on how much exposure it removes, and seven critical steps — a separate admin password, WPA2/WPA3 encryption, passphrase length, Mi Account two-step verification, keeping the admin page off the WAN and current firmware — hold the score at 60% until they are all done. It also estimates how long a Wi-Fi passphrase survives an offline WPA2 attack, using the PBKDF2-HMAC-SHA1 4096-iteration key derivation fixed by IEEE 802.11i.",
  useCases: [
    "Undo the setup shortcut that makes your Wi-Fi password double as the router admin password, so guests can no longer log into the admin page.",
    "Audit which Mi Accounts still have the router or the home shared with them after a flatmate or family member moves out.",
    "Work through the plug-ins, USB sharing and port forwards on a Mi Router AX-series before putting a work laptop behind it.",
    "Check whether a five-year-old Redmi router still receives firmware, or whether it should simply be replaced.",
  ],
  benefits: [
    [
      "Xiaomi-specific paths",
      "Every step names where it lives on 192.168.31.1, miwifi.com or the Xiaomi Home app rather than generic router advice.",
    ],
    [
      "Weighted, not a flat tick list",
      "Controls are scored by real exposure removed, and four risk profiles re-weight cloud, Wi-Fi and internet-facing axes.",
    ],
    [
      "Passphrase maths, not vibes",
      "Crack time comes from character-pool entropy and published GPU benchmark rates, so a weak passphrase is shown as hours, not as a colour.",
    ],
  ],
  faqs: [
    [
      "What is the default IP address of a Xiaomi router?",
      "Mi and Redmi routers use 192.168.31.1, not the 192.168.1.1 most other brands use. You can also reach the admin page at http://miwifi.com from a browser on the same Wi-Fi network.",
    ],
    [
      "Should the Wi-Fi password be the same as the Xiaomi router admin password?",
      "No. Xiaomi's setup wizard offers a tick box that reuses the Wi-Fi password as the admin password, and leaving it ticked means everyone you ever gave Wi-Fi access to can log into the router. Set a separate admin password in Settings and store it in a password manager.",
    ],
    [
      "Can someone control my Mi router if they get into my Mi Account?",
      "Yes. The router binds to one Mi Account, which can reach it remotely through the Xiaomi Home or Mi Wi-Fi app, so that account is effectively a second admin login. Turn on two-step verification at account.xiaomi.com and review anyone the home is shared with.",
    ],
    [
      "How long should a Wi-Fi password be to be safe?",
      "WPA2 allows 8 to 63 characters, but 8 is not enough — an eight-character lower-case passphrase is about 37.6 bits of entropy and falls in roughly 15 hours to a single high-end GPU. Sixteen or more characters mixing cases, digits and symbols puts brute force beyond any realistic attacker; this page is informational and does not replace advice from a security professional for a business network.",
    ],
  ],
};

export default seo;
