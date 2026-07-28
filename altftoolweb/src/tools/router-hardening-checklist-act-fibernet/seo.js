const seo = {
  intro:
    "The ACT Fibernet Router Hardening Checklist gives a practical security score for home routers used with ACT broadband. It covers the controls users can actually verify: router admin password, WPA2/WPA3 mode, WPS, strong Wi-Fi keys, guest access, remote administration, port forwards, UPnP, DNS and connected-device review.",
  useCases: [
    "Audit an ACT Fibernet router after installation, factory reset or technician visit.",
    "Replace weak Wi-Fi passwords based on phone numbers, birthdays, flat numbers or building names.",
    "Prepare a safer work-from-home network by closing remote admin, stale forwards and unnecessary UPnP.",
    "Create a short action list before sharing Wi-Fi with tenants, guests or neighbours.",
  ],
  benefits: [
    ["Critical-step scoring", "The score caps itself when high-risk controls such as WPS, WPA mode or remote admin remain open."],
    ["Plain-language router paths", "Each item shows the menu area to check without assuming one exact router model."],
    ["Copyable summary", "Export the current score and next actions for a family member, tenant or support checklist."],
  ],
  faqs: [
    [
      "Is this checklist only for one ACT router model?",
      "No. ACT installations can use different routers or ONTs, so the checklist focuses on common security settings and names the menu area rather than one model-specific screen.",
    ],
    [
      "Should UPnP always be disabled?",
      "Disable it unless a game console or specific app clearly needs it. UPnP is convenient, but it also allows local software to open inbound ports without a prompt.",
    ],
    [
      "Why does WPS matter if my Wi-Fi password is strong?",
      "On routers that expose WPS PIN mode, the PIN can become the weaker route into the network. The eight-digit PIN is validated in two halves, which collapses a brute force from 100 million combinations to about 11,000 — so turning WPS off is what keeps the long Wi-Fi password as the real barrier.",
    ],
    [
      "Does ACT Fibernet give a public IP address?",
      "It depends on the plan — some ACT connections get a routable public IPv4 and others sit behind carrier-grade NAT. Compare the WAN IP on the router status page with what a public IP-lookup site reports: if they match, you have a public IP and every open port is reachable from anywhere. An address inside 100.64.0.0/10, the range RFC 6598 reserves for CGNAT, means you are not directly reachable.",
    ],
  ],
};

export default seo;
