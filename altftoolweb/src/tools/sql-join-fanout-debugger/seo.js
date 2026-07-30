const seo = {
  intro:
    "This debugger computes the row-multiplication factor of a join and tells you exactly which aggregates it corrupts: describe each table's grain and its join key cardinality, and it returns the fan-out factor for every table, marks each SUM, COUNT, AVG, MIN and MAX as inflated, distorted or safe, and emits the corrected SQL. The rule it applies is the definition of a joined table in ISO/IEC 9075-2 §7.10 — a join is a filtered cross product, so one parent row matching m child rows becomes m result rows, and two fanning children of the same parent multiply to m1 x m2. It is for analysts and engineers whose total went up after adding a join and who need to know the exact factor before trusting the number.",
  useCases: [
    "A revenue query joining orders to order_items and payments returns 3x the real revenue — finding that each order's 3 item rows repeat the order_total three times, and that SUM(o.order_total) is the only broken column",
    "Deciding between the two standard fixes: pre-aggregating each child into a derived table grouped by the join key, or de-duplicating the fanned-out rows with ROW_NUMBER and a CASE, and seeing which totals each one returns",
    "Explaining why COUNT(DISTINCT order_id) still says 12,400 orders while COUNT(*) says 74,400 rows in the same query",
    "Checking whether a total is too high from fan-out, too low from an inner join dropping unmatched rows, or both at once",
  ],
  benefits: [
    [
      "The factor, not a hunch",
      "Each table gets its own duplication factor: total multiplicity divided by the multiplicity on the path from the base table, so a child that fans 3x can still leave its own SUM only 2x too high.",
    ],
    [
      "Per-aggregate verdicts",
      "SUM and COUNT scale with the fan-out, MIN, MAX and COUNT(DISTINCT) survive it exactly, AVG survives only uniform fan-out, and SUM(DISTINCT) is never a fix because it de-duplicates values rather than rows.",
    ],
    [
      "Two corrected queries, not advice",
      "Both the pre-aggregated subquery form and the ROW_NUMBER window form are emitted against your own table names, aliases and keys, with the aggregates that cannot compose through a pre-aggregate marked in the SQL.",
    ],
    [
      "Editable worked example",
      "Three small tables you can change in place: 3 orders totalling 1,300 report 3,900 through the naive join, and both fixes bring it back to 1,300.",
    ],
  ],
  faqs: [
    [
      "Why is my SUM too high after a JOIN?",
      "Because the join duplicated the rows the SUM reads. A join is a filtered cross product (ISO/IEC 9075-2 §7.10), so an order that has 3 line items appears on 3 result rows and its order_total is added 3 times. The factor is exact: if the base table's rows are each repeated d times, SUM is d times the true value. Join a second 1:many table with 2 matches per order and the factor becomes 3 x 2 = 6.",
    ],
    [
      "Does SELECT DISTINCT or SUM(DISTINCT col) fix a double-counted SUM?",
      "No. SUM(DISTINCT col) removes duplicate values, not duplicate rows — two different orders that both total 500 collapse into a single 500, so a true total of 1,300 comes back as 800. COUNT(DISTINCT id) does survive fan-out, because DISTINCT reduces the duplicated rows to a set of ids before counting. The two working fixes are pre-aggregating each fanning table to one row per join key, or keeping the wide rowset and using ROW_NUMBER() OVER (PARTITION BY the table's own primary key) with SUM(CASE WHEN rn = 1 THEN col END).",
    ],
    [
      "Why does my LEFT JOIN drop rows anyway?",
      "Because a WHERE predicate on the right table turns it back into an INNER JOIN. WHERE is evaluated after the from clause (ISO/IEC 9075-2 §7.4), so the null-extended rows the LEFT JOIN just created make the predicate UNKNOWN, and only rows evaluating to True are kept. Moving the condition into the ON clause — or writing it as (p.status = 'captured' OR p.order_id IS NULL) — keeps the join outer.",
    ],
    [
      "Why do rows with a NULL join key disappear?",
      "Because NULL = NULL is Unknown, not true (ISO/IEC 9075-2 §8.2), and a join keeps only rows whose condition evaluates to True. A row whose key is NULL therefore matches nothing at all, not even another NULL key, and an INNER JOIN discards it silently. Counting rows WHERE key IS NULL on both sides before joining shows how many are at stake.",
    ],
  ],
};

export default seo;
