const seo = {
  intro:
    "Juice jacking is data theft or malware delivery over a USB charging connection, and it can only happen when a USB data path exists between your phone and something acting as a host. This explainer takes your power source, cable, lock state, OS currency and a few settings, then returns a relative exposure index and — more usefully — tells you whether a data path exists at all. Charging from your own adapter, your own power bank, a charge-only cable or a data blocker scores zero because the data lines are simply not connected, and the tool says plainly that public advisories exist while documented victim cases remain scarce.",
  useCases: [
    "Deciding whether the seat-back USB socket on a flight is worth using or whether the power bank is better.",
    "Explaining to a team why the travel policy asks for charge-only cables instead of banning public charging outright.",
    "Checking how much a phone with USB debugging left on changes the picture compared with a stock, updated device.",
    "Settling an argument about whether a VPN or airplane mode does anything against a USB-borne attack.",
  ],
  benefits: [
    ["Separates absent from unlikely", "A mains socket or charge-only cable has no data lines — the tool reports no data path rather than low risk."],
    ["Credits the phone's own defences", "Charge-only defaults and iOS USB Restricted Mode are scored, not ignored."],
    ["Lists what does not help", "VPNs, airplane mode and antivirus apps are named as irrelevant to a USB data path."],
  ],
  faqs: [
    [
      "Is juice jacking actually a real threat?",
      "It is a demonstrated technique with genuine public advisories from the FBI and FCC, but publicly documented cases of real victims remain scarce. The realistic modern version is a tampered cable left hanging at a charging point rather than the wall socket itself, and it still needs your phone to grant data access.",
    ],
    [
      "Does a USB data blocker really work?",
      "Yes — a genuine data blocker leaves the two USB data pins unconnected, so power passes and data cannot, which removes the attack path rather than reducing it. Buy from a known brand: a counterfeit that quietly passes the data lines gives you false confidence and is the only residual risk in that setup.",
    ],
    [
      "Is it safe to charge my phone at an airport USB port?",
      "With a modern, updated phone that stays locked, the exposure is very low: Android defaults to charge-only until you pick a mode and iOS asks whether to trust the computer, blocking USB accessories roughly an hour after the last unlock. Using your own charger in a mains socket or your own power bank removes the question entirely.",
    ],
    [
      "What makes juice jacking risk go up the most?",
      "Leaving USB debugging or developer mode enabled, because it allows a host to install and run software once you authorise it. Using an unsupported phone that no longer gets security updates, and tapping Trust or Allow without reading the dialog, are the next two amplifiers.",
    ],
  ],
};

export default seo;
