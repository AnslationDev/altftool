const seo = {
  title: "Asus Router Hardening Checklist: 25 Scored Steps",
  metaDescription:
    "Score an ASUSWRT router across 25 weighted steps — admin login, WPS, WAN access, AiCloud, SSH keys, DDNS, UPnP, firmware — with an exposure index.",
  steps: [
    "Pick what the router carries under “What is this router carrying?” — Ordinary home broadband, Remote access enthusiast, Work from home, or Smart home with many IoT devices — which re-weights all 25 steps for that use.",
    "Work through the 25 steps grouped as Admin account, Wi-Fi, Facing the internet, Devices on your LAN and Firmware and lifecycle, each naming its ASUSWRT page; then tick what is switched on under “What is your router publishing to the internet?” (Web access from WAN, Telnet, SSH from the WAN, DMZ host, AiCloud, FTP share, UPnP, ASUS DDNS), enter Port forwards configured and tick “My ISP uses CGNAT” if you have no public IPv4.",
    "Read the Hardening score % with its band — Hardened, Solid, Partly hardened or Exposed — held at 60% while a critical step is open, alongside the exposure index out of 100 with its worst single item and the “Do these next” list; Copy result copies the summary.",
  ],
  intro:
    "This Asus hardening checklist runs a weighted 25-point pass over an ASUSWRT router — admin login and Two-Step Verification, WPA2/WPA3 mode, WPS, Web Access from WAN, AiCloud, SSH authorised keys, DDNS, UPnP and firmware — and scores what is still open instead of just counting ticks. A separate exposure index adds up the services you have published to the internet, weighting an interactive session on the router itself above a file share and a file share above a DDNS name. Every step gives the exact ASUSWRT menu path, and a CGNAT option adjusts the index for connections with no public IPv4.",
  useCases: [
    "Checking an Asus router for the planted SSH keys and enabled WAN services left behind by the 2025 backdoor campaign.",
    "Deciding whether AiCloud, DDNS and port forwards are worth their exposure or should be replaced by the built-in VPN server.",
    "Setting up a new RT or ZenWiFi unit properly the first time, including Two-Step Verification and HTTPS-only admin.",
    "Auditing a home network before a work laptop and company VPN start using the same line.",
  ],
  benefits: [
    ["Weighted, not counted", "Every step scores by exposure removed, and any open critical step holds the total at 60%."],
    ["Exposure index for WAN services", "See how much of the maximum footprint your enabled services and port forwards add up to."],
    ["Exact ASUSWRT paths", "Each item names its page, from Administration > System to WAN > DDNS and AiCloud 2.0."],
  ],
  faqs: [
    [
      "How do I log in to an Asus router?",
      "Open router.asus.com or 192.168.1.1 from a device on the network — newer models use 192.168.50.1. Older units shipped with admin as both username and password, while the current setup wizard forces you to choose one, and ASUSWRT also lets you rename the admin account under Administration > System.",
    ],
    [
      "Is AiCloud safe to leave enabled?",
      "Only if you actually use it and keep firmware current. AiCloud publishes the router's USB storage to the internet through your ASUS DDNS name, and ASUS has issued authentication-bypass advisories affecting multiple firmware branches, including one across several series in 2025. If you have never used it to reach a file, switch all three AiCloud services off.",
    ],
    [
      "Why should I check the SSH authorised keys on my Asus router?",
      "Because a compromise can hide there. A 2025 campaign added an attacker's SSH public key through the router's own settings, which meant the access survived firmware updates and reboots because it was a legitimate stored value. Look under Administration > System, clear any key you did not add, and factory reset if you find one.",
    ],
    [
      "Does turning off Web Access from WAN break the ASUS Router app?",
      "No. The app reaches the router over your local Wi-Fi, and remote features go through ASUS's own cloud service rather than an open admin port. For genuine remote administration, run the built-in OpenVPN or WireGuard server and connect to the tunnel instead of exposing the login page.",
    ],
  ],
};

export default seo;
