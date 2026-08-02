// Electrical — HousingNeeds vertical content.
//
// Content only. Structure and styling live in _components/HnVerticalPage.jsx
// and housingneeds.css, so editing this file changes copy without touching layout.
//
// The quote CTA points at a placeholder URL. Swap it for the real destination
// when the electrical funnel goes live.

const electrical = {
  "images": {
    "hero": {
      "src": "https://images.unsplash.com/photo-1621905251918-48416bd8575a",
      "alt": "Electrician in gloves working on wiring at a residential electrical panel"
    },
    "benefit": {
      "src": "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5",
      "alt": "Close-up of electrical wiring being connected during an installation"
    },
    "detail": {
      "src": "https://images.unsplash.com/photo-1601462904263-f2fa0c851cb9",
      "alt": "Modern light switch and outlet installed on an interior wall"
    }
  },
  "slug": "electrical",
  "name": "Electrical",
  "accent": "amber",
  "icon": "Zap",
  "eyebrow": "Electrical solutions",
  "headline": "Safe, code-compliant power for everything you plug in",
  "headlineAccent": "everything you plug in",
  "subheadline": "A home electrical system is a chain — service entrance, panel, branch circuits, devices — and it is only as safe as its weakest connection. Whether you are adding an EV charger, chasing nuisance breaker trips, or wondering if a 100-amp panel can keep up, understanding how capacity, wiring, and code fit together makes every decision easier and every quote easier to judge.",
  "heroPoints": [
    "100A vs 200A upgrades explained",
    "EV charging circuits done right",
    "Permits and inspections handled"
  ],
  "quoteLabel": "Get a Free Quote",
  "quoteUrl": "https://example.com/quote/electrical",
  "seo": {
    "title": "Electrical Guide: Panel Upgrades & Wiring",
    "description": "Understand home electrical work: 100A vs 200A panel upgrades, rewiring, EV chargers, generator hookups, NEC code compliance, permits, and what drives cost."
  },
  "services": [
    {
      "icon": "CircuitBoard",
      "title": "Electrical Panel Upgrades",
      "description": "Replacing an undersized or obsolete load center — commonly a 100-amp panel — with 200-amp service, new breakers, and a labeled directory, sized from an actual NEC load calculation rather than guesswork.",
      "image": {
        "src": "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5",
        "alt": "Electrical Panel Upgrades"
      }
    },
    {
      "icon": "Cable",
      "title": "Whole-Home Rewiring",
      "description": "Replacing knob-and-tube, cloth-insulated, or aluminum branch wiring with grounded copper circuits, routed to minimize wall damage and staged room by room so the house stays livable during the work.",
      "image": {
        "src": "https://images.unsplash.com/photo-1635335874521-7987db781153",
        "alt": "Whole-Home Rewiring"
      }
    },
    {
      "icon": "Plug",
      "title": "Outlet and Switch Installation",
      "description": "Adding grounded receptacles, GFCI and AFCI protection where code requires them, dimmers, and smart switches — with each device properly terminated and tested rather than simply made to work.",
      "image": {
        "src": "https://images.unsplash.com/photo-1660330589693-99889d60181e",
        "alt": "Outlet and Switch Installation"
      }
    },
    {
      "icon": "BatteryCharging",
      "title": "EV Charger Installation",
      "description": "Running a dedicated 240-volt circuit for Level 2 charging, with the load calculation, breaker sizing, and permit that keep the installation safe, inspectable, and consistent with insurance expectations.",
      "image": {
        "src": "https://images.unsplash.com/photo-1621905251918-48416bd8575a",
        "alt": "EV Charger Installation"
      }
    },
    {
      "icon": "Lightbulb",
      "title": "Recessed Lighting Installation",
      "description": "Laying out and installing IC-rated recessed fixtures with attention to spacing, insulation contact, and dimmer compatibility, so rooms are lit evenly instead of spotted with hot circles.",
      "image": {
        "src": "https://images.unsplash.com/photo-1758101755915-462eddc23f57",
        "alt": "Recessed Lighting Installation"
      }
    },
    {
      "icon": "Fan",
      "title": "Ceiling Fan Installation",
      "description": "Mounting fans on fan-rated boxes anchored to structure — not the light-duty boxes many builders leave behind — with balanced blades and separate light and fan control where the wiring allows.",
      "image": {
        "src": "https://images.unsplash.com/photo-1601462904263-f2fa0c851cb9",
        "alt": "Ceiling Fan Installation"
      }
    },
    {
      "icon": "Zap",
      "title": "Generator Hookups and Transfer Switches",
      "description": "Installing an interlock kit or transfer switch so a portable or standby generator can power selected circuits without backfeeding the grid, which is both a code violation and a hazard to utility line workers.",
      "image": {
        "src": "https://images.unsplash.com/photo-1609519479841-5fd3b2884e17",
        "alt": "Generator Hookups and Transfer Switches"
      }
    },
    {
      "icon": "ClipboardCheck",
      "title": "Code Corrections and Inspections",
      "description": "Correcting double-tapped breakers, open splices, missing GFCI protection, and other common home-inspection findings, documented so a sale, refinance, or insurance renewal can move forward.",
      "image": {
        "src": "https://images.unsplash.com/photo-1555470100-1728256970aa",
        "alt": "Code Corrections and Inspections"
      }
    }
  ],
  "benefits": [
    {
      "icon": "ShieldCheck",
      "title": "Fire Risk Reduced Where It Starts",
      "description": "Most residential electrical fires begin at connections — loose terminations, overloaded circuits, aging splices — not at the appliances plugged into them. Tight, correctly torqued, properly sized connections are the unglamorous work that actually prevents them."
    },
    {
      "icon": "Gauge",
      "title": "Capacity for the Way Homes Run Now",
      "description": "EV chargers, heat pumps, induction ranges, and home offices draw far more than the loads a mid-century panel was sized for. A 200-amp service typically provides the headroom that keeps breakers from nuisance-tripping and lets future projects tie in without another service upgrade."
    },
    {
      "icon": "FileCheck",
      "title": "Permitted Work That Protects Resale",
      "description": "Electrical work pulled under permit and signed off by the municipal inspector is documented for the life of the house. Unpermitted work has a way of surfacing at the worst time — during a sale, an appraisal, or an insurance claim — and often has to be opened up and redone."
    },
    {
      "icon": "ClipboardCheck",
      "title": "Problems Found Before They Escalate",
      "description": "Opening a panel reveals what a walkthrough cannot: double-lugged breakers, undersized conductors, scorched terminations, and mismatched breaker brands. Catching these during planned work is far cheaper than discovering them after a failure."
    },
    {
      "icon": "BadgeCheck",
      "title": "Licensed, Insured, and Accountable",
      "description": "Panel and service work belongs exclusively with licensed, insured electricians. Licensing means the work is done to the National Electrical Code as adopted locally, and insurance means a mistake is the contractor's liability rather than yours."
    }
  ],
  "options": {
    "title": "Sizing your electrical service",
    "intro": "Most panel conversations come down to a handful of standard service sizes, and the right one depends on square footage, whether major systems run on gas or electricity, and what you plan to add over the next decade. Upsizing during a planned upgrade is usually far cheaper than a second service change later, so it pays to size for where the home is heading rather than where it is.",
    "items": [
      {
        "name": "100-Amp Service",
        "summary": "The standard for much of the housing built before the 1980s, and still adequate for smaller homes where heating, water heating, and cooking run on gas. It leaves little margin once modern electrical loads start stacking up.",
        "bestFor": "Small homes with gas appliances and modest loads",
        "lifespan": "Panels commonly serve 25-40 years",
        "considerations": [
          "Often near capacity already; adding an EV charger or heat pump typically triggers an upgrade or a load-management device",
          "Certain legacy panel brands, such as Federal Pacific and Zinsco, have documented failure histories and are widely recommended for replacement regardless of amperage",
          "Some insurers ask about service size and panel brand at renewal, and older equipment can complicate coverage"
        ]
      },
      {
        "name": "150-Amp Service",
        "summary": "A middle step that shows up in some upgrades and newer mid-size homes. It can carry one or two major electric loads comfortably, but the cost difference between 150 and 200 amps is often small enough that most electricians recommend going straight to 200.",
        "bestFor": "Mid-size homes adding one major electric load",
        "lifespan": "Panels commonly serve 25-40 years",
        "considerations": [
          "Labor and permit costs are similar to a 200-amp upgrade, so the savings are mostly in equipment",
          "Can become the new bottleneck if an EV charger and electric heat arrive within a few years of each other",
          "Fewer stocked panel options than the 200-amp standard in some markets"
        ]
      },
      {
        "name": "200-Amp Service",
        "summary": "The modern default for new construction and the most common upgrade target. It typically supports an EV charger, electric range, heat pump, and normal household loads simultaneously, with breaker space left over for future circuits.",
        "bestFor": "Most whole-home upgrades and all-electric plans",
        "lifespan": "Panels commonly serve 25-40 years",
        "considerations": [
          "May require a new meter base, mast, and service-entrance conductors, plus utility coordination for the cutover",
          "A same-day power shutoff is part of the job, so scheduling matters for home offices and medical equipment",
          "An NEC load calculation should still confirm the size — square footage alone is not the standard"
        ]
      },
      {
        "name": "320/400-Amp Service",
        "summary": "Heavy service for large all-electric homes, detached workshops, accessory dwelling units, or properties running multiple EV chargers. Usually configured as two 200-amp panels fed from a single high-capacity meter base.",
        "bestFor": "Large all-electric homes, workshops, and multi-EV households",
        "lifespan": "Panels commonly serve 25-40 years",
        "considerations": [
          "The utility side of the upgrade — transformer capacity and service drop — can add lead time and, in some cases, utility charges",
          "Meaningfully higher equipment and labor cost than a 200-amp swap",
          "Overkill for most single-family homes; a load calculation should justify it before you pay for it"
        ]
      }
    ]
  },
  "process": [
    {
      "title": "Load Calculation and System Assessment",
      "description": "The existing service, panel condition, grounding, and branch circuits are evaluated, and an NEC load calculation totals what the home actually demands. This is where undersized service, legacy panel brands, and aluminum or knob-and-tube wiring get identified — before they become surprises mid-project."
    },
    {
      "title": "Scope, Permit, and Utility Coordination",
      "description": "A written scope defines exactly what is being installed and to which code cycle. The electrical permit is pulled with the local jurisdiction, and for service upgrades the utility is scheduled for the disconnect and reconnect, since the conductors ahead of the meter belong to them."
    },
    {
      "title": "Service and Panel Work",
      "description": "For upgrades, power is shut down for the cutover, the new panel and service equipment go in, and every circuit is re-terminated to manufacturer torque specifications with a legible, accurate directory. Grounding and bonding are brought up to current code, which older systems almost always need."
    },
    {
      "title": "Circuits, Devices, and Fixtures",
      "description": "New branch circuits are run for EV chargers, kitchens, or additions; outlets, switches, lighting, and fans are installed and tested under load. GFCI and AFCI protection is placed where the adopted code requires it, not just where it is convenient."
    },
    {
      "title": "Inspection and Closeout",
      "description": "The municipal inspector reviews the work against the permit, and any corrections are handled before final sign-off. You are left with a labeled panel, documentation of the permit and inspection, and a walkthrough of what was installed and how to use it."
    }
  ],
  "costFactors": [
    {
      "factor": "Panel Amperage and Service Scope",
      "detail": "A like-for-like panel swap sits at one price point; a full service upgrade from 100 to 200 amps is another project entirely, often involving a new meter base, mast, service-entrance conductors, and grounding electrode work. The further the job reaches toward the utility connection, the more labor and coordination it carries."
    },
    {
      "factor": "Wire Runs and Access",
      "detail": "Cost tracks the distance from the panel to the new load and how hard the path is to reach. A garage EV charger on the same wall as the panel is a short job; a detached garage, a finished basement ceiling, or a slab-on-grade home with no crawlspace can multiply labor hours for the same circuit."
    },
    {
      "factor": "Permits and Inspection",
      "detail": "Electrical permits and inspection fees vary by jurisdiction and by the scope of work, and service upgrades sometimes carry utility-side fees as well. These costs are real but modest next to the protection they buy — permitted, inspected work is what stands up at resale and in an insurance file."
    },
    {
      "factor": "Home Age and Legacy Wiring",
      "detail": "Homes with knob-and-tube or aluminum branch wiring often need remediation before new work can tie in, from approved connectors on aluminum terminations to full rewiring of affected circuits. Older homes also tend to need grounding, bonding, and box-fill corrections that were fine under the code they were built to but not under today's."
    },
    {
      "factor": "Fixture and Device Count",
      "detail": "Recessed lighting, switches, and receptacles price largely per opening, so the count drives the total more than any single unit cost. Dimmers, smart controls, and specialty trims add per-device cost, and plaster walls or insulated exterior walls slow the cut-in work compared with open framing or drywall."
    }
  ],
  "faqs": [
    {
      "q": "Do I really need a permit for electrical work?",
      "a": "For anything beyond swapping a like-for-like fixture or device, almost certainly yes. Panel changes, service upgrades, new circuits, and EV charger installs require an electrical permit in nearly every US jurisdiction, and the inspection that follows is an independent check on the work. Unpermitted work tends to surface during a home sale or an insurance claim, and at that point it often has to be opened up, corrected, and inspected anyway — at a worse time and a higher price. A licensed electrician typically handles the permit as part of the job."
    },
    {
      "q": "Do I need a 200-amp panel to install an EV charger?",
      "a": "Not always. The honest answer comes from an NEC load calculation, which totals the home's demand and shows how much capacity remains. Many 100-amp homes with gas heat and gas appliances can support a modest Level 2 circuit, and load-management devices can pause charging when other large loads run, letting a charger fit within existing service. That said, if the panel is already near capacity or more electrification is coming — a heat pump, an induction range, a second EV — upgrading once to 200 amps is usually more economical than working around the limit twice."
    },
    {
      "q": "How do I know if my panel needs to be replaced?",
      "a": "Warning signs include breakers that trip repeatedly under normal use, warmth or a burning smell at the panel, buzzing, flickering when large appliances start, and visible rust or scorching. Some panels warrant replacement on identity alone: Federal Pacific Stab-Lok and Zinsco panels have documented histories of breakers failing to trip under fault, and many electricians and home inspectors recommend replacing them regardless of apparent condition. A panel that is merely full, by contrast, can sometimes be solved with a subpanel — an evaluation by a licensed electrician sorts one case from the other."
    },
    {
      "q": "Is knob-and-tube or aluminum wiring actually dangerous?",
      "a": "Both can be managed, but neither should be ignored. Knob-and-tube has no ground conductor, and its rubber insulation grows brittle with age — the real hazards are buried splices, contact with insulation, and decades of amateur modifications. Aluminum branch wiring from the 1960s and 70s expands and contracts more than copper, which loosens connections at outlets and switches over time; remediation with approved connectors, or rewiring the affected circuits, addresses the risk at each termination. Many insurers ask about both during underwriting, so remediation often matters for coverage as well as safety. An assessment of what is actually in the walls is the right first step, not automatic panic — and not automatic replacement, either."
    },
    {
      "q": "Can I do panel or service work myself to save money?",
      "a": "No — this is the one area of home improvement where DIY is genuinely off the table. The service conductors feeding a panel remain energized even with the main breaker off, and a mistake there can be fatal, not merely expensive. Beyond the immediate danger, most jurisdictions restrict service work to licensed electricians, and unpermitted panel work can void insurance coverage and complicate a future sale. Swapping a light fixture is a reasonable homeowner task in many areas; anything at the panel, the meter, or the service entrance belongs with a licensed, insured professional."
    }
  ]
};

export default electrical;
