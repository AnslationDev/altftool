// Gutters — HousingNeeds vertical content.
//
// Content only. Structure and styling live in _components/HnVerticalPage.jsx
// and housingneeds.css, so editing this file changes copy without touching layout.
//
// To point the CTA at a real destination, set the URL in _data/site.js
// (HN_QUOTE_BASE) or replace quoteUrlFor("gutters") with a literal URL.
import { quoteUrlFor } from "../site";

const gutters = {
  "images": {
    "hero": {
      "src": "https://images.unsplash.com/photo-1654531015087-8cc3d04d1b2d",
      "alt": "Gutter and downspout running along a roof edge against a clear sky"
    },
    "benefit": {
      "src": "https://images.unsplash.com/photo-1665442348932-6e16d72fe163",
      "alt": "Fallen leaves collected in a roof gutter"
    },
    "detail": {
      "src": "https://images.unsplash.com/photo-1569898773055-2f2b6e97e1ed",
      "alt": "White downspout on a clapboard wall beside a brick chimney"
    }
  },
  "slug": "gutters",
  "name": "Gutters",
  "accent": "teal",
  "icon": "Waves",
  "eyebrow": "Gutters and drainage",
  "headline": "Move roof water away before it finds the foundation",
  "headlineAccent": "finds the foundation",
  "subheadline": "A gutter system is really a drainage system: it has to catch what the roof sheds, carry it at the right pitch, and discharge it far enough from the house to matter. Sizing, downspout placement, and the condition of the fascia and drip edge decide whether it works or just looks tidy.",
  "heroPoints": [
    "Seamless runs formed on site",
    "5-inch and 6-inch K-style",
    "Downspouts sized to roof area"
  ],
  "quoteLabel": "Get a gutter quote",
  "quoteUrl": quoteUrlFor("gutters"),
  "seo": {
    "title": "Gutter Guide: Sizing, Guards and Drainage",
    "description": "Learn how seamless aluminum gutters, 5-inch vs 6-inch sizing, downspouts and leaf guards protect your home's foundation, fascia and siding from water damage."
  },
  "services": [
    {
      "icon": "Waves",
      "title": "Seamless Gutter Installation",
      "description": "Aluminium coil rolled to length on site, so the only joints in the run are at corners and outlets rather than every ten feet as with sectional gutter.",
      "image": {
        "src": "https://images.unsplash.com/photo-1677945451878-de79f98149c9",
        "alt": "Close-up of a galvanized K-style gutter run with a hanger bracket clipped over the lip"
      }
    },
    {
      "icon": "Leaf",
      "title": "Gutter Guards and Leaf Protection",
      "description": "Micro-mesh or reverse-curve covers chosen for the actual debris load, since a guard sized for oak leaves will still clog with pine needles or shingle grit.",
      "image": {
        "src": "https://images.unsplash.com/photo-1762347870313-8a677d853feb",
        "alt": "Yellow fallen leaves resting on top of a perforated metal mesh panel, none passing through"
      }
    },
    {
      "icon": "Droplets",
      "title": "Downspouts and Drainage Extensions",
      "description": "Sizing and placing outlets so the roof area feeding each one drains freely, then carrying discharge far enough out to keep water off the foundation.",
      "image": {
        "src": "https://images.unsplash.com/photo-1635359800970-90b35af94a4a",
        "alt": "A zinc downspout with an elbow shoe at grade discharging onto pavers beside a block wall"
      }
    },
    {
      "icon": "Sparkles",
      "title": "Gutter Cleaning",
      "description": "Clearing troughs and flushing downspouts to confirm flow, catching the standing water and separated seams that go unnoticed until an interior wall stains.",
      "image": {
        "src": "https://images.unsplash.com/photo-1675415782443-32685e238b1c",
        "alt": "A leafy sapling growing out of the soil-packed end of a black gutter on a tiled roof"
      }
    },
    {
      "icon": "Wrench",
      "title": "Gutter Repair and Resealing",
      "description": "Re-sealing end caps, miters and outlets with a lap sealant that stays flexible, and replacing hangers that have pulled loose from softened fascia.",
      "image": {
        "src": "https://images.unsplash.com/photo-1600093652298-e57ee8aba769",
        "alt": "Rainwater sheeting over the lip of a gutter at a shingled roof edge and down the downspout"
      }
    },
    {
      "icon": "Ruler",
      "title": "Repitching and Realignment",
      "description": "Resetting the fall toward the outlet, roughly a quarter inch per ten feet, which is what stops the standing water that corrodes a trough from the inside.",
      "image": {
        "src": "https://images.unsplash.com/photo-1567361808976-260065224468",
        "alt": "A hand holding a spirit level with green bubble vials against a timber surface"
      }
    },
    {
      "icon": "Hammer",
      "title": "Fascia and Drip Edge Repair",
      "description": "Replacing the board the gutter actually hangs on, plus drip edge that directs runoff into the trough instead of behind it where it rots the fascia.",
      "image": {
        "src": "https://images.unsplash.com/photo-1780445392484-5fb7d5610708",
        "alt": "A worker's hands driving a fastener into the edge of a metal roofing trim panel"
      }
    },
    {
      "icon": "BadgeCheck",
      "title": "Copper and Half-Round Gutters",
      "description": "Soldered copper and half-round profiles for period homes, detailed for the patina and expansion behaviour that painted aluminium never has to account for.",
      "image": {
        "src": "https://images.unsplash.com/photo-1704750660778-db55114fa0fc",
        "alt": "Two verdigris-patinated copper downpipes with copper collars against a pale stone wall"
      }
    },
    {
      "icon": "Sprout",
      "title": "Underground and French Drains",
      "description": "Buried piping that takes downspout discharge away from the footing entirely, for lots where surface extensions cannot get water far enough from the house.",
      "image": {
        "src": "https://images.unsplash.com/photo-1759967495843-3edc416114a9",
        "alt": "A gravel-filled drainage trench cut across a green lawn running toward trees"
      }
    }
  ],
  "benefits": [
    {
      "icon": "House",
      "title": "Foundation and basement protection",
      "description": "A roof can shed hundreds of gallons in a single storm. Concentrated at the drip line, that water saturates backfill soil, raises hydrostatic pressure against foundation walls, and shows up as seepage, efflorescence or cracking. Controlled discharge well away from the wall is the cheapest form of foundation protection there is."
    },
    {
      "icon": "ShieldCheck",
      "title": "Siding, fascia and soffit stay dry",
      "description": "Water sheeting off an unguttered or overflowing edge splashes back onto siding and wicks into fascia board and soffit. Rotted fascia is a common and avoidable repair, and it usually traces back to a gutter that overflowed, sagged, or was hung without a drip edge directing runoff into the trough."
    },
    {
      "icon": "Sprout",
      "title": "Landscaping and hardscape preservation",
      "description": "Uncontrolled roof runoff erodes mulch beds, exposes root systems, stains masonry and undermines walkways, patios and driveway edges. Properly placed downspouts and extensions spread that discharge to where the grade can carry it away instead of letting it fall in one concentrated line."
    },
    {
      "icon": "Snowflake",
      "title": "Fewer freeze-thaw and ice problems",
      "description": "Debris-packed gutters hold water that freezes, and the added weight can pull hangers loose or bend the front lip. Clear, correctly pitched troughs with adequate downspout capacity drain before a freeze and reduce standing ice at the eave, though true ice dams are an attic insulation and ventilation issue rather than a gutter defect."
    }
  ],
  "options": {
    "title": "Choosing a gutter material and profile",
    "intro": "Two decisions drive the outcome: what the gutter is made of, and what shape and size it is. K-style profiles carry more water than half-round of the same nominal width and suit most modern homes, while half-round is traditional, sheds debris better by shape, and is common on historic or high-end architecture. Alongside material you will also choose between 5-inch and 6-inch troughs and between 2x3 and 3x4 downspouts.",
    "items": [
      {
        "name": "Seamless aluminum (K-style)",
        "summary": "The default choice for most homes: roll-formed on site from painted coil, light enough to hang easily, rust-proof, and available in a wide range of baked-on colors. Sold in .027 and heavier .032 gauge, with the thicker gauge holding its shape better under ladder pressure and ice load.",
        "bestFor": "Most residential roofs, color-matched to trim",
        "lifespan": "20-30 years",
        "considerations": [
          "Dents more easily than steel, especially in thinner .027 gauge and where ladders are set against the front lip",
          "The factory coil finish can be repainted, but it needs cleaning, etching and the right primer to bond, and the result rarely matches the original baked-on coating",
          "Thermal movement is real on long runs, making correct hanger spacing and end allowances important"
        ]
      },
      {
        "name": "Galvanized or galvalume steel",
        "summary": "Heavier and considerably more dent-resistant than aluminum, which matters under heavy snow load, falling branches or hail. Galvalume's aluminum-zinc coating outlasts plain galvanized noticeably, but any steel gutter depends on its coating staying intact.",
        "bestFor": "Snow country and impact-prone eaves",
        "lifespan": "15-25 years galvanized, 25-35 years galvalume",
        "considerations": [
          "Scratches and cut edges can begin to corrode, so seams, outlets and end caps need attention",
          "Heavier stock means more hangers and careful fastening into sound fascia or rafter tails",
          "Fewer installers run steel coil on site, so seamless steel is less widely available than aluminum"
        ]
      },
      {
        "name": "Copper (K-style or half-round)",
        "summary": "A lifetime material that develops a brown then green patina rather than failing outright. Copper systems are typically soldered rather than sealed at the joints, so installation skill matters as much as the metal. Usually paired with half-round troughs and round downspouts on period homes.",
        "bestFor": "Historic homes and long-horizon investments",
        "lifespan": "50-100 years",
        "considerations": [
          "The most expensive option by a wide margin, in both material and skilled labor",
          "Runoff can stain adjacent masonry, stone and painted surfaces as the patina develops",
          "Needs compatible fasteners and flashing, since contact with aluminum or unprotected steel drives galvanic corrosion"
        ]
      },
      {
        "name": "Vinyl sectional",
        "summary": "Snap-together PVC sections in fixed lengths. Genuinely DIY-friendly and it will never rust or dent, but it is sectional by nature, so it has joints along every run instead of only at corners and outlets.",
        "bestFor": "Detached structures, short runs, budget work",
        "lifespan": "10-20 years",
        "considerations": [
          "Every joint is a potential leak point, and gasketed seams commonly fail before the vinyl itself does",
          "Becomes brittle and prone to cracking in prolonged cold, and fades or chalks under strong UV exposure",
          "Sags between hangers under ice or standing-water load more readily than metal"
        ]
      }
    ]
  },
  "process": [
    {
      "title": "Assessment and measurement",
      "description": "Roof area, pitch and the number of valleys feeding each eave determine required capacity, not just the length of the run. This stage also checks existing fascia and drip edge for rot or gaps, notes where water currently overflows, and identifies where discharge can realistically be directed given the grade."
    },
    {
      "title": "System design and material selection",
      "description": "Capacity is matched to the roof: trough size, profile, downspout size and downspout count. As a common industry guide, one downspout per 30 to 40 feet of run is typical, and a 3x4 downspout has roughly twice the cross-sectional area of a 2x3. Material, gauge, color and any leaf protection are chosen here."
    },
    {
      "title": "Removal, fabrication and installation",
      "description": "Old gutter comes down first so fascia can be inspected and repaired and drip edge corrected. Seamless runs are formed on site to exact length, hung on hidden hangers at roughly 24 to 36 inch spacing (tighter in snow regions), and set to a slight fall toward each outlet, commonly about a quarter-inch of drop per 10 feet."
    },
    {
      "title": "Water testing and handover",
      "description": "Running water through the finished system reveals what a visual check cannot: standing water from a flat spot, weeping at a sealed miter, an overwhelmed outlet, or discharge pooling too close to the wall. Extensions are set, splash blocks placed, and cleaning intervals explained for that specific roof and tree cover."
    }
  ],
  "costFactors": [
    {
      "factor": "Linear footage, building height and access",
      "detail": "Total run length sets the baseline, but height and access often matter more. Second and third-story eaves, steep or cut-up rooflines, and areas needing staging over landscaping, decks or sloped ground all slow the work substantially compared with a single-story eave a ladder reaches from flat lawn."
    },
    {
      "factor": "Material and metal thickness",
      "detail": "Aluminum, steel and copper sit at very different price points, and within aluminum the step from .027 to .032 gauge costs more for meaningfully better dent resistance and rigidity. Copper also requires soldered joints and specialist labor, which widens the gap well beyond the raw metal cost."
    },
    {
      "factor": "Trough size, profile and downspout capacity",
      "detail": "Moving from 5-inch to 6-inch K-style adds roughly 40 percent more carrying capacity along with wider coil, larger outlets and usually 3x4 downspouts. Half-round profiles and round downspouts typically cost more than K-style for the same footage. Large roofs, steep pitches and valley-fed eaves push toward the higher-capacity setup."
    },
    {
      "factor": "Leaf protection system",
      "detail": "Guards range from inexpensive drop-in screens and foam inserts to professionally installed micro-mesh and reverse-curve systems that can approach the cost of the gutters themselves. The differentiators are filtration fineness, frame rigidity, how the product attaches at the roof edge, and whether it sheds shingle grit and pine needles rather than only large leaves."
    },
    {
      "factor": "Fascia condition and drainage termination",
      "detail": "Rotted fascia board, missing or misaligned drip edge and damaged soffit must be corrected before hangers can bite into sound wood, and that carpentry is often only discovered once the old gutter comes off. At the discharge end, work varies enormously between a splash block, a surface extension, and buried solid pipe run to daylight or a dry well."
    }
  ],
  "faqs": [
    {
      "q": "Should I get 5-inch or 6-inch gutters?",
      "a": "It depends on how much water reaches the eave, not on the size of the house. A 6-inch K-style trough carries roughly 40 percent more water than a 5-inch and normally pairs with 3x4 downspouts instead of 2x3. Large roof planes, steep pitches that speed runoff, valleys that dump two planes onto one eave, and regions with intense short-duration rainfall all argue for 6-inch. If the gutters are clean and correctly pitched but still overflow at the same spot in every heavy storm, undersizing is the likely cause."
    },
    {
      "q": "How often do gutters actually need cleaning?",
      "a": "Twice a year is the common baseline: late spring after seed pods and blossoms drop, and late fall after leaf drop. Homes under overhanging or evergreen trees often need three or four visits, because pine needles mat into a dense filter water cannot pass. Watch the practical signs rather than the calendar: water spilling over the front lip, dirt streaks on the fascia, plants growing in the trough, and downspouts that trickle instead of gushing during rain."
    },
    {
      "q": "Are gutter guards worth it?",
      "a": "They reduce cleaning frequency substantially, but they do not eliminate maintenance, and any product sold as permanently maintenance-free deserves skepticism. Micro-mesh blocks the finest debris including shingle grit, though the mesh surface itself needs occasional brushing. Reverse-curve systems use surface tension to draw water around a nose, which handles leaves well but can be overwhelmed in heavy downpours or fouled by needles. Foam inserts are cheap and simple but tend to trap grit and break down under UV within a few seasons."
    },
    {
      "q": "Why does water overflow or run behind my gutters, and can it be repaired?",
      "a": "Four causes are common, and each has a different fix: a clog in the trough or downspout, incorrect pitch that leaves water standing mid-run instead of moving to the outlet, undersized troughs or too few downspouts that overflow only in heavy rain, and missing or misaligned drip edge that lets runoff wick back behind the gutter and down the fascia. Roughly a quarter-inch of fall per 10 feet is the usual pitch target when re-hanging a run. Isolated leaks, a few failed hangers, a sagging section or a split miter are all worth repairing on an otherwise sound system. Widespread pinholes, corrosion along the trough bottom, or a system simply undersized for the roof are better solved by replacement."
    },
    {
      "q": "Do gutters cause ice dams?",
      "a": "No. Ice dams form when heat escaping into the attic melts snow on the upper roof, the meltwater refreezes at the cold eave, and the resulting ridge backs water up under the shingles, which happens with or without a gutter present. The real remedies are air sealing, insulation and ventilation; heat cable in the trough and downspout only manages the symptom by keeping a drainage channel open. Gutters do take collateral damage from ice, so clear troughs, adequate downspout capacity and securely fastened hangers reduce what the ice can pull loose."
    }
  ]
};

export default gutters;
