const seo = {
  title: "Smart Plug Security: 14 Controls, VLAN Plan",
  metaDescription:
    "Score 14 weighted controls for cheap smart plugs and bulbs, get a segmentation plan matched to your router, and size the IoT subnet from usable hosts.",
  steps: [
    "Set What your router can do and How the devices are controlled, then enter Devices on the IoT network and Room to grow (%).",
    "Tick the controls across Network segmentation, Accounts and apps, Local control and Devices and lifecycle; the three tagged Critical hold the score at 69% while open.",
    "Read the Setup score out of 100, the Segmentation score with whether it Keeps working with the internet down, and the Subnet that fits with its usable addresses.",
  ],
  intro:
    "This guide treats budget smart plugs and bulbs as what they are — the least-patched devices on a home network — and scores fourteen weighted controls across segmentation, vendor accounts, local control and end-of-life. It then builds a segmentation plan from what your router can actually do, adds points for Matter, Zigbee or local firmware over cloud-only Wi-Fi, and sizes the IoT subnet from usable IPv4 hosts (2^(32-prefix) - 2) against your device count plus growth. For anyone whose smart-home collection has quietly grown past a dozen devices on one flat network.",
  useCases: [
    "Moving fifteen plugs and bulbs off the main Wi-Fi onto a guest network before adding any more.",
    "Deciding between a cheap cloud-only Wi-Fi plug and a Zigbee or Matter device that keeps working during an outage.",
    "Sizing an IoT subnet so a /27 does not run out of DHCP addresses the month you add smart lighting.",
    "Reviewing which vendor accounts and linked assistants can still switch your devices on and off.",
  ],
  benefits: [
    ["Plan matched to your hardware", "Advice differs for a VLAN-capable router, a guest network, or a single flat SSID — no assumption you own enterprise kit."],
    ["Offline behaviour spelled out", "The protocol you choose determines whether the lights respond when the internet is down; the tool says which."],
    ["Real subnet maths", "Usable host counts come from the prefix length, so the recommended range genuinely fits the devices you plan for."],
  ],
  faqs: [
    [
      "Do I really need a separate network for smart plugs and bulbs?",
      "It is the single highest-value control for cheap IoT, because those devices get the fewest firmware updates and are the usual foothold onto a home network. A guest SSID with client isolation gets most of the benefit on ordinary consumer routers; a dedicated VLAN is better if your access point supports it.",
    ],
    [
      "What is client isolation and why does it matter?",
      "Client isolation, sometimes called AP isolation, stops devices on the same wireless network from talking to each other, so a compromised bulb cannot attack the plug beside it. Without it, a guest network only separates IoT devices from your laptops, not from one another.",
    ],
    [
      "Will smart plugs work without the internet?",
      "Only if they support local control. Cloud-dependent Wi-Fi plugs relay every command through a vendor server and stop responding when it is unreachable, while Zigbee, Z-Wave, Matter with a local controller, and devices running Tasmota or ESPHome keep working on the LAN alone.",
    ],
    [
      "How big should my IoT subnet be?",
      "Size it from usable hosts, which is 2^(32-prefix) minus 2 for the network and broadcast addresses: a /27 gives 30, a /26 gives 62 and a /24 gives 254. Twelve devices with 50% headroom needs 18 addresses, so a /27 fits, but a /26 leaves room for the lighting project you have not started yet.",
    ],
  ],
};

export default seo;
