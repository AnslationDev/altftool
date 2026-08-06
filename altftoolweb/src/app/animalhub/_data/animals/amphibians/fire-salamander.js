// Fire salamander — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.
//
// Note on imagery: the best-known Commons photograph of this species is an
// annotated museum specimen from the Muséum de Toulouse. It is excluded here
// in favour of photographs of living animals in the wild.

const fireSalamander = {
  slug: "fire-salamander",
  category: "amphibians",
  name: "Fire Salamander",
  scientificName: "Salamandra salamandra",
  otherNames: ["European fire salamander", "Spotted salamander"],

  summary:
    "Europe's most recognisable amphibian, black with yellow warning markings and a genuine nerve toxin behind them — and, since a skin-eating fungus arrived from Asia in the pet trade, the reason a species that was Least Concern for decades is now listed as Vulnerable.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Bayerischer_Spessart_Naturpark%2C_Feuersalamander_%28Salamandra_salamandra%29.jpg/1920px-Bayerischer_Spessart_Naturpark%2C_Feuersalamander_%28Salamandra_salamandra%29.jpg",
    alt: "A fire salamander on the forest floor, glossy black with irregular yellow markings",
    credit: "Thomas Fuhrmann / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Feuersalamander_%28Salamander_salamandra%29%2C_Rocherath%2C_Ostbelgien_%2851256920647%29.jpg/1920px-Feuersalamander_%28Salamander_salamandra%29%2C_Rocherath%2C_Ostbelgien_%2851256920647%29.jpg",
      alt: "A fire salamander photographed in eastern Belgium, black with bold yellow blotches",
      credit: "Frank Vassen from Brussels, Belgium / Wikimedia Commons",
      title: "A pattern no two animals share",
      caption:
        "The yellow markings are individually unique and stable for life, so researchers photograph them instead of tagging the animals — which is how population collapses in Belgium and the Netherlands were measured so precisely.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Feuersalamander_%28Salamander_salamandra%29%2C_Rocherath%2C_Ostbelgien_%2851286520459%29.jpg/1920px-Feuersalamander_%28Salamander_salamandra%29%2C_Rocherath%2C_Ostbelgien_%2851286520459%29.jpg",
      alt: "A fire salamander on damp woodland ground with leaf litter",
      credit: "Frank Vassen from Brussels, Belgium / Wikimedia Commons",
      title: "Cool, wet, deciduous, uphill",
      caption:
        "Fire salamanders need shaded broadleaf woodland with clean, cold, fast-flowing streams to release their larvae into. That combination is why the species is patchy across lowland Europe and common in hill country.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Feuersalamander_%28Salamander_salamandra%29%2C_Rocherath%2C_Ostbelgien_%2851619493799%29.jpg/1920px-Feuersalamander_%28Salamander_salamandra%29%2C_Rocherath%2C_Ostbelgien_%2851619493799%29.jpg",
      alt: "A fire salamander out in the open on wet ground",
      credit: "Frank Vassen from Brussels, Belgium / Wikimedia Commons",
      title: "Out after rain",
      caption:
        "Being conspicuous in daylight is only survivable for an animal that predators avoid. Fire salamanders emerge on wet days and warm rainy nights and make no attempt to hide, which is the whole point of the colouring.",
    },
  ],

  headline: "The salamander that lost its Least Concern listing to a fungus",
  intro: [
    "A fire salamander is not trying to be inconspicuous. It is a glossy black animal marked with yellow — sometimes in bands, sometimes in blotches, occasionally almost entirely yellow — that walks about in the open on wet days at a pace that would be suicidal for anything edible. The pattern is aposematic, an advertisement, and it is backed by samandarin, an alkaloid the animal secretes from glands behind the head and along the back.",
    "For most of the last century this was one of Europe's more reassuring amphibians: widespread from Portugal to Ukraine, long-lived, and adaptable. That changed in 2010, when a monitored Dutch population began to disappear. The cause turned out to be a previously unknown fungus, Batrachochytrium salamandrivorans, that eats salamander skin and had almost certainly arrived from Asia in the pet trade. In 2023 the species was moved from Least Concern to Vulnerable.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Amphibia",
    order: "Caudata",
    family: "Salamandridae",
    genus: "Salamandra",
    species: "Salamandra salamandra",
  },

  conservation: {
    status: "VU",
    assessmentYear: 2023,
    populationTrend: "decreasing",
    populationEstimate: "Still numerous across southern and central Europe, but collapsing where Bsal is established",
    note: "Reassessed as Vulnerable in 2023, having previously been Least Concern. The listing is driven almost entirely by Batrachochytrium salamandrivorans: it is lethal to this species, it is spreading through western Europe, and it persists in the environment after the salamanders are gone. Roads, woodland loss and stream pollution are secondary pressures on an animal that already moves slowly and does not disperse far.",
  },

  measurements: [
    {
      key: "length",
      label: "Total length",
      value: "15–25 cm",
      min: 15,
      max: 25,
      unit: "cm",
      note: "Head, body and tail. Some southern subspecies exceed 30 cm.",
    },
    {
      key: "weight",
      label: "Weight",
      value: "About 40 g",
      min: 40,
      max: 40,
      unit: "g",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Over 20 years",
      min: 20,
      max: 50,
      unit: "years",
      note: "A captive animal at Museum Koenig in Bonn lived more than 50 years — the longest documented for any salamander of its kind.",
    },
    {
      key: "brood-size",
      label: "Larvae per brood",
      value: "About 20–70 larvae",
      min: 20,
      max: 70,
      unit: "larvae",
      note: "Released live into water rather than laid as eggs. Numbers vary with the size of the female.",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "About 3–4 years",
      min: 3,
      max: 4,
      unit: "years",
      note: "Slow maturity is why a population wiped out by disease recovers so poorly.",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — earthworms, slugs, woodlice and insects", icon: "Drumstick" },
    { key: "activity", label: "Activity", value: "Nocturnal, but active by day in rain", icon: "Moon" },
    {
      key: "venom-type",
      label: "Skin toxin",
      value: "Samandarin — a poison, not a venom; secreted from parotoid glands, never injected",
      icon: "Skull",
    },
    {
      key: "life-cycle",
      label: "Reproduction",
      value: "Ovoviviparous — gives birth to live larvae; two subspecies bear fully formed young",
      icon: "Baby",
    },
    {
      key: "water-type",
      label: "Water type",
      value: "Freshwater — cold, clean, fast woodland streams for the larvae",
      icon: "Droplet",
    },
    {
      key: "disease-threat",
      label: "Principal threat",
      value: "Batrachochytrium salamandrivorans (Bsal), a salamander-specific chytrid fungus",
      icon: "AlertTriangle",
    },
  ],

  highlights: ["length", "venom-type", "disease-threat", "life-cycle"],

  distribution: {
    continents: ["Europe"],
    regions: [
      "Portugal and Spain east through France, Germany and Italy to Poland, Romania and Ukraine",
      "The Balkans and parts of Greece; a small population in western Asia",
    ],
    habitats: ["Deciduous and mixed hill forest", "Cold, clean, fast-flowing woodland streams"],
    elevation: "Mostly 250–1,000 m, higher in the Balkans and Spain",
    note: "The species is absent from Britain, Ireland, Scandinavia and most of the flat, dry or intensively farmed parts of Europe. It needs shaded broadleaf woodland and clean running water in the same place, which restricts it largely to hill and low mountain country.",
  },

  sections: [
    {
      id: "toxin",
      title: "Yellow means something",
      body: [
        "The black-and-yellow pattern is a warning, and it is honest. Fire salamanders concentrate poison glands around the head — the swollen parotoid glands behind the eyes — and in rows along the back, and secrete a milky fluid containing samandarin and related steroidal alkaloids. In a vertebrate that has swallowed or mouthed it, samandarin causes muscle convulsions, hypertension and hyperventilation, and in sufficient quantity it kills.",
        "This is a poison rather than a venom: there is no bite, no sting and no injection. A threatened salamander arches its body, tilts its glands toward the threat and can squeeze the secretion out in a fine spray of up to a few tens of centimetres, which is enough to reach a dog's mouth or a person's eyes. Handling one is not dangerous if hands are washed, but it is very unpleasant if the secretion reaches mucous membranes.",
        "Because that defence works, the animal has no need for speed or concealment. Adults walk about openly in the rain, which is precisely the behaviour that makes them so easy to survey — and, unfortunately, so easy to collect.",
      ],
    },
    {
      id: "live-birth",
      title: "Birth instead of spawn",
      body: [
        "Almost all European amphibians lay eggs in water. Fire salamanders do not. Mating happens on land: the male manoeuvres beneath the female, deposits a spermatophore and positions her to take it up, and the female stores the sperm — sometimes for a long time — before the eggs develop internally.",
        "Most subspecies are ovoviviparous. The female carries the developing young inside her and, months later, wades into a cold stream or spring pool and releases larvae that hatch as she deposits them. Each larva emerges with feathery external gills and four legs already formed, and spends its first months hunting in the stream before metamorphosing and leaving the water for good.",
        "Two subspecies in northern Spain have gone a step further. Salamandra salamandra bernardezi and S. s. fastuosa are fully viviparous: the female gives birth to small, fully metamorphosed salamanders and needs no water at all. That frees them from the one thing that constrains everything else about the species — the availability of a clean, permanent, fast-flowing stream.",
      ],
    },
    {
      id: "bsal",
      title: "Batrachochytrium salamandrivorans",
      body: [
        "Chytrid fungus is familiar to anyone who follows amphibian decline, but the famous one — Batrachochytrium dendrobatidis, or Bd — mainly devastates frogs, and fire salamanders tolerate it reasonably well. What hit them was a second, different organism.",
        "In the Bunderbos in the southern Netherlands, a fire salamander population that volunteers had surveyed since 1997 began to collapse around 2010. Falling numbers turned into dead animals; the last salamanders taken into captivity for safekeeping died too. The pathogen cultured from them at Ghent University in 2013 was new to science, and was named Batrachochytrium salamandrivorans — literally, the salamander-eating chytrid. It attacks the skin directly, producing deep ulcers, and kills quickly. The Dutch population fell by roughly 96 per cent in a few years, from a couple of hundred animals to a handful; a Belgian population subsequently lost more than 90 per cent of its salamanders in as little as six months.",
        "Its origin is the important part. Bsal appears to be native to East Asia, where salamanders such as Cynops and Paramesotriton carry it without dying — the signature of a pathogen and host that evolved together. European salamanders have no such history with it. The most likely route into Europe is the international trade in live amphibians for private collections, and Bsal has since been found in captive collections in several countries as well as in the wild in the Netherlands, Belgium, Germany and Spain.",
        "The response has been unusually fast for an amphibian disease. Several countries introduced import restrictions and health-certification requirements on salamanders, disinfection protocols became routine for anyone working in affected woodland, and captive assurance colonies were established for the worst-hit populations. North America, which holds the world's greatest diversity of salamanders and no Bsal so far, restricted salamander imports pre-emptively.",
      ],
    },
    {
      id: "name",
      title: "Where the name came from",
      body: [
        "The association with fire is old and has an ordinary explanation. Fire salamanders spend the day inside damp, rotting logs; a log carried indoors and thrown on a fire produced a salamander scrambling out of the flames, and the story wrote itself. From Pliny onward the animal was credited with the ability to survive, and even extinguish, fire.",
        "The belief was durable enough to attach itself to alchemy, where the salamander became the emblem of the element of fire, and to heraldry, where François I of France used one as a personal device. None of it has any basis: a fire salamander is a moist-skinned amphibian that dies quickly in heat and dry air.",
        "There is a small kernel of truth in one detail. A salamander suddenly heated secretes a copious milky fluid from its skin glands, which would briefly steam and sizzle — enough, for an observer in the first century, to look like an animal putting out flames.",
      ],
    },
  ],

  related: ["smooth-newt", "olm", "chinese-giant-salamander"],
  tags: ["salamander", "europe", "aposematism", "vulnerable", "chytrid", "woodland"],
  searchTerms: [
    "salamandra salamandra",
    "european fire salamander",
    "feuersalamander",
    "yellow and black salamander",
    "bsal fungus",
  ],

  faqs: [
    {
      q: "Are fire salamanders poisonous to humans?",
      a: "They secrete samandarin, an alkaloid that causes convulsions and hypertension in vertebrates, from glands behind the head and along the back, and can spray it a short distance. It is a poison rather than a venom — there is no bite or sting. Handling a salamander is not dangerous provided hands are washed afterwards, but the secretion is seriously irritating in the eyes or mouth, and it can harm a dog that mouths one.",
    },
    {
      q: "Do fire salamanders lay eggs?",
      a: "No. Most subspecies are ovoviviparous: the female carries developing eggs internally and releases live, gilled larvae into a cold stream, where they finish growing. Two Spanish subspecies, bernardezi and fastuosa, are fully viviparous and give birth to small, fully formed salamanders on land, needing no water at all.",
    },
    {
      q: "What is Bsal and why does it matter?",
      a: "Batrachochytrium salamandrivorans is a chytrid fungus that eats salamander skin, first identified in 2013 from a collapsing Dutch fire salamander population. It is distinct from Bd, the chytrid that has devastated frogs. It appears to have come from East Asia, where local salamanders tolerate it, most likely arriving in Europe through the live amphibian trade. It killed roughly 96 per cent of the monitored Dutch population and more than 90 per cent of a Belgian one in six months.",
    },
    {
      q: "Why was the fire salamander reclassified as Vulnerable?",
      a: "The 2023 Red List assessment moved it from Least Concern to Vulnerable on the basis of past and projected declines caused by Bsal. The fungus is lethal to the species, is still spreading in western Europe, and persists in the environment after a population has gone — and fire salamanders mature slowly and disperse poorly, so recolonisation is very slow.",
    },
    {
      q: "Why is it called a fire salamander?",
      a: "Because they shelter in rotting logs. A log brought indoors and put on a fire would produce a salamander scrambling out of the flames, which gave rise to the ancient belief that the animal was born in fire and could extinguish it. In reality it is a moist-skinned amphibian that dies quickly in heat.",
    },
  ],

  seo: {
    title: "Fire Salamander — Samandarin Toxin, Live Birth & the Bsal Fungus",
    description:
      "A researched profile of the fire salamander (Salamandra salamandra): what its yellow warning pattern is backed by, why it gives birth to live larvae, and how Batrachochytrium salamandrivorans moved it to Vulnerable in 2023.",
    keywords: [
      "fire salamander",
      "salamandra salamandra",
      "samandarin",
      "batrachochytrium salamandrivorans",
      "bsal fungus salamander",
    ],
  },

  sources: [
    {
      label: "Salamandra salamandra — Red List assessment (2023, e.T59467A219148292)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/59467/219148292",
    },
    {
      label: "Batrachochytrium salamandrivorans — pathogen account, origin and host range",
      publisher: "AmphibiaWeb, University of California, Berkeley",
      url: "https://amphibiaweb.org/chytrid/Bsal.html",
    },
    {
      label: "Rapid enigmatic decline drives the fire salamander to the edge of extinction in the Netherlands",
      publisher: "Amphibia-Reptilia",
      url: "https://brill.com/view/journals/amre/34/2/article-p233_8.xml?language=en",
    },
    {
      label: "Saving Europe's salamanders — Bsal spread and the emergency response",
      publisher: "Science",
      url: "https://www.science.org/doi/full/10.1126/science.357.6348.242",
    },
  ],

  updatedAt: "2026-07-29",
};

export default fireSalamander;
