// Pest Control — HousingNeeds vertical content.
//
// Content only. Structure and styling live in _components/HnVerticalPage.jsx
// and housingneeds.css, so editing this file changes copy without touching layout.
//
// To point the CTA at a real destination, set the URL in _data/site.js
// (HN_QUOTE_BASE) or replace quoteUrlFor("pestcontrol") with a literal URL.
import { quoteUrlFor } from "../site";

const pestcontrol = {
  "images": {
    "hero": {
      "src": "https://images.unsplash.com/photo-1591735115730-4bf3a351cfe8",
      "alt": "Wasp nest beneath the timber edge of a roof"
    },
    "benefit": {
      "src": "https://images.unsplash.com/photo-1591735115730-4bf3a351cfe8",
      "alt": "Wasp nest built under the timber edge of a roof"
    },
    "detail": {
      "src": "https://images.unsplash.com/photo-1527359443443-84a48aec73d2",
      "alt": "Backyard pergola inspected for seasonal pest activity"
    }
  },
  "slug": "pestcontrol",
  "name": "Pest Control",
  "accent": "lime",
  "icon": "Bug",
  "eyebrow": "Pest control explained",
  "headline": "Pest control starts with identification, not spraying",
  "headlineAccent": "not spraying",
  "subheadline": "Modern residential pest work follows Integrated Pest Management: identify the species, shut off entry points and food or moisture sources, monitor, and apply product only where the inspection says it is needed. Understanding that sequence is the difference between getting ahead of an infestation and paying to suppress it indefinitely.",
  "heroPoints": [
    "Identification before any treatment",
    "Exclusion and sealing, not just spray",
    "Monitoring and seasonal timing"
  ],
  "quoteLabel": "Request a pest control quote",
  "quoteUrl": quoteUrlFor("pestcontrol"),
  "seo": {
    "title": "Pest Control Guide: Inspection & Treatment",
    "description": "How residential pest control actually works: IPM inspection, exclusion, termite, rodent and bed bug treatment options, service intervals and what drives cost."
  },
  "services": [
    {
      "icon": "SprayCan",
      "title": "Mosquito Control",
      "description": "Barrier treatment of the shaded resting harbourage plus removal of standing-water breeding sites, since treating one without the other only shifts the population.",
      "image": {
        "src": "https://images.unsplash.com/photo-1527359443443-84a48aec73d2",
        "alt": "Timber backyard pergola at dusk with string lights over a cushioned outdoor sofa"
      }
    },
    {
      "icon": "Bug",
      "title": "Ant Control",
      "description": "Non-repellent baits carried back to the colony by foraging workers, which reaches the queen — spraying a trail kills workers and can split a colony into more.",
      "image": {
        "src": "https://images.unsplash.com/photo-1588470045344-4393b295297c",
        "alt": "A single live orange-brown ant in sharp macro profile on a plain white surface"
      }
    },
    {
      "icon": "Bug",
      "title": "Cockroach Control",
      "description": "Gel baiting and growth regulators placed in the harbourage points behind appliances and voids, targeting the nymph stage that surface sprays never reach.",
      "image": {
        "src": "https://images.unsplash.com/photo-1759379077720-b099c6cf2f71",
        "alt": "A live cockroach walking across textured grey concrete"
      }
    },
    {
      "icon": "TriangleAlert",
      "title": "Bee, Wasp and Hornet Removal",
      "description": "Nest location and removal, with honey bee colonies routed to a keeper for relocation rather than treated, and cavity nests sealed after removal.",
      "image": {
        "src": "https://images.unsplash.com/photo-1755039022246-d7e7f58b54c7",
        "alt": "A grey papery wasp nest hanging from a mossy branch among green leaves"
      }
    },
    {
      "icon": "Home",
      "title": "Termite Inspection and Treatment",
      "description": "Graphed inspection of the structure, then a liquid soil barrier or a monitored bait system depending on construction type and where the activity is found.",
      "image": {
        "src": "https://images.unsplash.com/photo-1769977453410-02f774fb8fef",
        "alt": "Timber eaten into ridges and hollows with packed earth galleries running across the grain"
      }
    },
    {
      "icon": "Rat",
      "title": "Rodent Control and Exclusion",
      "description": "Trapping paired with sealing every entry above a quarter inch, because removing the animals without closing the openings only clears the way for the next.",
      "image": {
        "src": "https://images.unsplash.com/photo-1575378064390-5a323bbac5d7",
        "alt": "A brown rat looking out from a gap beneath a timber structure"
      }
    },
    {
      "icon": "Thermometer",
      "title": "Bed Bug Treatment",
      "description": "Whole-room heat to lethal core temperature, or a staged chemical protocol with follow-up, both driven by inspection of seams, frames and adjacent rooms.",
      "image": {
        "src": "https://images.unsplash.com/photo-1647376036543-f9f543601a1d",
        "alt": "A clean stripped white quilted mattress surface in raking light"
      }
    },
    {
      "icon": "Bird",
      "title": "Bird and Wildlife Exclusion",
      "description": "Netting, spikes and one-way doors that let animals leave and not return, timed around nesting seasons so no young are sealed inside a structure.",
      "image": {
        "src": "https://images.unsplash.com/photo-1770892392918-c268cf443a5e",
        "alt": "A row of pigeons roosting along the tiled ridge and eaves of a stone building"
      }
    },
    {
      "icon": "ShieldCheck",
      "title": "Perimeter Pest Barrier",
      "description": "A scheduled exterior treatment band at the foundation and entry points, intercepting seasonal invaders outside instead of responding once they are indoors.",
      "image": {
        "src": "https://images.unsplash.com/photo-1747659629851-a92bd71149f6",
        "alt": "A gloved hand in dark workwear holding a yellow pump sprayer, fine mist against a wall"
      }
    }
  ],
  "benefits": [
    {
      "icon": "ClipboardCheck",
      "title": "Identification comes first",
      "description": "Two ants or two cockroaches that look alike to the eye can require opposite strategies. Correct species identification decides whether the answer is bait, exclusion, moisture repair or nothing at all, and it is one of the strongest predictors of whether a plan holds up over the following months."
    },
    {
      "icon": "Hammer",
      "title": "Exclusion addresses the cause",
      "description": "Sealing gaps, fitting door sweeps, screening weep holes and vents, and repairing damaged soffits removes the route rather than the individual pest. It is the part of the work that keeps paying after any applied product has broken down."
    },
    {
      "icon": "Leaf",
      "title": "Targeted application, not blanket spraying",
      "description": "IPM treats product as one tool, used late and placed precisely — crack-and-crevice, void injection, or bait confined inside a tamper-resistant housing — instead of broad surface spraying. Less material in fewer places also avoids disrupting bait uptake and scattering insects deeper into voids and adjacent rooms."
    },
    {
      "icon": "CalendarClock",
      "title": "Monitoring and timing",
      "description": "Monitoring stations, sticky traps and inspection records show whether pressure is rising or falling, instead of relying on whether anyone happened to see something. Timing matters too: termite swarms, overwintering flights, mosquito season and rodent movement indoors are all seasonal, and work scheduled to those cycles does more with less."
    }
  ],
  "options": {
    "title": "The approaches homeowners choose between",
    "intro": "Most residential pest work falls into one of four shapes. Which one fits depends on the species, whether the pressure is a one-off event or continuous, and whether the structure has openings and conditions that keep inviting pests back in.",
    "items": [
      {
        "name": "One-off targeted treatment",
        "summary": "A single visit aimed at a confirmed, contained problem — a wasp nest, a localized ant trail, an overwintering flare-up, or a first clean-out of a kitchen cockroach population. Product is placed only in the harborage identified during inspection rather than across the room.",
        "bestFor": "An isolated, correctly identified issue with no ongoing pressure from outside",
        "lifespan": "No scheduled interval; addresses the activity present at the visit, re-treat if it returns",
        "considerations": [
          "Does nothing about the entry point or the conditions that allowed it",
          "Some pests, notably German cockroaches and bed bugs, rarely resolve in a single visit and are planned as multi-visit work from the start"
        ]
      },
      {
        "name": "Recurring perimeter program",
        "summary": "Scheduled exterior barrier treatment plus interior crack-and-crevice work as needed, with monitoring stations and a fresh inspection each visit. Designed for continuous outside-in pressure rather than a single incident.",
        "bestFor": "Properties with steady seasonal pressure from ants, spiders, occasional invaders or outdoor cockroaches",
        "lifespan": "Re-treat every 2-3 months; quarterly is the common interval, monthly during peak pressure",
        "considerations": [
          "Ongoing cost, and suppression continues only while the schedule continues",
          "Cannot compensate for unsealed gaps, standing water or sanitation problems"
        ]
      },
      {
        "name": "Termite treatment — liquid soil barrier or bait system",
        "summary": "A continuous liquid soil termiticide zone is trenched and rodded around the foundation and injected through slabs where needed, so the soil the colony must cross is treated; modern soil products are generally non-repellent, meaning termites tunnel into treated soil and pick material up rather than being turned away. A bait system instead installs in-ground stations around the structure that are inspected on a cycle and act on the colony through foraging workers.",
        "bestFor": "Structures with confirmed subterranean activity, a previous history, or high local termite pressure",
        "lifespan": "Bait stations inspected and serviced roughly quarterly; soil treatment longevity is set by the product label and site conditions, with annual re-inspection typical",
        "considerations": [
          "Liquid work is invasive — trenching, drilling slabs and patios, and access into crawlspaces",
          "Bait systems act more slowly and depend on stations being serviced on schedule",
          "Drywood termites are a separate problem and are not addressed by soil treatment at all"
        ]
      },
      {
        "name": "Exclusion-led seal-out work",
        "summary": "A construction-side approach: identify every viable opening and close it with rodent-resistant or insect-resistant materials — door sweeps, garage-door corner seals, weep-hole screens, chimney caps, vent and soffit repairs, utility penetration sealing — usually combined with trapping and sanitation for rodents.",
        "bestFor": "Rodent problems, and any structure where pests keep returning after repeated treatment",
        "lifespan": "Repairs are durable; re-inspect annually and after any roof, siding or utility work",
        "considerations": [
          "Higher up-front labor than a spray visit, and may need trades work where materials are already damaged",
          "Older or heavily penetrated structures may need staged work rather than a single pass"
        ]
      }
    ]
  },
  "process": [
    {
      "title": "Inspect and identify",
      "description": "A proper visit starts with the perimeter, crawlspace or slab edge, attic, kitchen, bathrooms and any reported activity — looking for droppings, gnaw marks, mud tubes, frass, shed skins, trails and live specimens, and collecting a specimen where the species is not obvious. The species and the conditions supporting it, not the description of the symptom, set the plan."
    },
    {
      "title": "Exclude and correct conducive conditions",
      "description": "Seal the gaps, fit sweeps and screens, and address what is feeding the population: moisture from leaks and poor drainage, wood-to-soil contact, standing water, clutter and food residue. This is the least glamorous stage and usually the most decisive one."
    },
    {
      "title": "Treat where it is warranted",
      "description": "Only then is product used, chosen for the confirmed species and placed where that pest actually lives — gel bait in cracks and voids, bait stations, crack-and-crevice application, void injection or a soil treatment. Pesticides used in structural pest control are EPA-registered, the label carries the legally binding directions on where and how they may be applied, and application is a state-licensed activity in most jurisdictions."
    },
    {
      "title": "Monitor, follow up and document",
      "description": "Monitoring stations, sticky traps and repeat inspections show whether the population is actually declining rather than relying on sightings, and follow-up visits are scheduled to the biology — the egg-hatch cycle for bed bugs and cockroaches, the service cycle for termite stations. A record of what was found, what was applied and where should be provided after each visit."
    }
  ],
  "costFactors": [
    {
      "factor": "Which pest, and confirmed species",
      "detail": "A pavement ant call and a carpenter ant call are priced nothing alike, and German cockroaches and bed bugs are multi-visit work by definition. Termite and bed bug jobs sit at the top end because of the equipment, labor and scheduled return visits involved."
    },
    {
      "factor": "Size, construction and access",
      "detail": "Termite work is often measured in linear feet of foundation, so footprint and additions matter, and slab construction means drilling where a crawlspace would allow trenching. Tight crawlspaces, finished basements, multi-story rooflines and blocked attic access all add labor before any product is applied."
    },
    {
      "factor": "Severity and how long it has been active",
      "detail": "A population caught early is a different job from one that has spread through wall voids, insulation or multiple rooms. Established infestations need more visits, more monitoring and sometimes clean-out or sanitation work that a light case does not."
    },
    {
      "factor": "Method chosen",
      "detail": "Whole-room heat for bed bugs is equipment- and time-intensive compared with targeted chemical visits, and a liquid termiticide job front-loads trenching and drilling labor while a bait system spreads cost across ongoing station service. The cheaper method up front is not always the cheaper method across the protection period."
    },
    {
      "factor": "Program type and scope of exclusion",
      "detail": "A one-off visit, a quarterly program and an exclusion-led seal-out price on completely different bases — per visit, per subscription and labor-plus-materials respectively. Exclusion in particular tracks how many openings exist and whether damaged soffit, vent, siding or door hardware has to be repaired rather than simply sealed."
    }
  ],
  "faqs": [
    {
      "q": "Do I really need quarterly service, or is one treatment enough?",
      "a": "It depends on whether the pressure is an event or a constant. A wasp nest or a single overwintering flare-up is a one-off, while ants, spiders and outdoor cockroaches pushing in from a wooded or damp lot are continuous, and a single exterior application breaks down over weeks to a few months depending on weather, sunlight and surface. A recurring program is aimed at suppressing that ongoing pressure, not at removing it permanently. It is also not a substitute for exclusion and sanitation — if the schedule is the only thing holding pests back, something structural or environmental has not been fixed."
    },
    {
      "q": "How do I know whether I have termites?",
      "a": "For subterranean termites the classic evidence is pencil-width mud tubes running up foundation walls, piers or joists, plus hollow-sounding or blistered wood and swarmers or discarded wings near windows, usually in spring though the timing varies by species and region. Drywood termites leave small piles of hard, pellet-like frass beneath tiny kick-out holes instead, and need no soil contact at all. A wood-destroying insect (WDI/WDO) inspection also documents conducive conditions — wood-to-soil contact, buried form boards, leaks, poor crawlspace ventilation — that predict future problems even where nothing is currently active. Because subterranean and drywood infestations call for entirely different treatments, identification has to be settled before any product is chosen."
    },
    {
      "q": "What should I ask about the products being used around my home?",
      "a": "Ask which product will be applied, exactly where it will be placed, and to see the label and safety data sheet — the label carries the legally binding directions, including any re-entry or drying instructions, and applicators are licensed by the state in most jurisdictions. Pesticides used in structural pest control are EPA-registered, and it is reasonable to ask for the specific placement and re-entry guidance for your situation rather than a general reassurance. Lower-exposure approaches can also be discussed: bait confined inside a tamper-resistant station, crack-and-crevice and void placement rather than open surfaces, and non-chemical steps such as heat, trapping, exclusion and moisture repair. Raise pregnancy, small children, pets, fish tanks, beehives and respiratory conditions before the visit so placement and timing can be planned around them."
    },
    {
      "q": "Why am I still seeing pests after a treatment?",
      "a": "Some of it is expected. Bait works by being carried back to the nest, so activity can look unchanged or briefly heavier before it drops, and cockroach and bed bug eggs already laid will hatch after the first visit, which is why follow-ups are scheduled to the hatch cycle rather than to the calendar. Some of it is counterproductive DIY: spraying a repellent product over gel bait placements can stop insects feeding on the bait, and spraying visible trails of certain ant species can cause budding, splitting one colony into several. And some of it means the plan itself was wrong — the wrong species was targeted, or an unsealed gap, a leak or a food source is still supporting the population, which is what the follow-up inspection is for."
    },
    {
      "q": "Which parts can I do myself, and which really need a professional?",
      "a": "Homeowners can do most of the highest-value work: emptying standing water weekly, cleaning gutters, fixing leaks, fitting door sweeps, screening vents and weep holes, moving firewood and mulch off the foundation, decluttering and tightening up kitchen sanitation. Snap traps placed against walls and runways also handle a small mouse problem well. What generally goes badly as DIY is German cockroaches, bed bugs, termites and structural rodent exclusion at height — these need identification, equipment and a repeat schedule, and mistakes are expensive to undo. Rodenticide in particular deserves caution outside a professional program, because a poisoned rodent can be eaten by an owl, hawk, cat or dog, creating a documented secondary poisoning risk that trapping and exclusion avoid entirely."
    }
  ]
};

export default pestcontrol;
