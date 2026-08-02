// Roofing — HousingNeeds vertical content.
//
// Content only. Structure and styling live in _components/HnVerticalPage.jsx
// and housingneeds.css, so editing this file changes copy without touching layout.
//
// To point the CTA at a real destination, set the URL in _data/site.js
// (HN_QUOTE_BASE) or replace quoteUrlFor("roofing") with a literal URL.
import { quoteUrlFor } from "../site";

const roofing = {
  "images": {
    "hero": {
      "src": "https://images.unsplash.com/photo-1635424824849-1b09bdcc55b1",
      "alt": "Roofer fastening asphalt shingles on a residential roof"
    },
    "benefit": {
      "src": "https://images.unsplash.com/photo-1726589004565-bedfba94d3a2",
      "alt": "Roofing crew working from scaffolding on a tiled roof"
    },
    "detail": {
      "src": "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
      "alt": "Shingled house with a covered porch seen from the lawn"
    }
  },
  "slug": "roofing",
  "name": "Roofing",
  "accent": "orange",
  "icon": "HardHat",
  "eyebrow": "Roofing solutions",
  "headline": "A roof system that sheds water and breathes",
  "headlineAccent": "breathes",
  "subheadline": "A roof is not just shingles — it is decking, underlayment, flashing, and ventilation working as one system, and a failure in any layer shortens the life of the rest. Understanding how those layers interact makes it far easier to judge whether a repair, a re-roof, or a full tear-off is the honest answer.",
  "heroPoints": [
    "Tear-off vs overlay explained",
    "Flashing and ventilation detailed",
    "Storm damage documented properly"
  ],
  "quoteLabel": "Get a roofing quote",
  "quoteUrl": quoteUrlFor("roofing"),
  "seo": {
    "title": "Roofing Guide: Materials, Repairs and Costs",
    "description": "Learn how roof systems work: asphalt vs metal, tear-off vs overlay, underlayment, flashing, ventilation, storm damage, and what really drives roofing costs."
  },
  "services": [
    {
      "icon": "Home",
      "title": "Asphalt Shingle Roof Replacement",
      "description": "Full tear-off down to the decking, then new underlayment, starter course, field shingles and ridge cap installed as one system rather than a patched assembly.",
      "image": {
        "src": "https://images.unsplash.com/photo-1635424709961-f3a150459ad4",
        "alt": "Two roofers in harnesses kneeling on a dark asphalt-shingle roof, one working with a nail gun"
      }
    },
    {
      "icon": "Layers",
      "title": "Metal Roof Installation",
      "description": "Standing seam or exposed-fastener panels sized for the roof's expansion range, with clips and seams detailed so thermal movement never works the fasteners loose.",
      "image": {
        "src": "https://images.unsplash.com/photo-1518736346281-76873166a64a",
        "alt": "Dark grey pressed-metal tile roofing panels in steep diagonal perspective with crisp ribs"
      }
    },
    {
      "icon": "LayoutPanelTop",
      "title": "Flat and Low-Slope Roofing",
      "description": "TPO, EPDM or modified bitumen membranes for pitches below 2:12, where shingles cannot shed water fast enough and seams carry the whole waterproofing load.",
      "image": {
        "src": "https://images.unsplash.com/photo-1758304481667-71d545c91241",
        "alt": "Aerial view of long industrial buildings with white single-ply membrane low-slope roofs"
      }
    },
    {
      "icon": "Droplets",
      "title": "Roof Leak Repair",
      "description": "Tracing intrusion back to its real entry point, usually failed flashing or an exposed fastener rather than the field of the roof where the ceiling stain shows.",
      "image": {
        "src": "https://images.unsplash.com/photo-1737739973200-61c2ae4d1272",
        "alt": "Interior ceiling with collapsed plaster exposing wood lath strips and water-stained edges"
      }
    },
    {
      "icon": "Wind",
      "title": "Storm and Hail Damage Repair",
      "description": "Documenting bruised mats, granule loss, creased tabs and displaced flashing after a weather event, with findings written to support an insurance claim.",
      "image": {
        "src": "https://images.unsplash.com/photo-1761959166803-ed952543eeae",
        "alt": "White clapboard farmhouse with a caved-in section of shingle roof and torn shingles"
      }
    },
    {
      "icon": "Hammer",
      "title": "Roof Decking and Sheathing Repair",
      "description": "Replacing sheathing that has delaminated, rotted or sagged, since nails cannot develop full withdrawal resistance in soft decking no matter what covers it.",
      "image": {
        "src": "https://images.unsplash.com/photo-1690719095815-549c60090c9f",
        "alt": "Bare timber roof trusses and rafters with metal plate connectors on a house under construction"
      }
    },
    {
      "icon": "Thermometer",
      "title": "Attic Ventilation and Ridge Vents",
      "description": "Balancing soffit intake against ridge exhaust so the attic tracks outdoor temperature, which is what actually reduces ice dams, condensation and premature aging.",
      "image": {
        "src": "https://images.unsplash.com/photo-1759105734106-47594c3eea11",
        "alt": "A white louvred cupola sitting on the ridge of a pale standing-seam metal roof"
      }
    },
    {
      "icon": "ShieldCheck",
      "title": "Flashing, Valley and Chimney Sealing",
      "description": "Rebuilding the transitions that fail first: step flashing, counterflashing, valley metal, and every pipe or vent penetration through the roof plane.",
      "image": {
        "src": "https://images.unsplash.com/photo-1562774909-a67585efb8b4",
        "alt": "A rendered chimney stack with terracotta pots and a metal flue vent rising from a clay-tile roof"
      }
    },
    {
      "icon": "ClipboardCheck",
      "title": "Roof Inspection and Certification",
      "description": "A documented condition report with remaining service life, used for a sale, a refinance, or deciding honestly between another repair and a replacement.",
      "image": {
        "src": "https://images.unsplash.com/photo-1755114203680-d39d95efa82c",
        "alt": "Overhead drone view of a suburban house with a grey asphalt-shingle roof"
      }
    }
  ],
  "benefits": [
    {
      "icon": "ShieldCheck",
      "title": "Protection Where Roofs Actually Fail",
      "description": "Most leaks start at transitions and penetrations, not in the open field. Detailing flashing, valleys, and pipe boots correctly does more for long-term watertightness than any shingle upgrade."
    },
    {
      "icon": "Gauge",
      "title": "Longer Shingle Service Life",
      "description": "A properly vented attic keeps deck temperatures down and moisture out. Roofs that overheat from beneath tend to lose granules and cup years earlier than the same product on a balanced system."
    },
    {
      "icon": "ClipboardCheck",
      "title": "Fewer Surprises Mid-Project",
      "description": "A tear-off exposes the decking before new material goes down, so soft sheathing, old leak damage, and layered patch repairs get found and corrected rather than covered over."
    },
    {
      "icon": "FileCheck",
      "title": "Installation That Matches the Spec",
      "description": "Manufacturer warranties generally assume the published nailing pattern, exposure, starter course, and ventilation requirements were followed. Installing to spec is what keeps that coverage intact and what keeps wind ratings meaningful."
    }
  ],
  "options": {
    "title": "Choosing your roofing material",
    "intro": "Most homeowners are really choosing among a few well-established systems, and the right answer depends on roof pitch, climate, structural capacity, and how long you plan to own the house. Each option below trades cost against longevity, weight, or appearance in a fairly predictable way.",
    "items": [
      {
        "name": "Architectural Asphalt Shingles",
        "summary": "Laminated shingles built from two or more bonded layers, giving a thicker profile, a dimensional shadow line, and higher wind ratings than older flat shingles. This is the default residential covering across most of North America.",
        "bestFor": "Most pitched residential roofs",
        "lifespan": "20-30 years typical service life",
        "considerations": [
          "Real-world life depends heavily on attic ventilation and climate; poorly vented roofs commonly fall short of the product's rated range",
          "Vulnerable to hail bruising, which can fracture the mat long before the damage is visible from the ground",
          "Weighs more per square than 3-tab, which matters most when a second layer is added over an existing roof rather than on a tear-off"
        ]
      },
      {
        "name": "3-Tab Asphalt Shingles",
        "summary": "A single-layer shingle with cut tabs producing a flat, uniform pattern. It is the lightest and least expensive asphalt option and is now used mostly for budget projects, outbuildings, or matching existing work.",
        "bestFor": "Budget-driven projects and outbuildings",
        "lifespan": "15-20 years typical service life",
        "considerations": [
          "Lower wind ratings than laminated shingles, with tabs more prone to lifting and creasing",
          "Thinner mat means less impact resistance and faster granule loss",
          "Being phased out of many manufacturer lines, which can make future color matching difficult"
        ]
      },
      {
        "name": "Standing Seam Metal",
        "summary": "Interlocking metal panels joined by raised vertical seams, with fasteners concealed beneath the seam instead of driven through the panel face. Panels float on clips so they can expand and contract, which is why concealed fastening matters.",
        "bestFor": "Long-term ownership, snow and wildfire regions",
        "lifespan": "40-70 years typical service life",
        "considerations": [
          "Substantially higher upfront cost and a smaller pool of crews experienced in proper seaming and flashing",
          "Requires careful detailing at penetrations, since thermal movement can work poorly executed flashing loose",
          "Oil canning, the slight waviness visible in flat panel areas, is a normal characteristic of the product rather than a defect"
        ]
      },
      {
        "name": "Exposed-Fastener Metal Panels",
        "summary": "Corrugated or ribbed panels screwed directly through the face into purlins or decking, with an EPDM-washered fastener sealing each penetration. Common on shops, barns, porches, and value-focused residential re-roofs.",
        "bestFor": "Outbuildings, porches, and value-focused metal roofs",
        "lifespan": "25-40 years typical service life",
        "considerations": [
          "Washers degrade under UV exposure and thermal cycling, so fasteners need periodic inspection and eventual replacement",
          "Every fastener is a potential leak path, unlike a concealed-clip system",
          "Fewer profiles and colors, with a more utilitarian appearance than standing seam"
        ]
      }
    ]
  },
  "process": [
    {
      "title": "Inspection and Moisture Tracing",
      "description": "The roof is walked where it can be accessed safely and the attic is examined from below. Staining, deck discoloration, rusted fasteners, and daylight at penetrations often reveal the true entry point, which is frequently uphill from where the ceiling stain appears."
    },
    {
      "title": "Scope Decision: Repair, Overlay or Tear-Off",
      "description": "A localized flashing failure on an otherwise sound roof is a repair. An overlay adds a second layer over the existing one, which is faster and cheaper but hides the decking, adds dead load, and typically shortens the new layer's life. A tear-off exposes and corrects everything beneath."
    },
    {
      "title": "Deck Preparation and Water Barriers",
      "description": "Damaged sheathing is replaced, then underlayment is applied across the field. In freeze-prone climates, a self-adhering ice barrier is bonded to the deck along the eaves, up the valleys, and around penetrations, where ice dams and wind-driven rain push water backward under the covering."
    },
    {
      "title": "Covering, Flashing and Ventilation",
      "description": "Field material is installed to the manufacturer's nailing pattern and exposure, with new step, counter, and valley flashing rather than reused metal. Ridge exhaust is balanced against soffit intake, and the site is cleaned and magnet-swept for nails before completion."
    }
  ],
  "costFactors": [
    {
      "factor": "Roof Size, Pitch and Complexity",
      "detail": "Cost tracks squares of surface area — a square being 100 square feet — but steepness and shape matter just as much. Steep pitches require staging and fall protection and slow the crew down, while hips, dormers, valleys, and skylights multiply the cut-and-flash labor per square compared with a simple gable."
    },
    {
      "factor": "Existing Layers and Disposal",
      "detail": "Stripping one layer of shingles is routine; two or three multiplies labor hours and dumpster volume, and disposal is generally charged by weight or container size. Old roofs over spaced board sheathing, or with years of embedded patch repairs, take longer to strip cleanly and haul away."
    },
    {
      "factor": "Decking Condition Found After Tear-Off",
      "detail": "Sheathing damage is largely invisible until the covering comes off, which is why estimates usually price replacement per sheet as a contingency. Rot around chimneys, valleys, and eaves is common on roofs that leaked slowly for years, and every bad sheet adds both material and labor."
    },
    {
      "factor": "Material and System Choice",
      "detail": "Asphalt, exposed-fastener metal, and standing seam sit at very different price points, and within asphalt there is a real spread between 3-tab, architectural, and impact-rated products. Metal also demands more skilled labor, so the installation premium compounds the material premium."
    },
    {
      "factor": "Flashing, Ventilation and Code Requirements",
      "detail": "Reusing old flashing is a false economy, so new chimney, sidewall, and valley metal is typically in scope. Bringing intake and exhaust ventilation into balance, adding an ice barrier where code requires it, and permit and inspection fees all add cost that a shingle-only quote may have left out. Any utility or municipal incentives vary by location and change over time, so current local programs are worth checking directly."
    }
  ],
  "faqs": [
    {
      "q": "Can I just put new shingles over the old ones?",
      "a": "An overlay is allowed in many jurisdictions when there is only one existing layer, the decking is sound, and the existing shingles are flat rather than curled or buckled. It saves tear-off labor and disposal cost, but it hides deck damage, adds dead load, and traps heat, which usually shortens the new layer's service life. It also raises the cost of the next roof, since two layers then have to come off. Local code sets the limit, so it is worth confirming before assuming an overlay is an option."
    },
    {
      "q": "How do I tell whether I really have storm or hail damage?",
      "a": "Functional hail damage on asphalt shows as soft, bruised spots where granules are knocked away and the mat beneath has been fractured; the spot often feels spongy under a thumb. Wind damage shows as creased or lifted tabs, missing shingles, and displaced ridge caps. Dents on gutters, vents, and other soft metal confirm that impact occurred, but the roof surface still has to be evaluated on its own, and dated photographs taken soon after the event matter if a claim follows."
    },
    {
      "q": "Why does a roof need ventilation if its job is keeping weather out?",
      "a": "Attics collect warm, moist air from the living space below, and without airflow that moisture condenses on the underside of cold sheathing. A balanced system draws cool air in at the soffits and exhausts it at the ridge, keeping the deck closer to outdoor temperature. Codes commonly size the total net free vent area at roughly one square foot per 150 square feet of attic floor, with a reduced ratio permitted when intake and exhaust are properly balanced or a vapor retarder is present. The payoff is less winter ice damming, less summer heat aging the shingles from beneath, and far less risk of mold and sheathing rot."
    },
    {
      "q": "Most of my roof looks fine but I have one leak. Do I need a full replacement?",
      "a": "Often not. A large share of leaks originate at flashing, pipe boots, skylight curbs, or valleys rather than in the field, and those details can be rebuilt on their own. The deciding questions are the roof's age against its expected service life, whether granule loss and curling are widespread rather than local, and whether the decking has already been compromised. A roof in its last few years is usually better replaced than repeatedly patched."
    },
    {
      "q": "What is ice-and-water shield, and do I actually need it?",
      "a": "It is a self-adhering rubberized membrane bonded directly to the deck in the most vulnerable areas, with the field underlayment lapped over its upper edge, and it seals around nail shanks instead of simply lying loose on the deck. It belongs along the eaves, in valleys, and around chimneys and skylights, where meltwater backing up behind an ice dam or wind-driven rain can travel uphill under the shingles. Cold-climate codes commonly require an ice barrier at the eaves, extending a specified distance inside the exterior wall line. In milder regions it is not usually mandatory, but it is still worth having in valleys and at penetrations."
    }
  ]
};

export default roofing;
