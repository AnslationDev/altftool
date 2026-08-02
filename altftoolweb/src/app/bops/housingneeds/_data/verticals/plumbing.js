// Plumbing — HousingNeeds vertical content.
//
// Content only. Structure and styling live in _components/HnVerticalPage.jsx
// and housingneeds.css, so editing this file changes copy without touching layout.
//
// To point the CTA at a real destination, set the URL in _data/site.js
// (HN_QUOTE_BASE) or replace quoteUrlFor("plumbing") with a literal URL.
import { quoteUrlFor } from "../site";

const plumbing = {
  "images": {
    "hero": {
      "src": "https://images.unsplash.com/photo-1676210134188-4c05dd172f89",
      "alt": "Plumber working on the trap and supply lines beneath a sink"
    },
    "benefit": {
      "src": "https://images.unsplash.com/photo-1749532125405-70950966b0e5",
      "alt": "Plumber with a toolbox working in a bathroom"
    },
    "detail": null
  },
  "slug": "plumbing",
  "name": "Plumbing",
  "accent": "rose",
  "icon": "Droplet",
  "eyebrow": "Home plumbing solutions",
  "headline": "From hidden leaks to whole-home repipes",
  "headlineAccent": "whole-home repipes",
  "subheadline": "Most plumbing problems announce themselves late — a stained ceiling, a slow drain, a water bill that climbs for no obvious reason. Understanding how supply lines, drains, and water heaters actually fail makes it far easier to decide between a targeted repair and a system replacement.",
  "heroPoints": [
    "Leaks located before walls open",
    "Camera-verified sewer diagnostics",
    "Repair first, replace when justified"
  ],
  "quoteLabel": "Get a plumbing quote",
  "quoteUrl": quoteUrlFor("plumbing"),
  "seo": {
    "title": "Plumbing Guide: Leaks, Drains and Repiping",
    "description": "How home plumbing works: leak detection, drain cleaning, hydro jetting, sewer camera inspection, PEX and copper repiping, and water heater choices explained."
  },
  "services": [
    {
      "icon": "Droplets",
      "title": "Leak Detection and Repair",
      "description": "Acoustic and thermal location of concealed leaks, so the opening made in a wall or slab is the one over the leak rather than the first likely guess.",
      "image": {
        "src": "https://images.unsplash.com/photo-1596394723269-b2cbca4e6313",
        "alt": "Water jetting sideways out of a corroded brass valve body, droplets frozen mid-air"
      }
    },
    {
      "icon": "Waves",
      "title": "Drain Cleaning and Hydro Jetting",
      "description": "Cabling for a blockage, jetting when the line has scaled or greased down over years — jetting restores the full bore, a cable only punches through it.",
      "image": {
        "src": "https://images.unsplash.com/photo-1526898943670-92bfa9f94c12",
        "alt": "A wide metal hose coupling discharging water across a wet street beside orange traffic cones"
      }
    },
    {
      "icon": "Microscope",
      "title": "Sewer Camera Inspection",
      "description": "Recorded camera survey with depth and distance, identifying bellies, offsets and root intrusion before anyone commits to digging up a yard or a driveway.",
      "image": {
        "src": "https://images.unsplash.com/photo-1551516116-27394c95a55f",
        "alt": "View down the inside of a corrugated drainage pipe with water running along the bottom"
      }
    },
    {
      "icon": "Construction",
      "title": "Sewer Line Repair and Replacement",
      "description": "Spot repairs, trenchless lining or full replacement, chosen against the pipe material, its depth, and what sits on the ground above the run.",
      "image": {
        "src": "https://images.unsplash.com/photo-1772600110243-f4e1349259b6",
        "alt": "A hi-vis crew excavating an open trench along a street, one worker down in the trench"
      }
    },
    {
      "icon": "Thermometer",
      "title": "Water Heater Repair and Replacement",
      "description": "Tank service and swap-outs including the venting, expansion control and gas or electrical capacity that a like-for-like replacement still has to satisfy.",
      "image": {
        "src": "https://images.unsplash.com/photo-1620653713380-7a34b773fef8",
        "alt": "A hand gripping tongue-and-groove pliers on the copper supply line above a white water heater"
      }
    },
    {
      "icon": "Flame",
      "title": "Tankless Water Heater Installation",
      "description": "On-demand units sized by flow rate and temperature rise, which usually means new gas line capacity and dedicated venting rather than reusing the old flue."
    },
    {
      "icon": "Wrench",
      "title": "Whole-Home Repiping",
      "description": "Replacing failing galvanised or early plastic supply with PEX or copper, routed and sequenced to keep water on for most of the work.",
      "image": {
        "src": "https://images.unsplash.com/photo-1694827893591-af9b80361599",
        "alt": "Two bare copper pipes running vertically through an opened wall cavity exposing wood lath"
      }
    },
    {
      "icon": "Toilet",
      "title": "Fixture and Faucet Installation",
      "description": "Toilets, sinks, tubs and shower valves set on sound rough-in, with the shutoffs and supply lines replaced at the same time rather than reused.",
      "image": {
        "src": "https://images.unsplash.com/photo-1676210134190-3f2c0d5cf58d",
        "alt": "A person reaching under a white basin with both hands, P-trap and supply lines visible"
      }
    },
    {
      "icon": "Gauge",
      "title": "Water Pressure and Valve Service",
      "description": "Regulator, main shutoff and thermal expansion work, since pressure above about 80 psi quietly shortens the life of every fixture and appliance in the house.",
      "image": {
        "src": "https://images.unsplash.com/photo-1707409464203-df2f21c32b9c",
        "alt": "A row of brass valve and manifold bodies with white actuator caps and red and blue clips"
      }
    }
  ],
  "benefits": [
    {
      "icon": "ShieldCheck",
      "title": "Water damage caught early",
      "description": "A pinhole leak inside a wall can saturate framing and drywall for weeks before it becomes visible. Detecting and isolating it early keeps the repair a plumbing job rather than a restoration project."
    },
    {
      "icon": "CircleDollarSign",
      "title": "Lower consumption and waste",
      "description": "A running toilet flapper or a dripping supply stop wastes water continuously. Fixing small failures and correcting excessive household pressure reduces both water use and downstream fixture wear."
    },
    {
      "icon": "Droplet",
      "title": "Better water quality and flow",
      "description": "Corroded galvanized pipe sheds rust and narrows internally, producing discolored water and weak flow at upper-floor fixtures. Replacing degraded supply lines restores both clarity and usable flow."
    },
    {
      "icon": "CalendarClock",
      "title": "Fewer emergency failures",
      "description": "Storage water heaters typically last 8-12 years and sump pumps roughly 7-10, and shutoff valves seize with age. Planning replacement near the end of those ranges avoids flooded basements and unplanned after-hours work."
    }
  ],
  "options": {
    "title": "Choosing pipe materials for supply and drain lines",
    "intro": "Repiping decisions come down to a few materials that behave very differently in real conditions. Local code, water chemistry, whether pipe runs are exposed or concealed, and how much wall access a job requires all influence which one makes sense. Drain, waste, and vent piping is a separate decision from potable supply piping, and the two are often replaced at different times.",
    "items": [
      {
        "name": "PEX (cross-linked polyethylene)",
        "summary": "Flexible tubing joined with expansion, crimp, or press fittings. It bends around framing with far fewer joints than rigid pipe, which cuts labor and the number of potential leak points. Because the tubing can expand slightly, it tolerates a freeze better than rigid pipe, though no material is truly freeze-proof.",
        "bestFor": "Repipes where wall access is limited",
        "lifespan": "30-50 years",
        "considerations": [
          "Degrades under UV exposure, so it cannot be used outdoors or in sunlit spaces without protection",
          "Fitting systems are not interchangeable, and some crimp-style fittings restrict interior diameter more than expansion fittings",
          "Manufacturers and codes generally require a short metallic transition at water heater connections and other high-heat areas"
        ]
      },
      {
        "name": "Copper (Type L)",
        "summary": "Rigid, soldered or press-fit metal pipe that has been the long-standing benchmark for potable supply. It handles heat and pressure without deforming, is bacteriostatic rather than a surface that encourages biofilm, and can be run exposed in basements and utility spaces without protection.",
        "bestFor": "Exposed runs and long-term durability",
        "lifespan": "50-70 years",
        "considerations": [
          "Higher material cost and significantly more labor than flexible tubing",
          "Aggressive or acidic water and high flow velocity can cause pinhole corrosion, sometimes well before end of expected life",
          "Soldered joints require torch work and a fire watch, which adds constraints in finished spaces"
        ]
      },
      {
        "name": "CPVC",
        "summary": "Rigid plastic supply pipe joined with solvent cement. It is inexpensive, is rated for hot water service, and does not corrode or scale the way metal can, which makes it common in some regions and in partial repairs to existing CPVC systems.",
        "bestFor": "Budget-conscious repairs in CPVC homes",
        "lifespan": "40-75 years",
        "considerations": [
          "Becomes brittle as it ages and can crack when disturbed during unrelated work",
          "Incompatible with certain solvents, thread sealants, and some spray foam insulations, which can cause premature cracking",
          "Solvent-welded joints need full cure time before the system can be pressurized"
        ]
      },
      {
        "name": "PVC or ABS for drain, waste, and vent",
        "summary": "Lightweight plastic drainage pipe used for waste and venting rather than pressurized supply. It resists the corrosion and internal scaling that eventually collapse older cast iron, and it is far easier to work with in tight crawlspaces.",
        "bestFor": "Replacing failing cast iron or clay drains",
        "lifespan": "50-100 years",
        "considerations": [
          "Not a substitute for supply piping — standard DWV pipe is not rated for pressurized potable water",
          "Codes vary on whether PVC or ABS is permitted, and on how the two may be joined",
          "Transmits more drain noise than cast iron unless insulated, and needs correct slope and support spacing to avoid bellies"
        ]
      }
    ]
  },
  "process": [
    {
      "title": "Diagnose before opening anything",
      "description": "Symptoms rarely point straight to the cause. Pressure tests, meter checks, moisture readings, and camera inspection isolate the actual failure so demolition is targeted rather than exploratory."
    },
    {
      "title": "Scope the repair-versus-replace decision",
      "description": "A single failed section on an otherwise sound system is a repair. Repeated pinhole leaks, a heater past its service life, or a sewer line with multiple offsets points toward replacement — a call that should rest on test results and camera footage rather than assumption."
    },
    {
      "title": "Permit, protect, and perform the work",
      "description": "Water heater installs, repipes, and sewer replacements typically require permits and inspection. Shutoff windows, floor and wall protection, and sequencing are planned so the household keeps water for as much of the job as possible."
    },
    {
      "title": "Pressure test and verify",
      "description": "Supply work is pressure tested before walls close. Drains are flow tested and often re-inspected by camera, heaters are checked for correct T&P discharge routing and combustion venting, and household static pressure is confirmed within the code range."
    }
  ],
  "costFactors": [
    {
      "factor": "Access to the failed component",
      "detail": "The pipe itself is rarely the expensive part. A leak under a concrete slab, inside a finished ceiling, or beneath a driveway requires cutting, shoring, and restoring the surrounding surface, and that access work often exceeds the plumbing labor."
    },
    {
      "factor": "Scope: spot repair versus full system",
      "detail": "Replacing one failed section is a contained job. A whole-home repipe scales with the number of fixtures, bathrooms, and floors, because each fixture group needs its own runs, shutoffs, and wall openings."
    },
    {
      "factor": "Material and system selection",
      "detail": "Copper costs more in both material and labor than PEX. On the heater side, a tankless conversion may require gas line upsizing, new venting, and sometimes electrical work that a like-for-like tank swap does not."
    },
    {
      "factor": "Condition of what is being connected to",
      "detail": "New work has to tie into existing pipe. Brittle CPVC, corroded galvanized threads, or old cast iron hubs frequently crumble at the connection point, expanding the job beyond the original failure."
    },
    {
      "factor": "Permits, code upgrades, and timing",
      "detail": "Permitted work may trigger required upgrades such as expansion tanks, seismic strapping, backflow prevention, or venting corrections. Emergency and after-hours response also carries a premium over scheduled work."
    }
  ],
  "faqs": [
    {
      "q": "How can I tell whether I have a hidden leak?",
      "a": "Shut off every fixture and appliance, then watch the water meter's low-flow indicator — any movement over fifteen minutes suggests water is escaping somewhere. Warm spots on a floor slab, a persistent musty smell, unexplained bill increases, and a water heater or well pump that cycles when nothing is running are all common signs. Closing the main shutoff and rechecking the meter separates a leak inside the house from one on the buried service line. From there, acoustic listening equipment and thermal imaging narrow the location, and isolating hot side, cold side, and irrigation confirms it before anything is opened."
    },
    {
      "q": "Is a tankless water heater worth it compared to a tank?",
      "a": "Storage tanks typically last 8-12 years and cost far less to install, while tankless units commonly run 15-20 years and only heat water on demand, which reduces standby losses. The tradeoff is installation complexity: tankless conversions often need a larger gas line, different venting, and sometimes a dedicated circuit, and hard water requires periodic descaling to protect the heat exchanger. Tankless output is limited by flow rate, so a unit sized for one shower will struggle to run two at once. Heat pump water heaters are a third option worth pricing, though they need adequate air volume and produce cool exhaust air; rebates and incentives vary by location and change over time, so check what local programs currently offer."
    },
    {
      "q": "When does a house actually need repiping instead of another patch?",
      "a": "The usual trigger is a pattern rather than a single event — several pinhole leaks in different rooms within a year or two, or visible green corrosion at multiple joints. Galvanized steel supply lines scale shut internally over decades, showing up as rust-tinged water and weak flow at upstairs fixtures even though pressure at the main is fine. Polybutylene, common in homes built from the late 1970s through the mid-1990s, is generally replaced on sight because of its failure history. If repairs are recurring and walls are being opened repeatedly, a planned repipe is usually the cheaper path."
    },
    {
      "q": "What's the difference between snaking a drain and hydro jetting?",
      "a": "A cable or auger punches a hole through the obstruction, which restores flow quickly but leaves the buildup coating the pipe wall, so the clog often returns. Hydro jetting sends water through a nozzle at high pressure to scour grease, soap scale, and fine root hair off the full interior circumference, returning the line close to its working diameter. Jetting is the better choice for recurring kitchen line clogs and root-prone laterals, but it should follow a camera inspection — fragile cast iron, clay, or Orangeburg pipe can be damaged by aggressive jetting, and heavy roots usually need mechanical cutting first. If the camera shows a collapsed section or a belly holding standing water, no cleaning method will fix it."
    },
    {
      "q": "How do I keep pipes from freezing, and what should I do if they already have?",
      "a": "The pipes most at risk are the ones in unconditioned space — exterior walls, crawlspaces, attics, and garages — plus hose bibs left connected to a garden hose. Insulate exposed runs, disconnect hoses before the first hard freeze, open cabinet doors under sinks on exterior walls, and let a pencil-thin trickle run from the most distant fixture during extreme cold. If a fixture stops producing water in freezing weather, open that faucet so melting ice has somewhere to go, locate the main shutoff and be ready to close it, then warm the suspected section gradually with a hair dryer, heat lamp, or hot-water-soaked towels — never an open flame. Damage is frequently discovered only at thaw, when a split section starts flowing again, so stay near the shutoff while the line warms."
    }
  ]
};

export default plumbing;
