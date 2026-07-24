// Home Security — HousingNeeds vertical content.
//
// Content only. Structure and styling live in _components/HnVerticalPage.jsx
// and housingneeds.css, so editing this file changes copy without touching layout.
//
// Plain serialisable data: no imports, no logic. The CTA points at a literal
// quoteUrl rather than a helper so this file stays self-contained.

const homeSecurity = {
  "images": {
    "hero": {
      "src": "https://images.unsplash.com/photo-1716380703770-c3dd70781e82",
      "alt": "Outdoor home security camera mounted under the eaves of a house"
    },
    "benefit": {
      "src": "https://images.unsplash.com/photo-1598912357884-b22034ea3d13",
      "alt": "Homeowner checking a security camera app on a smartphone"
    },
    "detail": {
      "src": "https://images.unsplash.com/photo-1765380746307-b8b93dae1742",
      "alt": "Smart video doorbell mounted beside a residential front door"
    }
  },
  "slug": "home-security",
  "name": "Home Security",
  "accent": "violet",
  "icon": "ShieldCheck",
  "eyebrow": "Home security solutions",
  "headline": "A security system built around how break-ins really happen",
  "headlineAccent": "how break-ins really happen",
  "subheadline": "A single camera is not a security system. Real protection layers detection, deterrence, and response — sensors that notice an intrusion, cameras that document it, and a monitoring plan that gets someone to act on it. Understanding how those pieces fit together makes it far easier to judge what you actually need, what you are paying a monthly fee for, and where a cheaper approach quietly leaves a gap.",
  "heroPoints": [
    "DIY vs professional monitoring compared",
    "What insurers actually reward",
    "Renter-friendly and no-contract options"
  ],
  "quoteLabel": "Get a Free Quote",
  "quoteUrl": "https://example.com/quote/home-security",
  "seo": {
    "title": "Home Security Guide: Cameras, Alarms, Monitoring & Costs",
    "description": "How home security systems work: cameras, video doorbells, smart locks, sensors, DIY vs professional 24/7 monitoring, insurance discounts, and what drives cost."
  },
  "services": [
    {
      "icon": "Frame",
      "title": "Security Cameras (Wired & Wireless)",
      "description": "Indoor and outdoor cameras placed to cover entry points and blind spots, with wired power-over-Ethernet for reliability or wireless battery units where running cable is impractical.",
      "image": {
        "src": "https://images.unsplash.com/photo-1520697830682-bbb6e85e2b0b",
        "alt": "Security Cameras (Wired & Wireless)"
      }
    },
    {
      "icon": "DoorOpen",
      "title": "Video Doorbells",
      "description": "A camera, motion sensor, and two-way intercom at the front door — the most-used entry in most homes — so package thefts and unexpected visitors are seen, recorded, and answered from anywhere.",
      "image": {
        "src": "https://images.unsplash.com/photo-1633194883650-df448a10d554",
        "alt": "Video Doorbells"
      }
    },
    {
      "icon": "BadgeCheck",
      "title": "Smart Locks & Keyless Entry",
      "description": "Keypad or app-controlled deadbolts that replace hidden keys with codes you can issue and revoke, log who came and went, and auto-lock so a forgotten deadbolt no longer leaves the door open.",
      "image": {
        "src": "https://images.unsplash.com/photo-1641853256879-bd786e77d852",
        "alt": "Smart Locks & Keyless Entry"
      }
    },
    {
      "icon": "Grid2x2",
      "title": "Motion, Door & Window Sensors",
      "description": "Contact sensors on doors and windows plus motion detectors on interior paths form the perimeter that triggers an alarm — the layer that notices an intrusion the moment it starts, not after.",
      "image": {
        "src": "https://images.unsplash.com/photo-1770197247933-63e02c014cb7",
        "alt": "Motion, Door & Window Sensors"
      }
    },
    {
      "icon": "Volume2",
      "title": "Alarm Systems & Sirens",
      "description": "A control panel, keypad, and loud siren tie the sensors together. The noise itself is a deterrent, and the panel is what escalates a tripped sensor into an alert rather than a light that no one sees.",
      "image": {
        "src": "https://images.unsplash.com/photo-1762529484700-1a7aa5992aff",
        "alt": "Alarm Systems & Sirens"
      }
    },
    {
      "icon": "ShieldCheck",
      "title": "24/7 Professional Monitoring",
      "description": "A monitoring center watches signals around the clock, verifies the alarm, and can request police or fire dispatch when you cannot — which is the difference on nights, trips, and while you sleep.",
      "image": {
        "src": "https://images.unsplash.com/photo-1760276141897-de770ebf5bcc",
        "alt": "24/7 Professional Monitoring"
      }
    },
    {
      "icon": "CircuitBoard",
      "title": "Smart-Home Security Integration",
      "description": "A hub ties cameras, locks, lights, and sensors into shared routines — lights that trigger on motion, doors that lock at night, arming tied to your schedule — so the system acts, not just records.",
      "image": {
        "src": "https://images.unsplash.com/photo-1558002038-1055907df827",
        "alt": "Smart-Home Security Integration"
      }
    },
    {
      "icon": "Flame",
      "title": "Environmental Sensors (Smoke, CO & Leaks)",
      "description": "Monitored smoke, carbon-monoxide, and water-leak sensors extend the system beyond burglary to the threats that do quiet damage while a house is empty — fire, CO buildup, and a slow pipe leak.",
      "image": {
        "src": "https://images.unsplash.com/photo-1634224143538-ce0221abf732",
        "alt": "Environmental Sensors (Smoke, CO & Leaks)"
      }
    }
  ],
  "benefits": [
    {
      "icon": "ShieldCheck",
      "title": "Deterrence Where It Counts",
      "description": "Visible cameras, yard signs, and a loud siren give an intruder reasons to move on. Research and law-enforcement surveys consistently suggest burglars often avoid homes that look monitored, and deterrence is protection you never have to file a claim over."
    },
    {
      "icon": "CircleDollarSign",
      "title": "Possible Insurance Discounts",
      "description": "Many home insurers offer a premium discount for a monitored security system, and some add to it for monitored smoke or water sensors. The amount varies widely by carrier and policy, so it is worth asking yours directly what a monitored setup would qualify for."
    },
    {
      "icon": "AppWindow",
      "title": "Eyes on the House From Anywhere",
      "description": "Live view, recorded clips, and instant alerts on your phone mean you can check a doorbell notification at work or a motion alert on vacation. For many owners that day-to-day visibility is the feature they use most, well beyond emergencies."
    },
    {
      "icon": "FileCheck",
      "title": "Evidence, Not Just Alerts",
      "description": "Recorded footage of a break-in, a porch theft, or a disputed delivery gives police and insurers something concrete to work from. Clear, time-stamped video is often far more useful after the fact than a memory or a description."
    },
    {
      "icon": "Droplets",
      "title": "Protection Beyond Burglary",
      "description": "The same system can watch for smoke, carbon monoxide, and water leaks. A monitored leak sensor that catches a failed supply line early can prevent the kind of slow, expensive damage that happens while no one is home to notice."
    }
  ],
  "options": {
    "title": "Choosing how your system is monitored",
    "intro": "The hardware — cameras, sensors, locks — matters less than the decision behind it: who watches the system, and what happens when it goes off. That single choice drives your monthly cost, your response time, and how much of the setup falls on you. The approaches below trade cost, convenience, and response speed in fairly predictable ways.",
    "items": [
      {
        "name": "DIY Self-Monitored System",
        "summary": "You install off-the-shelf equipment and the alarms come to your own phone. No professional monitoring center is involved, so there is usually no monthly fee beyond optional cloud video storage. You decide, in the moment, whether to call for help.",
        "bestFor": "Cost-conscious owners and renters who want alerts, not a contract",
        "lifespan": "Equipment typically lasts 5-10 years; no ongoing commitment",
        "considerations": [
          "Response depends entirely on you seeing and acting on the alert, which fails if your phone is off, silenced, or out of signal",
          "Police in many areas will not dispatch on an unverified self-reported alarm the way they do for a monitored account",
          "Cloud storage for recorded video is often still a paid add-on even without full monitoring"
        ]
      },
      {
        "name": "Professionally Monitored System",
        "summary": "A monitoring center watches your system around the clock. When an alarm trips, trained staff verify it and can request emergency dispatch on your behalf, including when you are asleep, traveling, or unable to respond yourself.",
        "bestFor": "Homeowners who want a guaranteed response and possible insurance credit",
        "lifespan": "Ongoing monthly plan; look for no-contract options",
        "considerations": [
          "Carries a recurring monthly fee, typically tied to how many features and sensors are covered",
          "Some providers still lock you into multi-year contracts, so confirm whether no-contract or month-to-month is available before signing",
          "Cellular backup is usually required so a cut phone or internet line cannot silence the connection to the monitoring center"
        ]
      },
      {
        "name": "Full Smart-Home Security",
        "summary": "Security folded into a broader smart-home hub, so cameras, locks, lights, thermostats, and sensors work together. Motion can trigger lights, doors can auto-lock at night, and the whole system can arm and disarm on a schedule or your location.",
        "bestFor": "Owners invested in a smart-home ecosystem who want automation, not just alarms",
        "lifespan": "Long-term platform commitment; plan for occasional upgrades",
        "considerations": [
          "Deeper integration means more dependence on one ecosystem, which can complicate mixing brands or switching later",
          "More connected devices widen the attack surface, so strong passwords, two-factor login, and firmware updates matter",
          "Automations add real convenience but can also mask whether the core alarm and monitoring layer is actually armed"
        ]
      },
      {
        "name": "Local-Only / Unmonitored Cameras",
        "summary": "Cameras and doorbells that record to a local card or drive with no cloud service and no monitoring plan. You get footage and, on many units, on-device alerts, without any subscription at all.",
        "bestFor": "Renters and budget setups that mainly want a record and a visible deterrent",
        "lifespan": "Equipment typically lasts 5-10 years; no subscription",
        "considerations": [
          "No professional response and often no remote alerts, so it documents events more than it prevents them",
          "Locally stored footage can be lost if the camera or its card is stolen or damaged in the incident",
          "Advanced features like person detection or remote live view are frequently gated behind a paid plan anyway"
        ]
      }
    ]
  },
  "process": [
    {
      "title": "Home Security Assessment",
      "description": "The house is walked to map how someone would actually get in: ground-floor doors and windows, dark or hidden approaches, sightlines a camera can and cannot cover, and the most-used entry points. Renters and owners have different constraints here, and the plan is built around them rather than a one-size kit."
    },
    {
      "title": "Choosing Coverage and Monitoring",
      "description": "With the weak points known, the layers are decided: how many cameras and sensors, whether the system is self-monitored or professionally monitored, and whether smoke, carbon-monoxide, and leak sensors are included. This is where the monthly cost and the response plan are set, so it is worth being deliberate rather than defaulting to the largest bundle."
    },
    {
      "title": "Installation and Placement",
      "description": "Equipment is mounted where it does the most good — cameras high and angled to capture faces rather than the tops of heads, sensors on the doors and windows most likely to be used, the doorbell framing the porch. DIY kits are designed for self-install, while wired cameras and integrated panels are often better handled by a professional."
    },
    {
      "title": "Network, Power and Backup",
      "description": "The system is connected to Wi-Fi, and battery or cellular backup is configured so a power cut or a severed internet line cannot quietly disable it. Camera storage — local card, network recorder, or cloud — is set up, and app accounts are secured with strong, unique passwords and two-factor login."
    },
    {
      "title": "Testing, Routines and Handover",
      "description": "Every sensor is tripped and every camera checked, arming and disarming routines are set for daily life, and alerts are tuned so the system flags real events without burying you in false ones. You should leave knowing exactly how to arm it, silence a false alarm, and what happens when a monitored alarm fires."
    }
  ],
  "costFactors": [
    {
      "factor": "Number of Cameras and Sensors",
      "detail": "Cost scales with coverage. A doorbell and a couple of door sensors is a modest outlay, while whole-home coverage — multiple cameras, every accessible window and door sensored, motion detectors, and glass-break sensors — multiplies both the equipment bill and the install time. It is easy to over-buy, so coverage should follow the actual weak points found in the assessment."
    },
    {
      "factor": "Monitoring Plan and Monthly Fees",
      "detail": "The recurring fee is often the largest lifetime cost, not the hardware. Self-monitoring can be free beyond optional storage; professional monitoring adds a monthly charge that typically rises with the number of features covered. Over several years those fees add up, so the plan tier deserves as much scrutiny as the up-front equipment price."
    },
    {
      "factor": "Professional Installation vs DIY",
      "detail": "Modern DIY kits are designed to be self-installed in an afternoon and avoid a labor charge entirely. Professional installation adds cost but makes sense for wired cameras, hardwired panels, high or awkward mounting, and integrated smart-home setups where placement and wiring materially affect how well the system performs."
    },
    {
      "factor": "Cellular and Battery Backup",
      "detail": "A system that relies only on home Wi-Fi and wall power can be defeated by a power cut or a cut line. Cellular backup keeps the monitoring connection alive independent of your internet, and battery backup keeps sensors running through an outage. Both add cost — often a higher plan tier for cellular — but they close a gap that matters most during an actual emergency."
    },
    {
      "factor": "Hub, Storage and Add-Ons",
      "detail": "A smart-home hub, cloud video storage, extra key fobs, keypads, and environmental sensors all add to the total. Cloud storage in particular is usually a recurring subscription priced by how many cameras and how many days of footage you keep. Any insurance discount for a monitored system can offset part of the ongoing cost, but the amount varies by carrier and is worth confirming directly."
    }
  ],
  "faqs": [
    {
      "q": "Do home security systems actually deter burglars?",
      "a": "The evidence points that way. Surveys of convicted burglars and studies of neighborhood break-in patterns consistently find that visible signs of a security system — cameras, alarm decals, a doorbell that clearly records — make a home a less attractive target, and many intruders say they would simply move on to an easier one. Deterrence is not a guarantee, and no system makes a home burglar-proof, but reducing the odds of being chosen in the first place is the cheapest protection there is. Cameras positioned to capture faces and a siren loud enough to draw attention do more of this work than the number of devices alone."
    },
    {
      "q": "Will a security system lower my home insurance?",
      "a": "Often, at least somewhat. Many homeowners insurers offer a discount for a professionally monitored system, and some add a further credit for monitored smoke, carbon-monoxide, or water-leak sensors, because those reduce the size and likelihood of a claim. The catch is that the discount usually applies to monitored systems rather than self-monitored ones, and the amount varies a great deal between carriers and policies. The only reliable way to know is to ask your insurer what a monitored setup would qualify for, then weigh that credit against the monthly monitoring fee."
    },
    {
      "q": "DIY self-monitoring or professional monitoring — which do I need?",
      "a": "It comes down to who you want responding when an alarm fires. Self-monitoring is cheaper and contract-free, and it works well if you are comfortable being the one who sees the alert and decides whether to call for help — accepting that it fails if your phone is off, silenced, or out of range. Professional monitoring adds a monthly fee but puts a staffed center on the job around the clock, able to verify the alarm and request dispatch when you cannot, which is exactly the situation — asleep, traveling, incapacitated — where a self-monitored system is weakest. Many people start with self-monitoring and move up once they realize how often they are unavailable to respond."
    },
    {
      "q": "I rent. What are my options?",
      "a": "Plenty, and this has changed a lot. Wireless, adhesive-mounted kits are built for renters: cameras, door and window sensors, and doorbells that install without drilling and pack up when you move, usually with no long-term contract. Many can be self-monitored for free or professionally monitored month-to-month. Two things are worth checking first — your lease, since some landlords restrict doorbell or exterior camera placement, and your neighbors' privacy, since outdoor cameras should be aimed at your own entrances rather than into someone else's windows. A renters-insurance discount for a monitored system may also be available, so it is worth asking."
    },
    {
      "q": "Who can see my camera footage, and is it private?",
      "a": "That depends on where the footage lives and how the account is secured. Cloud-stored video sits on the provider's servers, so their security practices, encryption, and data policies matter — read what they retain and whether they share with anyone. Locally stored footage stays on a card or recorder in your home, which keeps it off third-party servers but can be lost if the device is stolen or damaged. Either way, the account itself is the common weak point: use a strong, unique password and turn on two-factor authentication so a leaked password elsewhere cannot expose your cameras. Aim outdoor cameras at your own property, and check local rules, since recording audio in particular is regulated in some states."
    }
  ]
};

export default homeSecurity;
