// Landscaping — HousingNeeds vertical content.
//
// Content only. Structure and styling live in _components/HnVerticalPage.jsx
// and housingneeds.css, so editing this file changes copy without touching layout.
//
// To point the CTA at a real destination, set the URL in _data/site.js
// (HN_QUOTE_BASE) or replace quoteUrlFor("landscaping") with a literal URL.

import { quoteUrlFor } from "../site";

const landscaping = {
  "images": {
    "hero": {
      "src": "https://images.unsplash.com/photo-1729058015948-592a8e4a1772",
      "alt": "Landscaped residential yard with a healthy lawn and layered garden beds"
    },
    "benefit": {
      "src": "https://images.unsplash.com/photo-1719324924230-63781a3f18b9",
      "alt": "Well-kept garden beds and greenery beside a manicured lawn"
    },
    "detail": {
      "src": "https://images.unsplash.com/photo-1665764188918-d1a2ff925dd6",
      "alt": "Paved walkway winding through planted beds in a landscaped yard"
    }
  },
  "slug": "landscaping",
  "name": "Landscaping",
  "accent": "lime",
  "icon": "Sprout",
  "eyebrow": "Landscaping solutions",
  "headline": "A yard that works as one living system",
  "headlineAccent": "living system",
  "subheadline": "A landscape is not just plants — it is grading, drainage, soil, irrigation, and hardscape working together, and a weakness in any one of them undermines the rest. Understanding how those pieces interact makes it far easier to judge where money is well spent: on the lawn you see, or on the water management and soil work underneath it.",
  "answer": "Landscaping is grading, drainage, soil, irrigation and hardscape working as one system, and a weakness in any one of them undermines the planting on top of it. Money usually goes further underneath than on show: sod gives a usable lawn within weeks, seeding takes 1-2 seasons to mature, artificial turf lasts about 8-15 years, and a drought-tolerant xeriscape takes 2-3 seasons to fill in but is long-lived once established.",
  "heroPoints": [
    "Sod vs seed vs turf compared",
    "Paver and concrete hardscapes explained",
    "Irrigation and drainage detailed"
  ],
  "quoteLabel": "Get a Free Quote",
  "quoteUrl": quoteUrlFor("landscaping"),
  "seo": {
    "title": "Landscaping Guide: Design, Lawns, Hardscaping & Costs",
    "description": "Learn how landscaping projects come together: sod vs seed vs turf, hardscape materials, irrigation zones, xeriscaping, seasonal timing, and what drives cost."
  },
  "services": [
    {
      "icon": "Leaf",
      "title": "Lawn Care and Maintenance",
      "description": "Mowing, edging, fertilization, aeration, and overseeding on a schedule matched to your grass type and region, since cool-season and warm-season lawns peak at different times of year.",
      "image": {
        "src": "https://images.unsplash.com/photo-1458245201577-fc8a130b8829",
        "alt": "Lawn Care and Maintenance"
      }
    },
    {
      "icon": "Sprout",
      "title": "Garden Design and Planting",
      "description": "Bed layouts and plant palettes chosen for your USDA hardiness zone, sun exposure, and soil, so plantings establish and fill in rather than fighting the site from day one.",
      "image": {
        "src": "https://images.unsplash.com/photo-1734303023491-db8037a21f09",
        "alt": "Garden Design and Planting"
      }
    },
    {
      "icon": "Layers",
      "title": "Patios, Walkways and Retaining Walls",
      "description": "Hardscape built on properly compacted base material with drainage behind every wall, because most paver and wall failures trace back to the base and the water, not the surface product.",
      "image": {
        "src": "https://images.unsplash.com/photo-1558904541-efa843a96f01",
        "alt": "Patios, Walkways and Retaining Walls"
      }
    },
    {
      "icon": "Droplets",
      "title": "Irrigation and Sprinkler Systems",
      "description": "Zoned systems that separate turf from beds and sun from shade, with head placement designed for even coverage and smart controllers that adjust run times to weather.",
      "image": {
        "src": "https://images.unsplash.com/photo-1605117882932-f9e32b03fea9",
        "alt": "Irrigation and Sprinkler Systems"
      }
    },
    {
      "icon": "TreePine",
      "title": "Tree and Shrub Planting",
      "description": "Species selected for mature size and placement, planted at the correct depth with root flare exposed — the single detail that most often decides whether a tree thrives or declines.",
      "image": {
        "src": "https://images.unsplash.com/photo-1597201278257-3687be27d954",
        "alt": "Tree and Shrub Planting"
      }
    },
    {
      "icon": "CalendarClock",
      "title": "Seasonal Cleanups",
      "description": "Spring bed preparation, fall leaf removal, pruning at the right point in each plant's cycle, and winterization of irrigation lines before the first hard freeze.",
      "image": {
        "src": "https://images.unsplash.com/photo-1734079692079-aae7e24a7035",
        "alt": "Seasonal Cleanups"
      }
    },
    {
      "icon": "Grid2x2",
      "title": "Sod and Artificial Turf Installation",
      "description": "Soil grading and amendment before natural sod goes down, or engineered base and infill work for synthetic turf, since both products live or die on what is underneath them.",
      "image": {
        "src": "https://images.unsplash.com/photo-1634316888962-75074307f81c",
        "alt": "Sod and Artificial Turf Installation"
      }
    },
    {
      "icon": "Waves",
      "title": "Grading and Drainage Correction",
      "description": "Regrading, French drains, dry creek beds, and downspout extensions that move water away from the foundation instead of letting the yard direct it toward the house.",
      "image": {
        "src": "https://images.unsplash.com/photo-1719324923613-ff0884b031ed",
        "alt": "Grading and Drainage Correction"
      }
    }
  ],
  "benefits": [
    {
      "icon": "Home",
      "title": "Curb Appeal That Buyers Notice",
      "description": "The yard is the first thing anyone sees, and real estate professionals consistently rank landscaping among the exterior projects that show well at resale. A tidy, intentional landscape signals a maintained house before a buyer ever steps inside."
    },
    {
      "icon": "Droplet",
      "title": "Water Use Matched to Your Climate",
      "description": "Zoned irrigation, drip lines in beds, and drought-tolerant plantings in arid regions can substantially cut outdoor water use, which typically accounts for a large share of a household's total in dry western states."
    },
    {
      "icon": "ShieldCheck",
      "title": "Drainage Handled Before It Does Damage",
      "description": "Grading that slopes away from the house and drainage that intercepts runoff protect the foundation, crawlspace, and hardscape. Water problems solved in the yard are far cheaper than the same water addressed in the basement."
    },
    {
      "icon": "Timer",
      "title": "Less Maintenance as the Landscape Matures",
      "description": "Right plant, right place is not a slogan — species suited to their spot need less water, less pruning, and less replacement. A landscape designed around your climate tends to get easier to own each year, not harder."
    },
    {
      "icon": "BadgeCheck",
      "title": "Work That Meets HOA and Local Standards",
      "description": "Many communities regulate lawn condition, plant heights, fence lines, and hardscape materials. Planning against those standards up front avoids the letters, fines, and redo work that improvised projects can invite."
    }
  ],
  "options": {
    "title": "Choosing your lawn approach",
    "intro": "Most homeowners weighing a new lawn are really choosing among a few established approaches, and the right answer depends on climate, budget, water availability, and how quickly you need a usable yard. Each option below trades upfront cost against establishment time, water demand, or ongoing upkeep in a fairly predictable way.",
    "items": [
      {
        "name": "Natural Sod",
        "summary": "Mature grass grown on a turf farm, cut into rolls, and laid over prepared soil. It delivers an instant lawn that can typically be walked on within a few weeks, and it establishes far faster than seed as long as the soil beneath it was properly graded and amended.",
        "bestFor": "Fast results, erosion-prone slopes, and sale-ready yards",
        "lifespan": "Decades with consistent care; usable within weeks",
        "considerations": [
          "The most expensive natural option per square foot, with cost driven as much by soil preparation as by the sod itself",
          "Demands frequent watering during the first several weeks while roots knit into the soil below",
          "Variety selection is limited to what regional turf farms grow, which may not include the best cultivar for a shaded or high-traffic yard"
        ]
      },
      {
        "name": "Seeding or Hydroseeding",
        "summary": "Grass grown in place from seed, either broadcast conventionally or sprayed on in a slurry of seed, mulch, and tackifier. It costs a fraction of sod and offers the widest choice of grass varieties, but the lawn takes one to two full growing seasons to mature.",
        "bestFor": "Large areas, tight budgets, and specific grass varieties",
        "lifespan": "Indefinite once established; 1-2 seasons to mature",
        "considerations": [
          "Timing is critical — cool-season grasses generally establish best in early fall, warm-season grasses in late spring, and seeding outside those windows often fails",
          "Vulnerable to washout, birds, and weed competition while young, so expect some bare patches and follow-up overseeding",
          "The area is effectively off-limits to foot traffic for weeks, which can be impractical for families and pets"
        ]
      },
      {
        "name": "Artificial Turf",
        "summary": "Synthetic grass blades tufted into a drainage-backed mat, installed over a compacted aggregate base with infill brushed between the fibers. It stays green without watering or mowing, which is why it has spread from sports fields into drought-conscious residential yards.",
        "bestFor": "Arid regions, heavy-shade areas, and pet runs",
        "lifespan": "8-15 years typical service life",
        "considerations": [
          "High upfront cost, with proper base preparation making up much of the installed price",
          "Surface temperatures can climb dramatically in direct summer sun, enough to be uncomfortable for bare feet and pets",
          "Some municipalities and HOAs restrict or regulate synthetic turf, particularly in front yards, so rules are worth checking before committing"
        ]
      },
      {
        "name": "Drought-Tolerant Xeriscape",
        "summary": "A designed landscape of native and low-water plants, mulch, gravel, and stone that replaces some or all of the turf entirely. Common across the West, where several water utilities have offered turf-replacement rebates, it trades the lawn aesthetic for dramatically lower water and mowing demands.",
        "bestFor": "Western and arid climates, low-maintenance goals",
        "lifespan": "Long-lived once established; typically 2-3 seasons to fill in",
        "considerations": [
          "Good xeriscape is designed, not just gravel — plant selection, grouping by water need, and drip irrigation determine whether it looks intentional or barren",
          "Upfront design and installation can cost as much as conventional landscaping even though ongoing costs are typically lower",
          "Rebate programs and HOA acceptance vary widely by city and change over time, so current local rules and incentives should be confirmed directly"
        ]
      }
    ]
  },
  "process": [
    {
      "title": "Site Walk and Assessment",
      "description": "The yard is evaluated for sun and shade patterns, soil condition, existing plants worth keeping, and how water actually moves across the property. Slope toward the foundation, soggy low spots, and compacted soil get flagged now, because they constrain everything designed later."
    },
    {
      "title": "Design and Plant Selection",
      "description": "A plan lays out beds, lawn areas, hardscape, and circulation, with plants chosen for the local hardiness zone and the specific microclimates of the yard. This is also where HOA guidelines and any permit requirements — common for retaining walls over a set height — are checked."
    },
    {
      "title": "Grading, Drainage and Hardscape",
      "description": "Heavy work comes first: regrading, drainage lines, and then patios, walkways, and walls built on compacted base material. Doing hardscape before planting means equipment never has to cross finished beds, and the drainage that protects both the plants and the house is in before anything grows."
    },
    {
      "title": "Irrigation and Planting",
      "description": "Irrigation mains and zone valves go in while trenching is still easy, then trees, shrubs, and perennials are planted at correct depth and spacing for their mature size. Turf — sod, seed, or synthetic — typically goes in last so it is not trampled during the rest of the build."
    },
    {
      "title": "Establishment and Handoff",
      "description": "The first weeks decide how well a new landscape takes hold. Watering schedules are set for establishment rather than maintenance, mulch depth is checked, and you get a season-by-season care plan, since new plantings typically need a year or more of attention before they are truly self-sufficient."
    }
  ],
  "costFactors": [
    {
      "factor": "Yard Size and Project Scope",
      "detail": "Cost scales with square footage, but scope matters more than raw area. A maintenance visit, a front-yard refresh, and a full design-build with hardscape and irrigation are entirely different projects, and combining phases in one mobilization is often more economical than spreading them across years."
    },
    {
      "factor": "Slope, Access and Site Conditions",
      "detail": "Steep grades require terracing or retaining walls, and tight side yards can force machine work to be done by hand. Rocky or heavily compacted soil, buried debris, and existing tree roots all slow excavation, which is why two same-sized yards can carry very different labor totals."
    },
    {
      "factor": "Hardscape Material Choice",
      "detail": "Poured concrete, concrete pavers, and natural stone sit at meaningfully different price points, and the base preparation under them is a real share of the installed cost. Pavers typically cost more than broom-finished concrete upfront but can be spot-repaired, while natural stone is usually the premium tier for both material and labor."
    },
    {
      "factor": "Irrigation Zones and Water Supply",
      "detail": "Irrigation cost tracks the number of zones, which is driven by yard layout and water pressure rather than area alone. Separating turf spray from bed drip, adding a smart controller, and the backflow prevention most codes require all add line items — as can trenching to reach a distant corner of the lot."
    },
    {
      "factor": "Region, Climate and Plant Selection",
      "detail": "Regional labor rates, growing seasons, and plant availability move prices noticeably across the country. Mature trees and large specimen plants cost several times what smaller container stock does, and in arid states, converting turf to xeriscape may qualify for utility rebates — programs vary by city and change over time, so current local offerings are worth checking directly."
    }
  ],
  "faqs": [
    {
      "q": "When is the best time of year to start a landscaping project?",
      "a": "It depends on what is being installed. Cool-season lawns in the northern half of the country generally establish best when seeded in early fall, while warm-season grasses in the South prefer late spring. Trees and shrubs typically do well planted in fall or early spring, when roots can grow without summer heat stress. Hardscape can be built almost any time the ground is workable, which is why many designers schedule patio and wall construction for the off-season and planting for the shoulder seasons. Booking design work in winter often means better contractor availability come spring."
    },
    {
      "q": "Is sod or seed the better way to get a new lawn?",
      "a": "Sod buys speed: an instant, weed-free lawn that can usually handle light traffic within a few weeks, which makes it the default for slopes prone to erosion and homes going on the market. Seed costs far less, offers many more grass varieties, and can produce an equally good lawn — but it takes one to two growing seasons, a well-timed planting window, and diligent watering to get there. Either way, most of the outcome is decided by soil preparation before anything green arrives; sod laid over compacted, unamended ground struggles just like seed does."
    },
    {
      "q": "Does landscaping actually add value to my home?",
      "a": "Well-kept landscaping is consistently cited by real estate professionals as one of the stronger exterior contributors to sale appeal, and industry surveys often report healthy cost recovery for projects like lawn care and basic landscape upgrades. That said, no specific return is guaranteed — value depends on the neighborhood, the market, and whether the design fits the house. As a rule, tidy, healthy, low-maintenance landscaping tends to help a sale, while highly personal or maintenance-intensive installations can narrow the buyer pool."
    },
    {
      "q": "What is xeriscaping, and does it mean a yard full of gravel?",
      "a": "Xeriscaping is landscape design built around low water use: grouping plants by water need, favoring natives and drought-tolerant species, improving soil, mulching, and irrigating efficiently — usually with drip lines rather than spray heads. Done well, it is lush and layered, not a sheet of rock; gravel-only 'zeroscapes' are what happens when the plant design is skipped. In many western cities, water utilities have offered rebates for replacing turf with approved xeriscape, though programs and eligible plant lists vary by location and change over time."
    },
    {
      "q": "Do I need a permit or HOA approval for hardscaping?",
      "a": "Often, yes. Many jurisdictions require a permit for retaining walls above a set height — commonly around three to four feet, and sometimes lower when the wall supports a slope or sits near a property line — and engineered drawings may be required beyond that. Grading changes that redirect runoff toward a neighbor can also trigger code issues. Separately, HOAs frequently require architectural review for patios, walls, fences, and even artificial turf or front-yard plant changes. Checking both before breaking ground is far cheaper than modifying finished work."
    }
  ]
};

export default landscaping;
