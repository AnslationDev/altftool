const seo = {
  title: "TP-Link Router Hardening: 21 Steps, Archer & Deco",
  metaDescription:
    "21 weighted steps for Archer and Deco routers, each with its exact tplinkwifi.net menu path, plus a WPA2 passphrase crack-time estimate.",
  steps: [
    "Choose what the router is carrying - ordinary home broadband, work from home, a shared flat or a small shop - to weight the 21 steps for that profile.",
    "Tick every hardening step already done across Admin account, Wi-Fi, Facing the internet, Devices on your LAN and Firmware and lifecycle.",
    "The score reports steps done, critical items still open - it is held at 60% while any remain - and remaining exposure by area; press Copy result for the to-do list.",
  ],
  intro:
    "This TP-Link hardening checklist walks a 21-point security pass over an Archer or Deco router — admin account, WPA2/WPA3 encryption, WPS, remote WAN management, UPnP, port forwards and firmware — and scores what is still open, weighted by how much exposure each step actually removes. It gives the exact menu path under tplinkwifi.net for every step, so you are not hunting through Advanced > System Tools. A built-in WPA2 crack-time estimator applies the PBKDF2-HMAC-SHA1 4096-iteration handshake maths to show how long your current Wi-Fi passphrase would survive an offline attack.",
  useCases: [
    "Doing a security pass on a new Archer router after the ISP technician has left and set everything to defaults.",
    "Working out why an unfamiliar device keeps appearing on the network in a shared flat, and closing the gaps that let it in.",
    "Checking that remote management, UPnP and old port forwards are all off before a work laptop starts using the home connection.",
    "Deciding whether an ageing Archer model is worth hardening or has stopped receiving firmware and should be replaced.",
  ],
  benefits: [
    ["Weighted, not just counted", "Each step carries points based on real exposure removed, and a missing critical step caps the score at 60%."],
    ["Exact TP-Link menu paths", "Every item names the page it lives on, from Wireless Settings to System Tools > Administration."],
    ["Real WPA2 crack maths", "The passphrase estimator uses published hashcat mode 22000 speeds rather than a vague strength meter."],
  ],
  faqs: [
    [
      "What is the default TP-Link router login?",
      "Most Archer routers answer at tplinkwifi.net or 192.168.0.1, and older units shipped with admin as both username and password. Newer firmware forces you to create a password during first setup, and the label on the base of the unit is the authoritative source for your specific model.",
    ],
    [
      "Should I turn WPS off on a TP-Link router?",
      "Yes. The eight-digit WPS PIN is checked in two halves, which reduces a brute-force search from 100 million combinations to about 11,000, and vulnerable chipsets fall to the offline Pixie Dust attack in seconds. Disable both the PIN and the push button under Advanced > Wireless > WPS.",
    ],
    [
      "Is remote management on a TP-Link router dangerous?",
      "It publishes the admin login on the public internet, where scanners find it within hours. The Archer AX21 command-injection flaw tracked as CVE-2023-1389 was mass-exploited by Mirai variants through exactly that surface in 2023, so leave Remote Management disabled and use a VPN back to the house if you genuinely need remote access.",
    ],
    [
      "How long should a Wi-Fi password be?",
      "Twelve or more characters mixing cases, digits and a symbol puts a brute-force attack far beyond practical reach, while eight lowercase letters falls in about 15 hours on a single high-end GPU. Avoid anything on a public wordlist, since dictionary attacks find those in the first few thousand guesses regardless of length.",
    ],
  ],
};

export default seo;
