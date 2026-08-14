const seo = {
  title: "Cart Bill Splitter: Per-Item Splits and Settle Up",
  metaDescription:
    "Splits each line equally, by percentage, by quantity or exact amount; tax and delivery follow each person's subtotal. Settles in at most n-1 transfers.",
  steps: [
    "Add everyone under Participants, typing each Name and the amount they Paid, then start the bill with Add Item under Cart Items.",
    "Give each line an Item Price and a Split Method — Equal Split, Percentage, Quantity or Exact Amount — tap the Owners buttons to choose who shares it, and add tax or delivery under Taxes & Fees.",
    "Individual Breakdown shows each person's share with the shared charges apportioned by subtotal, and Settlement Roadmap lists who pays whom; its copy button writes a Bill Settlement Summary to the clipboard.",
  ],
  intro:
    "Cart Bill Splitter divides a shared bill line by line rather than by head count: each item can be split equally, by percentage, by quantity of units, or by an exact typed amount, and shared charges like tax and delivery are then apportioned in proportion to what each person actually ordered. It is for flatmates splitting a grocery order and for tables where three people shared the starters and one drank all the wine. The settlement step uses greedy cash-flow minimisation, which clears any group in at most n − 1 transfers.",
  useCases: [
    "Split a supermarket delivery where two flatmates share the household staples and one bought their own snacks, with the ₹99 delivery fee shared in proportion to each subtotal",
    "Divide a restaurant bill where four people shared appetisers equally but only two had dessert, then apply an 18% service charge across the whole table",
    "Settle a trip where one person paid the entire hotel bill up front — the tool converts everyone's balance into the smallest possible set of transfers",
  ],
  benefits: [
    ["Four split modes per line", "Equal, percentage, quantity or exact amount — chosen per item, not once for the whole bill."],
    ["Tax and delivery split fairly", "Shared charges follow each person's item subtotal, so someone who ordered ₹200 of a ₹1,000 bill pays 20% of the tax, not 25% because there were four people."],
    ["Fewest possible transfers", "The largest debtor is matched to the largest creditor repeatedly, so a group of five settles in at most four payments instead of twenty."],
  ],
  faqs: [
    [
      "How should tax and delivery be split between people?",
      "In proportion to what each person ordered, which is what this tool does. On a ₹1,000 order with 5% tax, someone whose items came to ₹200 pays ₹10 of the ₹50, not ₹12.50. Splitting shared charges per head overcharges the person who ordered least — the standard fix is to apportion by subtotal.",
    ],
    [
      "What is the fewest number of payments needed to settle a group?",
      "n − 1 for a group of n, and often fewer. The tool computes each person's balance (paid minus owed), then repeatedly sends the biggest debtor's money to the biggest creditor. Three friends where one paid for everything settle in two transfers; nobody pays anybody twice.",
    ],
    [
      "Can I split one item unequally while splitting the rest evenly?",
      "Yes — the split mode is per line, not per bill. Set the shared pizza to equal, the bottle of wine to exact amounts, and a bulk pack to quantity so someone taking 2 of 3 units pays two-thirds of it. Percentage mode handles cases like a 70/30 split on a shared subscription.",
    ],
    [
      "Is my bill data uploaded anywhere?",
      "No. People, items, charges and the chosen currency are kept in your browser's localStorage and the whole calculation runs in the page. Closing the tab keeps the bill on that device only; there is no account and no server copy.",
    ],
  ],
};

export default seo;
