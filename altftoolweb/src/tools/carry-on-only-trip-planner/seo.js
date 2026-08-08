const seo = {
  title: "Carry-On Only Packing Planner: Capsule and 3-1-1",
  metaDescription:
    "The fewest tops and bottoms that cover your days, a 3-1-1 liquids audit at 100 ml a container and 1 litre a bag, and a cabin weight and volume check.",
  steps: [
    "Set 'Trip length (days)', 'Laundry every N days (0 = none)', 'Extra pairs of shoes packed' and a 'Cabin bag allowance' — Indian short-haul low cost at 55 x 35 x 25 cm and 7 kg, European low cost at 55 x 40 x 20 cm and 10 kg, full-service at 56 x 36 x 23 cm and 8 kg, or US domestic with no stated weight limit.",
    "Tick 'Wear the jacket, shoes and one outfit on the plane', then choose from 'Liquids you plan to carry' — Shampoo 100 ml, Toothpaste 75 ml, Roll-on deodorant 50 ml and the rest, each showing its solid swap.",
    "Read Packed weight against the allowance, the Capsule wardrobe as tops x bottoms = outfits, Packed volume in litres of usable space and the liquids total out of 1000 ml, then press 'Copy plan'.",
  ],
  intro:
    "This planner works out whether a trip fits in one cabin bag by solving the three constraints separately. The wardrobe is a combinatorics problem — t tops and b bottoms make t x b outfits, so the tool searches every split to find the fewest garments that still cover your days, which for a week is four tops and two bottoms giving eight outfits. Liquids are audited against the 3-1-1 rule (every container 100 ml or less, all inside one 1 litre transparent bag). Weight and packed volume are then checked against the cabin allowance you select.",
  useCases: [
    "Check whether a 10-day work trip really needs a checked bag, or six garments and one laundry stop.",
    "Audit a toiletry bag before security so nothing gets pulled at the scanner.",
    "See how much cabin volume switching to solid shampoo and toothpaste tablets frees up.",
  ],
  benefits: [
    ["Optimal capsule, not a guess", "Searches every tops-and-bottoms split to minimise the number of garments carried."],
    ["Liquids checked container by container", "Flags any bottle over 100 ml, which fails even when it is half empty."],
    ["Weight and volume both", "Cabin bags fail on size before they fail on mass, so both limits are checked."],
  ],
  faqs: [
    [
      "How many clothes do I need for a week in a carry-on?",
      "Six garments: four tops and two bottoms, which mix into eight outfits and cover seven days with one to spare. Adding a third pair of bottoms buys twelve outfits but costs more space than another two tops, which is why the counts are not symmetrical.",
    ],
    [
      "What is the 3-1-1 rule for liquids?",
      "Every liquid, gel, cream or aerosol container must hold 100 ml or less, all of them must fit inside one transparent resealable bag of at most 1 litre, and each passenger gets one bag. The limit is on the container's stated size, not how full it is, so a half-empty 150 ml bottle is still refused.",
    ],
    [
      "Do solid toiletries count towards the liquid limit?",
      "No. Bar soap, solid shampoo and conditioner bars, toothpaste tablets, stick deodorant and stick sunscreen are not liquids and travel outside the 1 litre bag entirely. Swapping the four biggest bottles usually frees up 300-400 ml of the allowance.",
    ],
    [
      "How much can a carry-on bag weigh?",
      "It depends on the airline: 7 kg is the common short-haul and Indian domestic figure, many European low-cost carriers allow around 10 kg for a bag placed in the overhead locker, and most US domestic carriers state a size limit but no weight limit. Size is usually the tighter constraint — always confirm both against your specific fare.",
    ],
  ],
};

export default seo;
