/**
 * Splitting shared tips across a group when not everyone was at every meal.
 *
 * The naive approach — total the tips and divide by the number of travellers — is unfair the
 * moment one person skips a dinner or two people take a private guide. This module splits each
 * tip only among the people who were actually there, then nets off who already paid, and
 * finally reduces the tangle of mutual debts to the smallest set of transfers that settles it.
 *
 * Two details make it trustworthy:
 *
 * 1. All arithmetic happens in integer minor units (cents, pence, paise). Splitting 10.00 three
 *    ways in floating point gives 3.3333... and the shares do not add back up to 10.00. Working
 *    in cents and handing the leftover cents out one at a time guarantees the shares sum
 *    EXACTLY to the amount, which is the whole point of a splitter.
 *
 * 2. The leftover cents go to participants in list order, deterministically, so the same input
 *    always produces the same answer — no randomness, no drift when the page re-renders.
 *
 * The settlement uses the standard greedy debt-simplification: repeatedly match the largest
 * debtor against the largest creditor. For n people it needs at most n-1 transfers, which is
 * far fewer than everyone paying everyone.
 */

export const MIN_PEOPLE = 2;
export const MAX_PEOPLE = 30;
export const MAX_ITEMS = 60;
/** Sanity ceiling per line, in major units, so a typo cannot produce a nonsense settlement. */
export const MAX_ITEM_AMOUNT = 1000000;

/** Marker for a tip nobody has paid yet — everyone contributes their share into a kitty. */
export const UNPAID = -1;

// `decimals` is the number of minor-unit digits Intl.NumberFormat uses for that
// currency by default (e.g. JPY has no subunit in everyday use, so it is 0
// while most others are 2). toCents/fromCents must use the same digit count
// or the "cents" arithmetic and the on-screen formatted totals disagree.
export const CURRENCIES = [
  { code: "USD", locale: "en-US", label: "US dollar", decimals: 2 },
  { code: "EUR", locale: "de-DE", label: "Euro", decimals: 2 },
  { code: "GBP", locale: "en-GB", label: "Pound sterling", decimals: 2 },
  { code: "INR", locale: "en-IN", label: "Indian rupee", decimals: 2 },
  { code: "AED", locale: "en-AE", label: "UAE dirham", decimals: 2 },
  { code: "SGD", locale: "en-SG", label: "Singapore dollar", decimals: 2 },
  { code: "JPY", locale: "ja-JP", label: "Japanese yen", decimals: 0 },
  { code: "AUD", locale: "en-AU", label: "Australian dollar", decimals: 2 },
];

const DEFAULT_DECIMALS = 2;

/** Minor-unit digit count for a currency code, defaulting to 2 (e.g. cents) when unknown. */
export function decimalsForCurrency(code) {
  const currency = CURRENCIES.find((item) => item.code === code);
  return currency ? currency.decimals : DEFAULT_DECIMALS;
}

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

/** Major units -> integer minor units, rounded half-up at the smallest unit the currency displays. */
export function toCents(amount, decimals = DEFAULT_DECIMALS) {
  if (!isNum(amount)) return NaN;
  return Math.round(amount * 10 ** decimals);
}

/** Integer minor units -> major units. */
export function fromCents(cents, decimals = DEFAULT_DECIMALS) {
  if (!isNum(cents)) return 0;
  return cents / 10 ** decimals;
}

/**
 * Split an integer amount of cents into `count` shares that sum EXACTLY back to it.
 * The first `remainder` shares are one cent larger than the rest.
 */
export function allocateCents(totalCents, count) {
  if (!Number.isInteger(totalCents) || !Number.isInteger(count) || count <= 0) return [];
  const sign = totalCents < 0 ? -1 : 1;
  const magnitude = Math.abs(totalCents);
  const base = Math.floor(magnitude / count);
  const remainder = magnitude - base * count;
  return Array.from({ length: count }, (_, index) => sign * (base + (index < remainder ? 1 : 0)));
}

/**
 * Reduce a set of net balances to the fewest transfers that clears them.
 * @param {number[]} netCents  positive = owed money, negative = owes money. Must sum to zero.
 * @returns {Array<{from:number,to:number,cents:number}>}
 */
export function settleBalances(netCents) {
  const creditors = [];
  const debtors = [];
  netCents.forEach((value, index) => {
    if (value > 0) creditors.push({ index, cents: value });
    else if (value < 0) debtors.push({ index, cents: -value });
  });
  // Largest first, with the index as a tie-break so the result is fully deterministic.
  creditors.sort((a, b) => b.cents - a.cents || a.index - b.index);
  debtors.sort((a, b) => b.cents - a.cents || a.index - b.index);

  const transfers = [];
  let c = 0;
  let d = 0;
  while (c < creditors.length && d < debtors.length) {
    const amount = Math.min(creditors[c].cents, debtors[d].cents);
    if (amount > 0) transfers.push({ from: debtors[d].index, to: creditors[c].index, cents: amount });
    creditors[c].cents -= amount;
    debtors[d].cents -= amount;
    if (creditors[c].cents === 0) c += 1;
    if (debtors[d].cents === 0) d += 1;
  }
  return transfers;
}

/**
 * Split shared tips across a group.
 *
 * @param {object} input
 * @param {string[]} input.people                names, in a fixed order; index is the person id
 * @param {Array<{label?:string, amount:number, participants:number[], paidBy:number}>} input.items
 * @param {string} [input.currency]               currency code from CURRENCIES; controls the minor-unit digit count
 * @returns {{error:string}|object}
 */
export function splitGroupTips({ people, items, currency }) {
  const decimals = decimalsForCurrency(currency);
  if (!Array.isArray(people) || people.length < MIN_PEOPLE) {
    return { error: `Add at least ${MIN_PEOPLE} travellers to split between.` };
  }
  if (people.length > MAX_PEOPLE) {
    return { error: `This splitter handles up to ${MAX_PEOPLE} travellers.` };
  }
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Add at least one shared tip to split." };
  }
  if (items.length > MAX_ITEMS) {
    return { error: `This splitter handles up to ${MAX_ITEMS} tip lines.` };
  }

  const count = people.length;
  const owedToPayers = new Array(count).fill(0);
  const owedToPot = new Array(count).fill(0);
  const paid = new Array(count).fill(0);
  const attended = new Array(count).fill(0);
  const itemRows = [];

  let totalCents = 0;
  let potCents = 0;

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const label = item?.label?.trim() || `Tip ${i + 1}`;
    const amount = Number(item?.amount);

    if (!isNum(amount) || amount < 0) {
      return { error: `"${label}" needs an amount of zero or more.` };
    }
    if (amount > MAX_ITEM_AMOUNT) {
      return { error: `"${label}" is larger than this splitter handles.` };
    }

    const participants = Array.isArray(item?.participants)
      ? item.participants.filter((id) => Number.isInteger(id) && id >= 0 && id < count)
      : [];
    if (participants.length === 0) {
      return { error: `Nobody is marked as present for "${label}" — tick at least one traveller.` };
    }

    const payer = Number.isInteger(item?.paidBy) ? item.paidBy : UNPAID;
    if (payer !== UNPAID && (payer < 0 || payer >= count)) {
      return { error: `"${label}" is marked as paid by someone who is not in the group.` };
    }

    const cents = toCents(amount, decimals);
    const ordered = [...participants].sort((a, b) => a - b);
    const shares = allocateCents(cents, ordered.length);

    ordered.forEach((personId, position) => {
      const share = shares[position];
      attended[personId] += 1;
      if (payer === UNPAID) owedToPot[personId] += share;
      else owedToPayers[personId] += share;
    });

    if (payer !== UNPAID) paid[payer] += cents;
    else potCents += cents;

    totalCents += cents;
    itemRows.push({
      label,
      cents,
      amount: fromCents(cents, decimals),
      participants: ordered,
      participantNames: ordered.map((id) => people[id]),
      payer,
      payerName: payer === UNPAID ? null : people[payer],
      shareCents: shares,
      perHead: fromCents(shares[0], decimals),
    });
  }

  const netCents = people.map((_, index) => paid[index] - owedToPayers[index]);
  const transfers = settleBalances(netCents);

  const perPerson = people.map((name, index) => ({
    id: index,
    name,
    attended: attended[index],
    owesToPayers: fromCents(owedToPayers[index], decimals),
    owesToPot: fromCents(owedToPot[index], decimals),
    totalShare: fromCents(owedToPayers[index] + owedToPot[index], decimals),
    paid: fromCents(paid[index], decimals),
    net: fromCents(netCents[index], decimals),
  }));

  const settlements = transfers.map((transfer) => ({
    from: transfer.from,
    fromName: people[transfer.from],
    to: transfer.to,
    toName: people[transfer.to],
    amount: fromCents(transfer.cents, decimals),
  }));

  return {
    people,
    items: itemRows,
    perPerson,
    settlements,
    total: fromCents(totalCents, decimals),
    potTotal: fromCents(potCents, decimals),
    equalSplit: fromCents(Math.round(totalCents / count), decimals),
    // Proof the split is exact: these must always be true.
    balanced: netCents.reduce((sum, value) => sum + value, 0) === 0,
    sharesMatchTotal:
      owedToPayers.reduce((sum, value) => sum + value, 0) + owedToPot.reduce((sum, value) => sum + value, 0) ===
      totalCents,
  };
}
