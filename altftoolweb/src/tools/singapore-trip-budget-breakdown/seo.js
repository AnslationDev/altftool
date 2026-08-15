const seo = {
  title: "Singapore Trip Budget: the ++, 10% Service, 9%",
  metaDescription:
    "Price a Singapore trip with the ++ applied in the right order: 10% service charge first, then 9% GST on top, so a quoted rate becomes 1.199x.",
  steps: [
    "Set Travel style, Travellers and Nights in Singapore, then adjust the quoted room, food, transport and attraction rates.",
    "Tick My room rate is a nett price or My food figure is a ++ menu price so the 10% service charge and 9% GST land in the right order.",
    "Read the per-person totals, the Nett cost of one room-night, and whether shopping Qualifies for the tourist GST refund (min S$100).",
  ],
  intro:
    "This planner breaks a Singapore trip into flights, room, food, transport, attractions, shopping and a contingency buffer, then reports the cost per person and per person per day. Singapore charges no per-night tourist tax, but it does have the \"++\": a quoted hotel or restaurant price is before a 10% service charge and before GST, and GST is charged on the service-inclusive amount, so the multiplier is 1.10 x 1.09 = 1.199 at the current 9% rate. The tool applies that stack correctly, handles nett prices in reverse, and shows the GST sitting inside a shopping figure that a visitor can reclaim on departure.",
  useCases: [
    "Seeing what a S$250 quoted room rate really costs once the service charge and GST are applied.",
    "Comparing a hawker-centre food budget with a restaurant one, where every menu price carries the ++.",
    "Checking whether a shopping plan clears the S$100 minimum for a tourist GST refund.",
  ],
  benefits: [
    ["Gets the ++ order right", "Applies the service charge first, then GST on the service-inclusive amount, not both on the base."],
    ["Works with nett quotes too", "Tick one box and the tool works backwards from an all-in price rather than double-charging."],
    ["Shows the reclaimable GST", "Reports the tax inside a GST-inclusive shopping figure and whether it clears the refund threshold."],
  ],
  faqs: [
    [
      "What does ++ mean on a Singapore menu or hotel rate?",
      "It means the price shown is before a 10% service charge and before GST. The service charge is added first, then GST is calculated on the service-inclusive amount, so at the current 9% GST rate a ++ price ends up 1.199 times the number you were shown — a S$100 menu price becomes S$119.90. A price marked \"nett\" already includes both.",
    ],
    [
      "What is the GST rate in Singapore?",
      "9%. It rose from 8% to 9% on 1 January 2024, having gone from 7% to 8% a year earlier. Retail prices in shops must be displayed GST-inclusive, so the shelf price is what you pay; it is hotels and full-service restaurants that quote before tax and add it at the bill.",
    ],
    [
      "Is there a tourist tax in Singapore?",
      "No per-night tourist or city tax of the kind Paris and Dubai charge. What a hotel adds is the 10% service charge and 9% GST on the room rate — there is no flat per-room or per-person nightly levy on top of that.",
    ],
    [
      "Can tourists claim GST back in Singapore?",
      "Yes, on goods taken out of the country, under the electronic Tourist Refund Scheme, above a minimum spend of S$100. The refund is processed at the airport before departure and the refund agent deducts a handling fee, so the amount received is less than the full 9% sitting inside the price. Services such as hotel stays and restaurant meals are not refundable.",
    ],
  ],
};

export default seo;
