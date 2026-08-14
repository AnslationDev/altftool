const seo = {
  title: "Car Rental Cost Comparison: Landed Cost per Trip",
  metaDescription:
    "Price self-drive quotes on one real trip: day rate, insurance, excess km, delivery fee, GST and fuel policy, with the refundable deposit excluded.",
  steps: [
    "Under Your trip fill in Days on rent, Kilometres you will drive, Pump price (₹ per litre), Real mileage (km per litre) and GST on the rental charges (%).",
    "For each Quote name enter Daily rate (₹), Insurance / CDW per day (₹), Included km per day and Excess km charge (₹ per km) or tick Unlimited kilometres, add the Delivery / pickup fee and Refundable deposit (₹), and pick a Fuel policy — Same-to-same, Prepaid tank or Fuel included; Add a quote takes it up to four.",
    "Cheapest landed cost names the winner and lists Rental invoice (with GST), Fuel, Cost per day, Cost per kilometre, Next kilometre costs and Deposit blocked, which stays out of the total; the ranked table compares every quote and Copy result copies it.",
  ],
  intro:
    "A car rental cost comparison prices competing self-drive quotes against one real trip instead of their headline day rates. It adds the daily tariff, the per-day insurance or CDW, the excess-kilometre charge on whatever you drive beyond the included allowance and any delivery fee, applies GST to that rental subtotal, then adds fuel separately — petrol and diesel sit outside GST in India, so they belong after tax. Prepaid-tank policies are costed with the unrefunded litres included, and the refundable deposit is reported but never counted as spend.",
  useCases: [
    "Choosing between a ₹2,000-a-day quote with 150 free km and a ₹2,800-a-day unlimited-km quote for a 600 km weekend",
    "Working out whether a prepaid fuel tank is worth taking when you will return the car half full",
    "Checking how much of a cheap-looking quote is really the excess-kilometre charge before you book",
  ],
  benefits: [
    ["Landed cost, not the headline", "Combines tariff, excess km, fees, GST and fuel into the number you actually pay."],
    ["Fuel policies modelled properly", "Same-to-same, prepaid tank and fuel-included each cost differently and are treated differently."],
    ["Marginal km price", "Shows what the next kilometre costs once the free allowance runs out."],
  ],
  faqs: [
    [
      "Is unlimited kilometres worth paying extra for?",
      "Only when your planned distance exceeds the included allowance by enough to cover the higher day rate. On a three-day rental with 150 free km a day, unlimited km starts paying at roughly the point where excess charges beat the rate difference — at ₹12 per excess kilometre, a ₹800-a-day premium needs about 200 extra kilometres a day to break even.",
    ],
    [
      "What is a same-to-same fuel policy?",
      "You collect the car at a given fuel level and return it at the same level, so you only ever pay the pump for what you burn. It is almost always cheaper than a prepaid tank, because prepaid fuel is charged at the operator's rate and anything left in the tank at return is not refunded.",
    ],
    [
      "Is the security deposit part of the rental cost?",
      "No — it is a refundable hold, usually released within a few working days after return, so it never belongs in a cost comparison. It does have to be free on your card during the rental though, and operators may deduct traffic fines, toll dues or damage from it before refunding.",
    ],
    [
      "What charges do self-drive rentals add that the quote does not show?",
      "The common ones are the excess-kilometre rate, a delivery or airport pickup fee, per-day insurance or damage waiver, late-return charges billed by the hour, interstate permit fees, cleaning charges and the insurance excess you owe on any claim. Ask for the rate card in writing and compare on the trip you plan to take, not on the day rate.",
    ],
  ],
};

export default seo;
