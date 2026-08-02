// Siding — HousingNeeds vertical content.
//
// Content only. Structure and styling live in _components/HnVerticalPage.jsx
// and housingneeds.css, so editing this file changes copy without touching layout.
//
// To point the CTA at a real destination, set the URL in _data/site.js
// (HN_QUOTE_BASE) or replace quoteUrlFor("siding") with a literal URL.
import { quoteUrlFor } from "../site";

const siding = {
  "images": {
    "hero": {
      "src": "https://images.unsplash.com/photo-1591926164531-2bbccbbb0443",
      "alt": "Horizontal lap siding meeting a stone veneer base course"
    },
    "benefit": {
      "src": "https://images.unsplash.com/photo-1575397205849-f5e0a03323a3",
      "alt": "House clad in yellow vinyl siding with shuttered windows"
    },
    "detail": {
      "src": "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
      "alt": "Shingled house exterior with a wraparound porch"
    }
  },
  "slug": "siding",
  "name": "Siding",
  "accent": "sky",
  "icon": "Layers",
  "eyebrow": "Siding solutions",
  "headline": "Siding that sheds water and holds its color",
  "headlineAccent": "holds its color",
  "subheadline": "Siding is a drainage system first and a finish second — what happens behind the panels decides whether a wall lasts decades or rots quietly. This guide covers the material choices, the details that actually keep water out, and the variables that move the price.",
  "heroPoints": [
    "Vinyl, fiber cement, engineered wood",
    "Weather barrier and flashing detailing",
    "Sheathing checked before panels go on"
  ],
  "quoteLabel": "Get a siding quote",
  "quoteUrl": quoteUrlFor("siding"),
  "seo": {
    "title": "Siding Guide: Materials, Install and Costs",
    "description": "Compare vinyl, insulated vinyl, fiber cement and engineered wood siding: typical lifespans, R-value, fade and impact resistance, and what drives siding cost."
  },
  "services": [
    {
      "icon": "Home",
      "title": "Vinyl Siding Installation",
      "description": "Panels hung loose on their nailing hem so they can expand and contract freely, which is the single detail that prevents the buckling seen on face-nailed jobs.",
      "image": {
        "src": "https://images.unsplash.com/photo-1574359411659-15573a27fd0c",
        "alt": "Two workers on extension ladders working the upper wall of a lavender clapboard house"
      }
    },
    {
      "icon": "Layers",
      "title": "Fiber Cement Siding",
      "description": "Cement board planks with a gap and flashing at every horizontal joint, cut and fastened to the manufacturer schedule so the finish warranty stays intact.",
      "image": {
        "src": "https://images.unsplash.com/photo-1643733901610-53f7ef2e9f7f",
        "alt": "Close-up of smooth white horizontal lap siding boards with crisp shadow lines"
      }
    },
    {
      "icon": "TreePine",
      "title": "Engineered Wood Siding",
      "description": "Treated wood-composite planks that take a nail like lumber but resist the moisture cycling and insect damage that ends the life of natural cedar.",
      "image": {
        "src": "https://images.unsplash.com/photo-1684841761246-bd116e0bf94c",
        "alt": "Close-up of white-painted vertical wood-grain-embossed board panels with a trim joint"
      }
    },
    {
      "icon": "Thermometer",
      "title": "Insulated Siding Upgrade",
      "description": "Contoured foam backing bonded to the panel, adding continuous R-value across the studs and breaking the thermal bridge a cavity-only assembly leaves open."
    },
    {
      "icon": "Hammer",
      "title": "Siding Repair and Panel Replacement",
      "description": "Swapping damaged panels mid-wall using a zip tool, matching profile and colour run so the repair does not read as a patch from the street.",
      "image": {
        "src": "https://images.unsplash.com/photo-1646640381839-02748ae8ddf0",
        "alt": "A worker in an orange vest using a cordless drill on vertical timber cladding beside a window"
      }
    },
    {
      "icon": "Wind",
      "title": "Storm and Hail Siding Damage",
      "description": "Assessing cracked, chalked or punctured cladding after a storm, including the impact damage that only shows at a raking light angle.",
      "image": {
        "src": "https://images.unsplash.com/photo-1753044162000-749540981d37",
        "alt": "Weathered white-grey wood shingle siding with one shingle missing, exposing dark boards"
      }
    },
    {
      "icon": "Droplets",
      "title": "House Wrap and Moisture Barrier",
      "description": "The drainage plane behind the cladding: wrap lapped shingle-style, seams taped, and integrated with window flashing so water always has a path back out."
    },
    {
      "icon": "Frame",
      "title": "Soffit and Fascia Replacement",
      "description": "Rebuilding the eave edge, including vented soffit panels that supply the attic intake air the ridge vent depends on to work at all.",
      "image": {
        "src": "https://images.unsplash.com/photo-1771955927699-29ccd0af59f0",
        "alt": "Building corner seen from below with dark metal fascia and ribbed metal soffit panels"
      }
    },
    {
      "icon": "Ruler",
      "title": "Exterior Trim and Corner Detailing",
      "description": "Corner posts, J-channel, window surrounds and frieze boards — the terminations where water gets in and where a siding job visibly succeeds or fails.",
      "image": {
        "src": "https://images.unsplash.com/photo-1767890034867-06027e836ed0",
        "alt": "Building corner with cream clapboard siding, red corner trim and decorative eave brackets"
      }
    }
  ],
  "benefits": [
    {
      "icon": "ShieldCheck",
      "title": "A managed water path",
      "description": "Siding is not waterproof and is not meant to be. A correctly built wall assumes wind-driven water will get behind the panels, then drains and dries it through the weather barrier and flashing before it reaches sheathing or framing."
    },
    {
      "icon": "Gauge",
      "title": "Measurable energy improvement",
      "description": "Foam backing or added continuous insulation reduces thermal bridging through the studs, which are the weakest thermal path in a framed wall. Gains are modest but continuous, and they help most on older homes with thin or settled cavity insulation."
    },
    {
      "icon": "Sun",
      "title": "Color that survives UV",
      "description": "Fade resistance varies widely by product and color. Panels with color through the body, factory-applied finishes, and dark colors formulated with heat-reflective or UV-stable pigments hold appearance far longer than budget lines or field paint on a south wall."
    },
    {
      "icon": "Timer",
      "title": "Lower ongoing upkeep",
      "description": "Modern cladding trades annual scraping and painting for periodic washing and occasional caulk renewal at trim joints. Painted products still need repainting eventually, but on a cycle measured in a decade or more rather than a few years."
    }
  ],
  "options": {
    "title": "Choosing your siding material",
    "intro": "Most homeowners are choosing between four systems. The right answer usually comes down to climate, how much impact and moisture the walls take, whether you want a paintable surface, and how the wall is detailed behind the panels — not just the look of the sample board.",
    "items": [
      {
        "name": "Vinyl siding",
        "summary": "Extruded PVC panels that hang loosely on their nailing hem so they can expand and contract with temperature. The most widely installed cladding in North America, available in profiles from clapboard to shake and vertical board-and-batten.",
        "bestFor": "Budget-conscious replacements and low-maintenance walls",
        "lifespan": "20-40 years",
        "considerations": [
          "Most panels are co-extruded with color through the body, so scratches show less than on painted cladding, though darker colors and lower-grade formulations can still fade under strong UV exposure",
          "Thin panels dent and crack from hail or ladder impact, and PVC becomes more brittle in deep cold",
          "Panels must be nailed loose with the fastener centered in the slot and never face-caulked at the ends; nailing tight is the single most common cause of buckled, wavy walls"
        ]
      },
      {
        "name": "Insulated vinyl siding",
        "summary": "Vinyl with expanded polystyrene foam contoured to the back of each panel, filling the void behind the profile. The foam adds continuous insulation over the framing and makes the panel noticeably more rigid.",
        "bestFor": "Older homes with thermal bridging or uneven walls",
        "lifespan": "25-40 years",
        "considerations": [
          "Typically adds roughly R-2 to R-3.5 of continuous insulation depending on profile and foam thickness — real, but not a substitute for cavity or attic insulation",
          "The rigid backer resists denting and hides minor wall irregularities better than hollow vinyl",
          "Costs meaningfully more per square than standard vinyl, and the added thickness changes how trim and J-channel must be built out around windows and doors"
        ]
      },
      {
        "name": "Fiber cement siding",
        "summary": "Portland cement, sand and cellulose fiber formed into lap boards, panels or shingles. Sold primed for field painting or with a factory-applied finish, and dimensionally very stable once installed.",
        "bestFor": "Hail, wildfire and high-moisture climates",
        "lifespan": "30-50 years",
        "considerations": [
          "Rated noncombustible in most product lines and highly impact resistant, but heavy — installation is slower and often needs a larger crew, which shows up in labor cost",
          "Cutting releases respirable crystalline silica, so shears or dust-collecting saws and respiratory protection are required on site",
          "Field-primed board must be painted within the manufacturer's window and repainted roughly every 10-15 years; factory finishes generally go longer. In wet climates a rainscreen gap behind the board significantly improves drying"
        ]
      },
      {
        "name": "Engineered wood siding",
        "summary": "Wood strands or fibers bonded with resins and treated for moisture and termite resistance, then formed into lap boards, panels and trim with an embossed wood grain.",
        "bestFor": "A wood look with lighter weight and easier handling",
        "lifespan": "20-30 years",
        "considerations": [
          "Cuts with standard woodworking tools and weighs far less than fiber cement, which speeds installation on tall or complex walls",
          "Every field cut must be sealed and the manufacturer's grade and roof clearances respected — untreated exposed edges are where failures start",
          "It is still a wood-based product, so paint film and caulk maintenance are not optional, and prolonged saturation from sprinklers or grade contact will cause swelling"
        ]
      }
    ]
  },
  "process": [
    {
      "title": "Assessment and measurement",
      "description": "Walls are measured by elevation and the existing cladding, trim details, window depths and problem areas are documented. Soft spots, staining below windows and interior signs of moisture are checked, since these predict what will be found behind the siding."
    },
    {
      "title": "Material and detail selection",
      "description": "Material, profile, color and trim package are chosen together, because trim depth and J-channel receivers depend on panel thickness. Soffit ventilation and clearances at grade, roof lines and decks are settled before anything is ordered."
    },
    {
      "title": "Tear-off and substrate repair",
      "description": "Old siding comes off in sections so the wall is not left open longer than necessary. Damaged sheathing and framing are replaced, then a weather-resistive barrier is installed shingle-lapped from the bottom up and integrated with window, door and penetration flashing."
    },
    {
      "title": "Installation and close-out",
      "description": "Panels are hung to the manufacturer's fastening and expansion specifications, corners and openings are trimmed, and sealant is applied only where the system calls for it — never closing off the drainage paths. Final walkthrough covers cleanup, a magnetic nail sweep and care instructions."
    }
  ],
  "costFactors": [
    {
      "factor": "Wall area and building geometry",
      "detail": "Pricing follows squares of wall surface — a square being 100 square feet — but complexity matters as much as area. Dormers, gables, bay windows, multiple stories and tight lot access all add staging, cutting and waste that a simple rectangular ranch does not."
    },
    {
      "factor": "Material and product tier",
      "detail": "Within any one material there is a wide spread. Panel thickness, foam backing, factory finish versus field paint, and specialty profiles such as shake or board-and-batten each raise both the material cost and the labor hours to install it."
    },
    {
      "factor": "Condition of the sheathing and framing",
      "detail": "Nobody knows what is behind the old siding until it comes off. Rotted sheathing, insect damage or failed original flashing has to be corrected before new cladding goes on, and this is the most common reason a siding project changes price mid-job."
    },
    {
      "factor": "Trim, openings and detailing",
      "detail": "Every window, door, light fixture, hose bib and vent is a labor event requiring flashing, trim and precise cuts. A house with many small openings costs more per square foot than one with the same wall area and fewer, larger ones."
    },
    {
      "factor": "Tear-off, disposal and added scope",
      "detail": "Removing and hauling existing cladding costs time and landfill fees, and multiple layers or older materials needing special handling increase that. Related work bundled into the same opening of the wall — house wrap upgrade, soffit and fascia, or a rainscreen gap — changes the scope and the total."
    }
  ],
  "faqs": [
    {
      "q": "Can new siding be installed over the old siding?",
      "a": "It is sometimes done, but it hides the two things that matter most: the condition of the sheathing and the integrity of the weather barrier and flashing. Layering also builds the wall out, which forces furring and deeper trim around every window and makes proper flashing harder to achieve. Full tear-off costs more up front and is the only way to confirm the wall behind is dry and sound, which is why it is the standard recommendation on a full replacement."
    },
    {
      "q": "How much will new siding actually cut my energy bills?",
      "a": "Less than most marketing implies, but the effect is real and continuous. Standard vinyl adds almost no thermal value on its own — roughly R-0.6 — while insulated vinyl or added rigid foam typically contributes about R-2 to R-3.5 of continuous insulation across the whole wall, including over the studs where cavity insulation cannot reach. Air sealing done while the wall is open often matters as much as the R-value itself. Incentive programs for insulation and envelope work vary by location and change over time, so check current local and utility programs rather than assuming any credit applies."
    },
    {
      "q": "Vinyl or fiber cement — which should I choose?",
      "a": "Fiber cement is heavier, noncombustible, much more impact resistant, and holds a painted finish for a longer, more wood-like look, but it costs more to install and eventually needs repainting. Vinyl is lighter, cheaper, never needs paint, and hides scratches because the color runs through the panel body, but it can dent or crack from hail and becomes brittle in extreme cold. Climate is often the deciding factor: severe hail, wildfire exposure or intense sun push toward fiber cement, while cost sensitivity and mild conditions favor vinyl or insulated vinyl."
    },
    {
      "q": "Why shouldn't the J-channel around my windows be caulked shut?",
      "a": "J-channel is a drainage and trim component, not a seal. Water that gets behind the siding is meant to run down inside the channel and exit at the bottom, so caulking the channel tight to the window traps that water in the wall. Sealing belongs at the flashing and window flange behind the siding, not at the visible trim seam. If someone proposes caulking every J-channel joint to stop a leak, that is a sign the flashing underneath is the real problem."
    },
    {
      "q": "How do I know whether to repair or replace my siding?",
      "a": "Isolated cracked or wind-lifted panels on an otherwise sound wall are a repair, though color-matching a discontinued product line is often the hard part. Replacement is the better call when you see widespread warping or buckling, soft or spongy spots when you press on the wall, paint failing repeatedly in the same areas, or interior signs such as staining and musty odors on exterior walls. Those symptoms usually mean moisture is getting past the cladding, and patching panels does nothing about the barrier behind them."
    }
  ]
};

export default siding;
