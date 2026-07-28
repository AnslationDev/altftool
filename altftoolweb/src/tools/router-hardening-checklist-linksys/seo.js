const seo = {
  intro:
    "The Linksys Router Hardening Checklist scores common Linksys and Linksys Smart Wi-Fi settings: router password, cloud account, remote management, WPS, WPA mode, guest access, UPnP, port forwards, DNS, firmware and device inventory.",
  useCases: [
    "Audit a Linksys router after setup, reset, firmware update or hand-me-down reuse.",
    "Create a short checklist before using Linksys Smart Wi-Fi or remote access.",
    "Find risky settings such as WPS, UPnP, exposed admin UI or stale port forwards.",
    "Prepare a safer home network for work-from-home devices, cameras and guests.",
  ],
  benefits: [
    ["Linksys-specific wording", "The checklist references Smart Wi-Fi, app/cloud account risks and common Linksys admin paths."],
    ["Critical-step scoring", "The score stays capped when high-risk items remain open."],
    ["Copyable action plan", "Export open fixes and remaining time as a text summary."],
  ],
  faqs: [
    [
      "Should I disable Linksys Smart Wi-Fi?",
      "If you do not use remote app management, disabling cloud binding reduces the number of accounts that can change router settings. If you keep it, use a unique password and two-factor authentication where available.",
    ],
    [
      "Is WPS safe on Linksys routers?",
      "WPS is convenient but historically weak, especially PIN mode. Turn it off after setup and use a long WPA2/WPA3 passphrase instead.",
    ],
    [
      "Why check port forwards?",
      "A port forward created for a camera, NAS or game server can expose that device to the internet long after you forgot about it.",
    ],
    [
      "How do I stop my Linksys router being reachable from the internet?",
      "Turn off Remote Management under Connectivity → Administration, then turn on automatic firmware updates. Both matter: a May 2019 disclosure found tens of thousands of internet-facing Linksys Smart Wi-Fi routers returning their connected-device lists — MAC addresses, device names and operating systems — to unauthenticated requests. Verify from mobile data with Wi-Fi off that your public IP answers nothing on 80, 443, 8080 or 8443.",
    ],
  ],
};

export default seo;
