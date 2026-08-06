// Atlantic cod — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const atlanticCod = {
  slug: "atlantic-cod",
  category: "fish",
  name: "Atlantic Cod",
  scientificName: "Gadus morhua",
  otherNames: ["Codling", "Northern cod", "Bacalao"],

  summary:
    "The fish that built the economies of the North Atlantic, and whose collapse off Newfoundland in 1992 remains the clearest warning any fishery has ever given.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Atlantic_Cod%2C_Atlantischer_Kabeljau_%28Gadus_morhua%29.jpg/1920px-Atlantic_Cod%2C_Atlantischer_Kabeljau_%28Gadus_morhua%29.jpg",
    alt: "An Atlantic cod in an aquarium tank, showing the mottled brown-green back, pale lateral line and chin barbel",
    credit: "Wilhelm Thomas Fiege / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Dead_Atlantic_Cod_%28Gadus_morhua%29%2C_Haroldswick_-_geograph.org.uk_-_4237977.jpg",
      alt: "A dead Atlantic cod lying on the shore at Haroldswick in Shetland",
      credit: "Mike Pennington / Wikimedia Commons",
      title: "A fish you meet dead",
      caption:
        "Almost nobody encounters a living cod. For five centuries this species has been a commodity first and an animal second, and the record below is about a fishery as much as it is about a fish. The pale line running from gill to tail is the lateral line, the pressure-sensing organ cod use to hold position in a shoal.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Cods_%28Gadus_morhua%2C_G._morhua_callarias%29_from_Baltic_Sea%2C_W%C5%82adys%C5%82awowo%2C_Pomeranian_Voivodeship%2C_Poland_2004.jpg/1920px-Cods_%28Gadus_morhua%2C_G._morhua_callarias%29_from_Baltic_Sea%2C_W%C5%82adys%C5%82awowo%2C_Pomeranian_Voivodeship%2C_Poland_2004.jpg",
      alt: "Two landed Baltic cod photographed at Władysławowo on the Polish coast",
      credit: "MichalPL / Wikimedia Commons",
      title: "Baltic fish, landed in Poland",
      caption:
        "Baltic cod are the same species living in water far fresher than the open Atlantic, and they grow smaller and mature earlier for it. Both Baltic stocks are now in such poor condition that directed fishing has been closed since 2019 — the same trajectory Newfoundland took, three decades later.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Gadus_morhua_%28Baltic_Sea%29.jpg",
      alt: "An Atlantic cod caught in a net in the Baltic Sea",
      credit: "Genet (Diskussion) / Wikimedia Commons",
      title: "Taken in a net",
      caption:
        "Cod are caught in bottom trawls, gillnets and on longlines. Gear that works the seabed is efficient precisely because cod are benthic — they feed on and just above coarse bottom, which is also where the eggs of everything else in that community settle.",
    },
  ],

  headline: "Five hundred years, and then nothing",
  intro: [
    "Atlantic cod is an unremarkable-looking fish with an outsized history. It is a heavy-bodied bottom feeder of the North Atlantic shelf, with a chin barbel it uses to taste the seabed, three dorsal fins and a pale lateral line running the length of its flank. It grows to two metres in exceptional cases and lives around twenty-five years, though fish that old have become rare almost everywhere.",
    "Its importance is economic. Cod salted and dried keeps for years without refrigeration, which made it the protein that provisioned ships, armies and Atlantic trade for five hundred years. European boats were working the Grand Banks off Newfoundland before there were European settlements in North America. And in July 1992 the Canadian government closed that fishery entirely, after the northern cod stock fell to a fraction of what it had been. Thirty-four years on it has still not recovered.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Actinopterygii",
    order: "Gadiformes",
    family: "Gadidae",
    genus: "Gadus",
    species: "Gadus morhua",
  },

  conservation: {
    status: "VU",
    assessmentYear: 1996,
    populationTrend: "decreasing",
    populationEstimate:
      "No global figure. Northern cod spawning biomass fell from about 1.6 million tonnes in 1962 to between 72,000 and 110,000 tonnes by 1992 — a decline of roughly 93% in thirty years",
    note: "Assessed as Vulnerable on 1 August 1996, and still the current global listing — an assessment the IUCN itself flags as needing updating, and the oldest carried by any animal on this site. It should not be read as a description of the species today, because the picture now varies enormously by stock. A 2015 European regional assessment found the species Least Concern in European waters, where several stocks have recovered. In the northwest Atlantic it has not: NOAA lists the US stocks as overfished and under rebuilding plans, and Canada's northern cod stock, closed in 1992, only reopened to a limited commercial fishery in June 2024 with an 18,000-tonne quota. Both Baltic stocks have been closed to directed fishing since 2019.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "Usually 1–1.4 m; up to 2 m",
      min: 1,
      max: 2,
      unit: "m",
      note: "FishBase gives a maximum of 200 cm total length. NOAA cites up to 51 inches (1.3 m) for US waters, which reflects how few large old fish are left rather than a difference in the animal",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Commonly under 20 kg; the record is 96 kg",
      min: 5,
      max: 96,
      unit: "kg",
      note: "FishBase lists a maximum published weight of 96 kg; NOAA gives up to 35 kg for the stocks it manages",
    },
    {
      key: "dive-depth",
      label: "Depth range",
      value: "Surface to about 600 m",
      min: 600,
      max: 600,
      unit: "m",
      note: "FishBase gives 0–600 m, usually 150–200 m. NOAA describes typical habitat as roughly 10–150 m over coarse bottom along rocky slopes and ledges",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "2–8 years, depending on the stock",
      min: 2,
      max: 8,
      unit: "years",
      note: "NOAA gives 2–3 years at 30–40 cm in US waters. Age at maturity has fallen over the past century in heavily fished stocks, which is itself a symptom of fishing pressure rather than a sign of health",
    },
    {
      key: "clutch-size",
      label: "Eggs per spawning",
      value: "3–9 million in a large female",
      min: 3000000,
      max: 9000000,
      unit: "eggs",
      note: "NOAA figure. Released in batches into open water; the eggs and larvae drift in the plankton for months and survival to age one is a fraction of a percent",
    },
    {
      key: "stock-decline",
      label: "Northern cod spawning biomass, 1962 to 1992",
      value: "From about 1.6 million tonnes to 72,000–110,000 tonnes",
      min: 72000,
      max: 1600000,
      unit: "tonnes",
      note: "A fall of roughly 93% in three decades, on Canada's own figures. The fishery was closed on 2 July 1992",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Up to about 25 years",
      min: 20,
      max: 25,
      unit: "years",
      note: "FishBase gives a maximum reported age of 25 and NOAA more than 20. Fish that old are now uncommon in most stocks, and losing them matters — the biggest, oldest females produce by far the most eggs",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — capelin, herring, sand lance, crabs, shrimp and molluscs", icon: "Fish" },
    { key: "senses", label: "Senses", value: "A chin barbel used to taste the seabed, plus a prominent lateral line", icon: "Radar" },
    { key: "reproduction", label: "Reproduction", value: "Broadcast spawner; eggs and larvae drift in the plankton", icon: "Egg" },
    { key: "movement", label: "Movement", value: "Seasonal spawning migrations, historically hundreds of kilometres", icon: "Navigation" },
    { key: "water-type", label: "Water type", value: "Saltwater; tolerates the brackish Baltic", icon: "Droplet" },
    { key: "schooling-behaviour", label: "Schooling", value: "Large size-structured shoals, with the biggest fish leading migrations", icon: "Users" },
    { key: "ocean-range", label: "Ocean range", value: "North Atlantic and Arctic, from the Barents Sea to Cape Hatteras", icon: "Globe" },
    { key: "ecological-role", label: "Ecological role", value: "Apex predator of North Atlantic shelf communities", icon: "Crosshair" },
  ],

  highlights: ["length", "weight", "clutch-size", "stock-decline"],

  distribution: {
    continents: ["Europe", "North America"],
    regions: [
      "Grand Banks and the Labrador Shelf",
      "Gulf of Maine and Georges Bank",
      "Both coasts of Greenland",
      "Icelandic waters",
      "Barents Sea and the Norwegian coast",
      "North Sea and the Celtic Sea",
      "Baltic Sea",
    ],
    habitats: ["Continental shelf", "Rocky slopes and ledges", "Coastal inshore waters"],
    elevation: "Shoreline to about 600 m",
    note: "In the western Atlantic the range runs from Ungava Bay in Canada south to Cape Hatteras in North Carolina; in the east from the Bay of Biscay north to the Barents Sea, including Iceland, Greenland and the Baltic. Cod are managed as a large number of separate stocks, which is not an administrative nicety: the Baltic, Barents Sea and Newfoundland populations differ in growth, maturity and behaviour, and their fortunes over the past fifty years have diverged completely.",
  },

  sections: [
    {
      id: "biology",
      title: "A fish built for cold, coarse bottom",
      body: [
        "Cod are heavy-bodied and blunt-headed, with three dorsal and two anal fins and a single barbel under the chin that carries taste receptors — the fish drags it over the seabed the way a mammal uses a nose. The pale lateral line running from gill to tail reads pressure changes in the water, which is how a cod holds station in a shoal it cannot always see.",
        "They are cold-water fish in a literal sense. Cod in Arctic waters carry antifreeze glycoproteins in their blood: small molecules that bind to the surface of forming ice crystals and stop them growing, allowing the fish to sit in water below the freezing point of its own body fluids. Antarctic notothenioid fish evolved essentially the same trick independently, from a completely different gene.",
        "Shoaling is size-structured, and the structure matters. Larger fish lead migrations and the shoal follows; strip out the large fish and the accumulated knowledge of where to spawn and where to feed goes with them. This is one reason a collapsed cod stock does not simply refill when the boats stop — the behavioural map has been erased along with the biomass.",
      ],
    },
    {
      id: "the-fishery",
      title: "Five hundred years on the Banks",
      body: [
        "Cod is the fish that made salt preservation into an industry. Split, salted and dried, it keeps for years without refrigeration, which made it the standard provision for ships, armies and long-distance trade throughout the medieval and early modern Atlantic. Basque, Portuguese, English and French boats were working the Grand Banks off Newfoundland in the early 1500s, before there was any permanent European settlement in that part of North America.",
        "For most of that history the fishery was limited by technology. Boats were small, lines were hand-hauled, and the banks were vast. What changed after the Second World War was the arrival of factory freezer trawlers, which could work far offshore in poor weather, tow gear across the seabed and process the catch on board. Landings from the northern cod stock exceeded 800,000 tonnes in the late 1960s — roughly three times what the fishery had taken in any comparable period before.",
        "The result was extraction at a rate the stock could not sustain and, critically, an assessment system that did not register it. Catch rates stayed high as the fleet became more effective at finding the fish that remained, which made the stock look healthier than it was right up until it was not there.",
      ],
    },
    {
      id: "collapse",
      title: "2 July 1992",
      body: [
        "Northern cod spawning biomass — the weight of fish old enough to breed — was about 1.6 million tonnes in 1962. By 1992 it was somewhere between 72,000 and 110,000 tonnes, a decline of roughly 93%. Some estimates put the stock at around 1% of its historic level.",
        "On 2 July 1992 the Canadian government imposed a moratorium on the northern cod fishery. It put about 30,000 people in Newfoundland and Labrador out of work at a stroke, in a province where whole communities existed because of the fish, and it contributed to a population decline of roughly 10% as younger people left to find work elsewhere. It was the largest industrial layoff in Canadian history.",
        "The moratorium was expected to last two years. It lasted thirty-two. The stock did not bounce back when fishing stopped, and the reasons are still argued over: the loss of the largest and most fecund fish, changes in water temperature, a growing seal population, and an ecosystem that reorganised itself around the absence of its apex predator. Shrimp and snow crab — species cod eat — boomed in the vacuum, and the Newfoundland fishery reinvented itself around them.",
      ],
    },
    {
      id: "reopening",
      title: "The 2024 reopening, and what it does and does not mean",
      body: [
        "In June 2024 Canada announced what it called the historic return of the commercial northern cod fishery, with a quota of 18,000 tonnes for the 2024–25 season. The stock had been in the 'cautious' zone of Canada's precautionary framework since 2016, and a revised assessment model moved the boundary between the critical and cautious zones downward.",
        "The decision was contested. Supporters point out that 18,000 tonnes is around 6% of the estimated biomass — a far more conservative exploitation rate than anything the fishery ran at before the collapse. Critics point out that the stock is nowhere near its healthy zone, that the change in status owed something to a change in the model as well as to the fish, and that the science advice available did not support an increase over the previous stewardship quota.",
        "The honest summary is that northern cod is no longer collapsing and is no longer recovering quickly either. Biomass sits well below the level that would once have been considered normal, and there is no serious prospect of a return to the fishery of the 1960s.",
      ],
    },
    {
      id: "elsewhere",
      title: "Cod that did come back, and cod that did not",
      body: [
        "The species' overall picture is genuinely mixed, which is why a single global Red List code fits it so badly. The Barents Sea stock, jointly managed by Norway and Russia, has been among the largest and most productive cod fisheries in the world for the past two decades. Iceland's stock has been rebuilt under a harvest control rule. Both are evidence that cod can recover where catch limits are set against scientific advice and enforced.",
        "The Baltic is the counter-example. The eastern Baltic stock declined through the 2000s and 2010s and directed fishing has been closed since 2019; the western stock followed. The causes there are not fishing alone — expanding oxygen-poor bottom water, a heavy parasite burden and poor condition in individual fish all play a part, which makes the problem harder to fix by regulation.",
        "In US waters NOAA lists the Gulf of Maine and Georges Bank stocks as overfished and subject to overfishing, with rebuilding plans running into the 2030s. What all of this adds up to is a species that is not close to extinction anywhere, and a set of fisheries several of which are.",
      ],
    },
  ],

  related: ["atlantic-salmon", "atlantic-bluefin-tuna", "european-eel", "great-white-shark"],
  tags: ["cod", "marine", "bony fish", "fishery", "collapse", "vulnerable"],
  searchTerms: ["gadus morhua", "cod", "codfish", "grand banks", "cod moratorium", "northern cod"],

  faqs: [
    {
      q: "Is Atlantic cod endangered?",
      a: "It is listed as Vulnerable globally, but from a 1996 assessment the IUCN itself says needs updating, so the code is a poor guide. The reality varies by stock: the Barents Sea and Icelandic fisheries are productive and well managed, European stocks were assessed as Least Concern regionally in 2015, US stocks are overfished and rebuilding, and both Baltic stocks have been closed to directed fishing since 2019.",
    },
    {
      q: "What caused the Grand Banks cod collapse?",
      a: "Sustained overfishing, mainly by factory freezer trawlers from the 1960s onward, combined with stock assessments that failed to detect the decline because catch rates stayed high as the fleet got better at finding the remaining fish. Northern cod spawning biomass fell from about 1.6 million tonnes in 1962 to between 72,000 and 110,000 tonnes by 1992, and Canada closed the fishery on 2 July 1992.",
    },
    {
      q: "Has the Newfoundland cod stock recovered?",
      a: "Not to anything like its former size. The stock stopped declining and has sat in Canada's 'cautious' zone since 2016 — above the critical threshold but well below a healthy level. A limited commercial fishery reopened in June 2024 with an 18,000-tonne quota, ending a 32-year moratorium, but that is roughly 6% of the estimated biomass and a small fraction of pre-collapse landings.",
    },
    {
      q: "How big do Atlantic cod get?",
      a: "The maximum on record is 200 centimetres and 96 kilograms, but fish anywhere near that size are historic. Most cod caught today are between 40 and 80 centimetres, and NOAA gives an upper figure of about 1.3 metres and 35 kilograms for the stocks it manages.",
    },
    {
      q: "How many eggs does a cod lay?",
      a: "A large female can release 3 to 9 million eggs in a spawning season, shed in batches into open water where they are fertilised externally. Almost none survive — the eggs and larvae drift in the plankton for months. Because egg production rises steeply with body size, the loss of the oldest, largest females has an effect on a stock far out of proportion to their numbers.",
    },
  ],

  seo: {
    title: "Atlantic Cod — Size, Biology, the Grand Banks Collapse & Status",
    description:
      "A researched profile of the Atlantic cod (Gadus morhua): antifreeze proteins, size-structured shoals, the 1992 Newfoundland moratorium, the 2024 reopening and the very different fortunes of cod stocks across the North Atlantic.",
    keywords: [
      "atlantic cod facts",
      "gadus morhua",
      "grand banks cod collapse",
      "cod moratorium 1992",
      "is atlantic cod endangered",
    ],
  },

  sources: [
    {
      label: "Gadus morhua — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/8784/12931575",
    },
    {
      label: "Atlantic cod species profile and stock status",
      publisher: "NOAA Fisheries",
      url: "https://www.fisheries.noaa.gov/species/atlantic-cod",
    },
    {
      label: "Gadus morhua — species summary",
      publisher: "FishBase",
      url: "https://www.fishbase.se/summary/gadus-morhua.html",
    },
    {
      label: "Cod moratorium in Newfoundland and Labrador",
      publisher: "Heritage Newfoundland and Labrador, Memorial University",
      url: "https://www.heritage.nf.ca/articles/economy/moratorium.php",
    },
    {
      label: "The historic return of the commercial northern cod fishery",
      publisher: "Fisheries and Oceans Canada (June 2024)",
      url: "https://www.canada.ca/en/fisheries-oceans/news/2024/06/the-government-of-canada-announces-the-historic-return-of-the-commercial-northern-cod-fishery-in-newfoundland-and-labrador.html",
    },
  ],

  updatedAt: "2026-07-29",
};

export default atlanticCod;
