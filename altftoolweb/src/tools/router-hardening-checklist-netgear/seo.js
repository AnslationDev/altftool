const seo = {
  intro:
    "This Netgear hardening checklist runs a weighted 22-point security pass over a Nighthawk or R-series router — the admin login, WPA2/WPA3 mode, WPS, Remote Management, UPnP, port forwards, ReadySHARE USB sharing and guest Wi-Fi — and scores what is still open rather than simply counting boxes. Every step names the exact page under routerlogin.net, so you are not guessing where Netgear moved a setting. A firmware-age check turns the date you last looked for an update into the number of quarterly cycles you have missed.",
  useCases: [
    "Securing a new Nighthawk router straight out of the box, before any devices are connected to it.",
    "Auditing an older Netgear unit that has been running untouched since it was installed, starting with whether it still gets firmware.",
    "Closing Remote Management, UPnP and old port forwards before a work laptop starts using the home line.",
    "Working out whether a plugged-in USB drive is quietly shared to the whole network or the internet through ReadySHARE and ReadyCLOUD.",
  ],
  benefits: [
    ["Weighted, not counted", "Steps score by how much exposure each removes, and a missing critical step holds the total at 60%."],
    ["Exact Netgear menu paths", "Each item points at the page it lives on, from Wireless Setup to ADVANCED > Advanced Setup."],
    ["Firmware age in plain numbers", "Enter the date of your last check and see the days elapsed and quarterly cycles missed."],
  ],
  faqs: [
    [
      "What is the default Netgear router password?",
      "Netgear routers historically shipped with admin as the username and password as the password, reachable at routerlogin.net or 192.168.1.1. Many recent models instead print a unique admin password on the label under the unit, and that label is the authoritative source for your model.",
    ],
    [
      "Should I disable Remote Management on my Netgear router?",
      "Yes, unless you have a specific need for it. Remote Management publishes the admin interface on the WAN — by default on port 8443 — where internet-wide scanners find it within hours, and Netgear has issued repeated advisories for pre-authentication flaws in its web interface. Use a VPN back to the home network instead.",
    ],
    [
      "How often should I update Netgear router firmware?",
      "Check at least every 90 days, and turn on automatic firmware update if your model supports it. Security fixes for router flaws ship only as firmware, so a router running a release from three years ago carries every bug fixed since.",
    ],
    [
      "Does a Netgear guest network keep visitors off my devices?",
      "Only if you untick the box labelled 'Allow guests to see each other and access my local network'. With that option enabled, guest devices reach your NAS, printer and cameras exactly as your own laptop does, which removes the isolation the guest network exists to provide.",
    ],
  ],
};

export default seo;
