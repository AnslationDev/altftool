const seo = {
  intro:
    "This checklist hardens a baby monitor against the two failures behind almost every reported takeover — an unchanged factory password and a camera left reachable from the internet — using fifteen weighted controls across credentials, network exposure, device settings and placement. It also scores exposure from the connection type you actually own, from a DECT audio unit that never touches your network to a port-forwarded Wi-Fi camera that scanners index within hours, adjusted by the settings you have in place. Written for parents and carers setting up a monitor, or auditing one bought second-hand.",
  useCases: [
    "Setting up a new Wi-Fi baby camera and wanting the password, remote access and router settings right before it ever watches the cot.",
    "Deciding whether a DECT audio-only monitor is enough, rather than a camera that needs a cloud account.",
    "Checking a second-hand or hand-me-down monitor that may still be bound to the previous owner's account.",
    "Working out why a camera is reachable from outside the house, and which single setting to change first.",
  ],
  benefits: [
    ["Ranked by consequence", "Default credentials and port forwarding outrank cosmetic settings, and a missing critical control caps the score."],
    ["Names who can reach the feed", "The exposure model states whether the risk is the whole internet, the street, or nobody outside the house."],
    ["Includes cot safety", "Cable distance and placement sit alongside the security controls, because they are the risk most likely to cause harm."],
  ],
  faqs: [
    [
      "How do hackers get into baby monitors?",
      "Overwhelmingly through credentials rather than clever exploits: an unchanged factory password, a password reused from a site that was breached, or a camera exposed to the internet by port forwarding or UPnP so it can be found by automated scanning. Changing the default password, enabling two-factor authentication and never forwarding a port closes almost all of it.",
    ],
    [
      "Are DECT or analogue baby monitors safer than Wi-Fi cameras?",
      "DECT and modern FHSS audio monitors are the lowest-exposure option because the link is digital, encrypted and never touches your network or the internet — an eavesdropper has to be within radio range with specialist equipment. Older analogue 2.4 GHz video monitors are the opposite: the picture is broadcast unencrypted, so any compatible receiver nearby can watch it.",
    ],
    [
      "Should I turn off remote viewing on a baby monitor?",
      "Turn it off if you only ever watch from elsewhere in the house. Remote viewing is the feature that makes the camera reachable from outside your network, so disabling it removes an entire class of risk at no cost, and it can be switched back on for a night away.",
    ],
    [
      "Is it safe to buy a used baby monitor?",
      "Only after a factory reset and a check that it is unlinked from the previous owner's account, since a reset clears stored Wi-Fi credentials and account binding on the device. Also confirm the model still receives firmware updates — a camera that stopped being supported keeps any known vulnerability for as long as it stays plugged in.",
    ],
  ],
};

export default seo;
