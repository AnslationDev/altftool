/**
 * Fall prevention home checklist.
 *
 * Hazard items follow the CDC "Check for Safety" home fall prevention checklist
 * and the STEADI (Stopping Elderly Accidents, Deaths and Injuries) initiative,
 * together with NICE clinical guideline CG161 on falls in older people. The
 * three personal screening questions below are the STEADI key questions: a yes
 * to any one of them marks someone as at increased risk of falling.
 *
 * Impact weights reflect how strongly each hazard features in fall prevention
 * guidance (3 = repeatedly named as a leading contributor, 1 = worth fixing but
 * a smaller contributor). They are a prioritisation aid, not a validated score.
 */

/** CDC: about one in four adults aged 65 and over falls each year. */
export const FALL_RATE_65_PLUS = "about 1 in 4 adults aged 65 and over falls each year";

export const EFFORT_LEVELS = [
  { key: "free", label: "Free, do it today", rank: 0 },
  { key: "cheap", label: "Small spend", rank: 1 },
  { key: "help", label: "Needs a hand or a tradesperson", rank: 2 },
];

export const ROOMS = [
  { key: "entry", label: "Entrance and outside" },
  { key: "stairs", label: "Stairs and hallways" },
  { key: "living", label: "Living room" },
  { key: "kitchen", label: "Kitchen" },
  { key: "bedroom", label: "Bedroom" },
  { key: "bathroom", label: "Bathroom" },
  { key: "general", label: "Lighting and general" },
];

export const CHECKLIST = [
  // Entrance and outside
  { key: "entry-path", room: "entry", task: "Path to the door is even, well drained and free of moss", fix: "Fill dips, clear moss and leaves, and repair loose paving.", impact: 3, effort: "help" },
  { key: "entry-light", room: "entry", task: "Outside light works and covers the whole doorstep", fix: "Fit a motion-sensor light so the key is never found in the dark.", impact: 2, effort: "cheap" },
  { key: "entry-handrail", room: "entry", task: "Entrance steps have a firm handrail", fix: "Add a grab rail beside the door step; even one step causes falls.", impact: 3, effort: "help" },
  { key: "entry-mat", room: "entry", task: "Doormat lies flat with no curled edges", fix: "Replace with a low-profile mat or fix the edges down with tape.", impact: 2, effort: "free" },

  // Stairs and hallways
  { key: "stairs-rail", room: "stairs", task: "Handrails run the full length of the stairs on both sides", fix: "Extend or add a second rail. A rail that stops short is a common fall point.", impact: 3, effort: "help" },
  { key: "stairs-clear", room: "stairs", task: "Nothing is stored or left on the steps", fix: "Clear shoes, post and boxes off the stairs today and keep them clear.", impact: 3, effort: "free" },
  { key: "stairs-carpet", room: "stairs", task: "Stair carpet is firmly fixed with no loose or worn treads", fix: "Re-tack loose carpet and replace worn treads.", impact: 3, effort: "help" },
  { key: "stairs-switch", room: "stairs", task: "Light switches at the top and bottom of the stairs", fix: "Add a two-way switch or a plug-in motion light for the landing.", impact: 2, effort: "cheap" },
  { key: "stairs-edge", room: "stairs", task: "Step edges are easy to see", fix: "Add contrasting non-slip nosing strips so each step edge is visible.", impact: 2, effort: "cheap" },

  // Living room
  { key: "living-rugs", room: "living", task: "No loose rugs, or all rugs have non-slip backing", fix: "Remove loose rugs entirely, or fix them with double-sided carpet tape.", impact: 3, effort: "free" },
  { key: "living-cords", room: "living", task: "Cables and phone cords run along walls, never across walkways", fix: "Reroute cords behind furniture or clip them to the skirting.", impact: 2, effort: "free" },
  { key: "living-path", room: "living", task: "A clear walking route runs through the room", fix: "Move a coffee table or footstool to open a straight path.", impact: 2, effort: "free" },
  { key: "living-chair", room: "living", task: "The main chair is high enough to stand up from with arms to push on", fix: "Raise the chair on stable risers or swap to a firmer, higher chair.", impact: 3, effort: "cheap" },

  // Kitchen
  { key: "kitchen-reach", room: "kitchen", task: "Everyday items are between waist and shoulder height", fix: "Move daily crockery and food down from high shelves.", impact: 3, effort: "free" },
  { key: "kitchen-stool", room: "kitchen", task: "No chair or stool used for reaching", fix: "Buy a step stool with a handrail, or ask for help instead of climbing.", impact: 3, effort: "cheap" },
  { key: "kitchen-spills", room: "kitchen", task: "Spills are wiped immediately and the floor is not polished slippery", fix: "Keep a cloth in reach; stop using high-gloss floor polish.", impact: 2, effort: "free" },

  // Bedroom
  { key: "bedroom-light", room: "bedroom", task: "A light can be switched on from the bed", fix: "Add a bedside lamp or a touch light within arm's reach.", impact: 3, effort: "cheap" },
  { key: "bedroom-path", room: "bedroom", task: "The route from bed to bathroom is clear and lit", fix: "Fit plug-in night lights along the route and clear the floor.", impact: 3, effort: "cheap" },
  { key: "bedroom-height", room: "bedroom", task: "The bed is a height where feet reach the floor when sitting", fix: "Adjust or change the bed; too high and too low both cause falls.", impact: 2, effort: "help" },
  { key: "bedroom-phone", room: "bedroom", task: "A phone or alarm is reachable from the floor beside the bed", fix: "Keep a mobile on a low bedside shelf, or wear a pendant alarm.", impact: 2, effort: "cheap" },

  // Bathroom
  { key: "bath-grab", room: "bathroom", task: "Grab rails beside the toilet and inside the shower or bath", fix: "Fit properly screwed grab rails — suction rails are not load-bearing.", impact: 3, effort: "help" },
  { key: "bath-mat", room: "bathroom", task: "Non-slip mat or strips in the bath or shower tray", fix: "Add a rubber non-slip mat; wet enamel is the single slipperiest surface in the house.", impact: 3, effort: "cheap" },
  { key: "bath-seat", room: "bathroom", task: "A shower stool or bath board is available if standing is tiring", fix: "Get a shower stool so washing does not depend on standing balance.", impact: 2, effort: "cheap" },
  { key: "bath-toilet", room: "bathroom", task: "Toilet height allows standing up without pulling on the basin", fix: "Add a raised toilet seat or a toilet frame.", impact: 2, effort: "cheap" },
  { key: "bath-floor", room: "bathroom", task: "Bathroom floor dries quickly and has no loose bath mat", fix: "Use a mat with a rubber backing and hang it up after use.", impact: 2, effort: "free" },

  // Lighting and general
  { key: "gen-bulbs", room: "general", task: "All bulbs work and are bright enough to read by", fix: "Replace dim or dead bulbs; ageing eyes need considerably more light.", impact: 3, effort: "cheap" },
  { key: "gen-shoes", room: "general", task: "Indoor footwear is well fitting with a firm sole and back", fix: "Swap loose slippers and socks for shoes with a back and grip.", impact: 3, effort: "cheap" },
  { key: "gen-glasses", room: "general", task: "Eye test in the last year, and no walking about in reading glasses", fix: "Book an eye test; varifocals in particular distort steps and kerbs.", impact: 3, effort: "cheap" },
  { key: "gen-pets", room: "general", task: "Pets and their bowls do not sit in walking routes", fix: "Move bowls out of doorways and put a bell on the cat.", impact: 1, effort: "free" },
  { key: "gen-alarm", room: "general", task: "There is a way to call for help after a fall", fix: "Set up a pendant alarm, a smartwatch fall alert, or a daily check-in call.", impact: 2, effort: "cheap" },
];

/** STEADI key screening questions. A yes to any one signals increased risk. */
export const RISK_QUESTIONS = [
  { key: "fell", question: "Have you fallen in the past year?", note: "A previous fall is the strongest single predictor of another one." },
  { key: "unsteady", question: "Do you feel unsteady when standing or walking?", note: "Unsteadiness suggests a balance, strength or blood pressure problem worth assessing." },
  { key: "worry", question: "Do you worry about falling?", note: "Fear of falling leads to less activity, which weakens the legs and raises risk further." },
  { key: "meds", question: "Do you take four or more prescribed medicines a day?", note: "Polypharmacy, and especially sedatives, antidepressants and blood pressure drugs, raises fall risk. Ask for a medication review." },
  { key: "rise", question: "Do you need to push up with your arms to get out of a chair?", note: "That points to lower limb weakness — strength and balance exercise is the best studied fix." },
];

const EFFORT_RANK = EFFORT_LEVELS.reduce((map, row) => ({ ...map, [row.key]: row.rank }), {});

export const TOTAL_WEIGHT = CHECKLIST.reduce((sum, item) => sum + item.impact, 0);

function bandFor(percent) {
  // Weighted share of hazards already dealt with.
  if (percent >= 90) return { code: "low", label: "Low hazard home", note: "Almost everything on the checklist is done. Re-check after any change — new rug, new medication, new furniture." };
  if (percent >= 70) return { code: "moderate", label: "Mostly safe, gaps remain", note: "The basics are covered. Work through the ranked list below, starting with the free items." };
  if (percent >= 40) return { code: "raised", label: "Several hazards left", note: "Enough hazards remain to be worth a focused weekend. Prioritise stairs, bathroom and lighting." };
  return { code: "high", label: "Many hazards present", note: "Most of the checklist is outstanding. Start with the free, high-impact items today; they cost nothing but time." };
}

/**
 * Score a home and rank what is left.
 *
 * @param {object} input
 * @param {string[]} input.doneKeys keys from CHECKLIST already dealt with
 * @param {string[]} [input.riskAnswers] keys from RISK_QUESTIONS answered yes
 * @returns {object} score and ranked actions, or { error }
 */
export function scoreFallRisk({ doneKeys, riskAnswers = [] } = {}) {
  if (!Array.isArray(doneKeys)) return { error: "Pass the completed checklist items as an array." };
  if (!Array.isArray(riskAnswers)) return { error: "Pass the risk answers as an array." };

  const doneSet = new Set(doneKeys);
  const done = CHECKLIST.filter((item) => doneSet.has(item.key));
  const remaining = CHECKLIST.filter((item) => !doneSet.has(item.key));

  const doneWeight = done.reduce((sum, item) => sum + item.impact, 0);
  const percent = TOTAL_WEIGHT > 0 ? Math.round((doneWeight / TOTAL_WEIGHT) * 100) : 0;

  const ranked = [...remaining].sort((a, b) => {
    if (b.impact !== a.impact) return b.impact - a.impact;
    if (EFFORT_RANK[a.effort] !== EFFORT_RANK[b.effort]) return EFFORT_RANK[a.effort] - EFFORT_RANK[b.effort];
    return a.key.localeCompare(b.key);
  });

  const byRoom = ROOMS.map((room) => {
    const items = CHECKLIST.filter((item) => item.room === room.key);
    const roomDone = items.filter((item) => doneSet.has(item.key));
    const roomWeight = items.reduce((sum, item) => sum + item.impact, 0);
    const roomDoneWeight = roomDone.reduce((sum, item) => sum + item.impact, 0);
    return {
      ...room,
      items,
      doneCount: roomDone.length,
      totalCount: items.length,
      percent: roomWeight > 0 ? Math.round((roomDoneWeight / roomWeight) * 100) : 0,
    };
  });

  const answered = RISK_QUESTIONS.filter((row) => riskAnswers.includes(row.key));
  const steadiFlags = answered.filter((row) => ["fell", "unsteady", "worry"].includes(row.key));

  return {
    percent,
    band: bandFor(percent),
    doneCount: done.length,
    totalCount: CHECKLIST.length,
    doneWeight,
    totalWeight: TOTAL_WEIGHT,
    remaining,
    ranked,
    quickWins: ranked.filter((item) => item.effort === "free"),
    byRoom,
    riskAnswers: answered,
    steadiPositive: steadiFlags.length > 0,
    steadiCount: steadiFlags.length,
  };
}
