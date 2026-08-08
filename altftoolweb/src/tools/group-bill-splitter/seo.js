const seo = {
  title: "Group Expense Splitter: Settle Up in Fewest Payments",
  metaDescription:
    "Log who paid what on a trip or flatshare, split each expense across everyone or just some, and get the shortest list of transfers that settles it.",
  steps: [
    "Type each person into Add member and press Add; a member named in an expense can't be removed until that expense is deleted or edited.",
    "Under Add expense fill Description, Amount (₹) and Paid by, then in Split among leave Everyone selected or tap only the people who shared that item.",
    "Balances show who is owed and who owes, Settle up (N payments) lists each transfer as payer → payee → amount, and Copy settle-up plan copies the trip total, per-head share and every payment for a group chat.",
  ],
  intro:
    "The Group Expense Splitter tracks who paid for what on a shared trip or in a flatshare, works out each person's net balance, and then reduces the tangle of debts to the smallest set of payments that clears it — repeatedly matching the largest debtor with the largest creditor until everyone is square. Every expense can be split across the whole group or only the people it applies to, so one person's late-night snack does not land on everyone's bill. It is for the person holding the receipts at the end of a trip who wants a payment list, not a spreadsheet.",
  useCases: [
    "Four of you just got back from a weekend away: one paid the hotel, another the cab, a third dinner, and nobody wants to work out the chain of reimbursements by hand.",
    "Two flatmates ordered in while the third was away, so that bill splits two ways while rent and groceries split three — the per-expense participant list handles both in the same ledger.",
    "You need to send the group a message saying exactly who transfers what to whom, with a total and a per-head share attached so nobody has to re-derive it.",
  ],
  benefits: [
    [
      "Settles in the fewest transfers",
      "Instead of everyone paying everyone, the plan pairs the biggest debt with the biggest credit each round, so a group of n people never needs more than n−1 payments.",
    ],
    [
      "Per-expense participants, not one flat split",
      "Each entry carries its own list of who shares it; leave it blank and it splits across everyone, or name two people and only they are charged.",
    ],
    [
      "Copy-ready settlement summary",
      "The share text carries the trip total, the per-head figure, each person's net position and every transfer, formatted so it reads correctly pasted into a group chat.",
    ],
  ],
  faqs: [
    [
      "How does it decide who pays whom?",
      "It computes each person's balance — what they paid minus their share of everything they were part of — then repeatedly settles the largest outstanding debt against the largest outstanding credit. This greedy matching clears the group in at most one payment fewer than the number of people, rather than one payment per pair.",
    ],
    [
      "Can one expense be split between only some of the group?",
      "Yes. Select the participants on that expense and the amount is divided only among them; leave the selection empty and it divides equally across everyone in the group. The payer is credited the full amount either way.",
    ],
    [
      "What happens to the odd paisa when an amount will not divide evenly?",
      "Balances are carried at full precision internally and anything within half a paisa of zero is treated as settled, so rounding does not leave phantom one-rupee debts. Displayed figures are rounded for readability, which is why a transfer may differ from a hand calculation by a fraction.",
    ],
    [
      "Is my group's expense data stored anywhere?",
      "Only in your own browser. Members and expenses are saved to local storage on the device you are using, so the ledger is still there when you come back, but nothing is uploaded and there is no shared account — send the copied summary if you want others to see it.",
    ],
  ],
};

export default seo;
