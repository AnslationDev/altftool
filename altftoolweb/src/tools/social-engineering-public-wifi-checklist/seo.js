const seo = {
  intro:
    "The Public Wi-Fi Safety Checklist scores eleven controls that still change the outcome on a network you do not own, weights them by real impact, and scales the total by where you are and what you plan to do. It is built on how browsing works now: HTTPS already encrypts the content of nearly everything, so the meaningful risks are the ones that need your cooperation — clicking through a certificate warning, typing a Google or work password into a captive portal, installing something a portal demands, or joining a lookalike network. The output ranks your gaps by weight so you fix the two that matter instead of all eleven.",
  useCases: [
    "Deciding whether to do a bank transfer on hotel Wi-Fi or switch to mobile data for two minutes.",
    "Setting a simple, defensible travel rule for a small team that does client work from cafes.",
    "Checking a laptop's sharing and auto-join settings before a conference where everyone is on the same network.",
    "Explaining to someone why a VPN alone does not make a phishing portal safe.",
  ],
  benefits: [
    ["Weighted, not a flat list", "Certificate warnings and portal credentials outrank forgetting the network, and the score says so."],
    ["Scaled by context", "The same habits score differently for casual browsing in a cafe and admin access on an unnamed open network."],
    ["Says what is no longer true", "It does not repeat pre-HTTPS advice about strangers reading your passwords off the air."],
  ],
  faqs: [
    [
      "Is public Wi-Fi actually dangerous in 2026?",
      "Far less than the old advice suggests, because almost all traffic is HTTPS and browsers now block or flag plain HTTP. The remaining risks need you to act: accepting a certificate warning, entering real credentials into a fake portal, installing a profile or app the portal asks for, or joining an evil-twin network with a copied name.",
    ],
    [
      "Do I need a VPN on public Wi-Fi?",
      "A VPN is useful but not the main control. It hides which sites you contact from the network operator and covers any stray unencrypted traffic, yet it does nothing against a phishing page, a malicious download, or credentials you type in yourself — and a free VPN app simply moves your trust to its operator.",
    ],
    [
      "How do I spot a fake Wi-Fi hotspot?",
      "Confirm the exact network name with staff, since an evil twin works by copying the venue's name with a small change such as an extra underscore. Be suspicious of any portal that asks for a Google, Apple or work password, or that requires you to install a certificate or app — genuine networks ask at most for a room number, ticket number or OTP.",
    ],
    [
      "Is it safe to use mobile banking on hotel Wi-Fi?",
      "Banking apps pin their own certificates and refuse to run over an intercepted connection, so the app itself is well protected. Even so, switching to mobile data for the transaction removes the shared network from the picture entirely, which is the simplest control available and the highest weighted item on this checklist.",
    ],
  ],
};

export default seo;
