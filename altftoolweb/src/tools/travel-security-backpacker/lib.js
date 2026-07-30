/**
 * Backpacker digital safety — domain coverage scoring plus a cheapest-first kit planner.
 *
 * The point of this module is that most of the protection on a long, low-budget trip costs
 * nothing. Each measure carries an indicative rupee cost and a set of 1-5 coverage points
 * across six risk domains, so the tool can answer two separate questions:
 *
 *   1. How well covered is each domain right now?
 *   2. Given a budget, which measures close the most remaining gap per rupee?
 *
 * The second question is a small greedy set-cover with a budget constraint. At each step it
 * scores every affordable measure by the coverage it would add BELOW the target (points
 * beyond the target are worth nothing), divided by its cost plus one rupee — the plus-one
 * keeps free measures finite and orders them by raw gain, which is the correct behaviour:
 * free measures should always be exhausted before money is spent.
 *
 * Costs are indicative Indian retail prices for the cheapest usable version of each item and
 * are exported so they can be checked. Coverage points are consistent editorial ratings.
 *
 * Pure module: no React, no DOM, no clocks, no randomness — the greedy tie-breaks are
 * deterministic, so the same input always produces the same plan.
 */

/** Risk domains a long trip has to cover. */
export const DOMAINS = [
  { id: "dorm", label: "Theft in shared rooms" },
  { id: "device", label: "Device loss or theft" },
  { id: "account", label: "Account takeover and lockout" },
  { id: "docs", label: "Documents and identity" },
  { id: "payment", label: "Cards, cash and fraud" },
  { id: "personal", label: "Personal safety and emergencies" },
];

/** Cost tiers, for grouping in the interface. */
export const TIERS = [
  { id: "free", label: "Free — habits and settings", max: 0 },
  { id: "cheap", label: "Cheap kit (under ₹1,000)", max: 1000 },
  { id: "moderate", label: "Bigger spend", max: Infinity },
];

/** The plus-one rupee that keeps free measures finite in the efficiency ranking. */
export const COST_FLOOR = 1;

/**
 * Measures. `cost` is an indicative rupee price for the cheapest usable version.
 * `points` are 1-5 coverage ratings per domain; absent domains score zero.
 */
export const MEASURES = [
  {
    id: "strong-passcode",
    label: "Six-digit or longer passcode on the phone, with biometrics treated as convenience only",
    cost: 0,
    points: { device: 4, account: 3 },
    why: "A four-digit PIN or a swipe pattern is read off the screen in a hostel common room in one glance.",
  },
  {
    id: "2fa-app",
    label: "Authenticator app instead of SMS codes, with backup codes printed and carried separately",
    cost: 0,
    points: { account: 5, device: 2 },
    why: "SMS two-factor stops working the moment your SIM is lost, stolen or out of coverage.",
  },
  {
    id: "find-my",
    label: "Find My / Find My Device switched on and actually tested once",
    cost: 0,
    points: { device: 4 },
    why: "Remote lock and wipe only help if you have used them before, not while borrowing a stranger's laptop.",
  },
  {
    id: "cloud-backup",
    label: "Photos and documents backing themselves up over Wi-Fi to an account you can open anywhere",
    cost: 0,
    points: { device: 3, docs: 3 },
    why: "Everything on the phone is gone with the phone unless the copy left the building.",
  },
  {
    id: "doc-scans",
    label: "Encrypted scans of passport, visa, insurance and tickets, openable offline",
    cost: 0,
    points: { docs: 5 },
    why: "An embassy asks for the passport data page first, and you will not have internet when you need it.",
  },
  {
    id: "split-cash",
    label: "Cash and cards split across three places — never all of it in one bag",
    cost: 0,
    points: { payment: 5, dorm: 3 },
    why: "One theft should cost you a day, not the trip. This is the single highest-value free habit.",
  },
  {
    id: "card-alerts",
    label: "Transaction alerts on, and daily ATM and online limits lowered before you fly",
    cost: 0,
    points: { payment: 4 },
    why: "A low limit converts a card compromise from a catastrophe into an annoyance.",
  },
  {
    id: "share-itinerary",
    label: "Itinerary and a check-in schedule shared with one person at home",
    cost: 0,
    points: { personal: 5 },
    why: "Someone noticing you missed a check-in is what starts a search; nothing else does.",
  },
  {
    id: "offline-map",
    label: "Offline maps and the route from the station to your bed downloaded before you arrive",
    cost: 0,
    points: { personal: 3 },
    why: "Standing still with a phone out in an unfamiliar place at night is the moment most thefts happen.",
  },
  {
    id: "emergency-numbers",
    label: "Local emergency number, embassy and insurer saved offline with country codes",
    cost: 0,
    points: { personal: 5, docs: 2 },
    why: "A number saved without its country code will not dial once you are outside the home network.",
  },
  {
    id: "no-open-wifi",
    label: "No banking or account changes on hostel Wi-Fi without a VPN or your own hotspot",
    cost: 0,
    points: { account: 4, payment: 2 },
    why: "Hostel networks are shared, unmanaged and frequently imitated by a device in the next room.",
  },
  {
    id: "no-shared-pc",
    label: "No sign-ins on hostel lobby computers or borrowed laptops",
    cost: 0,
    points: { account: 4 },
    why: "Assume any machine you do not control is logging what you type, because some of them are.",
  },
  {
    id: "bed-choice",
    label: "Bag between you and the wall at night, valuables inside the sleeping bag, not under the bunk",
    cost: 0,
    points: { dorm: 4 },
    why: "Dormitory theft is quiet and opportunistic; anything you are lying on is not opportunistic to reach.",
  },
  {
    id: "charge-own",
    label: "Charging only from your own adapter, never a shared USB socket or a lobby charging locker",
    cost: 0,
    points: { device: 2, account: 2 },
    why: "A bare USB socket in a hostel wall is unlabelled, unaudited and trivially replaced.",
  },
  {
    id: "padlock",
    label: "Two decent padlocks — one for the hostel locker, one through the bag zips",
    cost: 600,
    points: { dorm: 5, device: 3 },
    why: "Most hostels supply a locker and no lock; the ones that lend locks lend the same key pattern to everyone.",
  },
  {
    id: "cable-lock",
    label: "Steel cable lock to secure the bag to a bed frame or luggage rack",
    cost: 500,
    points: { dorm: 4, device: 3 },
    why: "It will not defeat a determined thief, but it defeats every thief who wants to be gone in ten seconds.",
  },
  {
    id: "money-belt",
    label: "Flat under-clothing pouch for the passport and reserve cash",
    cost: 500,
    points: { docs: 4, payment: 3 },
    why: "It keeps the irreplaceable half of your kit on your body during transit, which is when bags go missing.",
  },
  {
    id: "zip-clip",
    label: "Lockable zip clips or a slash-resistant strap on the daypack",
    cost: 700,
    points: { dorm: 3, payment: 2 },
    why: "Aimed squarely at crowded buses and markets, where the bag is behind you and open in two seconds.",
  },
  {
    id: "door-alarm",
    label: "Door-stop alarm for private rooms and guesthouses",
    cost: 700,
    points: { personal: 4 },
    why: "In rooms with unknown key control, a lock you brought yourself is the only one you can rely on.",
  },
  {
    id: "data-blocker",
    label: "USB data blocker or a charge-only cable",
    cost: 350,
    points: { device: 2, account: 2 },
    why: "It removes the data pins entirely, so a compromised socket has nothing to talk to.",
  },
  {
    id: "vpn-year",
    label: "A year of a reputable paid VPN",
    cost: 2500,
    points: { account: 4, payment: 2 },
    why: "It moves your trust from an unknown hostel network to a provider you chose; free VPNs sell the same traffic.",
  },
  {
    id: "travel-insurance",
    label: "Travel insurance covering devices and documents, with the policy number saved offline",
    cost: 4000,
    points: { device: 5, docs: 4, personal: 5 },
    why: "The only measure here that pays for a replacement rather than preventing a loss, and the only one that covers hospital costs.",
  },
  {
    id: "spare-phone",
    label: "A cheap second handset kept separately, with the essential apps and a spare SIM",
    cost: 6000,
    points: { device: 4, account: 3, personal: 3 },
    why: "Recovering an account usually requires a device you already trust — which is no help if it was the stolen one.",
  },
  {
    id: "power-bank",
    label: "Power bank big enough for a full day away from a socket",
    cost: 2000,
    points: { personal: 3, device: 2 },
    why: "A dead phone in an unfamiliar city is a safety problem before it is an inconvenience.",
  },
];

/** Coverage bands, lower bound inclusive. */
export const BANDS = [
  { id: "thin", min: 0, label: "Thin — a single bad night ends the trip", tone: "danger" },
  { id: "basic", min: 45, label: "Basic cover", tone: "warning" },
  { id: "solid", min: 70, label: "Solid for a long trip", tone: "success" },
  { id: "strong", min: 88, label: "Strong", tone: "success" },
];

export const DEFAULT_TARGET_PERCENT = 70;

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

const RUPEES = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => RUPEES.format(value);

const cleanIds = (value) =>
  Array.isArray(value) ? Array.from(new Set(value.map((entry) => String(entry)))) : null;

const pointsFor = (measure, domainId) => measure.points[domainId] || 0;

/** Total achievable points per domain across the whole catalogue. */
export function domainTotals() {
  const totals = {};
  for (const domain of DOMAINS) {
    totals[domain.id] = MEASURES.reduce((sum, measure) => sum + pointsFor(measure, domain.id), 0);
  }
  return totals;
}

function currentPoints(adoptedSet) {
  const points = {};
  for (const domain of DOMAINS) {
    points[domain.id] = MEASURES.filter((measure) => adoptedSet.has(measure.id)).reduce(
      (sum, measure) => sum + pointsFor(measure, domain.id),
      0,
    );
  }
  return points;
}

/**
 * Greedy cheapest-first plan. Returns the measures to add, in the order to buy them.
 * Deterministic: ties break on lower cost, then on measure id.
 */
function greedyPlan(adoptedSet, budget, targetPercent) {
  const totals = domainTotals();
  const targets = {};
  for (const domain of DOMAINS) {
    targets[domain.id] = Math.ceil((totals[domain.id] * targetPercent) / 100);
  }

  const chosen = new Set(adoptedSet);
  const plan = [];
  let spent = 0;

  for (let step = 0; step < MEASURES.length; step += 1) {
    const points = currentPoints(chosen);
    const deficits = {};
    let totalDeficit = 0;
    for (const domain of DOMAINS) {
      const deficit = Math.max(0, targets[domain.id] - points[domain.id]);
      deficits[domain.id] = deficit;
      totalDeficit += deficit;
    }
    if (totalDeficit === 0) break;

    let best = null;
    for (const measure of MEASURES) {
      if (chosen.has(measure.id)) continue;
      if (spent + measure.cost > budget) continue;
      let gain = 0;
      for (const domain of DOMAINS) {
        gain += Math.min(pointsFor(measure, domain.id), deficits[domain.id]);
      }
      if (gain <= 0) continue;
      const efficiency = gain / (measure.cost + COST_FLOOR);
      if (
        !best ||
        efficiency > best.efficiency ||
        (efficiency === best.efficiency &&
          (measure.cost < best.measure.cost ||
            (measure.cost === best.measure.cost && measure.id < best.measure.id)))
      ) {
        best = { measure, gain, efficiency };
      }
    }

    if (!best) break;
    chosen.add(best.measure.id);
    plan.push({
      id: best.measure.id,
      label: best.measure.label,
      cost: best.measure.cost,
      gain: best.gain,
      why: best.measure.why,
    });
    spent += best.measure.cost;
  }

  return { plan, spent, chosen };
}

/**
 * Assess a backpacking security setup and plan the cheapest useful additions.
 *
 * @param {object} input
 * @param {string[]} input.adoptedIds     Measures already in place.
 * @param {number}   input.budgetInr      Rupees available for new kit.
 * @param {number}   input.targetPercent  Coverage target per domain, 0-100.
 * @returns {object} assessment, or { error } when the input cannot be used.
 */
export function assessBackpackerSecurity({ adoptedIds, budgetInr, targetPercent }) {
  const adopted = cleanIds(adoptedIds);
  if (!adopted) return { error: "Measures already in place must be supplied as a list." };
  if (!isFiniteNumber(budgetInr)) return { error: "Enter your kit budget as a plain number." };
  if (budgetInr < 0) return { error: "Budget cannot be negative." };
  if (budgetInr > 1000000) return { error: "Budget should be under ₹10,00,000 for a kit list." };
  if (!isFiniteNumber(targetPercent)) return { error: "Enter the coverage target as a number." };
  if (targetPercent < 10 || targetPercent > 100) {
    return { error: "Coverage target should be between 10% and 100%." };
  }

  const known = new Set(MEASURES.map((measure) => measure.id));
  if (adopted.some((id) => !known.has(id))) {
    return { error: "One of the selected measures is not on the list." };
  }

  const adoptedSet = new Set(adopted);
  const totals = domainTotals();
  const points = currentPoints(adoptedSet);

  const domains = DOMAINS.map((domain) => {
    const total = totals[domain.id];
    const have = points[domain.id];
    return {
      id: domain.id,
      label: domain.label,
      have,
      total,
      percent: total > 0 ? Math.round((have / total) * 100) : 100,
      meetsTarget: total === 0 || (have / total) * 100 >= targetPercent,
    };
  });

  const grandTotal = DOMAINS.reduce((sum, domain) => sum + totals[domain.id], 0);
  const grandHave = DOMAINS.reduce((sum, domain) => sum + points[domain.id], 0);
  const overallPercent = grandTotal > 0 ? Math.round((grandHave / grandTotal) * 100) : 0;

  let band = BANDS[0];
  for (const entry of BANDS) if (overallPercent >= entry.min) band = entry;

  const weakest = [...domains].sort((a, b) => a.percent - b.percent || a.label.localeCompare(b.label))[0];

  const budgeted = greedyPlan(adoptedSet, budgetInr, targetPercent);
  const unlimited = greedyPlan(adoptedSet, Infinity, targetPercent);

  const afterPoints = currentPoints(budgeted.chosen);
  const afterDomains = DOMAINS.map((domain) => ({
    id: domain.id,
    label: domain.label,
    percent: totals[domain.id] > 0 ? Math.round((afterPoints[domain.id] / totals[domain.id]) * 100) : 100,
  }));
  const afterOverall =
    grandTotal > 0
      ? Math.round(
          (DOMAINS.reduce((sum, domain) => sum + afterPoints[domain.id], 0) / grandTotal) * 100,
        )
      : 0;

  const freeRemaining = MEASURES.filter(
    (measure) => measure.cost === 0 && !adoptedSet.has(measure.id),
  ).map((measure) => ({ id: measure.id, label: measure.label }));

  const planReachesTarget = afterDomains.every((domain) => domain.percent >= targetPercent);
  const costToTarget = unlimited.spent;

  let verdict;
  if (freeRemaining.length > 0) {
    verdict = `${freeRemaining.length} free measure(s) are still unticked. Do those before spending anything — they cost nothing and cover more ground per unit of effort than any purchase on this list.`;
  } else if (planReachesTarget) {
    verdict = `Your budget of ${money(budgetInr)} reaches ${targetPercent}% coverage in every domain. Buy the plan below in the order shown, cheapest useful item first.`;
  } else if (costToTarget > budgetInr) {
    verdict = `Reaching ${targetPercent}% in every domain would cost about ${money(costToTarget)}. Your budget closes the highest-value gaps first; the weakest domain remaining is ${weakest.label.toLowerCase()}.`;
  } else {
    verdict = `Work through the plan below. The weakest domain right now is ${weakest.label.toLowerCase()}, at ${weakest.percent}% coverage.`;
  }

  return {
    overallPercent,
    band,
    domains,
    weakest,
    grandHave,
    grandTotal,
    adoptedCount: adoptedSet.size,
    totalMeasures: MEASURES.length,
    plan: budgeted.plan,
    planCost: budgeted.spent,
    planReachesTarget,
    afterOverall,
    afterDomains,
    costToTarget,
    freeRemaining,
    targetPercent,
    budgetInr,
    verdict,
  };
}
