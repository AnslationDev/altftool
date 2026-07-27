const seo = {
  intro:
    "A shower water usage calculator multiplies the shower head's flow rate by the minutes it runs to give the litres one bath uses, then does the same for a bucket bath and compares the two. It also prices the heating with the sensible-heat equation Q = m × c × ΔT, using the specific heat of water (4.186 kJ per kg per °C) and your geyser's efficiency, so you see litres, kilowatt-hours and rupees for one bath, for the household per month and for the year.",
  useCases: [
    "Deciding whether swapping a rain shower for a low-flow aerated head is worth the fitting cost",
    "Settling the household argument about whether bucket baths really save much water",
    "Estimating how much of a summer electricity bill is the geyser rather than the air conditioner",
  ],
  benefits: [
    ["Water and energy together", "One bath is priced on litres and geyser units, not litres alone."],
    ["Correct heating physics", "Uses Q = mcΔT on the delivered volume, which holds however you mix hot and cold."],
    ["Household scale", "Multiplies a single bath up to a month and a year for everyone in the home."],
  ],
  faqs: [
    [
      "How many litres of water does a 10-minute shower use?",
      "A typical Indian hand shower runs at about 9 litres a minute, so ten minutes uses roughly 90 litres. A low-flow aerated head at 6 L/min uses 60 litres over the same ten minutes, while a large rain shower at 20 L/min uses 200 litres.",
    ],
    [
      "Does a bucket bath use less water than a shower?",
      "Almost always. Two 15-litre buckets is 30 litres, which is the same water as about three and a half minutes under a 9 L/min shower — so any shower longer than that uses more. The comparison flips only if you use very large buckets or a very short, low-flow shower.",
    ],
    [
      "How much electricity does a geyser use for one shower?",
      "Heating 72 litres from 25 °C to 40 °C needs about 1.26 kWh of useful heat, which is roughly 1.4 kWh at the meter for a storage geyser running at 90% overall efficiency — around ₹11 at a ₹8 per unit tariff. Energy scales directly with both the litres used and the temperature rise.",
    ],
    [
      "What is a good shower flow rate?",
      "The US EPA's WaterSense specification caps labelled shower heads at 2.0 gallons per minute, about 7.6 litres per minute, and aerated heads at 6 L/min still feel full because air is mixed into the spray. Fitting a flow restrictor or an aerated head is the single cheapest way to cut both water and geyser use.",
    ],
  ],
};

export default seo;
