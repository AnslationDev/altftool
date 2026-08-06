// Greater flamingo — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const greaterFlamingo = {
  slug: "greater-flamingo",
  category: "birds",
  name: "Greater Flamingo",
  scientificName: "Phoenicopterus roseus",
  otherNames: ["Common flamingo", "Rosy flamingo"],

  summary:
    "The largest and most widespread flamingo, a filter feeder that eats with its head upside down and gets its pink colour entirely from pigments in its food.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/010_Greater_flamingos_male_and_female_in_the_Camargue_during_mating_season_Photo_by_Giles_Laurent.jpg/1920px-010_Greater_flamingos_male_and_female_in_the_Camargue_during_mating_season_Photo_by_Giles_Laurent.jpg",
    alt: "A male and female greater flamingo standing together in shallow water in the Camargue during the breeding season",
    credit: "Giles Laurent / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Flamingo_%28Phoenicopterus_roseus%29_%2853386868601%29.jpg/1920px-Flamingo_%28Phoenicopterus_roseus%29_%2853386868601%29.jpg",
      alt: "A greater flamingo in shallow water, its long neck curved and its pink black-tipped bill lowered",
      credit: "José Prego from Moura, Portugal / Wikimedia Commons",
      title: "Eating upside down",
      caption:
        "To feed, the bird inverts its head so the bill is the wrong way up and sweeps it through the water. Unusually among birds, it is the upper jaw that moves — hinged to the skull rather than fixed to it — while the lower jaw stays comparatively still.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Flamingo_%28Phoenicopterus_roseus%29_%2853386877491%29.jpg/1920px-Flamingo_%28Phoenicopterus_roseus%29_%2853386877491%29.jpg",
      alt: "A greater flamingo wading on long pink legs in shallow water",
      credit: "José Prego from Moura, Portugal / Wikimedia Commons",
      title: "The one-legged stance is the cheap one",
      caption:
        "Cadaver work published in 2017 found that a flamingo body can be balanced passively on one leg, holding a stable joint posture with no muscle force at all — and could not be balanced the same way on two. Standing on one leg costs the bird less, not more.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Flamingo_%28Phoenicopterus_roseus%29_%2853386990783%29.jpg/1920px-Flamingo_%28Phoenicopterus_roseus%29_%2853386990783%29.jpg",
      alt: "A greater flamingo showing its pale pink body plumage and darker red wing coverts",
      credit: "José Prego from Moura, Portugal / Wikimedia Commons",
      title: "Colour that comes off the plate",
      caption:
        "None of the pink is made by the bird. Carotenoid pigments taken in with algae and crustaceans are deposited into growing feathers, so plumage intensity is a direct readout of what a flamingo has been eating.",
    },
  ],

  headline: "A bird that eats with its head upside down",
  intro: [
    "Almost everything distinctive about a greater flamingo follows from one thing: it filters its food out of shallow salty water. The bent bill, the long neck that reaches the bottom, the legs that keep the body clear of the water, the huge colonies on open mudflats, and the pink colour itself are all downstream of that single feeding strategy.",
    "It is the largest of the six flamingo species and by far the most widespread, breeding from southern Spain and the Camargue through Africa, the Middle East and into South Asia. It is also the only one most people ever see in a European wetland, and the one whose 83-year captive longevity record makes it among the longest-lived birds on record.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Aves",
    order: "Phoenicopteriformes",
    family: "Phoenicopteridae",
    genus: "Phoenicopterus",
    species: "Phoenicopterus roseus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2019,
    populationTrend: "increasing",
    populationEstimate:
      "The most numerous and widespread flamingo; no precise global figure, but the trend is increasing",
    note: "Listed as Least Concern in an amended version of the 2018 assessment, published in 2019, with an increasing population. Being widespread does not make individual colonies safe: flamingos breed at very few sites, in enormous concentrations, so draining, disturbing or altering the salinity of a single lagoon can take out an entire year's breeding for a whole region.",
  },

  measurements: [
    {
      key: "height",
      label: "Standing height",
      value: "110–150 cm",
      min: 110,
      max: 150,
      unit: "cm",
      note: "The tallest flamingo species; males are larger than females",
    },
    {
      key: "wingspan",
      label: "Wingspan",
      value: "140–165 cm",
      min: 140,
      max: 165,
      unit: "cm",
    },
    {
      key: "weight",
      label: "Weight",
      value: "2–4 kg",
      min: 2,
      max: 4,
      unit: "kg",
      note: "Remarkably light for the height — most of the standing height is leg and neck",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "1 egg",
      min: 1,
      max: 1,
      unit: "eggs",
      note: "A replacement egg may be laid if the first is lost early",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "26–32 days",
      min: 26,
      max: 32,
      unit: "days",
      note: "Shared by both parents on a mud-cone nest",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "Adult plumage at about 4 years; most females first breed at 5–6",
      min: 4,
      max: 6,
      unit: "years",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "30–40 years in the wild",
      min: 30,
      max: 40,
      unit: "years",
      note: "Captive birds commonly pass 60. The oldest known individual died at Adelaide Zoo in 2014, aged approximately 83.",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Filter feeder — brine shrimp, crustaceans, molluscs, insect larvae, algae and seeds", icon: "Utensils" },
    { key: "activity", label: "Activity", value: "Feeds by day and by night", icon: "Moon" },
    { key: "nest-type", label: "Nest type", value: "A cone of packed mud with a shallow cup on top", icon: "Home" },
    { key: "social-structure", label: "Social structure", value: "Highly colonial — breeding colonies can run to tens of thousands of pairs", icon: "Users" },
    { key: "water-type", label: "Water type", value: "Saline and alkaline shallows; also brackish and coastal lagoons", icon: "Droplets" },
  ],

  highlights: ["height", "wingspan", "weight", "diet-type"],

  distribution: {
    continents: ["Africa", "Asia", "Europe"],
    regions: [
      "Southern Spain and the Camargue",
      "North and sub-Saharan Africa",
      "The Middle East",
      "The Indian subcontinent",
    ],
    habitats: [
      "Saline lagoons",
      "Salt pans",
      "Alkaline and soda lakes",
      "Estuaries and mudflats",
      "Shallow coastal waters",
    ],
    elevation: "Mostly at or near sea level, with inland populations on saline lakes",
    note: "The widest range of any flamingo, taking in southern Europe, most of Africa, the Middle East and South Asia. Distribution is dictated by water chemistry rather than climate: the species wants shallow, salty or alkaline water rich in invertebrates and thin on fish, which is why salt pans and soda lakes suit it and freshwater lakes generally do not.",
  },

  sections: [
    {
      id: "filter-feeding",
      title: "How the upside-down bill actually works",
      body: [
        "A feeding flamingo lowers its head and inverts it, so the bill is held upside down with what is anatomically the upper jaw lying underneath. It then sweeps the bill from side to side through shallow water, often stirring the sediment with its feet first to lift food into suspension.",
        "Two features make the filter work. The first is an unusual jaw arrangement: in flamingos the upper mandible is hinged and mobile rather than rigidly fused to the skull, so it is the upper jaw that does most of the moving. The second is the tongue, a thick fleshy piston that slides back and forth in a groove in the lower mandible. Drawn backwards it pulls water into the bill; driven forwards it forces the water out again.",
        "The straining is done by lamellae — rows of comb-like keratin plates along the inside of the bill. As water is pumped out it passes through them and the food is left behind, to be moved back and swallowed. The greater flamingo has what is called a shallow-keeled bill, with the upper jaw about as wide as the lower and relatively coarse lamellae. That means it filters comparatively large items: brine shrimp and other crustaceans, molluscs, insect larvae and seeds. Its smaller relative the lesser flamingo has a deep-keeled bill with much finer lamellae and lives instead on microscopic cyanobacteria and diatoms — two species can share the same lake without competing.",
        "Recent work has added an active dimension to what was long described as passive straining. A 2025 study in the Proceedings of the National Academy of Sciences reported that flamingos use the L-shaped bend of the beak together with foot movements to set up small vortices in the water, concentrating prey into the region the bill is sampling rather than simply sieving whatever drifts past.",
      ],
    },
    {
      id: "colour",
      title: "Where the pink comes from",
      body: [
        "A flamingo makes none of its own colour. The pinks and reds come from carotenoids — the same class of pigment that makes carrots orange — taken in with the algae and the crustaceans that eat those algae. The bird metabolises the pigments and deposits them into growing feathers, skin and the bill.",
        "The consequence is that plumage intensity is a direct readout of diet and condition, and a flamingo that stops eating carotenoid-rich food fades. Captive birds turn white without supplemented feed, which is why zoo diets are formulated with added carotenoids.",
        "There is a cosmetic element too. Flamingos take carotenoid-bearing secretions from the uropygial (preen) gland at the base of the tail and work them through the plumage, and they do this considerably more during the run-up to breeding — effectively applying make-up when it counts.",
      ],
    },
    {
      id: "breeding",
      title: "Colonies, mud cones and crop milk",
      body: [
        "Greater flamingos breed in dense colonies that can run to tens of thousands of pairs, preceded by mass displays in which large groups march and turn together with necks stretched upright. Breeding is not annual and is triggered by water conditions — a colony may skip a year entirely if the site is too dry or too full.",
        "The nest is a cone of mud, packed up by the birds to raise the single egg clear of flooding and of the heat of the ground. One egg is laid, occasionally replaced if lost early, and both parents incubate for 26 to 32 days.",
        "Both parents then feed the chick on crop milk — a red secretion produced in the upper digestive tract. It is loaded with the same carotenoids that colour the adults, and producing it drains the parents so heavily that they fade towards white while raising a chick, regaining colour only once the young bird feeds itself.",
        "At around ten days old chicks leave the nest and gather into large creches, watched over by a few adults while the rest of the colony feeds. Parents still return to feed their own chick specifically, locating it by call among thousands of others.",
      ],
    },
    {
      id: "one-leg",
      title: "Standing on one leg",
      body: [
        "The most-asked question about flamingos has a mechanical answer. Young-Hui Chang and Lena Ting published a study in Biology Letters in 2017 in which flamingo cadavers were tested for stability. A dead flamingo could be balanced on one leg, holding a stable and unchanging joint posture much like a live bird's, with no muscular force whatsoever. The same body could not be held stably in a two-legged pose.",
        "That points to a passive gravitational stay apparatus in the leg: the bird's own weight and geometry hold the joints in position, rather like a sling, without any bones locking. Standing on one leg is therefore the cheap option, not the effortful one, which explains how a flamingo can hold the pose for hours and even while asleep.",
        "The often-repeated explanation that one-legged standing is about conserving heat in cold water may still contribute, but the mechanical result shows that the posture would be energetically favourable regardless of temperature.",
      ],
    },
  ],

  related: ["mute-swan", "common-ostrich", "scarlet-macaw", "emperor-penguin"],
  tags: ["wading bird", "filter feeder", "wetlands", "colonial", "pink"],
  searchTerms: ["flamingo", "phoenicopterus", "pink bird", "why are flamingos pink", "filter feeding"],

  faqs: [
    {
      q: "Why are flamingos pink?",
      a: "Because of what they eat. Their food — algae and the small crustaceans that graze on it — is rich in carotenoid pigments, which the bird metabolises and deposits into its feathers, skin and bill. Flamingos produce none of the colour themselves, so a bird on a carotenoid-poor diet fades towards white. Zoo flamingos are fed supplemented diets for exactly this reason.",
    },
    {
      q: "Why do flamingos eat upside down?",
      a: "Because the filter only works that way round. The bird lowers its head and inverts it so the bill is upside down, then sweeps it sideways through shallow water. In this position the bent bill sits flat to the bottom and the tongue can pump water through the filtering lamellae. Unusually, it is the flamingo's upper jaw that moves — it is hinged to the skull rather than rigidly attached.",
    },
    {
      q: "What do greater flamingos eat?",
      a: "Brine shrimp and other crustaceans, molluscs, insect larvae, seeds, blue-green algae and diatoms. The greater flamingo has a shallow-keeled bill with relatively coarse lamellae, so it takes larger items than the lesser flamingo, whose much finer filter is tuned to microscopic cyanobacteria. That difference lets both species feed on the same lake without competing directly.",
    },
    {
      q: "Why do flamingos stand on one leg?",
      a: "Because it takes less effort than standing on two. A 2017 study found that a flamingo body can be balanced passively on one leg, holding a stable joint posture with no muscle activity at all, while the same body could not be balanced on two legs without active force. A passive support mechanism in the leg does the work, which is why the bird can hold the pose for hours and even asleep.",
    },
    {
      q: "How long do greater flamingos live?",
      a: "Roughly 30 to 40 years in the wild, and commonly more than 60 in captivity. The oldest known individual, a greater flamingo at Adelaide Zoo, died in 2014 at an estimated 83 years old, making it one of the longest-lived birds ever documented.",
    },
    {
      q: "Are greater flamingos endangered?",
      a: "No — the species is assessed as Least Concern with an increasing population. The risk sits at site level rather than species level: flamingos breed at very few locations in enormous concentrations, so draining a lagoon, changing its salinity or disturbing a colony can wipe out a region's entire breeding effort for the year.",
    },
  ],

  seo: {
    title: "Greater Flamingo — Why They Are Pink & How They Filter Feed",
    description:
      "A researched profile of the greater flamingo (Phoenicopterus roseus): carotenoid pigments from diet, the upside-down bill and lamellae filter, mud-cone nests, crop milk and the one-legged stance.",
    keywords: [
      "greater flamingo facts",
      "phoenicopterus roseus",
      "why are flamingos pink",
      "flamingo filter feeding",
      "flamingo one leg",
    ],
  },

  sources: [
    {
      label: "Phoenicopterus roseus — Red List assessment (2019)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/22697360/155527405",
    },
    {
      label: "Mechanical evidence that flamingos can support their body on one leg with little active muscular force",
      publisher: "Chang & Ting, Biology Letters (2017)",
      url: "https://royalsocietypublishing.org/doi/10.1098/rsbl.2016.0948",
    },
    {
      label: "Flamingos use their L-shaped beak and morphing feet to induce vortical traps for prey capture",
      publisher: "Proceedings of the National Academy of Sciences (2025)",
      url: "https://www.pnas.org/doi/10.1073/pnas.2503495122",
    },
    {
      label: "The filter-feeding and food of flamingoes (Phoenicopteri)",
      publisher: "Philosophical Transactions of the Royal Society B",
      url: "https://royalsocietypublishing.org/doi/10.1098/rstb.1957.0004",
    },
  ],

  updatedAt: "2026-07-29",
};

export default greaterFlamingo;
