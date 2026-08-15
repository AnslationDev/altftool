const seo = {
  title: "Packing List Generator With Quantities and Bag",
  metaDescription:
    "Six trip templates scale each item by days, travellers and laundry stops, then total the estimated weight against a 7 kg cabin or 15 kg checked allowance.",
  steps: [
    "In Trip Setup pick a Trip type — Business Trip, Family Vacation, Weekend Getaway, Trek / Outdoor, International Travel or Beach / Resort — then enter Destination, Days, Travelers and a Climate of Warm, Cold, Rainy or Mixed.",
    "Choose a Bag type (Cabin bag - 7 kg, Checked bag - 15 kg, Backpack - 9 kg or Flexible - 12 kg) and set \"Laundry after days\", using 0 when laundry is not planned; add anything the template misses under Custom Item.",
    "Tick items off in the Packing Checklist, watching the running weight against your allowance and the Carry-on badges, then use Export Plan: Pending and Markdown copy the list, and CSV downloads packing-list.csv.",
  ],
  intro:
    "The Packing List Generator builds a quantity-accurate checklist from six trip templates — business, family vacation, weekend, trek, international and beach — scaling each item by trip length, number of travellers and how often you plan to do laundry, then adding up the estimated weight against your bag's allowance. Clothing items scale per day or per half-day, so a five-day trip for two produces real counts rather than a generic list of nouns. The finished list exports as Markdown or CSV with packed status, carry-on flags and per-item weight.",
  useCases: [
    "You are packing for a five-day family trip for two and want the shirt and innerwear counts worked out for you, including the fact that a mid-trip laundry stop cuts what you need to carry.",
    "You are flying with a 7 kg cabin allowance and want to see the running weight total as you add items, so you find out at home rather than at the check-in desk.",
    "You are packing for a trek and want the safety items — first-aid kit, headlamp, offline maps and permits — surfaced as high priority instead of remembering them at the trailhead.",
  ],
  benefits: [
    ["Quantities, not just item names", "Each template item carries a scaling rule — per day, per half-day, per day plus one spare, or per traveller — so counts change when you change the trip length or party size."],
    ["Laundry stops reduce the load", "Setting a laundry interval caps the days each garment has to cover, so a two-week trip with a wash on day 4 does not ask you to pack fourteen sets."],
    ["Weight tracked against your bag", "Every item has an estimated weight and the total is compared with the allowance for your bag type — 7 kg cabin, 9 kg backpack, 15 kg checked or a custom limit."],
  ],
  faqs: [
    [
      "How many outfits should I pack for a trip?",
      "The default rule here is one top per day, one bottom per two days and one set of innerwear per day plus one spare, multiplied by the number of travellers. If you set a laundry interval, the count is capped at that interval plus one day rather than the full trip length.",
    ],
    [
      "How much weight can I carry in a cabin bag?",
      "This tool checks against a 7 kg cabin default, with 9 kg for a backpack and 15 kg for checked luggage, and you can set a custom limit. Airline allowances vary widely — confirm the figure for your specific carrier and fare, since low-cost carriers in particular enforce cabin weight strictly.",
    ],
    [
      "What should stay in my carry-on rather than checked luggage?",
      "Documents, medicines and prescriptions, chargers, power banks and anything valuable. Power banks and spare lithium batteries are not permitted in checked baggage at all, which is why the generator marks those items as cabin-only in every template.",
    ],
    [
      "Can I add my own items or export the list?",
      "Yes — you can add custom items in any category, tick items off as you pack, and export the whole list as Markdown with checkboxes or as CSV including quantity, total weight in grams, carry-on flag and packed status.",
    ],
  ],
};

export default seo;
