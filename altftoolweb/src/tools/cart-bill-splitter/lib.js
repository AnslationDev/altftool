/**
 * Cart Bill Splitter — canonical pure-logic surface.
 *
 * Splitting a shared bill is three separate calculations, kept separate here:
 *
 *  1. Per-item shares. Each line can be split four ways —
 *     `equal` (price ÷ number of owners), `percentage` (price × pct ÷ 100),
 *     `quantity` (price ÷ total units × that person's units) and `exact`
 *     (the amount is typed in directly).
 *  2. Shared charges. Tax, delivery and service fees are apportioned in
 *     proportion to each person's item subtotal, not per head, so whoever
 *     ordered more of the bill carries more of the 5% tax on it. A fixed
 *     charge is split the same proportional way.
 *  3. Settlement. Balance = what you paid − what you owe. The tool then
 *     matches the largest debtor against the largest creditor repeatedly —
 *     the standard greedy cash-flow minimisation — which settles n people in
 *     at most n − 1 transfers instead of everyone paying everyone.
 *
 * Balances within one cent of zero are treated as settled, so floating-point
 * remainders never produce a "pay $0.00" line.
 */

export { calculateTotals, calculateSettlement, formatCurrency } from "./utils/splitterUtils";

/** The four ways one line item can be divided. */
export const SPLIT_TYPES = ["equal", "percentage", "quantity", "exact"];

/** Charge kinds: a percentage of the item subtotal, or a flat amount. */
export const CHARGE_TYPES = ["percentage", "fixed"];

/**
 * Balances smaller than this are treated as settled. One cent — the smallest
 * unit that can actually be transferred in the supported currencies.
 */
export const SETTLEMENT_EPSILON = 0.01;
