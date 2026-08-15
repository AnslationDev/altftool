const seo = {
  title: "Coworking Security Checklist: 20 Habits, 5",
  metaDescription:
    "Scores screens, printing, devices, network and people separately, weighted by impact and by whether you sit at a hot desk or a lockable cabin.",
  steps: [
    "Set \"Where do you sit?\" to Open-floor hot desk, Dedicated desk in a shared room, Private lockable cabin or Meeting rooms and lounge only, and \"How busy is the floor?\" from Quiet — a few regulars up to Event or open day with visitors.",
    "Tick the controls you already have in each of the five sections — Screens and what is visible, Printing and paper, Devices and lock-up, Shared network, and People and access — using \"Tick everything\" or \"Clear all\" to set them in one go.",
    "\"Workspace exposure index\" scores out of 100 with controls in place, coverage by weight, the setting multiplier and your weakest category listed, \"Coverage by category\" bars all five separately, \"Close these, highest impact first\" ranks the gaps with their fixes, and Copy result copies the summary.",
  ],
  intro:
    "The Coworking Space Security Checklist scores twenty habits across five categories — screens, printing and paper, devices, the shared network, and people and access — and reports each category separately so a weak area is visible instead of averaged away. It is built for the actual threat model of a shared office, where the people around you have legitimate access to the floor, the printer tray and the door, rather than for a network attacker. The overall index scales with where you sit and how busy the space is, because an open hot desk on an event day is not the same as a lockable cabin on a quiet morning.",
  useCases: [
    "A founder moving a two-person team into a hot-desk plan and wanting a one-page working standard.",
    "Deciding whether the printer setup in a shared space is safe for client contracts.",
    "Reviewing laptop lock-up and encryption habits before an audit or a client security questionnaire.",
    "Briefing a new joiner on why holding the door open for a friendly stranger is the operator's problem to solve, not theirs.",
  ],
  benefits: [
    ["Per-category scoring", "Screens, print, devices, network and people are graded separately, so you fix the weak one."],
    ["Weighted by impact", "Auto-lock and disk encryption outrank AirDrop settings, and the ranking reflects that."],
    ["Context-aware", "Hot desk versus private cabin, quiet day versus open day, changes the score rather than the advice being generic."],
  ],
  faqs: [
    [
      "What is the biggest security risk in a coworking space?",
      "People with legitimate access to the same floor — which makes an unlocked screen and an unattended laptop the two highest-impact gaps. A one-minute auto-lock plus full-disk encryption covers the majority of realistic loss scenarios, well before anything network-related matters.",
    ],
    [
      "Is the shared coworking Wi-Fi safe for work?",
      "Treat it as a network you share with every other member company in the building: join the operator's WPA2 or WPA3 SSID verified at the front desk, mark the network Public with sharing and discovery off, and reach work systems over your company VPN or zero-trust client. Avoid open SSIDs entirely, since a lookalike hotspot on a shared floor takes minutes to set up.",
    ],
    [
      "How do I print confidentially on a shared printer?",
      "Use secure release — where the job only prints after you enter a PIN or tap a badge at the device — and if the space does not offer it, walk to the printer before you press print. Send scans only to your own typed-in address rather than the device address book, and put confidential paper into a locked shredding bin, never open recycling.",
    ],
    [
      "Should I stop someone tailgating through the door behind me?",
      "You do not have to confront anyone: badge in for yourself, let the door close, and point the person to reception. Access control is the operator's responsibility, and a genuine member or visitor will not be offended by being asked to sign in.",
    ],
  ],
};

export default seo;
