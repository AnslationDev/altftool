// Polar bear — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const polarBear = {
  slug: "polar-bear",
  category: "mammals",
  name: "Polar Bear",
  scientificName: "Ursus maritimus",
  otherNames: ["Nanuq", "White bear", "Ice bear", "Sea bear"],

  summary:
    "The largest land carnivore on earth, classified as a marine mammal because it hunts almost entirely from sea ice — and therefore tied to the one habitat that is disappearing fastest.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/6/66/Polar_Bear_-_Alaska_%28cropped%29.jpg",
    alt: "A female polar bear photographed near Kaktovik on Barter Island, Alaska",
    credit: "Alan Wilson / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/2025_Ursus_maritimus_-_Eisbaer_-_by_2eight_-_9SC3526.jpg/1920px-2025_Ursus_maritimus_-_Eisbaer_-_by_2eight_-_9SC3526.jpg",
      alt: "A polar bear moving across broken Arctic pack ice",
      credit: "Stefan Brending ( 2eight ) / Wikimedia Commons",
      title: "The hunting platform",
      caption:
        "Almost every seal a polar bear eats is caught from sea ice. When the ice breaks up the bear is not merely inconvenienced — it loses access to food entirely until the ice returns.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/2025_Ursus_maritimus_-_Eisbaer_-_by_2eight_-_9SC3593.jpg/1920px-2025_Ursus_maritimus_-_Eisbaer_-_by_2eight_-_9SC3593.jpg",
      alt: "A polar bear standing on pack ice, seen against snow and open water",
      credit: "Stefan Brending ( 2eight ) / Wikimedia Commons",
      title: "White fur over black skin",
      caption:
        "The hairs are not white but transparent and hollow; they scatter light, and the skin beneath them is black. Under the skin sits a fat layer five to ten centimetres thick that does most of the actual insulating.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/2025_Ursus_maritimus_-_Eisbaer_-_by_2eight_-_9SC3627.jpg/1920px-2025_Ursus_maritimus_-_Eisbaer_-_by_2eight_-_9SC3627.jpg",
      alt: "A polar bear on drifting pack ice surrounded by open water",
      credit: "Stefan Brending ( 2eight ) / Wikimedia Commons",
      title: "Long crossings between floes",
      caption:
        "Polar bears swim well but slowly, at around 6 km/h. Tracking has recorded animals swimming for an average of three and a half days at a stretch, covering more than 150 km between floes.",
    },
  ],

  headline: "A bear that lives on the sea",
  intro: [
    "The polar bear is the largest bear and the largest land carnivore, with big males reaching 800 kg. It is also, legally and biologically, a marine mammal: it depends on sea ice for hunting, breeding and travel, and spends much of its life on floating ice far from land.",
    "Everything about it is shaped by that. It hunts a single prey type almost exclusively — seals — using techniques that only work on ice. It has the acute sense of smell needed to find a seal breathing hole under a metre of snow. And it is the species whose future is most directly and least ambiguously tied to how much Arctic sea ice there is.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Carnivora",
    family: "Ursidae",
    genus: "Ursus",
    species: "Ursus maritimus",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2015,
    populationTrend: "unknown",
    populationEstimate: "Roughly 22,000–31,000 across 19 recognised subpopulations",
    note: "Listed Vulnerable in the 2015 assessment on projected decline in the area and quality of habitat, not on counted losses. The assessment modelled the effect of forecast sea-ice loss and found roughly a 71% probability that the global population falls by more than 30% within three generations. The global trend is formally recorded as unknown because subpopulations are moving in different directions and several have never been reliably surveyed; the Western Hudson Bay and Southern Beaufort Sea groups are among those with clear declines.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Head–body length",
      value: "1.8–2.5 m",
      min: 1.8,
      max: 2.5,
      unit: "m",
      note: "Males 2.0–2.5 m, females 1.8–2.0 m",
    },
    {
      key: "shoulder-height",
      label: "Shoulder height",
      value: "1.3–1.6 m",
      min: 1.3,
      max: 1.6,
      unit: "m",
    },
    {
      key: "weight",
      label: "Weight",
      value: "150–800 kg",
      min: 150,
      max: 800,
      unit: "kg",
      note: "Males 300–800 kg, females 150–300 kg. The heaviest on record, shot at Kotzebue Sound in Alaska in 1960, was reported at 1,002 kg",
    },
    {
      key: "top-speed",
      label: "Top speed",
      value: "Up to about 40 km/h",
      min: 30,
      max: 40,
      unit: "km/h",
      note: "Over very short distances. Normal travelling pace is around 5.5 km/h — sprinting overheats a bear insulated for −40 °C",
    },
    {
      key: "swimming-speed",
      label: "Swimming speed",
      value: "About 6 km/h",
      min: 6,
      max: 6,
      unit: "km/h",
      note: "Slow but almost inexhaustible; tracked bears have swum for an average of 3.4 days and 154 km at a stretch",
    },
    {
      key: "smell-range",
      label: "Scent detection range",
      value: "Over 1 km",
      min: 1,
      max: 1,
      unit: "km",
      note: "And through roughly a metre of compacted snow — enough to locate a ringed seal lair that is completely invisible from the surface",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 7–9 months including delayed implantation",
      min: 195,
      max: 265,
      unit: "days",
      note: "Actual foetal development takes only around two months; implantation is delayed until autumn and depends on the female having built sufficient fat",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "1–3 cubs",
      min: 1,
      max: 3,
      unit: "cubs",
      note: "Two is typical. Cubs are born in the den weighing around 600 g",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "4–5 years (females), about 6 years (males)",
      min: 4,
      max: 6,
      unit: "years",
      note: "Females typically produce a litter only once every three years",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Up to about 30 years",
      min: 20,
      max: 30,
      unit: "years",
      note: "Few wild bears reach the upper end; most die well before it",
    },
    {
      key: "territory-size",
      label: "Annual range",
      value: "3,500–38,000 km²",
      min: 3500,
      max: 38000,
      unit: "km²",
      note: "Bears do not hold territories; these are the areas an individual covers in a year as it follows the ice",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — overwhelmingly ringed and bearded seals", icon: "Drumstick" },
    { key: "social-structure", label: "Social structure", value: "Solitary, apart from mothers with cubs", icon: "User" },
    { key: "activity", label: "Activity", value: "Active year-round; only pregnant females den through winter", icon: "Sun" },
    { key: "sea-ice-dependence", label: "Sea-ice dependence", value: "Obligate — hunts almost exclusively from the ice", icon: "Snowflake" },
    { key: "insulation", label: "Insulation", value: "Black skin under transparent hollow hair, over 5–10 cm of fat", icon: "Thermometer" },
    { key: "ecological-role", label: "Ecological role", value: "Apex predator of the Arctic sea-ice ecosystem", icon: "Network" },
  ],

  highlights: ["weight", "smell-range", "sea-ice-dependence", "insulation"],

  distribution: {
    continents: ["North America", "Europe", "Asia"],
    regions: [
      "Alaska, United States",
      "Northern Canada and the Canadian Arctic Archipelago",
      "Greenland",
      "Svalbard, Norway",
      "Russian Arctic — Barents, Kara, Laptev and Chukchi seas",
      "Hudson Bay",
    ],
    habitats: [
      "Annual sea ice over continental shelf",
      "Multi-year pack ice",
      "Arctic coastline and islands",
      "Coastal tundra (denning)",
    ],
    elevation: "Sea level; bears range across floating ice hundreds of kilometres from land",
    note: "The species is circumpolar, distributed across the Arctic in 19 recognised subpopulations. Density is highest over the shallow continental shelves, where sea ice is seasonal and productive and ringed seals are abundant, rather than over the deep central Arctic basin. Hudson Bay marks the southern limit; bears there are forced ashore every summer when the bay ices out completely.",
  },

  sections: [
    {
      id: "ice",
      title: "Why the ice is not optional",
      body: [
        "A polar bear on land is a poor hunter. Seals are fast and manoeuvrable in water and a bear cannot catch them by swimming; every effective hunting technique it has depends on the seal having to come to a fixed point on a solid surface. Take the surface away and the technique fails.",
        "The main method is still-hunting: the bear locates a breathing hole by smell, lies down beside it, and waits — sometimes for hours — for a seal to surface, then hauls it out with a foreleg and claws. The other main method is to smell out a ringed seal's snow lair, which may be more than a metre below the surface, and break through the roof with a downward strike of the forelimbs.",
        "This is why the timing of ice break-up matters more than its total extent. Bears do most of their annual feeding in late spring, when seal pups are in lairs and the ice is still solid. An earlier break-up shortens that window, and a bear that comes ashore under-fed has to wait out the whole open-water season on stored fat.",
      ],
    },
    {
      id: "adaptations",
      title: "Built for cold and for smell",
      body: [
        "The insulation is layered. Guard hairs are transparent and hollow rather than white, scattering light so the animal appears white against snow; the skin under them is black. Beneath that sits a fat layer five to ten centimetres thick, which does most of the actual thermal work — polar bears are so well insulated that overheating during exertion is a real constraint on how they move.",
        "The paws are very broad, spreading weight over thin ice and working as paddles in water, and they are furred on the soles with small papillae that grip wet ice. The claws are short, sharp and strongly hooked — built to hold a struggling seal rather than to dig.",
        "Smell is the primary hunting sense. A polar bear can most likely detect a seal from more than a kilometre away and through about a metre of packed snow, and bears routinely travel crosswind to sweep a wider band of air.",
      ],
    },
    {
      id: "denning",
      title: "Denning and cubs",
      body: [
        "Only pregnant females den. Everyone else stays active through the Arctic winter, hunting on the ice in near-total darkness. The female digs a snow chamber, usually in a coastal drift or on a slope, between August and October, and stays inside without eating for months.",
        "Mating happens in spring but the fertilised egg does not implant until autumn, and only if the female has accumulated enough fat — a mechanism that prevents her committing to a pregnancy she cannot finish. Cubs are born in mid-winter at around 600 grams, and emerge in March or April at ten to twelve kilograms.",
        "Cubs stay with the mother for about two and a half years, which sets the reproductive interval at roughly three years per litter. That slow rate is the reason population recovery from any loss is measured in decades, and why declining cub survival is the first signal that a subpopulation is in trouble.",
      ],
    },
    {
      id: "brownbears",
      title: "Recently split from the brown bear",
      body: [
        "Polar bears and brown bears are close relatives — estimates for the split range from around 600,000 years ago to over a million, depending on the study and the genomic method used. In evolutionary terms this is very recent for such a thorough transformation of diet, coat, skull shape and behaviour.",
        "They remain interfertile. Hybrids occur in the wild where ranges overlap in the Canadian Arctic, and have been confirmed by genetic testing on several occasions. Ancient gene flow runs both ways: some brown bear populations carry polar bear ancestry.",
        "The differences that did evolve are targeted. Polar bear teeth are sharper and less adapted to grinding plant material, the skull and neck are longer for reaching into holes, and the metabolism handles a diet that is extraordinarily high in fat — a load that would cause severe disease in most mammals.",
      ],
    },
    {
      id: "threats",
      title: "Sea ice loss and other pressures",
      body: [
        "The 2015 assessment listed the species as Vulnerable on the basis of projected habitat loss rather than counted decline. Modelling of forecast sea-ice change put the probability of a greater-than-30% fall in global numbers over three generations at around 71%, which is what the Vulnerable listing rests on.",
        "The observed effects so far are clearest at the southern edge. In Western Hudson Bay, the ice-free season has lengthened, bears come ashore lighter, cub survival has fallen and the subpopulation has declined. Bears in the Southern Beaufort Sea show a similar pattern. Some northern subpopulations, in contrast, are currently stable or increasing.",
        "Other pressures are real but secondary: persistent organic pollutants and mercury accumulate to high levels in an animal at the top of a marine food chain, shipping and oil development are expanding into newly ice-free waters, and conflict rises as hungry bears spend longer near coastal settlements. Regulated subsistence hunting continues under the 1973 international agreement between the five range states, which ended the era of unregulated commercial hunting that had been the main threat until then.",
      ],
    },
  ],

  related: ["brown-bear", "gray-wolf", "blue-whale"],
  tags: ["bear", "arctic", "marine", "apex predator", "carnivore", "vulnerable", "climate"],
  searchTerms: ["ursus maritimus", "nanuq", "polar bear vs grizzly", "how many polar bears", "arctic bear"],

  faqs: [
    {
      q: "Are polar bears white?",
      a: "Their fur looks white but is not pigmented. The guard hairs are transparent and hollow, and scatter light; the skin underneath is black. In strong sun or after a summer of wear the coat often looks distinctly yellow or cream.",
    },
    {
      q: "How many polar bears are there?",
      a: "Roughly 22,000 to 31,000, spread across 19 recognised subpopulations. The global trend is formally recorded as unknown, because some subpopulations are declining, others are stable or increasing, and several have never been reliably surveyed at all.",
    },
    {
      q: "How far can a polar bear smell a seal?",
      a: "More than a kilometre away, and through about a metre of compacted snow. That is precise enough to locate a ringed seal's birth lair, which is completely hidden beneath the surface, and then break into it with a downward strike of the forelegs.",
    },
    {
      q: "Do polar bears hibernate?",
      a: "Only pregnant females den. They dig a snow chamber in autumn and stay inside for months without feeding, giving birth in mid-winter. All other polar bears stay active through the Arctic winter and hunt on the ice in near-total darkness.",
    },
    {
      q: "Why are polar bears threatened by climate change?",
      a: "Because they can only hunt effectively from sea ice. Seals are too fast to catch in open water, so every successful technique depends on ice as a platform. A shorter ice season means a shorter feeding season, and bears that come ashore under-fed have lower cub survival — the pattern already documented in Western Hudson Bay.",
    },
  ],

  seo: {
    title: "Polar Bear — Size, Hunting on Sea Ice, Population & Status",
    description:
      "A researched profile of the polar bear (Ursus maritimus): the largest land carnivore, why it can only hunt from sea ice, its sense of smell, denning and cubs, and what Vulnerable actually means here.",
    keywords: [
      "polar bear facts",
      "ursus maritimus",
      "how many polar bears are left",
      "polar bear size",
      "polar bear sea ice",
    ],
  },

  sources: [
    {
      label: "Ursus maritimus — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22823/14871490",
    },
    {
      label: "IUCN Red List assessment background",
      publisher: "IUCN SSC Polar Bear Specialist Group",
      url: "https://www.iucn-pbsg.org/iucn-redlist/",
    },
    {
      label: "Polar bear facts",
      publisher: "Polar Bears International",
      url: "https://polarbearsinternational.org/polar-bears-changing-arctic/polar-bear-facts/",
    },
    {
      label: "Polar bear senses",
      publisher: "SeaWorld Animal Guide",
      url: "https://seaworld.org/animals/all-about/polar-bears/senses/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default polarBear;
