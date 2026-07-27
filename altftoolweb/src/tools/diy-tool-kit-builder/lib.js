/**
 * DIY tool kit builder.
 *
 * Two decisions decide what a starter kit costs, and neither is "which brand".
 *
 * 1. WHICH TOOLS. Every job has a short list it genuinely cannot be done
 *    without, a second list that makes it faster and safer, and a third that
 *    only matters once you are doing the job regularly. Buying all three at
 *    once is how people end up with a drawer of unused specialist tools and
 *    no decent tape measure.
 *
 * 2. BUY OR HIRE. For anything with a hire rate, the break-even is simply
 *
 *      buy when   purchase price <= expected uses x daily hire rate
 *
 *    A tile cutter you will use twice is cheaper hired; a drill you will use
 *    thirty times is absurd to hire. This is the same arithmetic a tool
 *    library runs, applied to your own project count.
 *
 * Prices are typical Indian retail bands in rupees for three quality tiers and
 * are indicative only — they move with brand, region and time. What does not
 * move is the ordering: the essential list first, the buy-or-hire test on the
 * expensive items, and the specialist tools last.
 */

/** Quality tiers, and what you are actually paying for. */
export const TIERS = [
  {
    id: "budget",
    label: "Budget",
    note: "Fine for a tool you will use a handful of times. Hand tools at this tier are usually acceptable; power tools are where it shows.",
  },
  {
    id: "mid",
    label: "Mid-range",
    note: "The sensible default. Better bearings, better steel and spare parts you can still buy in five years.",
  },
  {
    id: "pro",
    label: "Trade",
    note: "Worth it only for the two or three tools you use every week. Everything else is money sitting in a box.",
  },
];

/** Priority bands, which become the phases you buy in. */
export const PRIORITIES = {
  essential: { label: "Essential", order: 1, note: "The job cannot be done without it." },
  useful: { label: "Useful", order: 2, note: "Faster, safer or noticeably better results." },
  later: { label: "Later", order: 3, note: "Only once you are doing this kind of job regularly." },
};

/**
 * The tool catalogue. Prices in rupees by tier; hireDaily is the typical daily
 * hire rate where a tool is commonly hired, and null where it is not.
 */
export const TOOLS = [
  { id: "tape", label: "Tape measure, 5 m", budget: 150, mid: 350, pro: 800, hireDaily: null, why: "Everything else depends on this being right. Check it against a steel rule once when you buy it." },
  { id: "hammer", label: "Claw hammer, 450 g", budget: 300, mid: 600, pro: 1200, hireDaily: null, why: "The claw matters more than the face — most household hammer work is taking things out." },
  { id: "screwdrivers", label: "Screwdriver set", budget: 250, mid: 700, pro: 2000, hireDaily: null, why: "Cheap tips round off screw heads, and a rounded head is a much bigger problem than a blunt driver." },
  { id: "bits", label: "Driver bit set", budget: 300, mid: 800, pro: 2200, hireDaily: null, why: "Impact-rated bits for a cordless driver. The cheap ones shear at the shank." },
  { id: "level", label: "Spirit level, 600 mm", budget: 350, mid: 900, pro: 2500, hireDaily: null, why: "600 mm spans most of what a household levels. A short torpedo level lies to you over a long run." },
  { id: "knife", label: "Utility knife and blades", budget: 120, mid: 350, pro: 900, hireDaily: null, why: "Change the blade far more often than feels reasonable — a blunt blade slips, and that is how people get cut." },
  { id: "pliers", label: "Combination pliers", budget: 200, mid: 500, pro: 1200, hireDaily: null, why: "Grip, twist and cut in one tool." },
  { id: "longnose", label: "Long-nose pliers", budget: 180, mid: 450, pro: 1000, hireDaily: null, why: "For anything in a recess your fingers cannot reach, which is most electrical and plumbing work." },
  { id: "spanner", label: "Adjustable spanner", budget: 250, mid: 600, pro: 1500, hireDaily: null, why: "One 250 mm adjustable covers most household nuts, badly. A socket set covers them well." },
  { id: "allen", label: "Hex key set, metric and imperial", budget: 150, mid: 400, pro: 1200, hireDaily: null, why: "Flat-pack furniture, bicycles and most machine screws. Get both systems — the sizes are not interchangeable." },
  { id: "sockets", label: "Socket set", budget: 800, mid: 2500, pro: 7000, hireDaily: null, why: "Anything a spanner rounds off, a socket turns properly." },
  { id: "handsaw", label: "Hand saw", budget: 350, mid: 800, pro: 2000, hireDaily: null, why: "A hardpoint saw stays sharp for a year of occasional use and cannot be resharpened, which is a fair trade." },
  { id: "hacksaw", label: "Hacksaw", budget: 250, mid: 600, pro: 1400, hireDaily: null, why: "Metal, plastic pipe, bolts that have to come off. Blade teeth point forward." },
  { id: "chisels", label: "Wood chisel set", budget: 500, mid: 1200, pro: 3500, hireDaily: null, why: "For hinge and lock mortices. Useless blunt, so budget for a sharpening stone too." },
  { id: "clamps", label: "Clamps, pair", budget: 400, mid: 1000, pro: 3000, hireDaily: null, why: "A clamp is a second pair of hands, and glue joints need clamping pressure to reach full strength." },
  { id: "drill", label: "Cordless drill driver", budget: 2500, mid: 6000, pro: 15000, hireDaily: 250, why: "The one power tool worth buying properly. Two batteries, a clutch you can actually set, and a keyless chuck." },
  { id: "sds", label: "SDS rotary hammer", budget: 3500, mid: 8000, pro: 20000, hireDaily: 400, why: "Concrete and hard brick. A cordless drill in hammer mode makes noise and dust, not holes." },
  { id: "grinder", label: "Angle grinder, 115 mm", budget: 1800, mid: 3500, pro: 9000, hireDaily: 350, why: "Cuts and grinds almost anything. Also the tool that sends most DIYers to hospital — guard on, face shield on." },
  { id: "jigsaw", label: "Jigsaw", budget: 2000, mid: 4500, pro: 12000, hireDaily: 400, why: "Curves and cut-outs. The blade wanders on thick stock, so it is not a substitute for a circular saw." },
  { id: "circular-saw", label: "Circular saw", budget: 3000, mid: 7000, pro: 18000, hireDaily: 500, why: "Straight cuts in sheet goods, with a guide rail or a clamped straight edge." },
  { id: "mitre-saw", label: "Mitre saw", budget: 6000, mid: 14000, pro: 35000, hireDaily: 700, why: "Repeatable angled cuts for trim. Hard to justify for one room, hard to live without for a whole house." },
  { id: "sander", label: "Random orbit sander", budget: 2000, mid: 4500, pro: 11000, hireDaily: 350, why: "Faster and flatter than hand sanding, and it will not leave the swirl marks a rotary sander does." },
  { id: "tile-cutter", label: "Tile cutter", budget: 3500, mid: 9000, pro: 25000, hireDaily: 600, why: "A manual scoring cutter handles wall tile; porcelain and floor tile need a wet saw." },
  { id: "detector", label: "Stud, pipe and cable detector", budget: 800, mid: 2000, pro: 5000, hireDaily: null, why: "The cheapest insurance in the toolbox. Drilling into a buried cable or a pipe costs far more than the detector." },
  { id: "voltage-tester", label: "Non-contact voltage tester", budget: 250, mid: 600, pro: 1500, hireDaily: null, why: "Confirms dead before you touch. Test it on a known live circuit first, every time." },
  { id: "multimeter", label: "Multimeter", budget: 500, mid: 1500, pro: 5000, hireDaily: null, why: "Continuity, voltage and a blown fuse identified in seconds." },
  { id: "wire-strippers", label: "Wire strippers", budget: 250, mid: 600, pro: 1500, hireDaily: null, why: "Stripping insulation with a knife nicks the copper, and a nicked conductor is a future hot joint." },
  { id: "pipe-wrench", label: "Pipe wrench", budget: 500, mid: 1200, pro: 3000, hireDaily: null, why: "For round things a spanner cannot hold. It marks whatever it grips, so keep it off chrome." },
  { id: "basin-wrench", label: "Basin wrench", budget: 400, mid: 900, pro: 2200, hireDaily: null, why: "The only tool that reaches the nuts behind a basin, and worth every rupee the first time you need it." },
  { id: "ptfe", label: "PTFE tape and jointing compound", budget: 100, mid: 250, pro: 600, hireDaily: null, why: "Wrap in the direction the joint tightens, or it unwinds as you screw it up." },
  { id: "caulk-gun", label: "Caulking gun", budget: 250, mid: 600, pro: 1500, hireDaily: null, why: "A dripless gun with a release trigger costs a little more and stops the bead running on after you let go." },
  { id: "filling-knife", label: "Filling knife and scraper", budget: 150, mid: 400, pro: 1000, hireDaily: null, why: "Two widths — a narrow one to fill and a wide one to feather the edge flat." },
  { id: "brushes", label: "Paint brushes", budget: 200, mid: 500, pro: 1500, hireDaily: null, why: "The cheapest brushes shed bristles into the finish, which costs more time than the brush saved." },
  { id: "roller", label: "Roller, tray and pole", budget: 300, mid: 700, pro: 1800, hireDaily: null, why: "An extension pole turns ceiling painting from a ladder job into a floor job." },
  { id: "trowel", label: "Tiling trowel, spacers and float", budget: 400, mid: 900, pro: 2200, hireDaily: null, why: "Notch size sets the adhesive bed depth, which is what stops tiles sounding hollow." },
  { id: "ladder", label: "Step ladder", budget: 1500, mid: 3500, pro: 9000, hireDaily: 300, why: "Buy the height you actually need. Standing on the top step of a short ladder is how most DIY falls happen." },
  { id: "torch", label: "Head torch", budget: 300, mid: 800, pro: 2000, hireDaily: null, why: "Under sinks, in lofts and behind cupboards, both hands are already busy." },
  { id: "glasses", label: "Safety glasses", budget: 150, mid: 400, pro: 1000, hireDaily: null, why: "Non-negotiable for any cutting, grinding, drilling overhead or hammering masonry." },
  { id: "masks", label: "Dust masks, FFP2 or better", budget: 200, mid: 500, pro: 1200, hireDaily: null, why: "Wood, MDF and silica dust are all long-term respiratory hazards. A surgical mask does nothing for any of them." },
  { id: "ear", label: "Ear defenders", budget: 300, mid: 700, pro: 1800, hireDaily: null, why: "Any power tool run for more than a few minutes is over the level where hearing damage accumulates." },
  { id: "gloves", label: "Work gloves", budget: 150, mid: 400, pro: 1000, hireDaily: null, why: "Take them off for anything with a spinning blade — a glove caught in a tool takes the hand with it." },
  { id: "toolbox", label: "Tool bag or box", budget: 600, mid: 1500, pro: 4000, hireDaily: null, why: "Not for storage, for carrying. Half of every job is fetching the thing you left downstairs." },
  { id: "bike-multitool", label: "Bicycle multi-tool", budget: 400, mid: 1000, pro: 2500, hireDaily: null, why: "Hex keys, Torx and a chain breaker in something that fits a pocket." },
  { id: "torque-wrench", label: "Torque wrench", budget: 1500, mid: 3500, pro: 9000, hireDaily: 300, why: "Anything alloy, anything carbon, and every wheel nut. Wind it back to zero before storing it." },
  { id: "jack-stands", label: "Trolley jack and axle stands", budget: 2500, mid: 5000, pro: 12000, hireDaily: 400, why: "Never work under a car held up by a jack alone. The stands are the safety equipment; the jack only lifts." },
];

/** Jobs, and the tools each one calls for. */
export const JOBS = [
  {
    id: "flat-pack",
    label: "Assembling flat-pack furniture",
    tools: [
      ["allen", "essential"], ["screwdrivers", "essential"], ["hammer", "essential"],
      ["tape", "essential"], ["drill", "useful"], ["bits", "useful"], ["level", "useful"],
      ["toolbox", "later"],
    ],
  },
  {
    id: "shelves",
    label: "Shelves and fixings into masonry",
    tools: [
      ["drill", "essential"], ["bits", "essential"], ["level", "essential"], ["tape", "essential"],
      ["detector", "essential"], ["glasses", "essential"], ["masks", "useful"],
      ["sds", "useful"], ["screwdrivers", "useful"], ["ladder", "useful"],
    ],
  },
  {
    id: "painting",
    label: "Painting and decorating a room",
    tools: [
      ["brushes", "essential"], ["roller", "essential"], ["filling-knife", "essential"],
      ["caulk-gun", "essential"], ["ladder", "essential"], ["knife", "useful"],
      ["masks", "useful"], ["sander", "useful"], ["glasses", "useful"],
    ],
  },
  {
    id: "trim",
    label: "Fitting skirting, architrave and trim",
    tools: [
      ["tape", "essential"], ["handsaw", "essential"], ["hammer", "essential"],
      ["caulk-gun", "essential"], ["detector", "essential"], ["level", "useful"],
      ["mitre-saw", "useful"], ["drill", "useful"], ["clamps", "useful"], ["chisels", "later"],
    ],
  },
  {
    id: "tiling",
    label: "Tiling a splashback or floor",
    tools: [
      ["trowel", "essential"], ["tile-cutter", "essential"], ["level", "essential"],
      ["tape", "essential"], ["glasses", "essential"], ["caulk-gun", "useful"],
      ["masks", "useful"], ["grinder", "later"],
    ],
  },
  {
    id: "plumbing",
    label: "Taps, traps and washer changes",
    tools: [
      ["spanner", "essential"], ["pipe-wrench", "essential"], ["ptfe", "essential"],
      ["basin-wrench", "essential"], ["torch", "essential"], ["pliers", "useful"],
      ["hacksaw", "useful"], ["sockets", "later"],
    ],
  },
  {
    id: "electrics",
    label: "Replacing sockets and light fittings",
    tools: [
      ["voltage-tester", "essential"], ["screwdrivers", "essential"], ["wire-strippers", "essential"],
      ["torch", "essential"], ["longnose", "useful"], ["multimeter", "useful"],
      ["detector", "useful"], ["ladder", "useful"],
    ],
  },
  {
    id: "woodwork",
    label: "Building simple furniture",
    tools: [
      ["tape", "essential"], ["handsaw", "essential"], ["clamps", "essential"],
      ["drill", "essential"], ["bits", "essential"], ["glasses", "essential"],
      ["circular-saw", "useful"], ["sander", "useful"], ["chisels", "useful"],
      ["masks", "useful"], ["mitre-saw", "later"], ["jigsaw", "later"],
    ],
  },
  {
    id: "garden",
    label: "Fencing, decking and garden work",
    tools: [
      ["tape", "essential"], ["handsaw", "essential"], ["drill", "essential"],
      ["level", "essential"], ["gloves", "essential"], ["glasses", "essential"],
      ["circular-saw", "useful"], ["sds", "useful"], ["clamps", "useful"], ["ear", "useful"],
    ],
  },
  {
    id: "bike",
    label: "Bicycle maintenance",
    tools: [
      ["bike-multitool", "essential"], ["allen", "essential"], ["pliers", "useful"],
      ["torque-wrench", "useful"], ["longnose", "later"],
    ],
  },
  {
    id: "car",
    label: "Basic car maintenance",
    tools: [
      ["sockets", "essential"], ["jack-stands", "essential"], ["gloves", "essential"],
      ["torch", "essential"], ["spanner", "useful"], ["torque-wrench", "useful"],
      ["pliers", "useful"], ["multimeter", "later"],
    ],
  },
];

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

const MAX_USES = 200;

/**
 * Build the kit.
 *
 * @param {object} input
 * @param {string[]} input.jobIds       Jobs you plan to do.
 * @param {"budget"|"mid"|"pro"} [input.tier]
 * @param {string[]} [input.ownedIds]   Tools you already have.
 * @param {number} [input.expectedUses] How many times you expect to use a hireable tool.
 * @param {number} [input.budgetLimit]  Optional spending ceiling.
 */
export function buildToolKit({
  jobIds = [],
  tier = "mid",
  ownedIds = [],
  expectedUses = 3,
  budgetLimit = 0,
} = {}) {
  if (!TIERS.some((entry) => entry.id === tier)) {
    return { error: "Choose a budget, mid-range or trade tier." };
  }
  if (!Array.isArray(jobIds) || !Array.isArray(ownedIds)) {
    return { error: "Jobs and owned tools must be given as lists." };
  }
  if (!isNum(expectedUses) || !isNum(budgetLimit)) {
    return { error: "Expected uses and budget must be numbers." };
  }
  if (expectedUses < 1 || expectedUses > MAX_USES) {
    return { error: `Expected uses should be between 1 and ${MAX_USES}.` };
  }
  if (budgetLimit < 0) {
    return { error: "A budget cannot be negative. Use 0 for no limit." };
  }

  const jobs = JOBS.filter((job) => jobIds.includes(job.id));
  if (jobs.length === 0) {
    return { error: "Pick at least one job you plan to do." };
  }

  const owned = new Set(ownedIds);

  // Merge the jobs, keeping the highest priority any job assigns to a tool.
  const merged = new Map();
  for (const job of jobs) {
    for (const [toolId, priority] of job.tools) {
      const existing = merged.get(toolId);
      if (!existing || PRIORITIES[priority].order < PRIORITIES[existing.priority].order) {
        merged.set(toolId, { priority, jobs: existing ? [...existing.jobs, job.label] : [job.label] });
      } else {
        existing.jobs.push(job.label);
      }
    }
  }

  const entries = [];
  for (const [toolId, meta] of merged) {
    const tool = TOOLS.find((candidate) => candidate.id === toolId);
    if (!tool) continue;
    const price = tool[tier];
    const hireTotal = tool.hireDaily === null ? null : tool.hireDaily * Math.round(expectedUses);
    const shouldHire = hireTotal !== null && hireTotal < price;
    entries.push({
      ...tool,
      price,
      priority: meta.priority,
      jobs: [...new Set(meta.jobs)],
      owned: owned.has(toolId),
      hireTotal,
      shouldHire,
      saving: shouldHire ? price - hireTotal : 0,
    });
  }

  entries.sort(
    (a, b) => PRIORITIES[a.priority].order - PRIORITIES[b.priority].order || b.price - a.price,
  );

  const toBuy = entries.filter((entry) => !entry.owned);
  const phases = Object.keys(PRIORITIES).map((key) => {
    const items = toBuy.filter((entry) => entry.priority === key);
    return {
      id: key,
      ...PRIORITIES[key],
      items,
      cost: items.reduce((sum, item) => sum + (item.shouldHire ? item.hireTotal : item.price), 0),
      listPrice: items.reduce((sum, item) => sum + item.price, 0),
    };
  });

  const essentialCost = phases[0].cost;
  const totalCost = phases.reduce((sum, phase) => sum + phase.cost, 0);
  const totalListPrice = phases.reduce((sum, phase) => sum + phase.listPrice, 0);
  const hireSaving = totalListPrice - totalCost;
  const ownedValue = entries
    .filter((entry) => entry.owned)
    .reduce((sum, entry) => sum + entry.price, 0);
  const hireItems = toBuy.filter((entry) => entry.shouldHire);
  const costPerJob = jobs.length > 0 ? totalCost / jobs.length : 0;

  let verdict;
  if (budgetLimit > 0 && essentialCost > budgetLimit) {
    verdict = `The essential list alone comes to ${Math.round(essentialCost)} against a budget of ${Math.round(budgetLimit)}. Hire what you can, and drop to the budget tier on hand tools before you drop anything off the essential list.`;
  } else if (budgetLimit > 0 && totalCost > budgetLimit) {
    verdict = `Everything comes to ${Math.round(totalCost)}, over your ${Math.round(budgetLimit)} budget, but the essential phase is only ${Math.round(essentialCost)}. Buy that now and add the rest as jobs come up.`;
  } else if (hireItems.length > 0) {
    verdict = `${hireItems.length} item${hireItems.length === 1 ? " is" : "s are"} cheaper hired at ${Math.round(expectedUses)} use${Math.round(expectedUses) === 1 ? "" : "s"}, saving about ${Math.round(hireSaving)}. Total for the kit: ${Math.round(totalCost)}, of which ${Math.round(essentialCost)} is what you need before starting.`;
  } else {
    verdict = `At ${Math.round(expectedUses)} uses each, everything here is worth owning. Total ${Math.round(totalCost)}, with ${Math.round(essentialCost)} of it needed before you start.`;
  }

  return {
    jobs,
    tier: TIERS.find((entry) => entry.id === tier),
    expectedUses: Math.round(expectedUses),
    entries,
    phases,
    toBuyCount: toBuy.length,
    ownedCount: entries.length - toBuy.length,
    ownedValue,
    essentialCost,
    totalCost,
    totalListPrice,
    hireSaving,
    hireItems,
    costPerJob,
    budgetLimit,
    withinBudget: budgetLimit === 0 || totalCost <= budgetLimit,
    verdict,
  };
}
