const seo = {
  title: "Singapore Airlines Excess Baggage: Prepaid",
  metaDescription:
    "Works out excess kilos over your fare brand allowance plus KrisFlyer bonus, and prices them at the airport rate against 5-40 kg advance blocks.",
  steps: [
    "Pick your 'Fare brand / cabin' and 'KrisFlyer / PPS Club tier', then enter 'Passengers on the booking', 'Total checked baggage weight (kg)' and 'Heaviest single bag (kg)'.",
    "Set the 'Currency of the quoted rates' and type the two per-kilogram figures from your own booking into 'Airport rate' and 'Advance purchase rate'.",
    "Read 'Chargeable excess (rounded up)', 'Advance purchase total' and 'Saving by buying early', compare the 'Advance block price ladder', then press 'Copy result'.",
  ],
  intro:
    "This estimator works out Singapore Airlines excess baggage under the weight concept: your checked allowance is a total number of kilograms set by the fare brand — 25 kg on Economy Lite up to 50 kg in Suites — with any KrisFlyer or PPS Club bonus added on top, and anything above that billed per kilogram rounded up to the next whole kilo. Enter your total checked weight, fare brand, tier and party size and it compares paying at the airport against buying weight in advance, which Singapore Airlines sells in fixed blocks of 5, 10, 15, 20, 25, 30 or 40 kg per passenger. The per-kilogram rates are yours to enter, because excess is priced by route band and currency of sale.",
  useCases: [
    "You are 6 kg over on an Economy Lite ticket the night before departure and want to know whether buying a 10 kg advance block beats being charged for 6 kg at the counter.",
    "A family of three is checking in together and needs to know whether the allowance pools — it does, because the weight concept adds each passenger's kilograms into one total.",
    "You made KrisFlyer Elite Gold since booking and want to confirm the +20 kg is added to the fare brand allowance rather than replacing it, before repacking to a lower weight.",
  ],
  benefits: [
    ["It models the block rounding, not just a rate", "Advance weight is sold in fixed blocks, so covering 6 kg means buying 10 kg — the estimator shows the unused kilos and flags the cases where prepaying actually costs more."],
    ["Tier bonuses handled additively", "Elite Silver, Elite Gold and PPS kilograms are stacked onto the fare brand allowance and it tells you what the excess would have been without them."],
    ["Catches the 32 kg piece ceiling", "If your heaviest single bag is over 32 kg it warns you, because that bag is refused at check-in no matter how much excess weight you have paid for."],
  ],
  faqs: [
    [
      "How much checked baggage does Singapore Airlines allow?",
      "It depends on the fare brand, measured in total weight rather than pieces: Economy Lite 25 kg, Economy Value and Standard 30 kg, Economy Flexi and Premium Economy 35 kg, Business 40 kg, First and Suites 50 kg. Because it is a weight allowance, how you split it between suitcases makes no difference to the charge.",
    ],
    [
      "Is buying excess baggage online cheaper than at the airport?",
      "Usually yes — advance weight bought through Manage Booking is sold at a lower per-kilogram rate than the airport counter — but it is sold in fixed blocks of 5 to 40 kg, so a small overage can mean buying more than you need. Enter both rates from your own booking and the tool tells you which one wins for your exact weight.",
    ],
    [
      "Does KrisFlyer status add to my allowance or replace it?",
      "It adds. KrisFlyer Elite Silver carries +10 kg and Elite Gold and PPS Club carry +20 kg, stacked on top of the fare brand allowance — so Elite Gold on Economy Standard is 30 + 20 = 50 kg.",
    ],
    [
      "Is there a limit on how heavy one suitcase can be?",
      "Yes — 32 kg for any single checked piece, a handling limit that paying excess does not lift. A 35 kg case has to be repacked into two bags at the counter regardless of how much total weight you have bought.",
    ],
  ],
};

export default seo;
