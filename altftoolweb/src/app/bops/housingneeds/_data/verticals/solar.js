// Solar — HousingNeeds vertical content.
//
// Content only. Structure and styling live in _components/HnVerticalPage.jsx
// and housingneeds.css, so editing this file changes copy without touching layout.
//
// To point the CTA at a real destination, set the URL in _data/site.js
// (HN_QUOTE_BASE) or replace quoteUrlFor("solar") with a literal URL.
import { quoteUrlFor } from "../site";

const solar = {
  "images": {
    "hero": {
      "src": "https://images.unsplash.com/photo-1624397640148-949b1732bb0a",
      "alt": "Installer carrying a solar panel across a roof"
    },
    "benefit": {
      "src": "https://plus.unsplash.com/premium_photo-1682148199282-f05a9532a629",
      "alt": "Two installers mounting solar panels on a tiled roof"
    },
    "detail": {
      "src": "https://images.unsplash.com/flagged/photo-1566838616631-f2618f74a6a2",
      "alt": "Brick house with a rooftop solar array"
    }
  },
  "slug": "solar",
  "name": "Solar",
  "accent": "amber",
  "icon": "Sun",
  "eyebrow": "Residential solar",
  "headline": "Turn your roof into a working power plant",
  "headlineAccent": "a working power plant",
  "subheadline": "A solar array converts daylight into electricity used on site, cutting what a home draws from the grid and, with storage, keeping essential circuits alive when the grid goes down. Good systems start with a shade study and twelve months of actual kWh consumption, not a panel count pulled from a brochure.",
  "answer": "A residential solar array converts daylight into electricity used on site, cutting what the home draws from the grid; adding battery storage is what keeps selected circuits running during an outage, because a grid-tied system without storage shuts down when the grid does. Sizing should start from a shade study and twelve months of actual kWh use — panels commonly carry 25-30 year output warranties, string inverters last 10-15 years, microinverters 20-25 and lithium batteries 10-15.",
  "heroPoints": [
    "Shade and orientation modeled first",
    "Flashed, engineered roof penetrations",
    "Storage-ready system design"
  ],
  "quoteLabel": "Get a solar quote",
  "quoteUrl": quoteUrlFor("solar"),
  "seo": {
    "title": "Home Solar Panel Installation: Systems & Costs",
    "description": "How residential solar works: monocrystalline panels, string inverters vs microinverters, batteries, net metering, shading, and what drives system cost."
  },
  "services": [
    {
      "icon": "Sun",
      "title": "Rooftop Solar Panel Installation",
      "description": "Grid-tied arrays laid out around obstructions and rafter positions, with the string design set by the roof's real usable planes rather than its total area.",
      "image": {
        "src": "https://images.unsplash.com/photo-1660330589257-813305a4a383",
        "alt": "Technician in a safety harness kneeling on a shingle roof, drilling beside a black solar array"
      }
    },
    {
      "icon": "SunMedium",
      "title": "Ground-Mount Solar Arrays",
      "description": "Pole or ballasted racking for sites where the roof is shaded, too small or too complex, with tilt and azimuth set for the site's own production curve.",
      "image": {
        "src": "https://images.unsplash.com/photo-1509389928833-fe62aef36deb",
        "alt": "Long parallel rows of ground-mounted panels on tilted metal racking over bare earth"
      }
    },
    {
      "icon": "BatteryCharging",
      "title": "Battery Storage and Backup",
      "description": "Storage sized to the loads that must ride through an outage, wired to a protected subpanel so backup power reaches those circuits and not the whole house.",
      "image": {
        "src": "https://images.unsplash.com/photo-1742899273038-67ff67477663",
        "alt": "Rows of white battery cells with red and blue terminal caps receding into shallow focus"
      }
    },
    {
      "icon": "Zap",
      "title": "Inverter and Optimizer Design",
      "description": "String, microinverter or optimizer topology chosen by shading pattern, since partial shade on one panel behaves very differently in each configuration.",
      "image": {
        "src": "https://images.unsplash.com/photo-1754620906703-496ec2451744",
        "alt": "Gloved hands wiring a small electrical component onto an aluminium mounting rail on a rooftop"
      }
    },
    {
      "icon": "CircuitBoard",
      "title": "Electrical Panel Upgrades",
      "description": "Service and busbar work to satisfy the interconnection rule, the constraint that most often decides whether an array can be added without a panel change.",
      "image": {
        "src": "https://images.unsplash.com/photo-1635335874521-7987db781153",
        "alt": "Open distribution board with a row of DIN-rail circuit breakers and dense coloured wiring"
      }
    },
    {
      "icon": "Wrench",
      "title": "Racking, Flashing and Mounting",
      "description": "Mounts landed on structure and flashed into the roof covering, so an array adds twenty years of penetrations without adding a single leak path.",
      "image": {
        "src": "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d",
        "alt": "Two pairs of gloved hands lowering a panel edge onto an aluminium mounting rail"
      }
    },
    {
      "icon": "FileCheck",
      "title": "Permitting and Interconnection",
      "description": "Structural and electrical permits, utility application and the inspection sequence, handled in the order that avoids a system sitting finished but not energised.",
      "image": {
        "src": "https://images.unsplash.com/photo-1530951226911-640987bd484c",
        "alt": "A utility electricity meter box on a white stucco wall with the service cable looping in"
      }
    },
    {
      "icon": "Gauge",
      "title": "Monitoring and Maintenance",
      "description": "Production monitoring at panel or string level, so a failing optimizer or a soiled section shows up as a data anomaly instead of a quiet yearly loss.",
      "image": {
        "src": "https://images.unsplash.com/photo-1754619880959-2b0528375883",
        "alt": "A long-handled brush with a wet roller scrubbing across blue solar panels on a flat roof"
      }
    },
    {
      "icon": "Plug",
      "title": "EV Charger Installation",
      "description": "Level 2 charging tied into the same service work as the array, with load calculations that account for the charger and the solar backfeed together.",
      "image": {
        "src": "https://images.unsplash.com/photo-1704475187766-058b6f7b7929",
        "alt": "A small black wall-mounted EV charger on a plain white wall with the cable hanging down"
      }
    }
  ],
  "benefits": [
    {
      "icon": "Zap",
      "title": "Offset the power you already buy",
      "description": "A correctly sized array can cover a meaningful share of a household's annual kilowatt-hours, replacing purchased energy with on-site generation. Output still swings with season and weather, so the offset is measured across a full year rather than any single month."
    },
    {
      "icon": "Gauge",
      "title": "Predictable output over decades",
      "description": "Modules carry published degradation curves, typically around 0.3-0.5% of rated output lost per year after a slightly larger first-year drop, so production twenty years out can be modeled rather than guessed."
    },
    {
      "icon": "ShieldCheck",
      "title": "Resilience when paired with storage",
      "description": "Solar alone shuts down during an outage for line-worker safety. Adding a battery and switchgear with islanding capability keeps selected circuits running while the grid is down."
    },
    {
      "icon": "Leaf",
      "title": "Lower household carbon intensity",
      "description": "Electricity generated on the roof is consumed at the point of use, avoiding the losses that come with moving power across transmission and distribution lines and displacing whatever mix the local grid is running."
    }
  ],
  "options": {
    "title": "Choosing your panels, inverters, and storage",
    "intro": "Most solar decisions come down to three linked choices: the module technology on the roof, how DC power is converted to AC, and whether to add storage. Each affects cost, output on an imperfect roof, and how the system behaves over twenty-plus years. The right combination depends far more on the specific roof planes, shading, and utility tariff than on any single product being objectively best.",
    "items": [
      {
        "name": "Monocrystalline modules",
        "summary": "Single-crystal silicon cells, now the dominant residential module type. Efficiencies commonly fall in the 19-22% range, meaning more watts per square meter of roof and fewer panels to reach a given system size. Published degradation rates typically run about 0.3-0.5% per year.",
        "bestFor": "Limited usable roof area relative to consumption",
        "lifespan": "25-30+ years",
        "considerations": [
          "Historically the highest cost per watt of the common module types, though the premium over older polycrystalline has largely disappeared",
          "Best power density, so the highest output where usable roof area is the binding constraint",
          "Generally a modestly better temperature coefficient and low-light response than legacy polycrystalline modules, which are now rare in residential work"
        ]
      },
      {
        "name": "String inverter system",
        "summary": "Panels are wired in series into one or more strings feeding a single central inverter, usually mounted near the service panel. This is the simplest and least expensive conversion architecture, and it carries high-voltage DC from the roof down to the inverter.",
        "bestFor": "Simple, unshaded roofs with one or two planes",
        "lifespan": "10-15 years (inverter)",
        "considerations": [
          "Least expensive inverter option and a single point of service, but also a single point of failure",
          "A string's output is pulled down toward its weakest module, so partial shading hurts disproportionately unless DC optimizers are added",
          "Most jurisdictions require module-level rapid shutdown on rooftop arrays, so some per-module hardware is usually needed even with a string inverter"
        ]
      },
      {
        "name": "Microinverters or module-level electronics",
        "summary": "Microinverters convert DC to AC at each panel; DC optimizers instead condition each module's output and still feed a central string inverter. Either way every module tracks its own maximum power point, so shading on one panel no longer drags down its neighbors and different roof planes can be combined into one system.",
        "bestFor": "Complex roofs, partial shading, or mixed orientations",
        "lifespan": "20-25 years",
        "considerations": [
          "Higher upfront hardware cost per watt than a plain central string inverter",
          "Per-panel monitoring isolates faults quickly, but the electronics sit under the modules, so service means roof access",
          "Microinverter warranties commonly run around 25 years, roughly matching module life, while optimizer systems still include a string inverter with a shorter service life"
        ]
      },
      {
        "name": "Lithium battery storage",
        "summary": "Commonly lithium iron phosphate chemistry, sized in usable kilowatt-hours with a separate continuous kilowatt power rating. Stores daytime surplus for evening use and, with the right switchgear, provides backup during grid outages.",
        "bestFor": "Outage resilience or low export credit rates",
        "lifespan": "10-15 years",
        "considerations": [
          "Adds substantial upfront cost, usually the largest single option on a quote",
          "Warranted throughput or cycle count and retained-capacity terms matter as much as headline kWh capacity",
          "Continuous kW rating limits what can run at once, and islanding switchgear plus a critical-loads subpanel are usually required"
        ]
      }
    ]
  },
  "process": [
    {
      "title": "Site assessment and consumption analysis",
      "description": "Twelve months of utility bills establish annual kWh use and load patterns. A roof inspection confirms structure, rafter spacing, remaining roof life, and available planes, while a shade study maps obstructions across the seasons. The main service panel is checked for busbar capacity to accept a solar backfeed."
    },
    {
      "title": "System design and production modeling",
      "description": "Array layout, module count, and inverter architecture are set against the measured roof planes and shading. Modeling software produces month-by-month kWh estimates using local weather data, and the design is checked against setback, fire-access, and rapid-shutdown code requirements as well as the utility's interconnection limits."
    },
    {
      "title": "Permitting and utility interconnection",
      "description": "Structural and electrical plans go to the local building authority, and a separate interconnection application goes to the utility. Utility approval to energize is a distinct step from the building permit, and its timeline is set by the utility. Some jurisdictions require a stamped engineering review or a service upgrade before approval."
    },
    {
      "title": "Installation, inspection, and commissioning",
      "description": "Racking is anchored to structural members with every penetration flashed and sealed, modules are mounted and wired, and the inverter, disconnects, and any battery are tied into the service panel. After the jurisdiction's inspection and the utility's permission to operate, the system is commissioned and monitoring is verified against the modeled production."
    }
  ],
  "costFactors": [
    {
      "factor": "System size in kilowatts DC",
      "detail": "Cost scales primarily with how many panels are installed, because modules, racking, wiring, and labor hours all grow with array size. Sizing is driven by annual kWh consumption, usable roof area, and how much of the bill the homeowner wants to offset, so a household that heats with electricity or charges an EV will need a materially larger array than one that does not."
    },
    {
      "factor": "Inverter architecture and rapid shutdown",
      "detail": "A single string inverter is the least expensive electronics package but works best when panels in a string share similar sun conditions. Microinverters or DC optimizers add per-module hardware cost, and that premium buys per-panel monitoring, code-required rapid shutdown, and tolerance for shading and mixed roof orientations. Roofs with dormers, chimneys, or multiple planes usually push the design toward module-level electronics."
    },
    {
      "factor": "Roof condition, material, and complexity",
      "detail": "Racking must be anchored into structural members and every penetration flashed and sealed. Standing-seam metal accepts clamps with no penetrations at all and mounts quickly; slate and clay tile are slow, fragile, and demand specialized hooks. Steep pitch, multiple planes, and limited safe access all add labor hours, and a roof near the end of its life is generally replaced before panels go on, since removing and reinstalling an array later is a separate cost."
    },
    {
      "factor": "Battery storage and backup scope",
      "detail": "Storage is usually the single largest optional line item. Cost tracks usable kilowatt-hours of capacity and the continuous power rating of the battery inverter, plus the switchgear needed to island from the grid. Backing up a few essential circuits through a critical-loads subpanel costs far less than whole-home backup, which may also require a smart panel or a main-panel upgrade."
    },
    {
      "factor": "Electrical upgrades and interconnection requirements",
      "detail": "The main service panel must have enough busbar capacity to accept a solar backfeed breaker under the utility and code rules that apply locally. Older or fully loaded panels often need a service upgrade, a line-side tap, or a busbar derate. Interconnection applications, production metering, engineering review, and permit and inspection fees vary widely by jurisdiction and can add both cost and weeks or months of schedule."
    }
  ],
  "faqs": [
    {
      "q": "How many panels will my home actually need?",
      "a": "Start with annual kilowatt-hour consumption, which appears on twelve months of utility bills, rather than a rule of thumb about house size. A designer then models how many kWh each panel will produce on that specific roof, accounting for orientation, tilt, latitude, local weather data, and shading, then divides the target offset by that per-panel yield. Two identical-looking homes can need very different arrays: an all-electric house with a heat pump and an EV may use two to three times the electricity of a gas-heated neighbor. The roof is often the real constraint, since only planes with adequate unshaded area and acceptable orientation can be used."
    },
    {
      "q": "Does my roof face the wrong way for solar?",
      "a": "In the northern hemisphere, south-facing planes produce the most, but east- and west-facing roofs typically still deliver roughly 80 to 85% of a south-facing array's annual output, which is often perfectly viable. Pitch matters less than most people expect across a broad range of angles. Shading is the bigger issue: a chimney, vent stack, or tree that clips part of the array for a few hours a day can cut production disproportionately on a plain string system, which is exactly where microinverters or DC optimizers earn their added cost by isolating the affected modules. A site assessment should include a shade study across the full year, not just a summer afternoon."
    },
    {
      "q": "What happens to my power when the grid goes out?",
      "a": "A standard grid-tied system without storage shuts down automatically during an outage. This is a code requirement known as anti-islanding, and it exists so the array cannot energize utility lines that crews are repairing. To keep power during an outage you need a battery plus equipment that can disconnect the home from the grid and form its own stable microgrid. Most homeowners back up a defined set of critical loads such as the refrigerator, well pump, internet, and a few lighting and outlet circuits through a subpanel, because whole-home backup requires far more battery power and capacity."
    },
    {
      "q": "How long do panels last, and do they lose output over time?",
      "a": "Crystalline silicon modules commonly carry 25 to 30 year performance warranties and often keep producing usefully beyond that at reduced output. Manufacturers publish an annual degradation rate, typically in the range of 0.3 to 0.5% per year for quality monocrystalline modules after a slightly larger first-year drop, so an array may still deliver roughly 85 to 90% of its original output after 25 years. These are industry-typical ranges rather than guarantees; the specific module datasheet and warranty govern. The panels are usually not the first thing to need attention: string inverters commonly have a 10 to 15 year service life and may need replacement once during the array's lifetime, while microinverters generally carry warranties of around 25 years."
    },
    {
      "q": "How does net metering affect what solar is worth to me?",
      "a": "Net metering rules determine what exported kilowatt-hours are credited at, and after system cost they are the biggest variable in the economics. Under full retail net metering, exported energy offsets imported energy at the same rate, so the grid effectively acts as a battery. Many utilities have moved to net billing or export-rate structures that credit exports at a lower wholesale or avoided-cost rate, sometimes varying by time of day; under those structures self-consumption becomes more valuable, which strengthens the case for storage or for shifting large loads into daylight hours. These tariffs, along with any incentive programs, vary by location and change over time, so verify the rules currently in force with your utility and check current local programs before assuming any payback figure."
    }
  ]
};

export default solar;
