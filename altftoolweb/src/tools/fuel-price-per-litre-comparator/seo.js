const seo = {
  title: "Fuel Price Per Litre Comparator: Gallons to Litres, Ranked",
  metaDescription:
    "Convert pump prices per litre, US gallon or imperial gallon in any currency to one price per litre, rank up to 6 stations and cost out the fill and trip.",
  steps: [
    "For up to 6 stations, enter the Price on the sign, whether it is quoted per litre, per US gallon or per imperial gallon, the currency and your exchange rate.",
    "Pick the currency to Show everything in — INR, USD, EUR, GBP, AED, AUD, CAD or SGD — and every price is converted to that currency per litre.",
    "Read the Cheapest per litre ranking and each station's premium %, add tank litres, km/l and remaining distance for fill and trip costs, then click Copy result.",
  ],
  intro:
    "This comparator converts fuel prices quoted in different volume units and currencies into a single price per litre so they can be ranked honestly. It divides the sign price by the litres in the quoted unit — 1 for a litre, 3.785411784 for a US gallon, 4.54609 for an imperial gallon — then multiplies by the exchange rate you enter. It then shows the spread between the cheapest and dearest option and what a fill and the rest of the drive would cost.",
  useCases: [
    "Deciding whether to fill up before crossing a border where the sign price looks lower but is quoted in gallons.",
    "Checking whether a motorway service station's premium is worth avoiding on a long drive.",
    "Turning a US price per gallon into rupees per litre to see how a road trip abroad compares with home.",
  ],
  benefits: [
    ["One honest scale", "Gallons, litres and several currencies all reduced to one comparable price per litre."],
    ["Shows the real spread", "Reports how much more the dearest option costs per litre and as a percentage."],
    ["Trip cost, not just price", "Turns the winning price into the cost of a fill, the range it buys and the cost per 100 km."],
  ],
  faqs: [
    [
      "How do I convert a price per gallon to a price per litre?",
      "Divide by 3.785411784 for a US gallon or by 4.54609 for an imperial gallon. A US price of $3.79 a gallon is $1.00 a litre, which is why American fuel looks dramatically cheaper on the sign than it is per litre.",
    ],
    [
      "Which exchange rate should I use for fuel abroad?",
      "Use the rate your card actually settles at, which is the network rate plus any foreign-transaction fee — often 1% to 3% above the mid-market rate you see quoted online. Dynamic currency conversion offered at the pump, where the terminal bills you in your home currency, is usually worse still and should be declined.",
    ],
    [
      "Is it worth driving out of the way for cheaper fuel?",
      "Only when the saving beats the fuel and time the detour costs. A 20 km round-trip detour in a car doing 15 km/l burns about 1.3 litres, so on a 40 litre fill the pump has to be more than about 3% cheaper before you break even — before counting your time.",
    ],
    [
      "Why is the price per litre different at motorway service stations?",
      "Motorway and airport sites pay far higher rents and concession fees and serve drivers with few alternatives, so a premium of several percent over a town forecourt is normal in most countries. Filling before you join a long toll road is usually the cheaper habit.",
    ],
  ],
};

export default seo;
