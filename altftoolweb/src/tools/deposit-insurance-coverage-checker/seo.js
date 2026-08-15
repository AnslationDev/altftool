const seo = {
  title: "DICGC Cover Checker: ₹5 Lakh per Depositor",
  metaDescription:
    "List each bank, balance with interest and the capacity it is held in. Accounts in the same capacity are added up, then the ₹5,00,000 DICGC limit applied.",
  steps: [
    "For each row give the Bank, the Balance including interest (INR), the Capacity in which it is held and the Account type, adding rows with Add an account.",
    "Balances at one bank in the same capacity are pooled first, and the DICGC limit of ₹5,00,000 is applied to each pooled group rather than to each account.",
    "Read Not covered by deposit insurance, Unused cover across your groups and the Cover group by group table of Bank, Capacity, Insured and Uninsured, then Copy result.",
  ],
  intro:
    "This checker applies the Deposit Insurance and Credit Guarantee Corporation cover of ₹5,00,000 per depositor per bank to the accounts you list, aggregating them the way DICGC does: all deposits held at one bank in the same capacity and the same right are added together, principal and interest, before the limit is applied. Accounts held in a different right — a joint account with the names in a different order, or one held as guardian, karta or trustee — carry their own separate limit. The result is the rupee amount of your savings that sits outside the guarantee.",
  useCases: [
    "Check whether a ₹8 lakh fixed deposit at one bank is fully insured, and by how much it is not.",
    "See whether splitting money between two banks actually buys extra cover for your situation.",
    "Confirm that a joint account and a single account at the same bank are insured separately.",
  ],
  benefits: [
    ["Aggregates the way DICGC does", "Adds up every account at one bank in the same capacity before applying the limit, instead of per account."],
    ["Capacity rules built in", "Distinguishes single, joint by name order, guardian, karta, partner, director and trustee holdings."],
    ["Shows unused headroom", "Reports how much cover you are leaving on the table at banks where you are under the limit."],
  ],
  faqs: [
    [
      "How much bank deposit is insured in India?",
      "₹5,00,000 per depositor per bank, covering principal and interest together. The limit was raised from ₹1,00,000 with effect from 4 February 2020 and applies across all branches of that bank taken together.",
    ],
    [
      "Does the ₹5 lakh limit apply per account or per bank?",
      "Per depositor per bank, not per account. All your savings, current, fixed and recurring accounts at one bank held in the same capacity are added up first, so three deposits of ₹3 lakh each at one bank are insured only to ₹5 lakh in total.",
    ],
    [
      "Are joint accounts insured separately from single accounts?",
      "Yes, and the order of names matters. An account in your sole name, an account held as 'A and B' and an account held as 'B and A' are three different capacities, each with its own ₹5,00,000 limit, but two accounts with the same names in the same order are added together.",
    ],
    [
      "Which deposits are not covered by DICGC?",
      "Deposits of central and state governments, of foreign governments, inter-bank deposits, deposits of a State Land Development Bank with the State co-operative bank, amounts due on deposits received outside India, and any deposit exempted with prior RBI approval. Primary co-operative societies are not insured banks at all.",
    ],
  ],
};

export default seo;
