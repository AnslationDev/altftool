const seo = {
  intro:
    "This comparison converts the alloy-versus-steel wheel decision into numbers: how many kilograms of unsprung, rotating mass an alloy set removes, what that is worth in fuel, and how long the saving takes to repay the price premium. Rotating mass is weighted using the wheel-and-tyre inertia factor, so each kilogram at the rim counts as about 1.6 kg of dead weight under acceleration. The fuel effect uses the standard mass-reduction rule that a 10% cut in vehicle mass buys roughly 6-7% better fuel economy.",
  useCases: [
    "Deciding whether to pay the alloy upgrade on a new hatchback or keep the steel wheels and covers",
    "Checking whether a heavier aftermarket alloy would actually hurt fuel economy compared with the stock steel rim",
    "Costing a swap to steel wheels for winter or for a pothole-heavy commute",
  ],
  benefits: [
    ["Rotating mass counted properly", "Weight at the rim is scaled by the wheel inertia factor, not treated as plain kerb weight."],
    ["Honest payback number", "Shows when the fuel saving never repays the premium instead of hiding it."],
    ["Handles heavier alloys", "Large aftermarket alloys often weigh more than stock steel, and the result says so."],
  ],
  faqs: [
    [
      "Are alloy wheels actually lighter than steel wheels?",
      "For the same rim diameter and width, yes, usually by around 1-2 kg per wheel. But a bigger aftermarket alloy, say 17-inch replacing a 15-inch steel, is often heavier than the wheel it replaces, which is why this calculator asks you for both actual weights.",
    ],
    [
      "How much fuel do lighter wheels really save?",
      "Very little. Saving 6 kg across four wheels on a 1,100 kg car is under 1% of vehicle mass even after weighting for rotating inertia, which works out to well under 1% better fuel economy, typically a few hundred rupees a year. Lighter wheels are bought for ride, steering feel and looks, not for fuel.",
    ],
    [
      "Do alloy wheels break more easily in potholes?",
      "They fail differently. Steel bends and can often be straightened, while an alloy is more likely to crack, and a cracked alloy has to be professionally welded or replaced. On rough roads a steel wheel with a good tyre is the more forgiving combination.",
    ],
    [
      "Will fitting alloy wheels void my warranty or insurance?",
      "Changing wheels is a declared modification for most insurers, and fitting a rim size or offset outside the manufacturer's specification can affect suspension and warranty claims. Keep the load index and speed rating at least equal to the original and tell your insurer. Confirm the details with your dealer and insurer before buying.",
    ],
  ],
};

export default seo;
