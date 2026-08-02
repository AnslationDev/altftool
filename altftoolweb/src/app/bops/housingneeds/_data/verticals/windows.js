// Windows — HousingNeeds vertical content.
//
// Content only. Structure and styling live in _components/HnVerticalPage.jsx
// and housingneeds.css, so editing this file changes copy without touching layout.
//
// To point the CTA at a real destination, set the URL in _data/site.js
// (HN_QUOTE_BASE) or replace quoteUrlFor("windows") with a literal URL.
import { quoteUrlFor } from "../site";

const windows = {
  "images": {
    "hero": {
      "src": "https://images.unsplash.com/photo-1509644851169-2acc08aa25b5",
      "alt": "Multi-pane windows overlooking a garden"
    },
    "benefit": {
      "src": "https://images.unsplash.com/photo-1509644851169-2acc08aa25b5",
      "alt": "Window seat beneath a multi-pane window looking onto a garden"
    },
    "detail": null
  },
  "slug": "windows",
  "name": "Windows",
  "accent": "violet",
  "icon": "AppWindow",
  "eyebrow": "Window replacement",
  "headline": "Better windows start with the numbers on the label",
  "headlineAccent": "the numbers on the label",
  "subheadline": "The right replacement window balances glass performance, frame material, and installation method for your specific climate and openings. Understanding U-factor, SHGC, and full-frame versus insert installation is what separates a window that pays you back from one that merely looks new.",
  "heroPoints": [
    "U-factor and SHGC explained",
    "Full-frame and insert options",
    "Frame materials compared honestly"
  ],
  "quoteLabel": "Get a window quote",
  "quoteUrl": quoteUrlFor("windows"),
  "seo": {
    "title": "Window Replacement Guide: Glass & U-Factor",
    "description": "How double vs triple pane, low-E coatings, argon fill, U-factor, SHGC and frame material affect windows, plus full-frame vs insert replacement."
  },
  "services": [
    {
      "icon": "AppWindow",
      "title": "Full-Frame Window Replacement",
      "description": "Removing the unit down to the rough opening so the sill can be flashed and the frame reinsulated, which is the only route when the existing frame has rot.",
      "image": {
        "src": "https://images.unsplash.com/photo-1768321910174-6f55899299a2",
        "alt": "Room stripped back to studs with exposed insulation and two window openings mid-renovation"
      }
    },
    {
      "icon": "PanelsTopLeft",
      "title": "Insert (Pocket) Replacement",
      "description": "A new unit set inside the sound existing frame, keeping interior and exterior trim intact and trading a small amount of glass area for a far faster install.",
      "image": {
        "src": "https://images.unsplash.com/photo-1751486403820-7cf45ebec080",
        "alt": "A newly fitted window seen from inside, still wearing protective film and yellow install tape"
      }
    },
    {
      "icon": "Thermometer",
      "title": "Double and Triple Pane Upgrades",
      "description": "Low-E coatings and argon fill matched to the climate and to which direction the window faces, since the right coating differs on a north and a south wall.",
      "image": {
        "src": "https://images.unsplash.com/photo-1514994792087-578fe80d0ff9",
        "alt": "Close-up of metal window frame profiles and glazing beads with a sunset reflected in the panes"
      }
    },
    {
      "icon": "Droplets",
      "title": "Foggy Glass and Seal Failure Repair",
      "description": "Replacing the sealed insulating unit alone when the perimeter seal has failed, which restores clarity and R-value without touching the frame or trim.",
      "image": {
        "src": "https://images.unsplash.com/photo-1464519586905-a8c004d307cc",
        "alt": "A dark-framed multi-pane window with the lower panes heavily clouded by condensation"
      }
    },
    {
      "icon": "DoorOpen",
      "title": "Egress and Basement Windows",
      "description": "Units sized to the code minimum for clear opening and sill height, with the window well and drainage that make a finished basement bedroom legal.",
      "image": {
        "src": "https://images.unsplash.com/photo-1694161375074-e11da93b199e",
        "alt": "A precast concrete below-grade window well with an angled glazed panel at ground level"
      }
    },
    {
      "icon": "Frame",
      "title": "Bay and Bow Window Installation",
      "description": "Projecting assemblies that carry real load, needing cable or knee-brace support and a properly roofed and flashed head to stay weathertight.",
      "image": {
        "src": "https://images.unsplash.com/photo-1763333409545-909dd6b8fda4",
        "alt": "The angled bay corner of an older house with three windows catching warm evening light"
      }
    },
    {
      "icon": "Blinds",
      "title": "Sliding and Patio Door Replacement",
      "description": "Door units set dead level on a supported sill, because a patio door that racks even slightly will drag on the track and leak air at the interlock.",
      "image": {
        "src": "https://images.unsplash.com/photo-1721902024148-287438cf3e05",
        "alt": "An empty modern room with wood floors and a large sliding glass balcony door at dusk"
      }
    },
    {
      "icon": "Ruler",
      "title": "Custom and Specialty Shapes",
      "description": "Arched, round-top and trapezoid units templated on site, so the glass and frame follow the opening the house actually has rather than a catalogue size.",
      "image": {
        "src": "https://images.unsplash.com/photo-1714963810770-1506ea5806b7",
        "alt": "A circular window with a grid of glazing bars set in a dark wall, green foliage outside"
      }
    },
    {
      "icon": "Wind",
      "title": "Weatherproofing and Trim",
      "description": "Sill pan, flashing tape, backer rod and sealant at the perimeter, plus interior casing — the details that decide whether a good window performs.",
      "image": {
        "src": "https://images.unsplash.com/photo-1783587616528-a37972228563",
        "alt": "A hammer and chisel resting on a stripped, part-repainted window sash and sill"
      }
    }
  ],
  "benefits": [
    {
      "icon": "Gauge",
      "title": "Lower Heating and Cooling Load",
      "description": "Windows are typically the weakest thermal point in a wall assembly. Moving from clear single glazing or older uncoated double glazing to a low-E, gas-filled unit substantially cuts conductive heat loss and unwanted radiant gain."
    },
    {
      "icon": "Sun",
      "title": "Control Over Solar Heat",
      "description": "SHGC determines how much solar heat ends up inside the room. A low SHGC keeps west-facing rooms from overheating, while a higher SHGC lets south-facing glass contribute free winter heat in heating-dominated climates."
    },
    {
      "icon": "ShieldCheck",
      "title": "Reduced Condensation and Rot Risk",
      "description": "Warmer interior glass surfaces and warm-edge spacers keep the glass above the dew point under a wider range of conditions, which limits the winter condensation that damages sills, stools and surrounding finishes."
    },
    {
      "icon": "Volume2",
      "title": "Comfort, Noise and UV Protection",
      "description": "Fewer drafts and warmer interior glass reduce the cold-wall effect near windows. Laminated or dissimilar-thickness glass damps outside noise more effectively than simply adding a pane, and low-E coatings block much of the UV that fades flooring and fabric, though no coating stops fading entirely."
    }
  ],
  "options": {
    "title": "Choosing your window frame and glass",
    "intro": "Two decisions drive most of a window's performance and price: what the frame is made of, and what is sealed inside the glass unit. Frame material sets structural behavior, thermal performance and maintenance profile, while the glazing package — pane count, low-E coating type, gas fill and spacer — sets the U-factor and SHGC printed on the NFRC label. Neither choice has a universal winner; the right answer depends on climate, orientation, opening size and how long you plan to keep the house.",
    "items": [
      {
        "name": "Vinyl (uPVC) Frames",
        "summary": "Extruded PVC frames with hollow, sometimes foam-filled chambers. The most widely installed replacement material, offering good thermal performance for the money with no painting or refinishing required.",
        "bestFor": "Cost-conscious whole-house replacement",
        "lifespan": "20-30 years",
        "considerations": [
          "Vinyl expands and contracts far more than glass with temperature swings, which stresses seals over time and matters most on large, dark, sun-exposed units",
          "Color choices are limited and vinyl is not designed to be repainted; darker exterior finishes absorb more heat and require heat-stabilized formulations",
          "Frame and sash profiles are bulkier than fiberglass or clad-wood, so visible glass area is slightly smaller for the same rough opening"
        ]
      },
      {
        "name": "Fiberglass (Pultruded) Frames",
        "summary": "Frames pultruded from glass fibers and resin. The material expands at nearly the same rate as the glass it holds, which reduces long-term stress on the insulated glass unit's perimeter seal.",
        "bestFor": "Large openings and harsh climates",
        "lifespan": "30-50 years",
        "considerations": [
          "Costs meaningfully more than vinyl for a comparable glass package",
          "Fewer manufacturers and fewer local installers carry it, which can limit competitive bids and long-term parts availability",
          "Factory finishes are durable and paintable but may need refinishing after a couple of decades of heavy sun exposure"
        ]
      },
      {
        "name": "Wood and Aluminum-Clad Wood",
        "summary": "A wood interior for warmth and a stainable finish, usually protected outside by extruded aluminum or fiberglass cladding. The traditional choice for historic homes and high-end interior woodwork.",
        "bestFor": "Period homes and stained interiors",
        "lifespan": "30-50 years with maintenance",
        "considerations": [
          "Interior wood must be kept sealed or finished, and any breach in the cladding or persistent interior condensation can lead to hidden rot",
          "Typically the highest cost tier, and clad units are heavy, which accelerates hardware wear on large operating sashes",
          "Bare unclad wood exteriors need repainting on a regular cycle, generally every several years depending on exposure"
        ]
      },
      {
        "name": "Double vs Triple Pane Glazing",
        "summary": "Double pane with a low-E coating and argon fill is the mainstream baseline. Triple pane adds a third lite, a second coated surface and a second gas cavity, sometimes with krypton where cavities are too narrow for argon to perform well.",
        "bestFor": "Cold climates and noisy sites",
        "lifespan": "Sealed unit typically 15-25 years",
        "considerations": [
          "Triple pane cuts U-factor substantially but returns diminish; in mild climates the payback period can exceed the seal life of the unit itself",
          "The added weight strains hinges, balances and operators on large casements and double-hungs and may require upgraded hardware",
          "A third pane slightly reduces visible light transmittance, and gas fill migrates out slowly over time in any sealed unit regardless of pane count"
        ]
      }
    ]
  },
  "process": [
    {
      "title": "Assessment and Measurement",
      "description": "Each opening is measured at several points for width, height and diagonal squareness, and the existing frame, sill and surrounding wall are checked for rot, water staining and out-of-square conditions. This is what determines whether insert or full-frame replacement is appropriate."
    },
    {
      "title": "Specification and Ordering",
      "description": "Style (double-hung, casement, slider, awning or fixed), frame material, glass package, grille pattern and hardware are chosen per opening, with U-factor and SHGC targets set by climate zone and window orientation. Custom-sized units are then built to order, which is where most of the lead time sits."
    },
    {
      "title": "Removal and Preparation",
      "description": "Old sashes and, for full-frame work, the frame and interior stops come out. The rough opening is cleaned, damaged framing repaired, and sill pan flashing with a sloped or back-dammed sill established so any water that gets past the exterior drains back out."
    },
    {
      "title": "Installation, Sealing and Finish",
      "description": "Units are set plumb, level and square and shimmed at the fastening points so the frame is not bowed, then checked for smooth operation and even reveals before final fastening. Perimeter gaps are insulated with low-expansion foam, integrated with the wall's water-resistive barrier, then trimmed and sealed with an appropriate exterior sealant."
    }
  ],
  "costFactors": [
    {
      "factor": "Insert vs Full-Frame Installation",
      "detail": "An insert reuses the existing frame and leaves trim intact, so labor and finish work stay low. Full-frame means stripping to the rough opening, repairing any rot found, re-flashing and rebuilding interior and exterior trim — typically adding substantially more labor per opening, but it is the only correct choice when the existing frame is rotted, racked or out of square."
    },
    {
      "factor": "Frame Material and Glass Package",
      "detail": "Vinyl, fiberglass and clad-wood generally sit in ascending price tiers for the same opening, and the glazing multiplies it. Adding a second low-E coating, upgrading argon to krypton, or moving from double to triple pane each raise unit cost, as does the tempered, laminated or impact-rated glass required by code in hazardous locations near doors, floors and tubs and in high-wind or coastal zones."
    },
    {
      "factor": "Size, Shape and Operating Style",
      "detail": "Price scales with square footage, and non-rectangular or oversized units fall outside standard production runs. Fixed picture windows cost less per square foot because they carry no operating hardware or weatherstripping, while casements and awnings use crank operators and multi-point locks, so they typically cost more than a comparable slider or double-hung."
    },
    {
      "factor": "Condition of the Opening and Surrounding Wall",
      "detail": "Rotted sills, damaged framing, failed flashing or a missing sill pan discovered during removal must be corrected before the new window goes in. Older homes may also require lead-safe work practices, and changing an opening size pulls in header, framing, drywall and siding work well beyond the window itself."
    },
    {
      "factor": "Access, Story Height and Exterior Cladding",
      "detail": "Upper-story openings need ladders, staging or lifts, which slows every unit. The exterior finish matters just as much: cutting back and re-integrating stucco, brick or fiber cement around a full-frame replacement is far more involved than removing and refitting a few courses of vinyl or wood siding."
    }
  ],
  "faqs": [
    {
      "q": "What do U-factor and SHGC actually mean on the window label?",
      "a": "U-factor is the rate of non-solar heat transfer through the whole assembly — glass, spacer and frame together — so lower is better, with double-pane low-E argon units commonly landing near 0.30 and triple-pane units typically reaching roughly 0.15 to 0.20. SHGC, the Solar Heat Gain Coefficient, is the fraction of solar heat that ends up inside, on a scale of 0 to 1. In cooling-dominated climates you generally want both numbers low, while in heating-dominated climates a low U-factor paired with a moderate-to-higher SHGC on south-facing glass supplies useful free winter heat. Both are certified on the same NFRC label, which is the only apples-to-apples way to compare brands."
    },
    {
      "q": "Is triple pane glass worth the extra cost?",
      "a": "That depends far more on climate and orientation than on marketing. Triple pane meaningfully lowers U-factor and raises interior glass surface temperature, which improves comfort near the window and reduces condensation in cold northern climates, though for street noise laminated or dissimilar-thickness glass usually does more than a third pane alone. In mild or cooling-dominated regions the energy savings over a good double-pane low-E argon unit are small enough that simple payback can exceed the 15-25 year typical seal life of the glass unit. The extra weight also stresses hardware on large operating sashes, so triple pane is often best deployed selectively rather than house-wide."
    },
    {
      "q": "Why do my windows fog between the panes, and can that be fixed?",
      "a": "Haze or moisture trapped between the panes means the perimeter seal on the insulated glass unit has failed and the desiccant is saturated, so gas fill has escaped and humid air is getting in; that unit has lost much of its insulating advantage and cleaning cannot reach the affected surfaces. This is different from condensation on the room-side surface, which usually signals high indoor humidity rather than a defective window. Seal failure is often repairable, since many frames allow the sealed glass unit or the whole sash to be replaced while keeping the existing frame. Check the manufacturer's written warranty first, as seal failure is commonly covered for a defined period."
    },
    {
      "q": "Should I choose insert replacement or full-frame?",
      "a": "Insert or pocket replacement fits a new unit inside the existing frame and is appropriate when that frame is square, dry, solid and properly flashed, since it is faster and preserves original interior and exterior trim. The trade-off is that the new frame nests inside the old one, so you give up roughly half an inch to an inch or more of glass area per side depending on the frames involved, and any hidden water problem stays hidden. Full-frame replacement removes everything to the rough opening, which is the only way to inspect and repair the sill and framing, install a proper sill pan and tie the flashing into the wall's water-resistive barrier. Soft wood, water staining, or sashes that bind because the frame has racked all point toward full-frame."
    },
    {
      "q": "How long does the work take, and what lifespans are realistic?",
      "a": "The installation is usually the short part — a crew commonly completes several to around ten straightforward insert openings in a day — but custom-built units typically carry a lead time of several weeks or more from order to delivery, and full-frame work with exterior finish repairs runs considerably longer per opening. In service, vinyl frames commonly last 20-30 years, fiberglass and well-maintained clad-wood 30-50 years, while the insulated glass units inside any of them typically hold their seal 15-25 years. Installation quality dominates those ranges: a window that is not shimmed square, flashed correctly and drained properly fails long before the material wears out. Efficiency incentives and rebates vary by location and change over time, so verify which programs are currently active in your area rather than assuming any particular credit exists."
    }
  ]
};

export default windows;
