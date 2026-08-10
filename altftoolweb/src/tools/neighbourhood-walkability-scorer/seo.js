const seo = {
  title: "Neighbourhood Walkability Scorer — Score 0 to 100",
  metaDescription:
    "Score an address on the Walk Score model: nine amenity categories, full marks inside 400 m, nothing past 2,400 m, plus block and intersection penalties.",
  steps: [
    "Enter 'Walk to nearest (minutes)' for each of the nine amenity categories — grocery, restaurants, shops, cafés, bank or ATM, park, school, library or bookshop and cinema/gym — adding 'How many within 10 minutes' for the counted ones.",
    "Fill in 'Intersections per km²', 'Average block length (metres)', 'Walk to nearest transit stop (minutes)' and 'Typical gap between services (minutes)' under Street layout and transit.",
    "Read the Walkability score out of 100 with its band, the pedestrian-friendliness penalty, the separate Transit access score, and the 'Points by category' table with its Biggest gaps list; Copy result copies the summary.",
  ],
  intro:
    "Scores a neighbourhood out of 100 for how much of daily life is reachable on foot, using the structure of the published Walk Score methodology: nine amenity categories weighted to a 15-point total, a distance decay that gives full marks inside a five-minute walk (about 400 m) and nothing beyond a thirty-minute walk (about 2,400 m), then pedestrian-friendliness penalties of up to 5% each for low intersection density and long blocks. Transit access is scored separately, because a bus stop you cannot rely on is not access.",
  useCases: [
    "Comparing two flats you are deciding between when one is cheaper but further from a grocery store",
    "Checking before signing a lease whether you could realistically live without a second car",
    "Explaining to a landlord or agent exactly which amenity gap makes an otherwise good address car-dependent",
  ],
  benefits: [
    ["Same shape as the reference model", "Category weights, the 15-point total and the published score bands, not an invented rating."],
    ["Shows which category loses you points", "The weakest three categories are called out so you know what the address is actually missing."],
    ["Street layout counted, not just distance", "Intersection density and block length change how far 400 m really gets you."],
  ],
  faqs: [
    [
      "What counts as a walkable distance to shops?",
      "Five minutes, or roughly 400 m at a normal 4.8 km/h pace — that is the distance inside which amenities earn full marks in the Walk Score model. Value falls away with distance and reaches zero at about 2,400 m, a thirty-minute walk, which most people will not make routinely for an errand.",
    ],
    [
      "What is a good walkability score?",
      "90 and above means daily errands do not require a car; 70 to 89 means most errands can be done on foot; 50 to 69 means some can; below 50 the neighbourhood is car-dependent. These are the published Walk Score bands. Scores above 90 usually need a genuine cluster of shops and cafés rather than one of each at the edge of the range.",
    ],
    [
      "Why does block length affect walkability?",
      "Long blocks force detours, because you can only cross or change direction at a junction. The reference methodology deducts up to 5% for blocks averaging over 195 m and up to a further 5% where intersection density falls below 60 junctions per square kilometre. A cul-de-sac layout can put a shop 400 m away in a straight line but 1,200 m away on foot.",
    ],
    [
      "Does a walkability score include public transport?",
      "Not in the amenity score — transport is measured separately here, on the walk to the nearest usable stop and the gap between services. A stop five minutes away with a service every ten minutes scores full marks; a twenty-minute walk or an hourly service scores nothing, because neither supports spontaneous travel.",
    ],
  ],
};

export default seo;
