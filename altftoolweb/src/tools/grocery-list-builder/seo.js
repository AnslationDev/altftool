const seo = {
  title: "Grocery List Builder: Auto-Sorts into 8 Store Aisles",
  metaDescription:
    "Type onion or pyaz and it files into one of 8 aisles automatically. Lists stay on your device and copy out as aisle-grouped text for any chat.",
  steps: [
    "Under Quick add, type an Item name such as paneer, haldi or dishwash liquid, then set the Quantity and Unit.",
    "Category stays on \"Auto\" and shows the aisle the keyword map matched; press \"Add to Weekly Groceries\" to file the item, or tap a Restock suggestions chip to re-add something you ticked off before.",
    "Turn on Shopping mode to tick items off against the in-the-cart progress bar, then use Copy / share for aisle-grouped text, Download for a weekly-groceries.txt file, or Print.",
  ],
  intro:
    "The Smart Grocery List Builder sorts whatever you type into eight store categories automatically — produce, dairy, staples, spices, snacks, frozen, household and personal care — by matching the item name against a keyword dictionary that understands both English and everyday Hinglish, so 'pyaz' and 'onion' both land in Fruits & Vegetables. Each category is tagged with its aisle, from Fresh aisle to Chiller to Masala aisle, so the finished list reads in the order you actually walk the shop. It keeps your lists on your own device, remembers what you have bought before, and copies out as clean text you can paste into any chat.",
  useCases: [
    "You are adding things to the list all week as they run out, and you want them already grouped by aisle on Saturday instead of zig-zagging across the store re-reading a jumbled note.",
    "You are sending your partner to the shop and need a legible list in a chat message with quantities and units attached, not 'milk, atta, some dal'.",
    "You are doing the monthly stock-up and want the tool to remind you of things you bought last month — detergent, tea, cooking oil — that are missing from this month's list.",
  ],
  benefits: [
    [
      "Categorises as you type",
      "Item names are matched against per-category keyword lists in English and Hinglish, with the longest match winning, so 'sweet potato' is not filed as 'potato'.",
    ],
    [
      "Restock memory from your own history",
      "Up to 12 previously added items that are missing from the current list are offered as one-tap suggestions, so recurring buys stop getting forgotten.",
    ],
    [
      "Shares as aisle-grouped plain text",
      "The copy output keeps the category headings, quantities, units and tick marks, so it stays readable in WhatsApp, notes or email without any app on the other end.",
    ],
  ],
  faqs: [
    [
      "How does it know which category an item belongs to?",
      "It matches your typed name against keyword dictionaries attached to each of the eight categories, testing both the word as typed and a singularised form, and picks the longest keyword that matches. Anything it cannot place goes to 'Other', and you can move any item to a different category yourself.",
    ],
    [
      "Does it understand Hindi or Hinglish item names?",
      "Yes. The dictionaries carry common Hinglish names alongside English ones — pyaz, aloo, tamatar, bhindi, atta, dahi, sabun — so typing the word you actually say still files the item in the right aisle.",
    ],
    [
      "Are my lists saved, and can I keep more than one?",
      "Yes to both. Lists are written to your browser's local storage, so they survive closing the tab, and you can keep several at once — the tool ships with Weekly Groceries, Party Snacks and Monthly Staples as starting points. Data stays on that device; clearing site data removes it.",
    ],
    [
      "Can I use it while I am in the shop?",
      "Yes — tick items off as you pick them up and the progress bar shows how many of the total remain. Checked items stay visible with their quantity and unit, so you can still verify the trolley against the list at the till.",
    ],
  ],
};

export default seo;
