// Tree Service — HousingNeeds vertical content.
//
// Content only. Structure and styling live in _components/HnVerticalPage.jsx
// and housingneeds.css, so editing this file changes copy without touching layout.
//
// Services intentionally carry no image field and fall back to designed icon
// tiles; only hero, benefit, and detail use photography.

const treeService = {
  "images": {
    "hero": {
      "src": "https://images.unsplash.com/photo-1626828476637-5bd713ef9f22",
      "alt": "Certified arborist in a climbing harness cutting a large limb high in a tree with a chainsaw"
    },
    "benefit": {
      "src": "https://images.unsplash.com/photo-1631300313270-227604e71ea5",
      "alt": "Tree crew pruning a tall leafy tree using climbing ropes"
    },
    "detail": {
      "src": "https://images.unsplash.com/photo-1669065054992-3151b15aab08",
      "alt": "Stump grinder removing a tree stump in a residential yard"
    }
  },
  "slug": "tree-service",
  "name": "Tree Service",
  "accent": "emerald",
  "icon": "TreePine",
  "eyebrow": "Tree service solutions",
  "headline": "Remove what's dangerous, protect what's worth keeping",
  "headlineAccent": "worth keeping",
  "subheadline": "A tree is a living structure, and every cut either helps it seal and grow or opens it to decay. The same judgment decides whether a struggling tree can be saved or has become a hazard — which is why the honest answer depends on the tree's health, its structure, and what sits underneath it if something fails.",
  "heroPoints": [
    "Remove-vs-save decisions explained",
    "Access and crane costs detailed",
    "Storm and hazard work done safely"
  ],
  "quoteLabel": "Get a Free Quote",
  "quoteUrl": "https://example.com/quote/tree-service",
  "seo": {
    "title": "Tree Service Guide: Removal, Trimming & Stumps",
    "description": "Learn how tree service works: removal vs trimming, stump grinding, storm and hazard removal, ISA-certified arborists, permits, and what drives the cost."
  },
  "services": [
    {
      "icon": "TreePine",
      "title": "Tree Removal",
      "description": "Full removal of dead, dying, or hazardous trees, taken down in controlled sections when a straight fell isn't safe, so nothing lands on a roof, fence, or power line on the way down.",
      "image": {
        "src": "https://images.unsplash.com/photo-1626828476637-5bd713ef9f22",
        "alt": "Tree Removal"
      }
    },
    {
      "icon": "Leaf",
      "title": "Tree Trimming and Pruning",
      "description": "Selective removal of dead, crossing, and overextended limbs to improve structure, clearance, and light, cutting back to the branch collar so wounds seal cleanly instead of leaving stubs that decay.",
      "image": {
        "src": "https://images.unsplash.com/photo-1754322449185-31f56117ed87",
        "alt": "Tree Trimming and Pruning"
      }
    },
    {
      "icon": "Wrench",
      "title": "Stump Grinding and Removal",
      "description": "Grinding the remaining stump and surface roots several inches below grade so you can replant, lay sod, or reclaim the space, rather than leaving a trip hazard that sprouts and attracts pests.",
      "image": {
        "src": "https://images.unsplash.com/photo-1657730391002-bf55ff069a80",
        "alt": "Stump Grinding and Removal"
      }
    },
    {
      "icon": "TriangleAlert",
      "title": "Emergency Storm and Fallen-Tree Removal",
      "description": "Rapid response to trees and heavy limbs brought down by wind, ice, or saturated soil, including limbs under tension or resting on a structure, which are far more dangerous to cut than they look.",
      "image": {
        "src": "https://images.unsplash.com/photo-1754321902809-5c21cbc67228",
        "alt": "Emergency Storm and Fallen-Tree Removal"
      }
    },
    {
      "icon": "Microscope",
      "title": "Tree Health, Pest and Disease Treatment",
      "description": "Diagnosing decline, pests, and fungal or bacterial disease, then treating what's treatable through targeted pruning, soil care, or insect management, and being honest when a tree is past saving.",
      "image": {
        "src": "https://images.unsplash.com/photo-1754321860056-ca7254d5e7ac",
        "alt": "Tree Health, Pest and Disease Treatment"
      }
    },
    {
      "icon": "Construction",
      "title": "Land and Lot Clearing",
      "description": "Clearing brush, undergrowth, and unwanted trees to prepare a lot for building, fencing, or a firebreak, with debris chipped or hauled and any trees worth keeping flagged and protected.",
      "image": {
        "src": "https://images.unsplash.com/photo-1754321871548-61bdbc6f1506",
        "alt": "Land and Lot Clearing"
      }
    },
    {
      "icon": "ShieldCheck",
      "title": "Cabling, Bracing and Risk Assessment",
      "description": "Documenting structural defects such as codominant stems, weak unions, cavities, and lean, then installing support hardware where a valuable tree can be retained safely rather than removed.",
      "image": {
        "src": "https://images.unsplash.com/photo-1617143520628-86934f404d06",
        "alt": "Cabling, Bracing and Risk Assessment"
      }
    }
  ],
  "benefits": [
    {
      "icon": "BadgeCheck",
      "title": "Certified Expertise, Properly Insured",
      "description": "A trained arborist judges tree structure, defects, and disease, not just how to run a saw. Confirming a crew carries liability and workers-comp coverage also keeps a fall or a dropped limb from becoming your financial problem."
    },
    {
      "icon": "ShieldCheck",
      "title": "Safety Where the Real Risk Is",
      "description": "Most serious tree-work injuries involve power lines, tension in a fallen limb, or a load going the wrong direction. A trained crew rigs and lowers heavy wood under control instead of dropping it, which is what protects people and property below."
    },
    {
      "icon": "Sprout",
      "title": "Pruning That Extends Tree Life",
      "description": "Correct cuts at the branch collar let a tree compartmentalize the wound and keep growing. Flush cuts, stubs, and topping do the opposite, opening the tree to decay and weak regrowth that tends to fail in the next storm."
    },
    {
      "icon": "Home",
      "title": "Protecting Structures and Landscaping",
      "description": "Careful rigging, ground protection, and cleanup keep the work from trading a tree problem for a damaged roof, driveway, or garden bed. Good crews plan the drop zone before the first cut rather than after."
    },
    {
      "icon": "ClipboardCheck",
      "title": "Honest Remove-or-Save Recommendations",
      "description": "Not every struggling tree needs to come down, and not every large tree is safe to keep. A straight read of health, structure, and target — what the tree could hit — leads to a recommendation you can actually trust."
    }
  ],
  "options": {
    "title": "Comparing your tree care options",
    "intro": "Most tree work comes down to a handful of interventions, and the right one depends on the tree's health, its structure, and what sits beneath it if something fails. Each option below trades cost, permanence, and the tree's future in a fairly predictable way.",
    "items": [
      {
        "name": "Pruning and Crown Thinning",
        "summary": "Selective removal of dead, weak, and crossing branches to open the canopy, improve structure, and gain clearance from a roof or wires. Done well, it keeps a healthy tree healthy without taking more than a modest share of live growth at once.",
        "bestFor": "Healthy trees needing shape, clearance, or light",
        "lifespan": "Typically repeated every 3-5 years",
        "considerations": [
          "Removing too much live canopy at once stresses the tree and triggers weak, fast regrowth",
          "Timing matters for some species; certain trees are best pruned in dormancy to limit disease spread",
          "It manages a sound tree rather than rescuing one with serious structural defects"
        ]
      },
      {
        "name": "Crown Reduction",
        "summary": "Reducing a tree's height or spread by cutting back to living lateral branches large enough to take over, used when a tree has simply outgrown its space. It is the skilled alternative to topping, which cripples a tree instead of shaping it.",
        "bestFor": "Oversized trees crowding a structure or wires",
        "lifespan": "Holds several years; not a fix for a declining tree",
        "considerations": [
          "Only a limited amount of reduction is possible in one visit without harming the tree",
          "Poorly done it becomes topping — flat cuts that rot and throw up weak water sprouts",
          "A tree that needs drastic reduction every year is often a candidate for removal instead"
        ]
      },
      {
        "name": "Full Tree Removal",
        "summary": "Taking the whole tree down, in controlled sections where needed, when it is dead, hazardous, or structurally failing and can't be made safe. This is the right call when the risk to people or property clearly outweighs the tree's value.",
        "bestFor": "Dead, hazardous, or structurally failing trees",
        "lifespan": "Permanent; leaves a stump unless it is ground out",
        "considerations": [
          "Proximity to structures and power lines drives both the difficulty and the cost",
          "Some cities require a permit to remove protected, heritage, or large-diameter trees, even on private land",
          "A stump remains afterward and will sprout or attract pests unless it is ground out"
        ]
      },
      {
        "name": "Stump Grinding",
        "summary": "Grinding the leftover stump and major surface roots below grade after a removal so the area can be replanted or reclaimed. It is a separate service from the removal itself and is usually priced on its own.",
        "bestFor": "Reclaiming space and appearance after a removal",
        "lifespan": "One-time; roots below the grind slowly decay in place",
        "considerations": [
          "Grinding leaves a pile of wood chips and soil that settles as it decomposes",
          "Deep roots are left to rot in place rather than fully excavated",
          "Nearby utilities and irrigation lines should be marked before grinding begins"
        ]
      }
    ]
  },
  "process": [
    {
      "title": "On-Site Assessment and Risk Evaluation",
      "description": "An arborist evaluates the tree's health, structure, and lean, and identifies targets below — the house, wires, walkways, or a neighbor's property — that would be struck if a limb failed. This is where remove, prune, or treat gets decided honestly rather than by default."
    },
    {
      "title": "Scope, Permits, and Utility Coordination",
      "description": "The plan is set and any permit required for a protected or heritage tree is pulled before work starts. When limbs are near service lines, the utility is contacted rather than risking the line, since clearance near energized conductors is never a DIY or shortcut task."
    },
    {
      "title": "Site Setup and Drop-Zone Protection",
      "description": "Ropes, rigging, and ground protection go in first, and a drop zone is established and kept clear of people and vehicles. Planning where each piece of wood will land before cutting is what separates a controlled removal from hoping it goes well."
    },
    {
      "title": "Controlled Take-Down or Pruning",
      "description": "The crew climbs or works from a bucket or crane, lowering heavy limbs in sections under rope control near structures and cutting to the branch collar when pruning. Nothing is dropped freely where it could reach a target below."
    },
    {
      "title": "Cleanup, Stump Grinding, and Haul-Away",
      "description": "Brush is chipped, logs are cut down and removed or left as requested, and the stump is ground if that was in scope. The site is raked and cleared so the yard is usable again before the crew leaves."
    }
  ],
  "costFactors": [
    {
      "factor": "Tree Size and Height",
      "detail": "Cost climbs steeply with size. A tall, heavy tree means more time aloft, more rigging, larger wood to lower and cut, and more debris to process than a small yard tree. Height and trunk diameter together are usually the single biggest driver of price."
    },
    {
      "factor": "Species and Wood Density",
      "detail": "Dense hardwoods like oak and hickory are heavier and harder to cut and chip than softer species, and some trees have brittle wood or awkward branching that slows a crew down. The same height in a tougher species can cost meaningfully more."
    },
    {
      "factor": "Proximity to Structures and Power Lines",
      "detail": "A tree in the open can sometimes be felled in one piece; the same tree over a roof, fence, or service line has to be dismantled piece by piece under rope control. Nearby targets and energized lines add rigging, time, and risk that all show up in the price."
    },
    {
      "factor": "Site Access and Equipment",
      "detail": "Whether a truck, chipper, or crane can reach the tree changes everything. Tight backyards, steep ground, or no gate access mean wood is carried out by hand, while a job that needs a crane to lift sections over a house carries the added cost of that equipment and operator."
    },
    {
      "factor": "Stumps, Debris Haul-Away, and Emergency Call-Outs",
      "detail": "Stump grinding, hauling logs and brush off-site rather than leaving them, and after-hours emergency response for storm damage are typically priced on top of the base removal. Any local permit fees for protected trees add to the total as well, and those fees vary by location."
    }
  ],
  "faqs": [
    {
      "q": "Do I need a permit to remove a tree in my yard?",
      "a": "Sometimes. Many cities and HOAs regulate protected, heritage, or large-diameter trees — and some street or right-of-way trees — even when they stand on private property, and removing one without approval can bring a fine or a replanting requirement. Rules vary widely by municipality, so it is worth checking with your local planning or urban-forestry office, or asking the arborist, before scheduling a removal. A reputable company will usually know the local ordinances or help you confirm them."
    },
    {
      "q": "Should this tree be removed, or can it be saved?",
      "a": "It usually comes down to three things: the tree's health, its structure, and its target — what it could hit if it or a large limb failed. A tree with a modest, treatable problem and nothing important beneath it is often worth saving through pruning or treatment. One that is dead, has major structural defects like a split trunk or extensive decay, or leans over the house is typically safer removed. A certified arborist can weigh those factors honestly rather than defaulting to removal."
    },
    {
      "q": "Why should I avoid topping my trees?",
      "a": "Topping — cutting main limbs back to stubs to reduce height — is one of the most damaging things you can do to a tree. It removes so much canopy that the tree is stressed and starved, the flat cuts rarely seal and often invite decay, and the tree tends to respond with dense, weakly attached water sprouts that are more likely to break in the next storm than the limbs they replaced. Proper crown reduction, which cuts back to sound lateral branches, controls size without that damage."
    },
    {
      "q": "Is my tree an emergency, or can it wait?",
      "a": "Treat it as an emergency when a tree or large limb has already fallen on a structure or is leaning on power lines, when a major limb is cracked and hanging, or when a tree has partially uprooted and could come down on something. Those situations involve stored tension and unpredictable loads and should be handled by a trained crew, not a homeowner with a chainsaw. Cosmetic damage, minor deadwood, or a lean that has been stable for years can generally wait for a scheduled visit."
    },
    {
      "q": "Why does it matter that a tree company is insured and certified?",
      "a": "Tree work is genuinely dangerous, and if an uninsured crew is hurt on your property or drops a limb on your house, the liability can land on you. Confirm the company carries both general liability and workers-compensation insurance, and ask for a current certificate. ISA (International Society of Arboriculture) certification signals the arborist has been trained and tested on tree biology, safety, and proper pruning — the judgment that separates real tree care from simply cutting things down."
    }
  ]
};

export default treeService;
