// West Indian Ocean coelacanth — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.
//
// Note on media: every gallery candidate returned for this species was a
// preserved or taxidermied museum specimen, so the gallery is intentionally
// empty rather than filled with dead animals.

const coelacanth = {
  slug: "coelacanth",
  category: "fish",
  name: "Coelacanth",
  scientificName: "Latimeria chalumnae",
  otherNames: ["West Indian Ocean coelacanth", "African coelacanth", "Gombessa"],

  summary:
    "A deep-water fish known only from fossils until one was landed in South Africa in 1938 — a hundred-year-old animal with limb-like fins, a hinged skull and a five-year pregnancy.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Coelacanth_off_Pumula_on_the_KwaZulu-Natal_South_Coast%2C_South_Africa%2C_on_22_November_2019.png",
    alt: "A living coelacanth photographed at 69 m depth off Pumula on the KwaZulu-Natal coast of South Africa, its lobed fins held out from the body",
    credit: "Bruce A.S. Henderson / Wikimedia Commons",
  },
  gallery: [],

  headline: "The fish that was extinct for seventy million years",
  intro: [
    "On 22 December 1938 a trawler working off East London in South Africa landed a heavy blue fish that nobody on the quay recognised. Marjorie Courtenay-Latimer, curator of the town's small museum, could not identify it either, but she was certain enough that it mattered to fight to have it preserved. The chemist and ichthyologist J.L.B. Smith, when he finally saw her sketch, recognised a coelacanth — a lineage last seen in rocks around seventy million years old.",
    "It remains one of the great rediscoveries in zoology, and almost everything found since has been as strange as the first specimen. The coelacanth is nearly two metres long, lives in caves at two hundred metres and more, carries its young for about five years, does not breed until it is roughly fifty-five, and may live for a century. It is also, at fewer than a thousand animals, Critically Endangered.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Actinistia",
    order: "Coelacanthiformes",
    family: "Latimeriidae",
    genus: "Latimeria",
    species: "Latimeria chalumnae",
  },

  conservation: {
    status: "CR",
    assessmentYear: 2000,
    populationTrend: "decreasing",
    populationEstimate:
      "Fewer than 500 individuals were estimated in 1998, roughly 370 of them around Grande Comore; later work suggests a few hundred more across the wider western Indian Ocean",
    note: "Assessed as Critically Endangered on 30 June 2000, and still the current listing. Listed on CITES Appendix I, which bans commercial international trade. A second living species, Latimeria menadoensis, was found in Indonesian waters in 1997 and described in 1999; it is assessed separately and is not covered by this record. There is no fishery for coelacanths — the losses come from deep-set gillnets targeting oilfish, which take them as bycatch.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "Up to 2 m",
      min: 1.5,
      max: 2,
      unit: "m",
      note: "Females grow larger than males, which reach about 1.68 m",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Up to about 95 kg",
      min: 60,
      max: 95,
      unit: "kg",
    },
    {
      key: "dive-depth",
      label: "Depth range",
      value: "150–700 m",
      min: 150,
      max: 700,
      unit: "m",
      note: "Usually between 180 and 250 m, where the water sits near 18 °C; shallower records exist off KwaZulu-Natal",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Around 100 years",
      min: 48,
      max: 100,
      unit: "years",
      note: "A 2021 study counting fine growth rings on scales under polarised light revised the previous maximum of about 48 years upward roughly fivefold",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "Around 55 years",
      min: 40,
      max: 69,
      unit: "years",
      note: "From the same 2021 scale analysis; later than any other fish yet measured",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 5 years",
      min: 5,
      max: 5,
      unit: "years",
      note: "The longest known gestation of any vertebrate",
    },
    {
      key: "litter-size",
      label: "Brood size",
      value: "Recorded broods of 5 to 26 pups",
      min: 5,
      max: 26,
      unit: "pups",
      note: "Known only from the handful of pregnant females ever examined",
    },
    {
      key: "birth-size",
      label: "Size at birth",
      value: "About 35 cm",
      min: 35,
      max: 38,
      unit: "cm",
      note: "Born fully formed and free-swimming, already the size of a decent trout",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — cuttlefish, squid, eels, deepwater snappers and small sharks", icon: "Fish" },
    { key: "feeding-method", label: "Feeding method", value: "Drift-hunting: hangs head-down in the current and takes what passes", icon: "Filter" },
    { key: "rostral-organ", label: "Rostral organ", value: "A gel-filled cavity in the snout that detects the electric fields of prey", icon: "Zap" },
    { key: "reproduction", label: "Reproduction", value: "Ovoviviparous — eggs the size of grapefruits hatch inside the female", icon: "Egg" },
    { key: "activity", label: "Activity", value: "Nocturnal; spends the day packed into caves", icon: "Moon" },
    { key: "schooling-behaviour", label: "Schooling", value: "Shares daytime caves without aggression, then drifts and hunts alone at night", icon: "Users" },
    { key: "water-type", label: "Water type", value: "Saltwater", icon: "Droplet" },
    { key: "ocean-range", label: "Ocean range", value: "Western Indian Ocean, chiefly the steep volcanic slopes of the Comoros", icon: "Globe" },
  ],

  highlights: ["length", "lifespan", "gestation", "dive-depth"],

  distribution: {
    continents: ["Africa"],
    regions: [
      "Grande Comore and Anjouan, Comoros",
      "KwaZulu-Natal, South Africa",
      "Northern Mozambique",
      "Southwestern Madagascar",
      "Tanzania, particularly off Tanga",
    ],
    habitats: ["Submarine lava caves", "Steep volcanic island slopes", "Deep submarine canyons"],
    elevation: "150 to 700 m below the surface",
    note: "The Comoros hold the best-known population, on the steep basalt slopes of Grande Comore where lava tubes provide daytime shelter. Sightings elsewhere in the western Indian Ocean have accumulated steadily since the 1990s — a Sodwana Bay canyon population in South Africa found by technical divers in 2000, animals off Tanzania, Mozambique and Madagascar — so the range is wider than first assumed, but the total number of animals is not thought to be large.",
  },

  sections: [
    {
      id: "discovery",
      title: "December 1938",
      body: [
        "Marjorie Courtenay-Latimer ran the East London Museum and had a standing arrangement with a local trawler captain, Hendrik Goosen, to look through his catch for anything unusual. Just before Christmas 1938 she found a 1.5-metre blue fish with heavy, fleshy, limb-like fins, unlike anything in her reference books. With no formaldehyde and no cold storage available, she had it mounted by a taxidermist — the internal organs were lost, a detail that would frustrate researchers for decades.",
        "Her letter and sketch reached J.L.B. Smith at Rhodes University weeks later. He recognised the animal at once and named it Latimeria chalumnae for her and for the Chalumna River near where it was caught. He then spent fourteen years searching for a second specimen, distributing reward posters in three languages along the East African coast, before one was landed off Anjouan in the Comoros in December 1952. Comorian fishermen had been catching them for generations and calling them gombessa; they were considered poor eating and were used mostly for their rough scales, as a sandpaper substitute.",
      ],
    },
    {
      id: "living-fossil",
      title: "Why 'living fossil' is the wrong phrase",
      body: [
        "The label stuck immediately and it misleads on two counts. First, the coelacanth has not stopped evolving. Latimeria is not the same animal as the Cretaceous coelacanths in the fossil record; it is a modern species in an old lineage, and genomic work has shown its genes changing, just more slowly than in most ray-finned fish. Slow is not stationary.",
        "Second, it is not our ancestor. Coelacanths and lungfish are both lobe-finned fish and both close to the lineage that produced land vertebrates, and for a long time the coelacanth was cast as the transitional animal. Genome sequencing published in 2013 settled the order: lungfish, not coelacanths, are the closest living relatives of tetrapods. The coelacanth is a cousin of our distant ancestors, not one of them, and its fleshy fins are a window onto the kind of limb the ancestor might have had rather than a copy of it.",
      ],
    },
    {
      id: "anatomy",
      title: "An anatomy nothing else has",
      body: [
        "The coelacanth's skull is hinged. An intracranial joint runs across the braincase, allowing the front of the head to swing upward against the back so the mouth opens far wider than the jaw alone would allow, which is thought to help it snap up prey by suction. No other living vertebrate has this joint.",
        "It has no vertebral column in the ordinary sense. The backbone is a fluid-filled tube — a notochord, the embryonic structure most vertebrates replace with bone — running the length of the body. Its swim bladder is not gas-filled but packed with fat, which provides buoyancy at depth and is a modified vestige of a lung.",
        "Six of the eight fins are on fleshy, muscular stalks that move in an alternating pattern like a walking gait, though a coelacanth does not walk. Filling the snout is a large jelly-filled space, the rostral organ, which detects the weak electric fields of animals hiding in the dark — the sense it hunts with, in place of eyes that are of little use at two hundred metres.",
        "Submersible footage settled how it actually feeds: it drifts on the current, often at odd angles or fully head-down, keeps station with small fin adjustments, and takes what comes past. Hans Fricke's expeditions from 1987 onwards produced the first film of living animals and the first evidence that they spend their days packed into lava caves in loose, tolerant groups.",
      ],
    },
    {
      id: "slow-life",
      title: "A century-long life",
      body: [
        "In 2021 a French team led by Kelig Mahé re-examined coelacanth scales under polarised light and found faint annual growth rings that earlier work had missed entirely. The correction was dramatic: the maximum age went from around 48 years to close to 100, and everything downstream of it changed too.",
        "The same analysis put age at first maturity around 55 years, with a range of about 40 to 69 — later than any other fish measured. Gestation, worked out from the size of embryos, runs for about five years, the longest of any vertebrate. A female coelacanth may therefore be older than most of the people studying her before she produces a single brood.",
        "This is why the species' small numbers matter so much. A population with a fifty-five-year generation time cannot respond to anything. Removing a handful of breeding adults from an island's population is a loss that takes the better part of a century to make good, if it is made good at all.",
      ],
    },
    {
      id: "threats",
      title: "Caught by accident",
      body: [
        "Nobody wants to catch a coelacanth. The flesh is oily, laxative and generally considered inedible, and there is no commercial market. The animals die anyway, in deep-set gillnets that artisanal fishers use for oilfish on the same steep volcanic slopes where the coelacanths live. As nylon gillnets replaced hand lines through the late twentieth century, the incidental catch went up.",
        "Population estimates have never been comfortable. Fewer than 500 individuals were estimated in 1998, around 370 of them off Grande Comore, and while the discovery of populations off South Africa, Tanzania, Mozambique and Madagascar has raised the global total, no assessment has suggested it is large.",
        "The species was listed on CITES Appendix I in 1989, banning commercial international trade, and is protected in Comorian and South African law. Newer pressures are harder to legislate against: oil and gas exploration along the East African margin overlaps the known habitat, and deepwater trawling reaches depths that were effectively out of range a generation ago. The most effective measures so far have been local — gear changes, depth restrictions and compensation schemes that give fishers a reason to work away from the coelacanth slopes.",
      ],
    },
  ],

  related: ["great-white-shark", "ocean-sunfish", "electric-eel", "lined-seahorse"],
  tags: ["coelacanth", "lobe-finned fish", "deep sea", "critically endangered", "marine", "rediscovered"],
  searchTerms: ["latimeria", "gombessa", "living fossil fish", "lobe finned fish", "coelacanth discovery"],

  faqs: [
    {
      q: "Is the coelacanth a living fossil?",
      a: "It is a very old lineage, but the phrase is misleading. Latimeria is a modern species whose genome has continued to change — more slowly than most ray-finned fish, but it has not stood still. It is not the same animal found in Cretaceous rocks, and it is not frozen in time.",
    },
    {
      q: "Is the coelacanth the ancestor of land animals?",
      a: "No. Coelacanths and lungfish are both lobe-finned fish close to the lineage that produced tetrapods, and genome sequencing published in 2013 showed that lungfish, not coelacanths, are our closest living fish relatives. The coelacanth is a cousin of our ancestors rather than one of them.",
    },
    {
      q: "How was the coelacanth rediscovered?",
      a: "Marjorie Courtenay-Latimer, curator of the East London Museum in South Africa, found one in a trawler's catch on 22 December 1938 and had it preserved despite being unable to identify it. J.L.B. Smith recognised it from her sketch and named it Latimeria chalumnae. A second specimen was not found until 1952, off Anjouan in the Comoros, where fishermen had long known the fish as gombessa.",
    },
    {
      q: "How long do coelacanths live?",
      a: "Around a century. A 2021 study found annual growth rings on coelacanth scales that earlier work had missed, revising the maximum age from about 48 years to close to 100. The same analysis put sexual maturity at roughly 55 years and gestation at about five years — the longest pregnancy known in any vertebrate.",
    },
    {
      q: "Why is the coelacanth critically endangered if nobody eats it?",
      a: "Because it is killed by accident. Deep-set gillnets targeting oilfish work the same steep volcanic slopes coelacanths inhabit, and take them as bycatch. With fewer than a thousand animals thought to exist and a generation time of over fifty years, even a small number of deaths each year outpaces the rate at which the population can replace them.",
    },
  ],

  seo: {
    title: "Coelacanth — 1938 Rediscovery, Anatomy, Lifespan & Status",
    description:
      "A researched profile of the West Indian Ocean coelacanth (Latimeria chalumnae): the 1938 rediscovery, the hinged skull and rostral organ, a century-long life with a five-year pregnancy, and why 'living fossil' is the wrong phrase.",
    keywords: [
      "coelacanth facts",
      "latimeria chalumnae",
      "coelacanth discovery 1938",
      "living fossil fish",
      "coelacanth lifespan",
    ],
  },

  sources: [
    {
      label: "Latimeria chalumnae — Red List assessment (Critically Endangered, assessed 2000)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/11375/3274618",
    },
    {
      label: "Latimeria chalumnae — species summary, Red List date and CITES listing",
      publisher: "FishBase",
      url: "https://fishbase.se/summary/2063",
    },
    {
      label: "New scale analyses reveal centenarian African coelacanths (Mahé et al., 2021)",
      publisher: "Current Biology",
      url: "https://www.cell.com/current-biology/fulltext/S0960-9822(21)00752-1",
    },
    {
      label: "Endangered Species Act status review report for the coelacanth",
      publisher: "NOAA Fisheries",
      url: "https://www.fisheries.noaa.gov/resource/document/endangered-species-act-status-review-report-coelacanth-latimeria-chalumnae",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default coelacanth;
