const seo = {
  title: "Shared Flat Rent Split Calculator by Room & Area",
  metaDescription:
    "Common areas split equally per head, bedrooms by floor area with 12% for an attached bathroom. Whole-rupee shares that add up to the rent exactly.",
  steps: [
    "Enter Total monthly rent (INR), Shared bills each month (INR) and \"Rent attributed to common areas (%)\" — at 100% everyone pays the same, at 0% rent follows bedroom size alone.",
    "Under Bedrooms press Add room for each bedroom, set its Floor area (sq ft) and \"People sharing this room\", then tick Room features: Attached bathroom (+12%), Private balcony (+6%), Air conditioning (+10%) or \"No window, or faces noise\" (−8%).",
    "The \"Who pays what\" table lists each room's Weight, Per person and Room total, above rows for Common-area pool, Bedroom pool, Shared bills per person and \"A plain equal split would be\"; Copy result copies the split.",
  ],
  intro:
    "This calculator divides flat rent between flatmates using a two-pool method: a set share of the rent covers common areas and is charged equally per head, and the rest is allocated across bedrooms in proportion to floor area adjusted for an attached bathroom, a balcony, air conditioning or a poor outlook. A room shared by two people has its bedroom cost halved, and every share is rounded to whole rupees by the largest-remainder method so the individual amounts add up to the rent exactly. It is for flatmates who want the split written down with the reasoning visible rather than argued from memory.",
  useCases: [
    "Pricing a 200 sq ft master bedroom with an attached bathroom against a 120 sq ft room shared by two people.",
    "Working out a fair rent for the flatmate taking the interior room with no window when someone moves out.",
    "Producing a per-person figure that includes electricity, internet and society charges alongside the rent.",
  ],
  benefits: [
    ["Shares add up exactly", "Largest-remainder rounding means the whole-rupee amounts total the rent, with no stray rupee."],
    ["Double occupancy handled", "A shared room's bedroom cost is divided between its occupants while common costs stay per head."],
    ["Adjustable, not opaque", "Every weight and the common-area share are shown and editable, so the method can be argued with openly."],
  ],
  faqs: [
    [
      "How should flatmates split rent when the rooms are different sizes?",
      "Charge the common areas equally per person and split the remaining rent between bedrooms in proportion to their floor area, then adjust for features like an attached bathroom. With a 25% common share on Rs 60,000, each of four people pays Rs 3,750 towards common areas and the remaining Rs 45,000 follows the bedrooms.",
    ],
    [
      "Should someone sharing a room pay less?",
      "Yes for the bedroom, no for the rest. Two people in one room split that room's bedroom cost between them, but each still pays a full share of the kitchen, living room and bills, because those are used per person rather than per room.",
    ],
    [
      "How much extra should a room with an attached bathroom cost?",
      "There is no standard, but a premium of roughly 10 to 15% on the room's weight reflects what the rental market charges, and this tool uses 12% by default. Treat it as a starting point to negotiate from, not a rule.",
    ],
    [
      "Does the split affect who is liable to the landlord?",
      "No. Only the tenants named on the rent agreement are liable to the landlord for the full rent, whatever the flatmates have agreed between themselves. Rent handed to a flatmate rather than the landlord also usually fails as HRA proof unless there is a formal sub-tenancy and receipts in the payer's name.",
    ],
  ],
};

export default seo;
