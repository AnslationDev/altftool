const seo = {
  title: "Pounds to Rupees in Your Head: Rules and Error Rates",
  metaDescription:
    "Turns the GBP-INR rate into head maths — round multipliers, an eighth nudge, simple fractions — each with its error stated, plus VAT and service charge.",
  steps: [
    "Enter Rupees per £1 (today's rate) and A price on the tag or menu (£).",
    "Set Discretionary service charge (%), leaving it at 0 for shops, supermarkets and pub bar service.",
    "Compare the three rule cards, each showing how far it lands from the exact answer, then press Copy sheet.",
  ],
  intro:
    "This cheat sheet turns today's rupee-pound rate into a multiplication you can run at a till. It rewrites the rate as a decimal shift plus a working multiplier between 1 and 10, then tests three families of approximation — rounding to the nearest quarter or half, adding an easy percentage nudge such as a tenth or an eighth, and the closest simple fraction — and reports each rule's error as a fixed percentage of the exact answer. The pound is the case where the nudge matters: near a round hundred, \"add two zeros, then add an eighth\" is far more accurate than any single round multiplier.",
  useCases: [
    "Judging in a London shop whether a £45 shirt is worth it in rupees, without opening a converter app.",
    "Checking a restaurant bill after the discretionary service charge has been added to the menu prices.",
    "Setting a daily spending limit in pounds that corresponds to a round rupee figure you can remember.",
  ],
  benefits: [
    ["A rule that fits the pound", "Round multipliers fail near 100; the percentage nudge fixes it and the sheet shows why."],
    ["Error stated up front", "Every rule reports how far it lands from the exact answer, in percent and in rupees."],
    ["Menu price versus bill total", "Service charges are applied where they belong, and VAT is shown as already included."],
  ],
  faqs: [
    [
      "What is the quickest way to convert pounds to rupees in my head?",
      "Multiply by 100 and then add an eighth. At a rate near ₹112 to the pound that rule gives ₹112.5 and lands under half a percent from the exact answer, which is far better than simply multiplying by 100 — that alone is nearly 11% low. Adding an eighth is easy because it is half of a quarter: £60 becomes 6,000, then 6,000 + 750 = ₹6,750.",
    ],
    [
      "Is VAT included in UK prices?",
      "Yes. Displayed retail prices in the United Kingdom must include VAT, which has a standard rate of 20%, so the price on the shelf is the price you pay at the till. Most supermarket food, children's clothing and books are zero-rated, which is why a supermarket basket carries less tax than a restaurant meal. The tax already inside a gross price is the price times 20 ÷ 120 — a sixth of the total.",
    ],
    [
      "Can tourists claim a VAT refund when leaving the UK?",
      "No. The UK ended VAT-free shopping for visitors taking goods home in their luggage on 1 January 2021, so there is no airport refund counter for departing tourists as there is in the European Union. Goods shipped directly overseas by a retailer can still be zero-rated, but that is a different scheme and has to be arranged at the point of purchase. Budget for the full displayed price.",
    ],
    [
      "Do I have to pay the service charge on a UK restaurant bill?",
      "A service charge is normally discretionary, printed on the bill at around 12.5% in London, and you can ask for it to be removed if the service was poor. Since October 2024 UK law requires that tips and service charges be passed on to staff in full, so leaving it on is the more reliable way to tip. Bar service in a pub and takeaway counters add nothing at all.",
    ],
  ],
};

export default seo;
