const seo = {
  title: "Remote Worker Privacy Kit: Home Office Audit",
  metaDescription:
    "Scores a home office across router, laptop, accounts and calls, skipping controls that don't apply, and counts devices kept off the work network.",
  steps: [
    "Pick your work machine — 'Company-managed laptop' or 'My own device (BYOD)' — and your household: alone, with family, or a shared flat.",
    "Enter 'Devices on your home network' and 'Of those, how many share the work laptop's network', then tick the controls you already have under Home network, Devices, Accounts and Calls.",
    "Read the baseline score, points earned, critical controls still open and the devices kept off the work network.",
  ],
  intro:
    "The Remote Worker Privacy Starter Kit scores a home-office security baseline across the router, the work machine, the accounts behind it and video calls, counting only the controls that actually apply to your situation. Tell it whether the laptop is company-managed or your own and who else lives in the house, and it drops the irrelevant items — no penalty for skipping a personal backup on a managed device, or headphones when you live alone. It also measures network segmentation directly: how many of the devices on your home network still share a link with the machine you work on.",
  useCases: [
    "Set up a home office properly on the first day of a fully remote job, in the right order.",
    "Work out which router settings matter after moving flat or replacing the internet provider.",
    "Move smart TVs, speakers and a housemate's console onto a guest SSID and see the segmentation figure change.",
    "Prepare for an employer's remote-work security attestation without guessing what they will ask.",
  ],
  benefits: [
    [
      "Scores only what applies",
      "Company-managed and BYOD setups get different checklists, as do solo, family and shared households.",
    ],
    [
      "Segmentation as a real number",
      "Counts devices you moved off the work network rather than assuming a guest SSID fixes everything.",
    ],
    [
      "Covers the call surface too",
      "Backgrounds, default mute, lobby settings and recording announcements, not just the router.",
    ],
  ],
  faqs: [
    [
      "What is the first thing to secure in a home office?",
      "Change the router's administrator password from the factory default and switch off remote administration, then confirm full-disk encryption and multi-factor authentication on the work machine. Default router credentials are published per model, and remote admin exposes that login to the whole internet.",
    ],
    [
      "Should smart home devices be on a separate Wi-Fi network from a work laptop?",
      "Yes. Smart TVs, speakers, cameras and plugs receive updates for a shorter period than laptops and phones, and on a flat home network any one of them can reach the machine you work on. Most consumer routers offer a guest SSID with client isolation, which is enough for this.",
    ],
    [
      "Do I need a VPN to work from home?",
      "Not on your own network for its own sake — use whatever VPN or zero-trust client your employer provides for access to internal systems. A VPN becomes important on networks you do not control, such as cafes, hotels and a client's guest Wi-Fi, where the local network can otherwise observe or redirect traffic.",
    ],
    [
      "How do I keep my home private on video calls?",
      "Turn on background blur or replacement, join every meeting muted with the camera off by default, and glance at what is behind you before enabling video — whiteboards, delivery labels and documents are the usual accidental disclosures. If you share the home, use headphones so the other side's audio is not broadcast to people who never joined the call.",
    ],
  ],
};

export default seo;
