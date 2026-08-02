// Foundation Repair — HousingNeeds vertical content.
//
// Content only. Structure and styling live in _components/HnVerticalPage.jsx
// and housingneeds.css, so editing this file changes copy without touching layout.
//
// The CTA points at a literal quote URL below; swap it for a real destination,
// or route it through quoteUrlFor("foundation") in _data/site.js if preferred.
//
// Note: the intended hero icon "Building2" is not bundled in _lib/icons.js, so
// the nearest valid in-file icon ("House") is used to avoid the Wrench fallback.

const foundation = {
  "images": {
    "hero": {
      "src": "https://images.unsplash.com/photo-1575971637203-d6255d9947a9",
      "alt": "Concrete foundation wall and footing exposed during a home foundation repair"
    },
    "benefit": {
      "src": "https://images.unsplash.com/photo-1587052694737-a972e4186288",
      "alt": "Waterproofing membrane applied to a poured concrete foundation wall"
    },
    "detail": {
      "src": "https://images.unsplash.com/photo-1610079732288-72a77bd816c9",
      "alt": "Crew working along the excavated base of a home's foundation"
    }
  },
  "slug": "foundation",
  "name": "Foundation Repair",
  "accent": "violet",
  "icon": "House",
  "eyebrow": "Foundation & waterproofing",
  "headline": "A foundation that stays level, dry, and structurally sound",
  "headlineAccent": "structurally sound",
  "subheadline": "A cracked wall or a door that suddenly sticks is rarely the real problem — it is a symptom of soil moving, water pooling, or a footing that has lost its support. Understanding what is actually shifting the house is what separates a lasting structural fix from a cosmetic patch that reopens next season.",
  "heroPoints": [
    "Cracks and settling diagnosed by cause",
    "Piering vs slab jacking compared",
    "Drainage and waterproofing addressed too"
  ],
  "quoteLabel": "Get a Free Quote",
  "quoteUrl": "https://example.com/quote/foundation",
  "seo": {
    "title": "Foundation Repair Guide: Cracks and Piers",
    "description": "Learn how foundation problems really start, when cracks and settling turn serious, and how piering, slab jacking, wall anchors, and waterproofing fix them."
  },
  "services": [
    {
      "icon": "Wrench",
      "title": "Foundation Crack Repair",
      "description": "Sealing and reinforcing cracks in poured concrete and block walls, typically with epoxy or polyurethane injection that bonds the crack and blocks water. The key step is confirming the crack is dormant rather than a sign of active movement that needs structural support first.",
      "image": {
        "src": "https://images.unsplash.com/photo-1598092655914-44f06584e31a",
        "alt": "Foundation Crack Repair"
      }
    },
    {
      "icon": "Construction",
      "title": "Pier and Underpinning Systems",
      "description": "Driving or screwing steel piers down to dense, load-bearing soil so a settling foundation can be stabilized and, where possible, lifted back toward level. Underpinning transfers the home's weight off the failing shallow soil onto strata that will actually hold it.",
      "image": {
        "src": "https://images.unsplash.com/photo-1669027108349-a9bea2bec1d5",
        "alt": "Pier and Underpinning Systems"
      }
    },
    {
      "icon": "Ruler",
      "title": "Concrete Leveling and Slab Jacking",
      "description": "Raising sunken slabs, driveways, garage floors, and patios by pumping cement slurry or polyurethane foam into the voids beneath them until they float back to grade. It corrects flatwork and floors, and is often paired with piering when structural footings are also involved.",
      "image": {
        "src": "https://images.unsplash.com/photo-1583517190311-846a7653d8be",
        "alt": "Concrete Leveling and Slab Jacking"
      }
    },
    {
      "icon": "ShieldCheck",
      "title": "Bowing Basement Wall Stabilization",
      "description": "Straightening or arresting walls that lean or bow under lateral soil pressure using wall anchors, steel I-beam braces, or carbon-fiber straps. The method is matched to how far the wall has already deflected, since minor bowing and severe movement call for very different hardware.",
      "image": {
        "src": "https://images.unsplash.com/photo-1546816077-623b4eaab352",
        "alt": "Bowing Basement Wall Stabilization"
      }
    },
    {
      "icon": "Droplets",
      "title": "Basement Waterproofing",
      "description": "Stopping water intrusion through interior drainage, exterior membranes, and sealed penetrations so hydrostatic pressure stops working against the walls and floor. Managing the water is frequently what keeps the structural repair from being undone by the same conditions that caused it.",
      "image": {
        "src": "https://images.unsplash.com/photo-1706660143732-c1d14701114e",
        "alt": "Basement Waterproofing"
      }
    },
    {
      "icon": "Home",
      "title": "Crawl-Space Encapsulation",
      "description": "Sealing a damp crawl space with a heavy vapor barrier, sealed vents, and often a dehumidifier to control the moisture that rots framing and fuels mold. A dry, encapsulated crawl space also stabilizes humidity in the living space above it.",
      "image": {
        "src": "https://images.unsplash.com/photo-1606362811767-c96ff375b3d9",
        "alt": "Crawl-Space Encapsulation"
      }
    },
    {
      "icon": "Waves",
      "title": "Drainage and Sump Pump Systems",
      "description": "Directing groundwater and roof runoff away from the foundation with interior or exterior drain tile, a sump pit and pump, and regraded soil. Because most foundation problems trace back to water, drainage is usually treated as part of the repair rather than an add-on.",
      "image": {
        "src": "https://images.unsplash.com/photo-1646184466560-f81b1e495604",
        "alt": "Drainage and Sump Pump Systems"
      }
    },
    {
      "icon": "ClipboardCheck",
      "title": "Foundation Inspection and Assessment",
      "description": "A documented condition report combining an elevation survey with a map of cracks, gaps, and sticking openings to establish what is moving and how much. It gives an honest baseline for deciding between monitoring, a targeted repair, or a full structural scope.",
      "image": {
        "src": "https://images.unsplash.com/photo-1632192723921-fe6feb9c905d",
        "alt": "Foundation Inspection and Assessment"
      }
    }
  ],
  "benefits": [
    {
      "icon": "Microscope",
      "title": "Fixing the Cause, Not Just the Crack",
      "description": "Sealing a crack without addressing the soil movement or water behind it simply resets the clock. Diagnosing whether the house is settling, heaving, or under water pressure is what makes a repair hold instead of reappearing a season later."
    },
    {
      "icon": "CircleDollarSign",
      "title": "Protecting the Home's Value",
      "description": "A foundation problem is one of the few defects that can stall a sale or shrink an appraisal on its own. A properly engineered and documented repair, ideally with a transferable warranty, turns an open-ended worry into a closed, verifiable item for buyers and lenders."
    },
    {
      "icon": "Droplet",
      "title": "Keeping Water From Undermining the Footing",
      "description": "Water is the common thread behind settling, heaving, and bowing walls. Pairing structural work with grading, drainage, and waterproofing removes the force that caused the damage, so the fix is not fighting the same conditions that broke the foundation."
    },
    {
      "icon": "FileCheck",
      "title": "Engineered, Documented Repairs",
      "description": "Work tied to a structural engineer's design and a permit generally carries more weight than a sales estimate alone. That paper trail supports the warranty, satisfies inspectors, and reassures a future buyer that the repair was done to a defined standard."
    },
    {
      "icon": "CalendarClock",
      "title": "Acting Early Usually Costs Less",
      "description": "Foundation problems tend to progress as soil keeps moving and water keeps working. Catching a small elevation difference or a hairline crack early often means a smaller, less invasive scope than waiting until doors jam, walls bow, or floors slope noticeably."
    }
  ],
  "options": {
    "title": "Comparing foundation repair methods",
    "intro": "Most foundation work comes down to a few established methods, and the right one depends on the cause, how far the movement has gone, the soil, and how much access the site allows. Each option below is matched to a specific type of problem, and serious projects often combine more than one.",
    "items": [
      {
        "name": "Steel Push Piers",
        "summary": "Sections of galvanized steel pipe are hydraulically driven straight down through the failing soil until they reach dense, load-bearing strata or bedrock. The home's weight is then transferred onto the piers, and in many cases the foundation can be lifted back toward its original elevation.",
        "bestFor": "Heavier structures with settlement that can reach stable soil at depth",
        "lifespan": "Engineered as a permanent underpinning solution, often with a long or transferable warranty",
        "considerations": [
          "Piers advance using the weight of the structure, so they suit heavier masonry and multi-story homes better than light additions",
          "Reaching capacity depends on how deep competent soil sits; very deep unstable layers add piers and cost",
          "Lifting a settled foundation can reopen old cracks and disturb finishes, so full recovery is a goal rather than a guarantee"
        ]
      },
      {
        "name": "Helical Piers",
        "summary": "Screw-like steel shafts with helical plates are turned into the ground with a torque motor, so their capacity is verified by installation torque rather than by structural weight. They work for underpinning existing foundations and for supporting new construction and lighter loads.",
        "bestFor": "Lighter structures, additions, and exterior slabs where push piers lack the load to advance",
        "lifespan": "Long-term structural support, with capacity confirmed during installation and typically warrantied for decades",
        "considerations": [
          "Because they are torqued in rather than pushed by the building, they suit lighter loads that cannot drive a push pier",
          "Installation torque correlates to load capacity, giving a measurable verification not available with every method",
          "Buried obstructions such as debris, boulders, or old footings can complicate advancement and require adjustment"
        ]
      },
      {
        "name": "Concrete Leveling (Slab Jacking and Foam)",
        "summary": "Rather than supporting a foundation, this raises sunken concrete — driveways, patios, garage and basement floors — by pumping material through small holes to fill voids and float the slab back to grade. Traditional mudjacking uses a cement slurry, while polyurethane foam is lighter and cures within minutes.",
        "bestFor": "Settled or uneven slabs and flatwork rather than load-bearing foundation footings",
        "lifespan": "Durable when the cause of the void is corrected; results depend on stabilizing the soil that settled",
        "considerations": [
          "It levels slabs, not structural foundation walls, so it often complements piering rather than replacing it",
          "Foam is lighter and sets faster through smaller holes; slurry mudjacking is usually cheaper but heavier and messier",
          "If erosion or poor drainage created the void, leveling alone can settle again unless the water problem is also fixed"
        ]
      },
      {
        "name": "Wall Anchors and Carbon-Fiber Reinforcement",
        "summary": "For basement walls bowing or leaning under soil pressure, wall anchors tie the wall back to steel plates set in stable soil out in the yard and can be tightened over time, while carbon-fiber straps bond directly to the wall to arrest movement where deflection is still minor.",
        "bestFor": "Bowing, leaning, or horizontally cracked basement and retaining walls",
        "lifespan": "Long-term stabilization; anchors can be adjusted over time, and carbon-fiber reinforcement forms a permanent bond",
        "considerations": [
          "Carbon fiber suits walls with limited bowing; walls past a certain deflection usually need anchors or rebuilding",
          "Wall anchors need accessible yard space to set the exterior plates, which is not always possible on tight lots",
          "These methods counter lateral soil pressure, which is often driven by drainage, so grading and gutters usually need attention too"
        ]
      }
    ]
  },
  "process": [
    {
      "title": "Inspection and Cause Diagnosis",
      "description": "The foundation is checked for elevation differences with a level survey, and cracks, gaps, and sticking doors and windows are mapped inside and out. Because the same crack can come from settling, heaving, or water pressure, the assessment focuses on what is actually moving the house before any method is chosen."
    },
    {
      "title": "Structural Engineer Review When Warranted",
      "description": "For significant settlement, bowing walls, or anything affecting how loads travel through the house, an independent structural engineer's report defines the scope and provides a neutral second opinion. It also creates documentation that helps at resale and ties the repair to an engineered design rather than a sales estimate."
    },
    {
      "title": "Repair Plan and Method Selection",
      "description": "With the cause understood, the plan specifies the method, pier count and spacing or wall reinforcement, and any target lift. An honest scope separates stabilizing the movement, which is the structural priority, from cosmetically closing cracks, which follows once the foundation is stable."
    },
    {
      "title": "Stabilization, Piering, or Leveling",
      "description": "Piers are installed, walls are anchored or braced, or slabs are lifted according to the engineered plan, usually from a combination of interior and exterior access points. Any lift is taken slowly and monitored so the structure recovers as much as it safely can without cracking finishes further."
    },
    {
      "title": "Drainage, Waterproofing, and Restoration",
      "description": "Because water drives most foundation problems, the work often includes regrading soil away from the house, extending downspouts, and adding interior drains or a sump pump. Excavations are backfilled and compacted, and cracks are sealed once movement has stopped."
    }
  ],
  "costFactors": [
    {
      "factor": "Severity and Underlying Cause",
      "detail": "A single dormant crack is a modest fix; widespread settling, active movement, or a bowing wall is a structural project. What is driving the problem matters as much as the visible damage, since a plumbing leak, expansive clay, or chronic drainage failure each points toward a different and differently priced scope."
    },
    {
      "factor": "Repair Method and Number of Piers",
      "detail": "Piering is generally priced per pier, and the count is set by the home's weight and the span that needs support, so a longer failing wall means more piers. Method also drives cost: crack injection, slab leveling, wall anchors, and full underpinning sit at very different price points."
    },
    {
      "factor": "Soil Conditions and Depth to Stable Strata",
      "detail": "Expansive clay soils that swell and shrink with moisture are a common culprit across much of the country and can complicate a repair. How deep the piers must go to reach competent load-bearing soil directly affects material and labor, since deeper stable strata means longer piers and more time per pier."
    },
    {
      "factor": "Site Access and Excavation",
      "detail": "Interior work under a finished basement, tight side yards, mature landscaping, driveways, and decks all raise the effort to reach the foundation. Exterior methods that require excavation and backfill cost more than interior approaches, and restoring hardscaping or plantings afterward adds to the total."
    },
    {
      "factor": "Added Drainage and Waterproofing Scope",
      "detail": "When the fix also includes interior drain tile, a sump pump, exterior waterproofing, or regrading, those systems add to a structural-only estimate. Permit fees and an engineer's report add cost as well, and any local incentives vary by area and change over time, so current programs are worth checking directly."
    }
  ],
  "faqs": [
    {
      "q": "How do I know if a foundation crack is serious?",
      "a": "Not every crack is structural. Thin vertical or hairline cracks in concrete are often shrinkage from curing and are usually cosmetic, especially if they are narrow and not spreading. Horizontal cracks, stair-step cracks through block joints, cracks wider than about a quarter inch, and cracks paired with sticking doors, sloping floors, or gaps at trim are more likely to signal movement. Width that changes over time is a useful warning sign, so marking and dating a crack helps. When any of those appear, an inspection with an elevation survey is the honest way to tell whether it needs monitoring or repair."
    },
    {
      "q": "What actually causes foundation problems?",
      "a": "Water and soil movement are behind most of them. Expansive clay soils swell when wet and shrink when dry, and that repeated movement lifts and drops the foundation unevenly. In colder regions, freeze-thaw cycles heave the soil, and poor drainage, clogged gutters, or downspouts dumping next to the wall keep the ground saturated. Undetected plumbing leaks, drought that pulls moisture out from under the footing, and soil that was not properly compacted during construction all contribute as well. Because the causes are usually about water and soil rather than the concrete itself, managing those conditions is typically part of any lasting fix."
    },
    {
      "q": "Is foundation repair permanent, and are the warranties meaningful?",
      "a": "Properly engineered piering is generally designed as a permanent solution, since it transfers the load onto stable soil that will not keep settling. That said, no repair can promise the house will never move again, because the surrounding soil and water conditions keep acting on it, which is why drainage is so often part of the scope. On warranties, the useful question is whether the coverage is transferable to a future owner and what it specifically covers. A transferable, engineer-backed warranty carries far more weight at resale than a vague verbal assurance, so it is worth reading the terms rather than the headline."
    },
    {
      "q": "Do I need a structural engineer, or is a contractor's inspection enough?",
      "a": "For minor, clearly cosmetic cracks, a reputable contractor's assessment is often sufficient. For significant settlement, bowing walls, sloping floors, or anything affecting how the house carries its load, an independent structural engineer is worth the cost. Because the engineer does not sell the repair, the report tends to be a neutral read on the cause and the appropriate scope, and it gives you a design to hold bids against rather than trusting a single company's diagnosis. That documentation also tends to reassure lenders and future buyers, so it can pay for itself beyond the repair itself."
    },
    {
      "q": "Will foundation problems hurt resale, and do I have to disclose them?",
      "a": "Foundation issues can slow a sale and affect an appraisal, which is one reason acting early usually works in your favor. Most states require sellers to disclose known material defects, and a known foundation problem or prior repair generally falls under that, though the specific rules vary by state, so confirm your local disclosure requirements. In practice, a documented, engineer-backed repair with a transferable warranty is far easier to present to a buyer than an unresolved crack, because it turns an open question into a closed, verifiable record. Keeping the inspection report, permits, and warranty together makes that conversation much simpler."
    }
  ]
};

export default foundation;
