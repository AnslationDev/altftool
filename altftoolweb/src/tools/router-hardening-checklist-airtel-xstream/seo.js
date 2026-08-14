const seo = {
  title: "Airtel Xstream Router Hardening Checklist (16 Steps)",
  metaDescription:
    "A scored 16-step pass over the Airtel Xstream ONT at 192.168.1.1: admin login, WPA2/WPA3, WPS, UPnP, WAN management, port forwards and guest SSID.",
  steps: [
    "Sign in to the ONT admin page at http://192.168.1.1 using the credentials printed on the label under the unit, then change that password first.",
    "Work down the Admin access, Wi-Fi, Remote access, Exposure and Maintenance groups, opening Why and how for the exact menu path, and ticking Not applicable where a step does not fit your model.",
    "Watch the Hardening score out of 100 — it stays capped while any Critical steps open remain — then press Copy result to take the outstanding steps with you.",
  ],
  intro:
    "A scored, sixteen-step hardening pass for the Nokia, ZTE, Syrotech or Tenda ONT that Airtel supplies with an Xstream Fibre connection. It covers the admin login at 192.168.1.1, the factory Wi-Fi key on the label, WPA2-AES versus WPA3, WPS, UPnP, WAN-side management, TR-069 provisioning on TCP 7547, stale port forwards and the guest SSID — each weighted by severity, so the score stays capped while any critical item is unfinished. Every item names the exact menu to open and a way to confirm the change took effect.",
  useCases: [
    "You have just had an Airtel Xstream Fibre installation and want to move off the sticker credentials before anyone else uses the network.",
    "A technician visited or the ONT was factory reset, and you need to redo the whole hardening pass without missing a step.",
    "You suspect the Wi-Fi key has leaked around the building and want a structured way to rotate it and check the connected-device list.",
    "You are setting up smart plugs, cameras and a TV stick and want them on an isolated guest SSID rather than beside your work laptop.",
  ],
  benefits: [
    ["Weighted, not a flat list", "Admin password, Wi-Fi key, WPA2, WPS and WAN management carry the most points, so the dangerous gaps surface first."],
    ["Airtel-specific paths", "Each step names the actual ONT menu and explains what Airtel controls through TR-069 that you cannot switch off."],
    ["Verifiable steps", "Every item includes a check — reconnect a device, scan the public IP, confirm the old key fails — so you know it actually applied."],
  ],
  faqs: [
    [
      "What is the default login for an Airtel Xstream router?",
      "Airtel-supplied ONTs normally answer at http://192.168.1.1, and the default admin password is printed on the label underneath the unit rather than being a single value across all models. Change it on first login, because that label has been seen by the installer and by anyone who has picked the box up.",
    ],
    [
      "Can I disable TR-069 on an Airtel ONT?",
      "Usually not, and you should not try. TR-069 (CWMP, conventionally TCP 7547) is how Airtel provisions and updates the unit, and cutting it off can leave the ONT unmanaged or unable to reconnect after a reset. The practical control is making sure nothing else is listening on the WAN side beside it — a 2016 Mirai variant abused exposed CWMP to take roughly 900,000 Deutsche Telekom routers offline.",
    ],
    [
      "Why should I turn WPS off?",
      "Because the eight-digit WPS PIN is validated in two halves, which collapses a brute force from 100 million combinations to about 11,000 — a flaw published by Stefan Viehbock in 2011 and tracked as US-CERT VU 723755. Disable WPS on both the 2.4 GHz and 5 GHz radios and join devices with the passphrase instead.",
    ],
    [
      "Is hiding the Wi-Fi network name a good security step?",
      "No. A hidden SSID is still broadcast by every client that looks for it, so it is trivially discoverable, and it causes connection problems on some phones and IoT devices. Rename the network to something that does not identify your ISP, model or household, keep the broadcast on, and put the effort into a long WPA2 or WPA3 passphrase instead.",
    ],
  ],
};

export default seo;
