const seo = {
  intro:
    "This estimator turns a fuel gauge reading into kilometres: fuel on board is tank capacity multiplied by the gauge fraction, and range is that fuel — minus the reserve you want to keep — multiplied by your real mileage. A condition factor scales rated mileage down for city traffic or a full load, and a trip distance field tells you straight away whether you can make it or how many litres you are short. Useful whenever the warning light comes on and the next pump is some distance away.",
  useCases: [
    "Decide whether to fill now or push on to a cheaper pump 40 km further along the highway.",
    "Check before a long weekend drive how many litres you need to add to reach the destination with a margin.",
    "Work out what a full tank will cost at today's pump price when the needle is at a quarter.",
  ],
  benefits: [
    ["Reserve built in", "Range is shown to the reserve you choose, not to a dry tank, so the number is one you can act on."],
    ["Real mileage, not brochure", "A condition factor scales the rated figure for city driving, load and air conditioning."],
    ["Trip verdict", "Enter the distance and it says whether you make it, and how many litres and rupees short you are."],
  ],
  faqs: [
    [
      "How far can I drive on a quarter tank?",
      "Multiply a quarter of your tank capacity by your real km per litre. A 42 litre tank at a quarter holds about 10.5 litres, which at 18 km/l is roughly 189 km to a dry tank — or about 99 km if you hold back a 5 litre reserve.",
    ],
    [
      "How much fuel is left when the low fuel light comes on?",
      "In most passenger cars the warning light comes on with roughly 10-15% of tank capacity remaining, which on a 40-45 litre tank is about 5 to 6 litres. The exact trigger point is in the owner's manual and varies by model, so check yours rather than relying on the average.",
    ],
    [
      "Is it bad to run the tank down to empty?",
      "Running very low risks drawing sediment from the bottom of the tank, and in fuel-pump-in-tank designs the fuel also cools the pump, so repeatedly running near empty shortens pump life. Beyond the mechanical risk, an empty tank on a highway is a safety problem — that is why this tool defaults to keeping a reserve.",
    ],
    [
      "Why is my actual range lower than the calculated one?",
      "Rated mileage is measured on a steady test cycle. Stop-start traffic, air conditioning, a roof carrier, under-inflated tyres, a full passenger load and hill climbs each cut real consumption, which is what the condition factor is for. The most accurate input is your own tank-to-tank average: distance covered between two brim fills divided by the litres added.",
    ],
  ],
};

export default seo;
