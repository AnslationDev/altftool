// Interiors — HousingNeeds vertical content.
//
// Content only. Structure and styling live in _components/HnVerticalPage.jsx
// and housingneeds.css, so editing this file changes copy without touching layout.
//
// To point the CTA at a real destination, set the URL in _data/site.js
// (HN_QUOTE_BASE) or replace quoteUrlFor("interiors") with a literal URL.
import { quoteUrlFor } from "../site";

const interiors = {
  "images": {
    "hero": {
      "src": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
      "alt": "Living room with an armchair, framed print and wood flooring"
    },
    "benefit": {
      "src": "https://images.unsplash.com/photo-1616046229478-9901c5536a45",
      "alt": "Living space with a sideboard, round mirror and houseplants"
    },
    "detail": null
  },
  "slug": "interiors",
  "name": "Interiors",
  "accent": "emerald",
  "icon": "PaintRoller",
  "eyebrow": "Interior renovation",
  "headline": "Walls, floors and finishes, done right",
  "headlineAccent": "done right",
  "subheadline": "Interior work is where small tolerances show — a texture patch that reads flat under raking light, a floor transition that telegraphs a subfloor hump, a sheen that highlights every roller lap. Understanding how drywall, paint, flooring, trim and lighting interact helps you sequence a project correctly and judge the finish quality you are paying for.",
  "heroPoints": [
    "Texture and sheen matched to existing",
    "Dust-controlled sanding and prep",
    "Trade-correct project sequencing"
  ],
  "quoteLabel": "Get an interiors quote",
  "quoteUrl": quoteUrlFor("interiors"),
  "seo": {
    "title": "Interior Remodeling Guide: Drywall, Paint, Flooring, Trim and Lighting",
    "description": "How interior finishes actually work: drywall texture matching, primer and sheen selection, LVP vs hardwood vs tile, trim, cabinet refacing and lighting."
  },
  "services": [
    {
      "icon": "Layers",
      "title": "Drywall Repair and Texture Matching",
      "description": "Patching, taping and feathering, then matching the existing texture — the step that decides whether a repair disappears or reads as a bright rectangle.",
      "image": {
        "src": "https://images.unsplash.com/photo-1768839725085-829e6ac7ac26",
        "alt": "Hands holding a wide taping knife loaded with white joint compound against a pale wall"
      }
    },
    {
      "icon": "Paintbrush",
      "title": "Interior Painting",
      "description": "Surface prep, priming and sheen selection by room, with washable finishes where hands and moisture reach and flat where wall imperfections need hiding.",
      "image": {
        "src": "https://images.unsplash.com/photo-1693985120993-e9b203ce7631",
        "alt": "A paint roller pushed upward leaving a wet stripe on a bare interior wall"
      }
    },
    {
      "icon": "Brush",
      "title": "Cabinet Refacing and Painting",
      "description": "Doors and drawer fronts degreased, deglossed and sprayed with a hard-curing finish, since a brushed wall paint on cabinetry will not survive daily contact.",
      "image": {
        "src": "https://images.unsplash.com/photo-1652918320907-f9ec8623ab30",
        "alt": "Teal-green shaker cabinets with brass pulls, marble counters and a subway tile backsplash"
      }
    },
    {
      "icon": "LayoutGrid",
      "title": "Hardwood and LVP Flooring",
      "description": "Plank flooring over a checked and levelled subfloor, with acclimation and expansion gaps set for the material so seasonal movement does not buckle a run.",
      "image": {
        "src": "https://images.unsplash.com/photo-1598718544285-7180f670198b",
        "alt": "Wide-plank golden oak flooring running through a bright white room"
      }
    },
    {
      "icon": "Grid2x2",
      "title": "Tile and Stone Installation",
      "description": "Tile over the right underlayment and movement joints, with waterproofing in wet areas taken up the wall rather than stopped at the floor line.",
      "image": {
        "src": "https://images.unsplash.com/photo-1523413307857-ef24c53571ae",
        "alt": "A hand pressing a white tile into combed adhesive with plastic spacers in the joints"
      }
    },
    {
      "icon": "Ruler",
      "title": "Trim, Molding and Baseboards",
      "description": "Base, casing and crown coped rather than mitred at inside corners, so joints stay tight when the framing moves through the first heating season.",
      "image": {
        "src": "https://images.unsplash.com/photo-1776482128072-5fd43852163b",
        "alt": "Cream hallway with crown moulding, deep door casing and turned stair balusters"
      }
    },
    {
      "icon": "DoorOpen",
      "title": "Interior Door Installation",
      "description": "Pre-hung and slab doors shimmed plumb in the opening, which is what produces an even reveal and a door that stays where it is left.",
      "image": {
        "src": "https://images.unsplash.com/photo-1561111283-8eff0e921cf6",
        "alt": "Tall white four-panel double doors set in a thick moulded architrave above parquet flooring"
      }
    },
    {
      "icon": "Utensils",
      "title": "Kitchen Refresh",
      "description": "Cabinets, counters, backsplash and lighting updated within the existing footprint, avoiding the plumbing and electrical moves that drive a full remodel.",
      "image": {
        "src": "https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
        "alt": "White kitchen with an island, globe pendant lights, marble backsplash and stainless range"
      }
    },
    {
      "icon": "Bath",
      "title": "Bathroom Remodel",
      "description": "Tub, shower, vanity and tile with the waterproofing membrane and ventilation detailed first, because that is what the finished surfaces depend on.",
      "image": {
        "src": "https://images.unsplash.com/photo-1782805153002-96e099970a9d",
        "alt": "Bathroom with a floating oak vanity, rounded mirror, wall-hung toilet and marble walls"
      }
    }
  ],
  "benefits": [
    {
      "icon": "Sparkles",
      "title": "Finish quality you can actually see",
      "description": "Interior work is judged at arm's length under changing light. Feathering joint compound wide, sanding between coats and choosing the right sheen are what separate a surface that looks new from one that looks patched."
    },
    {
      "icon": "ClipboardCheck",
      "title": "Correct sequencing saves rework",
      "description": "Trades run in a specific order — demo, rough-in, drywall, prime, then flooring and trim in the order the materials require, then final paint. Doing it out of order usually means recutting trim or repainting scuffed walls."
    },
    {
      "icon": "Wind",
      "title": "Dust and disruption control",
      "description": "Vacuum-assisted sanders, temporary plastic containment barriers and negative-air setups keep gypsum and tile dust from migrating through return ducts and settling in rooms nobody is working in."
    },
    {
      "icon": "Gauge",
      "title": "Substrate problems caught early",
      "description": "Moisture readings on slabs, subfloor deflection checks and probing for soft drywall around wet areas reveal issues that would otherwise cup a new floor or bubble fresh paint within a season."
    }
  ],
  "options": {
    "title": "Choosing your interior flooring and finishes",
    "intro": "Most interior decisions come down to how a material handles moisture, foot traffic and light — and how forgiving it is of an imperfect subfloor. Manufacturer wear-layer and finish warranties generally cover replacement of defective material, not the labour to pull and reinstall it, so the ranges below reflect typical in-home service life rather than warranty terms.",
    "items": [
      {
        "name": "Luxury vinyl plank (LVP/SPC)",
        "summary": "A rigid or flexible multilayer plank with a printed decor and clear wear layer over a vinyl or stone-composite core, usually installed as a floating click-lock floor over an attached or separate pad.",
        "bestFor": "Basements, kitchens, baths and homes with pets or heavy traffic",
        "lifespan": "10-25 years, depending heavily on wear layer thickness",
        "considerations": [
          "Wear layer thickness is the number that matters — thin residential-grade layers scuff and dull in busy walkways far sooner than thicker commercial-grade ones, and the plank can never be sanded or refinished",
          "It is waterproof as a surface but is not a waterproofing system; standing water still reaches the subfloor through seams and perimeter expansion gaps",
          "Floating installations telegraph subfloor humps and dips, so flatness correction is often the hidden cost of an otherwise inexpensive floor"
        ]
      },
      {
        "name": "Solid and engineered hardwood",
        "summary": "Solid strip or plank milled from a single piece of wood, or engineered planks with a hardwood wear layer over a plywood or composite core that is far more dimensionally stable across humidity swings.",
        "bestFor": "Living areas and bedrooms where repairability and long-term appeal matter",
        "lifespan": "50-100+ years for solid; 20-40 years for engineered",
        "considerations": [
          "Solid hardwood is generally not recommended below grade or directly over slabs without a proper subfloor and vapour retarder, and wood should acclimate to the home's in-service temperature and humidity before installation or it will gap in the dry season and cup in the humid one",
          "Engineered floors can only be sanded as many times as the wear layer allows — thin veneers may permit one light refinish or none at all",
          "Site-finished floors give custom color and a seamless surface but need cure time and ventilation; prefinished planks are walkable almost immediately but show a micro-bevel at every seam"
        ]
      },
      {
        "name": "Porcelain and ceramic tile",
        "summary": "Fired clay-body tile set in thinset mortar over a rigid, deflection-rated substrate, with grout joints and movement joints sized to the tile format and the space.",
        "bestFor": "Bathrooms, showers, entries and mudrooms",
        "lifespan": "50+ years for the tile itself; grout and sealant maintenance on a far shorter cycle",
        "considerations": [
          "Performance depends almost entirely on what is underneath — cement backer board or an uncoupling membrane over a subfloor stiff enough for the tile format being used",
          "Large-format tile demands a flatter substrate and usually a levelling system; lippage between tile edges is the most common finished-job complaint",
          "Showers need a continuous waterproofing layer behind the tile rather than merely water-resistant board, and that layer is invisible once finished and easy to shortcut"
        ]
      },
      {
        "name": "Cabinet refacing versus full replacement",
        "summary": "Refacing keeps the existing cabinet boxes and replaces doors, drawer fronts and hinges while skinning the face frames; replacement swaps the entire cabinetry and allows a new layout.",
        "bestFor": "Kitchens with sound, well-configured boxes and a dated door style",
        "lifespan": "15-25 years for a quality reface; 25-50 years for new cabinetry",
        "considerations": [
          "Refacing only pays off if the boxes are square, dry and structurally sound — swollen particle-board bottoms under a sink are not worth saving",
          "It cannot change the footprint, so awkward layouts, dead corners and existing appliance openings stay exactly as they are",
          "Painting existing cabinets is the cheapest path but demands thorough degreasing, deglossing and a bonding primer; skipping that is why brushed-on cabinet paint chips at the door edges within a year"
        ]
      }
    ]
  },
  "process": [
    {
      "title": "Walkthrough and substrate assessment",
      "description": "Rooms are measured and existing conditions documented: subfloor type and flatness, moisture readings on slabs, drywall texture identification, trim profiles that need matching, and the condition of anything hiding behind a vanity or under a sink."
    },
    {
      "title": "Selections and scope agreement",
      "description": "Materials, colors, sheens, tile layouts and trim profiles are locked in before work starts. Late changes to a selection are a common cause of schedule slip, because lead times on tile, cabinetry and specialty trim can run long."
    },
    {
      "title": "Protection, demo and rough work",
      "description": "Containment goes up, floors and openings are protected, and demolition is followed by any framing, blocking, electrical or plumbing adjustments. Wet-area waterproofing and drywall hanging and finishing happen in this phase."
    },
    {
      "title": "Finishes, punch list and cleanup",
      "description": "Priming, flooring, trim, cabinetry, fixtures and final coats go in a deliberate order, then the space is walked under good light for nail holes, caulk lines, sheen inconsistencies and hardware alignment before final cleaning."
    }
  ],
  "costFactors": [
    {
      "factor": "Substrate condition and prep required",
      "detail": "Prep is the largest hidden variable. A wall with failing paint layers, wallpaper adhesive or water-damaged board needs skim coating or replacement before finishing; a floor outside flatness tolerance needs grinding or self-levelling compound. None of it shows in the finished result, but it can rival the cost of the visible work."
    },
    {
      "factor": "Material grade and format",
      "detail": "Within any category the spread is wide: wear layer thickness in LVP, wear layer thickness and species in engineered wood, rectified versus standard-edge porcelain, and MDF versus solid hardwood trim. Larger tile formats and wider planks also raise labour because they are less forgiving of substrate variation."
    },
    {
      "factor": "Cut complexity and detail work",
      "detail": "Labour scales with the number of edges and transitions, not just square footage. Herringbone and diagonal layouts, stair treads, curved walls, multi-piece built-up crown, coped corners and tile around niches and windows all multiply cutting and fitting time relative to a simple open rectangle."
    },
    {
      "factor": "Scope of what sits behind the finish",
      "detail": "Whether the job touches plumbing, electrical or framing changes the trade count and the permitting picture. Moving a shower drain, adding circuits for new lighting or opening a wall pulls in inspections and specialists that a pure surface refresh avoids entirely. Permit rules vary by jurisdiction and change over time, so confirm what applies locally."
    },
    {
      "factor": "Occupancy, access and containment",
      "detail": "Working in a lived-in home with pets, upper floors without lift access, or narrow stairwells adds protection, staging and daily cleanup time. Phasing work so a household keeps one usable bathroom or kitchen costs more than doing the same scope in an empty house in a single pass."
    }
  ],
  "faqs": [
    {
      "q": "Why does my drywall patch still show even though it was sanded smooth?",
      "a": "Two things usually cause it. The first is texture mismatch: orange peel and knockdown are sprayed and depend on nozzle size, air pressure and how thin the mud is, while skip trowel is applied by hand, so close is not the same as matched. The second is flashing — joint compound is far more porous than the surrounding painted wall, so an unprimed patch absorbs topcoat differently and reads as a dull or shiny shape under raking light. A sound repair is feathered wide, textured to match, spot-primed, then painted corner to corner rather than dabbed."
    },
    {
      "q": "What paint sheen should I use in each room?",
      "a": "Flat and matte hide surface imperfection best and suit ceilings and low-traffic walls, but they burnish when scrubbed. Eggshell is the usual living-area compromise, and satin holds up in kitchens, hallways and children's rooms where walls actually get wiped. Semi-gloss or gloss belongs on trim, doors and cabinetry because the harder film resists handling and cleans easily. Higher sheen reflects more light and therefore exaggerates every dent and roller mark, so smoother surfaces earn higher sheen."
    },
    {
      "q": "Do I need to prime, or is paint-and-primer-in-one enough?",
      "a": "Self-priming paints work fine on sound, previously painted surfaces in a similar color. They do not substitute for a dedicated primer over bare drywall or fresh joint compound, over glossy or oil-based existing finishes, over bare wood and MDF, or when blocking stains. Water stains, smoke, tannin bleed from knots and marker need a stain-blocking shellac or oil-based primer; standard latex will let them ghost back through no matter how many coats go on."
    },
    {
      "q": "In what order should flooring, trim and paint be done?",
      "a": "A common professional sequence is drywall, then prime and first coat of wall paint, then flooring, then baseboard and trim, then caulk and the final wall and trim coats. That keeps flooring installers from cutting into finished baseboard and lets painters cut a clean line to a floor that is already protected. The main variation is installing baseboard before the floor and adding a shoe molding afterward, which suits tile and floating floors because the shoe covers the required perimeter expansion gap."
    },
    {
      "q": "How should interior lighting be planned during a remodel?",
      "a": "Think in three layers: ambient light that fills the room, task light where work actually happens, and accent light for depth. Recessed cans alone leave countertops in your own shadow, which is why under-cabinet lighting matters in kitchens and why vanity lighting works better at roughly face height on either side of a mirror than directly overhead. Keep color temperature consistent across a sightline — roughly 2700K to 3000K reads warm and residential, and mixing temperatures in adjoining fixtures is immediately noticeable. Dimmer wiring and any added circuits belong in the rough-in phase, before drywall closes the walls."
    }
  ]
};

export default interiors;
