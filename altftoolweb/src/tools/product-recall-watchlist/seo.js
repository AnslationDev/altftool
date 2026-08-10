const seo = {
  title: "Product Recall Watchlist: Search US CPSC Recalls",
  metaDescription:
    "Search the U.S. CPSC recall database by product word and get up to 50 notices with recall date, title, official recall number and the CPSC page link.",
  steps: [
    "Type a product word into the Lookup box — it opens on 'battery' — such as stroller, heater or charger.",
    "Press 'Get current result'; the button reads 'Checking source…' while it queries the SaferProducts.gov CPSC recall web service by recall title.",
    "'Current result' reports how many U.S. CPSC recall results came back with an Updated timestamp, then lists up to 50 rows of recall date, recall title, recall number and the CPSC URL, with the source shown underneath.",
  ],
  intro:
    "This watchlist searches the U.S. Consumer Product Safety Commission's public recall database by recall title and returns the matching notices with their recall date, title, official recall number and a link to the CPSC page. Type a product word — battery, stroller, heater, charger — and you get the live CPSC records rather than a news write-up of them. It is for anyone checking whether something already in their home has been recalled, and it reads the regulator's own feed so the recall number you cite is the real one.",
  useCases: [
    "You read that a brand of power bank caught fire and want to know whether the model on your desk is in an actual CPSC notice or just a viral post.",
    "Before handing down a cot, high chair or car-seat accessory to family, checking whether that product line has an open recall.",
    "A landlord or office manager running through space heaters and extension leads on the premises and needing the recall number to file with the safety log.",
  ],
  benefits: [
    ["Straight from the regulator", "Results come from the CPSC's own SaferProducts REST service, so each row carries the official recall number and the government page it came from."],
    ["Recall number, not just a headline", "Every hit includes the identifier a manufacturer or retailer will ask for when you claim a refund, repair or replacement."],
    ["Broad keyword matching", "Searching a product word returns up to 50 recall titles at once, so you can scan a whole product category rather than guessing exact brand spellings."],
  ],
  faqs: [
    [
      "Which recall database does this search?",
      "The U.S. CPSC database only, via the SaferProducts.gov recall web service. It does not cover vehicle recalls (NHTSA), food, drugs and cosmetics (FDA), or meat and poultry (USDA), and it does not cover other countries' regulators.",
    ],
    [
      "I live outside the US — is this useful?",
      "Partly. Many products are sold globally and a CPSC recall usually signals a defect wherever the item was sold, but the legal recall and the remedy in your country come from your own regulator. Use a CPSC hit as a lead, then check the authority where the product was purchased.",
    ],
    [
      "How many results will I get?",
      "Up to 50 recall records per search, matched against the recall title. If a broad word like 'charger' fills that limit, narrow the search with a brand or product-type word to see the specific notice.",
    ],
    [
      "Does it alert me when a new recall is published?",
      "No — it is an on-demand search, not a background monitor, so there are no push notifications or saved subscriptions. Re-run the searches that matter to you periodically, and sign up for CPSC's own recall email list if you want to be notified automatically.",
    ],
  ],
};

export default seo;
