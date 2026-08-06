// Moving & Storage — HousingNeeds vertical content.
//
// Content only. Structure and styling live in _components/HnVerticalPage.jsx
// and housingneeds.css, so editing this file changes copy without touching layout.
//
// The CTA points at a literal quoteUrl below. To route it through the shared
// contact flow instead, swap the string for quoteUrlFor("moving") from _data/site.js.

const moving = {
  "images": {
    "hero": {
      "src": "https://images.unsplash.com/photo-1698917414969-feade59e3343",
      "alt": "Movers carrying boxes and furniture to a loaded moving truck"
    },
    "benefit": {
      "src": "https://images.unsplash.com/photo-1581573833610-487d80de9aab",
      "alt": "Professional movers wrapping and padding furniture before loading"
    },
    "detail": {
      "src": "https://images.unsplash.com/photo-1600518464441-9154a4dea21b",
      "alt": "Stacked labeled cardboard moving boxes in an empty room"
    }
  },
  "slug": "moving",
  "name": "Moving & Storage",
  "accent": "amber",
  "icon": "Truck",
  "eyebrow": "Moving & storage solutions",
  "headline": "A move that protects your things and respects your time",
  "headlineAccent": "respects your time",
  "subheadline": "A move is more than a truck and a few strong backs — it is packing, protection, logistics, and licensing working together, and a weak link in any one of them is where damage, delays, and surprise charges creep in. Understanding how full-service, labor-only, container, and DIY options actually differ makes it far easier to judge which one honestly fits your distance, your budget, and how much of the work you want to do yourself.",
  "heroPoints": [
    "Local hourly vs long-distance pricing explained",
    "Licensed FMCSA carriers and binding estimates",
    "Full-service, container, and DIY compared"
  ],
  "quoteLabel": "Get a Free Quote",
  "quoteUrl": "#demo-only",
  "seo": {
    "title": "Moving & Storage Guide: Movers, Costs & Tips",
    "description": "Learn how moving works: local vs long-distance pricing, full-service vs labor-only vs pods vs DIY, packing, storage, and the real cost drivers."
  },
  "services": [
    {
      "icon": "Home",
      "title": "Local Moving",
      "description": "Crew-and-truck moves within a metro area, usually billed by the hour, where an efficient load plan and a short drive are what keep the clock — and the cost — down.",
      "image": {
        "src": "https://images.unsplash.com/photo-1714647211902-bb711d643a17",
        "alt": "Local Moving"
      }
    },
    {
      "icon": "Gauge",
      "title": "Long-Distance & Interstate Moving",
      "description": "Priced by shipment weight or volume plus mileage rather than by the hour, carried by an interstate mover that must be licensed and put a written estimate in your hands before loading.",
      "image": {
        "src": "https://images.unsplash.com/photo-1614359835514-92f8ba196357",
        "alt": "Long-Distance & Interstate Moving"
      }
    },
    {
      "icon": "Layers",
      "title": "Full-Service Packing & Unpacking",
      "description": "Professional packing that wraps, boxes, and inventories your belongings so fragile and high-value items are protected the way carrier valuation coverage generally expects them to be.",
      "image": {
        "src": "https://images.unsplash.com/photo-1600518464441-9154a4dea21b",
        "alt": "Full-Service Packing & Unpacking"
      }
    },
    {
      "icon": "Sofa",
      "title": "Furniture Disassembly & Reassembly",
      "description": "Breaking down beds, tables, and modular pieces for safe transport, then rebuilding them in the new home so nothing is forced through a doorway or stressed at a joint.",
      "image": {
        "src": "https://images.unsplash.com/photo-1698917414969-feade59e3343",
        "alt": "Furniture Disassembly & Reassembly"
      }
    },
    {
      "icon": "HardHat",
      "title": "Loading & Unloading Labor",
      "description": "Trained help to load or unload a truck, trailer, or container you have rented — useful when you want to keep control of the vehicle and the drive but hand off the heavy lifting.",
      "image": {
        "src": "https://images.unsplash.com/photo-1657049199023-87fb439d47c5",
        "alt": "Loading & Unloading Labor"
      }
    },
    {
      "icon": "Grid2x2",
      "title": "Short- & Long-Term Storage",
      "description": "Storage between moves for a closing gap, a downsize, or a staging period, with your inventory tracked from pickup through final delivery rather than left to chance.",
      "image": {
        "src": "https://images.unsplash.com/photo-1523543659209-5c57c05834aa",
        "alt": "Short- & Long-Term Storage"
      }
    },
    {
      "icon": "ShieldCheck",
      "title": "Specialty & Heavy-Item Moves",
      "description": "Pianos, gun safes, hot tubs, and heavy gym equipment that need the right dollies, straps, and technique — not just extra hands and optimism — to move without injury or damage.",
      "image": {
        "src": "https://images.unsplash.com/photo-1586781383963-8e66f88077ec",
        "alt": "Specialty & Heavy-Item Moves"
      }
    },
    {
      "icon": "LayoutGrid",
      "title": "Moving Supplies & Boxes",
      "description": "Boxes, tape, mattress bags, and protective padding sized to what you actually own, so you are not improvising with grocery cartons on the morning of the move.",
      "image": {
        "src": "https://images.unsplash.com/photo-1663625318264-695d2d04f11a",
        "alt": "Moving Supplies & Boxes"
      }
    }
  ],
  "benefits": [
    {
      "icon": "BadgeCheck",
      "title": "Carriers You Can Actually Verify",
      "description": "Interstate movers must register with the FMCSA and carry a USDOT number you can look up. Confirming it up front is the single clearest line between an established mover and a rogue operator."
    },
    {
      "icon": "FileCheck",
      "title": "Estimates You Can Hold Them To",
      "description": "A binding or binding-not-to-exceed estimate ties the price to the agreed inventory, so the final bill does not balloon once the truck is loaded and the leverage has quietly shifted to the mover."
    },
    {
      "icon": "ShieldCheck",
      "title": "Protection Built Into the Move",
      "description": "Proper padding, crating, and a clear valuation-coverage choice mean damage is both less likely and actually accounted for, instead of discovered on unpacking day with no recourse."
    },
    {
      "icon": "Timer",
      "title": "Crews That Move Faster and Safer",
      "description": "An experienced two- or three-person crew loads efficiently and protects doorways, floors, and backs — which on an hourly local move is exactly what keeps the total in check."
    },
    {
      "icon": "CircleDollarSign",
      "title": "Costs You Can Plan Around",
      "description": "Once distance, home size, packing, and access are known, a good mover can price the job in a way you can compare like-for-like against other quotes rather than guessing at the number."
    }
  ],
  "options": {
    "title": "Choosing how to move",
    "intro": "Most moves come down to how much of the work you want to hand off versus how much you are willing to do yourself, and the honest answer depends on distance, budget, timeline, and how much heavy lifting you can realistically manage. Each option below trades cost against convenience and control in a fairly predictable way.",
    "items": [
      {
        "name": "Full-Service Movers",
        "summary": "A professional company handles the whole move — optionally packing, then loading, driving, unloading, and even unpacking — under one estimate. It is the least hands-on option and the one where licensing, valuation coverage, and a written estimate matter most.",
        "bestFor": "Long-distance moves, tight timelines, and anyone short on time or muscle",
        "lifespan": "One to a few days end to end, with minimal hands-on work required from you",
        "considerations": [
          "Highest cost of the four and the widest quality range, so verifying FMCSA licensing and reading the estimate type is essential",
          "Interstate pricing is driven by weight or volume, so a heavier inventory directly raises the bill",
          "Peak-season and month-end dates book out early and often carry premium pricing"
        ]
      },
      {
        "name": "Labor-Only (You Rent the Truck)",
        "summary": "You rent and drive the truck or trailer and hire movers by the hour only to load and unload. It splits the job so you keep control of the vehicle and route while handing off the heaviest, most injury-prone part.",
        "bestFor": "Local or regional moves where you are comfortable driving a rental truck",
        "lifespan": "Hourly help at each end; you own the scheduling and the drive between",
        "considerations": [
          "You carry the driving risk and any liability for the rental vehicle, its fuel, and its mileage",
          "Labor-only helpers typically are not liable for damage the way a full-service carrier's valuation coverage provides",
          "Coordinating separate truck and labor bookings on the same day takes planning, especially at month-end"
        ]
      },
      {
        "name": "Portable Container / Pod",
        "summary": "A company drops a weatherproof container at your home, you load it on your own schedule, and they transport it to the new address or hold it in storage. It blends DIY loading with professional driving and built-in storage flexibility.",
        "bestFor": "Flexible timelines, moves with a gap between closings, or staged loading",
        "lifespan": "Days to weeks of loading at your own pace, plus optional storage in between",
        "considerations": [
          "You still do all the loading and stacking, so poor load technique is on you if items shift in transit",
          "Container placement needs adequate driveway or street space and any permit an HOA or city requires",
          "Total cost depends on container count, distance, and how long you keep it, which can add up on longer holds"
        ]
      },
      {
        "name": "DIY Truck Rental",
        "summary": "You rent a truck, load it, drive it, and unload it yourself with help from friends or family. It is the lowest sticker price and the most work, and it puts every part of the move — and its risk — squarely on you.",
        "bestFor": "Short, smaller moves on a tight budget with willing help",
        "lifespan": "Rental billed by the day plus mileage; the whole job runs on your own effort",
        "considerations": [
          "Fuel, mileage, insurance add-ons, and equipment rental can quietly narrow the gap with hiring labor",
          "No professional valuation coverage, so damage to your belongings is entirely your own risk",
          "Driving a loaded truck you are not used to, and the physical toll, are real factors people tend to underestimate"
        ]
      }
    ]
  },
  "process": [
    {
      "title": "Inventory and In-Home or Video Survey",
      "description": "A reliable estimate starts from what is actually moving. A walkthrough — in person or by video — captures room counts, bulky and specialty items, access issues, and how much packing you want, which is what turns a vague phone quote into a number that holds up on move day."
    },
    {
      "title": "Choosing the Estimate Type",
      "description": "The mover proposes a non-binding, binding, or binding-not-to-exceed estimate. Understanding which one you are signing matters, because it decides whether the price can rise once the truck is loaded and how much protection you have if the weight or hours run over."
    },
    {
      "title": "Verifying Licensing and Coverage",
      "description": "For an interstate move, the carrier's USDOT number and FMCSA registration are confirmed, and you choose between the free released-value protection and full-value protection. This is also where deposit demands, reviews, and any pattern of complaints are worth checking before you book."
    },
    {
      "title": "Packing, Padding, and Loading",
      "description": "Boxes are labeled by room, furniture is padded and shrink-wrapped, and the truck or container is loaded with weight distributed and fragile items secured. Whether you or the crew packs, an accurate item count and careful stacking are what prevent shifting and breakage in transit."
    },
    {
      "title": "Delivery, Inventory Check, and Payment",
      "description": "At delivery the inventory is checked off as items come in, any damage is noted on the paperwork before you sign, and payment terms match the agreed estimate. Tipping the crew is customary in the US when the work is done well, though it is never required."
    }
  ],
  "costFactors": [
    {
      "factor": "Distance and Move Type",
      "detail": "Local moves are usually billed by the hour, so a short drive and easy access keep the total down. Long-distance and interstate moves are priced by shipment weight or volume plus mileage, which is why the same household costs far more across state lines than across town."
    },
    {
      "factor": "Home Size and Volume",
      "detail": "More rooms mean more boxes, more furniture, and more crew hours or truck space. On long-distance moves this shows up directly as weight, so a decluttered, lighter shipment is one of the few cost levers genuinely in your control before the truck arrives."
    },
    {
      "factor": "Packing and Specialty Services",
      "detail": "Full-service packing adds labor and materials but transfers both the risk and the time; partial packing of just the kitchen and fragiles is a common middle ground. Pianos, safes, appliances, and other specialty items carry added charges because they need specific equipment and handling."
    },
    {
      "factor": "Access, Stairs, and Long Carries",
      "detail": "Stairs, elevators, narrow doorways, and a long walk from door to truck all add labor time or a flat access fee. A shuttle is sometimes needed when a full-size truck cannot reach the door, and that too is billed, so describing the access at both ends up front avoids surprise line items."
    },
    {
      "factor": "Season, Timing, and Coverage",
      "detail": "Summer, weekends, and the start and end of each month are peak demand and tend to cost more, while midweek and off-season dates are often cheaper. Choosing full-value protection over the basic released-value coverage adds cost as well, but it is what actually pays out if something is damaged."
    }
  ],
  "faqs": [
    {
      "q": "How is a moving quote actually calculated?",
      "a": "It depends on the move type. Local moves are typically hourly — an agreed crew size and truck at a rate per hour, plus travel time and any materials — so the total tracks how long the job takes. Long-distance and interstate moves are priced instead by the weight or volume of your shipment and the distance it travels, plus charges for packing, stairs, long carries, or specialty items. Because the local clock and the long-distance weight are the two big drivers, a lighter, well-organized load and easy access at both ends are the most reliable ways to keep the number down."
    },
    {
      "q": "What is the difference between a binding and non-binding estimate?",
      "a": "A non-binding estimate is the mover's best guess, and the final bill can come in higher or lower based on the actual weight and services. A binding estimate fixes the price for the agreed inventory and services, so it will not change unless you add items. A binding-not-to-exceed estimate is the most protective: you pay the estimate or the actual weight, whichever is lower. Knowing which you are signing matters, because it decides whether move day can bring a bigger bill — and reputable movers put the estimate type in writing before they load."
    },
    {
      "q": "How do I make sure a mover is legitimate and not a scam?",
      "a": "For interstate moves, the carrier must be registered with the FMCSA and have a USDOT number you can verify through the federal lookup tool. Warning signs of a rogue operator include a large deposit demanded up front, a refusal to do an in-home or video survey, a quote that comes in far below all the others, and no written estimate. The classic scam is a lowball quote followed by an inflated bill, with belongings effectively held hostage until you pay. Checking the license, reading recent reviews, and getting everything in writing are the best defenses."
    },
    {
      "q": "Do I really need packing services, or can I pack myself?",
      "a": "You can absolutely pack yourself, and many people do to save money. The trade-offs are time and liability: self-packed boxes are usually not covered for damage to their contents the same way professionally packed cartons are, since the mover did not control how they were packed. A common compromise is to pack your own books, clothes, and non-fragile items while paying the crew to handle the kitchen, electronics, and anything breakable. If you do pack yourself, using proper boxes and padding rather than improvised containers makes a real difference in what survives the trip."
    },
    {
      "q": "Should I tip movers, and how much is normal?",
      "a": "Tipping is customary in the US when a crew does a good job, though it is never required. A common approach is a per-person amount that reflects the length and difficulty of the move — more for an all-day job, lots of stairs, or heavy specialty items — or a percentage of the labor cost split among the crew. Cash handed to each mover is typical, and offering water or lunch on a long move is a normal courtesy. If a crew was careless or unprofessional, it is entirely reasonable to tip less or not at all."
    }
  ]
};

export default moving;
