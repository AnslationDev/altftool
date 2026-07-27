const seo = {
  intro:
    "This estimator works out what extra kilograms cost on an IndiGo booking by pricing the same overweight two ways: per kilogram at the check-in counter, and as a prepaid excess baggage slab bought before travel. It applies the two rounding rules that decide the answer — the counter rounds a part kilogram up to the next whole kilogram, and prepaid excess is only sold in fixed blocks per passenger, so a 7 kg overweight forces you to buy a 10 kg block. Both rates are editable, so you can drop in the figures shown on your own booking page.",
  useCases: [
    "You are 6 kg over on a domestic sector and want to know whether prepaying online actually beats paying at the counter.",
    "Two of you are travelling on one booking and want to see whether the pooled allowance covers a heavy suitcase plus a light one.",
    "You are packing for a move and need to know at what point buying the largest prepaid slab plus a counter top-up becomes the cheaper route.",
  ],
  benefits: [
    ["Slab rounding made visible", "Shows the block you are forced to buy and how many kilos of it go unused."],
    ["Counter versus prepaid, side by side", "Names the cheaper option instead of assuming prepaying always wins."],
    ["Catches the 32 kg piece limit", "Warns when one bag is too heavy to be accepted however much you pay."],
  ],
  faqs: [
    [
      "How much is IndiGo excess baggage per kg?",
      "Domestic excess is billed per kilogram at the check-in counter, and the published rate has sat in the ₹500–₹550 per kilogram range in recent fare sheets. Buying the same weight in advance as a prepaid excess baggage slab is cheaper per kilogram, which is why this tool prices both. Rates change with the fare sheet, so check the current figure on the booking page and type it in.",
    ],
    [
      "What is the free baggage allowance on IndiGo?",
      "A regular domestic economy ticket carries 15 kg of checked baggage per passenger, plus one 7 kg cabin bag and one 3 kg personal item. Hand-baggage-only fares carry no free checked allowance at all, and international sectors are typically 20 kg to 30 kg depending on the route, so read the allowance printed on your own ticket rather than assuming 15 kg.",
    ],
    [
      "Is it cheaper to prepay for extra baggage than to pay at the airport?",
      "Usually, but not always. The prepaid per-kilogram rate is lower, yet prepaid weight is sold in fixed blocks — 3, 5, 10, 15, 20 and 30 kg — so a small overweight can cost more to prepay than to pay for at the counter. If you are 1 kg over, one kilogram at the counter rate beats buying a 3 kg block; at 10 kg or more over, prepaying wins clearly.",
    ],
    [
      "Can one bag weigh more than 32 kg if I pay the excess charge?",
      "No. A single piece over 32 kg is refused at check-in regardless of what you pay, because it exceeds the manual-handling limit ground staff work to. Split the contents across two bags and pay excess on the total weight instead. Paying for excess buys extra weight, never an exemption from the per-piece limit.",
    ],
  ],
};

export default seo;
