// Gila monster — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const gilaMonster = {
  slug: "gila-monster",
  category: "reptiles",
  name: "Gila Monster",
  scientificName: "Heloderma suspectum",
  otherNames: ["Beaded lizard (of the southwest)", "Monstruo de Gila"],

  summary:
    "A venomous desert lizard that eats only a handful of meals a year, and whose saliva turned out to contain the peptide that became the first of the modern diabetes drugs.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Gila_monster2.JPG/1920px-Gila_monster2.JPG",
    alt: "A Gila monster showing its beaded black and orange-pink skin",
    credit: "Blueag9 / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/RETICULATE_GILA_MONSTER_%28Heloderma_suspectum_suspectum%29_%285-17-11%29_patagonia_lake%2C_scc%2C_az_-04_%285731530095%29.jpg/1920px-RETICULATE_GILA_MONSTER_%28Heloderma_suspectum_suspectum%29_%285-17-11%29_patagonia_lake%2C_scc%2C_az_-04_%285731530095%29.jpg",
      alt: "A reticulate Gila monster photographed at Patagonia Lake, Santa Cruz County, Arizona",
      credit: "ALAN SCHMIERER / Wikimedia Commons",
      title: "Beads, not scales",
      caption:
        "Each of those raised bumps is an osteoderm — a small bone embedded in the skin. Only a handful of lizard families have them in this form, and they give the animal both armour and its distinctive beaded texture.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/RETICULATE_GILA_MONSTER_%28Heloderma_suspectum%29_%285-17-11%29_patagonia_lake%2C_scc%2C_az_-02_%285731511803%29.jpg/1920px-RETICULATE_GILA_MONSTER_%28Heloderma_suspectum%29_%285-17-11%29_patagonia_lake%2C_scc%2C_az_-02_%285731511803%29.jpg",
      alt: "A Gila monster photographed at Patagonia Lake in southern Arizona, its black and orange banding visible",
      credit: "ALAN SCHMIERER / Wikimedia Commons",
      title: "Aposematic by design",
      caption:
        "Black-and-orange banding is a warning, and it works: almost nothing preys on an adult Gila monster. That is one reason a slow lizard can afford to walk in the open at all.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/RETICULATE_GILA_MONSTER_%28Heloderma_suspectum%29_%285-17-11%29_patagonia_lake%2C_scc%2C_az_-03_%285732065658%29.jpg/1920px-RETICULATE_GILA_MONSTER_%28Heloderma_suspectum%29_%285-17-11%29_patagonia_lake%2C_scc%2C_az_-03_%285732065658%29.jpg",
      alt: "A Gila monster photographed at Patagonia Lake, Santa Cruz County, Arizona",
      credit: "ALAN SCHMIERER / Wikimedia Commons",
      title: "The tail is the larder",
      caption:
        "Fat stored in the tail carries the animal between meals, and a well-fed Gila monster has a noticeably fat one. In an animal that may eat only a few times a year, tail thickness is the most direct indicator of condition there is.",
    },
  ],

  headline: "A venomous lizard that gave medicine a drug",
  intro: [
    "The Gila monster is one of a small number of lizards with a genuine venom system, and the only venomous lizard native to the United States. It is slow, heavy-bodied and beaded with black and orange, reaching about 56 cm and 700 g, and it spends the overwhelming majority of its life underground.",
    "Its main claim on the wider world is pharmacological. In 1992 a peptide isolated from its saliva, exendin-4, was found to mimic a human hormone that stimulates insulin release — but to survive far longer in the bloodstream. A synthetic version was approved as the type 2 diabetes drug exenatide in 2005, and it opened the class of medicines that dominates diabetes and obesity treatment today.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Squamata",
    family: "Helodermatidae",
    genus: "Heloderma",
    species: "Heloderma suspectum",
  },

  conservation: {
    status: "NT",
    assessmentYear: 2007,
    populationTrend: "decreasing",
    populationEstimate: "No overall figure; densities are naturally low across a large range",
    note: "Assessed as Near Threatened in 2007 — a dated assessment for a species whose main pressures, desert development and road mortality, have grown since. It was the first venomous animal anywhere in the United States to be given legal protection, by Arizona in 1952, and it is now protected throughout its range in both the US and Mexico. Listed on CITES Appendix II.",
  },

  measurements: [
    {
      key: "length",
      label: "Total length",
      value: "Up to about 56 cm",
      min: 35,
      max: 56,
      unit: "cm",
      note: "Including the tail, which accounts for roughly a third of the animal and stores its fat reserves",
    },
    {
      key: "weight",
      label: "Weight",
      value: "350–700 g",
      min: 350,
      max: 700,
      unit: "g",
      note: "Varies enormously with how recently the animal has fed — a single meal can be a third of its body mass",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "2–12 eggs, most often about five",
      min: 2,
      max: 12,
      unit: "eggs",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "Roughly five months",
      min: 130,
      max: 160,
      unit: "days",
      note: "Eggs laid in summer develop underground; hatchlings emerge in autumn and go straight into their first winter dormancy",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "Around 3–5 years",
      min: 3,
      max: 5,
      unit: "years",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "20–30 years; up to about 40 in captivity",
      min: 20,
      max: 40,
      unit: "years",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — mostly eggs, plus nestling birds, young rodents and rabbits", icon: "Drumstick" },
    { key: "venom-type", label: "Venom", value: "Neurotoxic and intensely painful, delivered by chewing rather than injection", icon: "Droplet" },
    { key: "activity", label: "Activity", value: "Active for a few weeks in spring and after summer rain; underground the rest of the year", icon: "Sun" },
    { key: "heat-sensing", label: "Heat sensing", value: "None — it finds buried eggs by scent, flicking a forked tongue and reading it with the vomeronasal organ", icon: "Thermometer" },
    { key: "shedding-frequency", label: "Shedding", value: "Piecemeal, a few times a year, rather than in one whole piece", icon: "RefreshCw" },
    { key: "ecological-role", label: "Ecological role", value: "Nest predator — a significant consumer of reptile and ground-nesting bird eggs", icon: "Globe" },
  ],

  highlights: ["length", "weight", "venom-type", "activity"],

  distribution: {
    continents: ["North America"],
    regions: [
      "Arizona",
      "Sonora and Sinaloa, Mexico",
      "Southern Nevada and southwestern Utah",
      "Southwestern New Mexico",
      "Extreme southeastern California",
    ],
    habitats: [
      "Sonoran Desert scrub",
      "Mojave Desert",
      "Rocky foothill and canyon",
      "Desert grassland",
      "Oak woodland edge",
    ],
    elevation: "Sea level to about 1,500 m",
    note: "Two subspecies are recognised: the reticulate Gila monster of Arizona and Mexico, whose markings break into a net, and the banded Gila monster of the Mojave, which keeps distinct crossbands into adulthood. Both need shelter — rock crevices, packrat middens or burrows dug by other animals — and are effectively absent from open flats without it.",
  },

  sections: [
    {
      id: "venom",
      title: "A venom system built the other way round",
      body: [
        "Snakes deliver venom from glands in the upper jaw, through hollow or grooved fangs, under muscular pressure. The Gila monster does none of that. Its glands sit in the lower jaw, the venom travels along ducts to the base of the teeth, and it moves up grooves on the front and back of each tooth by capillary action.",
        "There is no injection, so the animal has to chew. A defensive bite is a determined grip that the lizard holds and works, sometimes for minutes, which is why bites are far more damaging than the animal's size suggests and why handlers describe it as difficult to detach.",
        "The venom is not primarily a hunting tool — an egg does not need subduing. It is a deterrent, and it works. Envenomation causes severe pain, swelling, a sharp drop in blood pressure, nausea and weakness. Human deaths are extraordinarily rare: no confirmed fatality was recorded between 1930 and 2024, when a man in Colorado died after being bitten by a captive animal.",
        "Heloderma has long been the textbook case of a venomous lizard, alongside the beaded lizards of Mexico and Guatemala. The picture has widened since: work on varanids showed that monitor lizards including the Komodo dragon also produce venom, and that venom in lizards is older and more widespread than the two Heloderma species once suggested.",
      ],
    },
    {
      id: "exendin",
      title: "Exendin-4, and the drug that came out of it",
      body: [
        "In the early 1990s the endocrinologist John Eng was looking for hormones in animal venoms, working on the observation that helodermatid venoms enlarge the pancreas. In 1992 he isolated a 39-amino-acid peptide from Gila monster saliva and named it exendin-4.",
        "The peptide turned out to be a close functional analogue of human GLP-1, a gut hormone that prompts the pancreas to release insulin when blood glucose is high. Human GLP-1 is useless as a drug because an enzyme in the blood destroys it within about two minutes. Exendin-4 resists that enzyme and stays active for hours — the same job, on a timescale a medicine can use.",
        "A synthetic version was approved by the US Food and Drug Administration in 2005 as exenatide, marketed as Byetta, the first GLP-1 receptor agonist to reach patients; a long-acting weekly formulation followed. The class it opened is now among the most consequential in medicine, though the later drugs are a different lineage: semaglutide and liraglutide are modified human GLP-1, not derived from Gila monster venom. Exenatide is the one that actually came from the lizard.",
        "It is a useful argument for keeping obscure species around. Nothing about a slow desert lizard suggested a diabetes treatment, and the peptide was found because someone went looking in an unlikely place.",
      ],
    },
    {
      id: "feeding",
      title: "Three or four meals a year",
      body: [
        "Gila monsters are specialist nest raiders. The diet is dominated by eggs — those of ground-nesting birds, tortoises, other lizards and snakes — with nestling birds, newborn rabbits and young rodents making up the rest. Everything on that list is defenceless, which suits a predator that walks at a stroll.",
        "The eating is concentrated. An adult may take only three or four substantial meals in a year, and a single feed can be a third of its body weight. Surplus is stored as fat in the tail, and tail girth is the standard field measure of a Gila monster's condition.",
        "That budget explains the rest of the animal's life. It spends something like ninety per cent of its time in burrows and crevices, emerges mainly in spring and again after summer monsoon rain, and even then is above ground only for a fraction of the day. A lizard seen crossing a desert road is not a common sight, and not because the species is especially rare — because it is almost never out.",
      ],
    },
    {
      id: "breeding",
      title: "Breeding and slow replacement",
      body: [
        "Mating follows the spring emergence, and males wrestle for access to females in prolonged bouts of shoving. Eggs — usually about five, occasionally up to a dozen — are laid in summer in a burrow and left there.",
        "Development takes roughly five months underground. Hatchlings appear in autumn at about 16 cm, already fully venomous, and go straight into their first winter dormancy on the yolk reserves they hatched with.",
        "Maturity takes three to five years and adults are long-lived, commonly twenty to thirty years and up to about forty in captivity. That combination — few eggs, slow maturity, long life — means a population absorbs the loss of adults badly. Collecting even a handful of animals from a local population has a disproportionate effect, and it is why the species was given legal protection so early.",
      ],
    },
    {
      id: "conservation",
      title: "Protection and pressure",
      body: [
        "Arizona protected the Gila monster in 1952, the first law anywhere in the United States to protect a venomous animal. The reasoning at the time was largely that the species was being killed and collected as a curiosity; the protection has since been extended across its range in both countries, and it is listed on CITES Appendix II.",
        "The threats now are those of the desert southwest generally. Housing and solar development remove the rocky shelter the species cannot do without, roads kill animals that move slowly and cross them at ground level, and illegal collection for the pet trade continues because the animal is distinctive and valuable.",
        "The Red List assessment dates from 2007 and is overdue for revision. Near Threatened was a reasonable reading then; the pace of desert development in Arizona, Nevada and Sonora since means the current position is likely to be worse than the listing states, and better population data is the first thing needed to say so with confidence.",
      ],
    },
  ],

  related: ["komodo-dragon", "black-mamba"],
  tags: ["lizard", "venomous", "desert", "north america", "reptile"],
  searchTerms: ["heloderma suspectum", "venomous lizard", "exendin-4", "exenatide", "gila monster bite"],

  faqs: [
    {
      q: "Is the Gila monster venomous?",
      a: "Yes, genuinely so. Venom glands in its lower jaw feed grooves in the teeth, and because there is no injection mechanism the lizard delivers venom by biting down and chewing. A bite causes intense pain, swelling and a drop in blood pressure. Deaths are extremely rare — none was confirmed between 1930 and a single case in 2024 involving a captive animal.",
    },
    {
      q: "Is the diabetes drug Ozempic made from Gila monster venom?",
      a: "No, and the confusion is common. The drug that came from the lizard is exenatide, approved in 2005 and based on exendin-4, a peptide isolated from Gila monster saliva in 1992. It was the first GLP-1 receptor agonist. Semaglutide and liraglutide are modified versions of the human hormone GLP-1 and have no Gila monster component, though exenatide is what proved the approach would work.",
    },
    {
      q: "How often does a Gila monster eat?",
      a: "Three or four substantial meals in a year is normal for an adult. A single feed can be a third of its body weight, and the surplus is stored as fat in the tail, which is why a healthy Gila monster has a fat one. It spends roughly ninety per cent of its time underground between meals.",
    },
    {
      q: "What does a Gila monster eat?",
      a: "Mostly eggs — those of ground-nesting birds, tortoises, lizards and snakes — along with nestling birds and newborn rabbits and rodents. It finds nests by scent, flicking a forked tongue and reading it with the vomeronasal organ in the roof of the mouth, much as a snake does.",
    },
    {
      q: "Are Gila monsters endangered?",
      a: "They are assessed as Near Threatened, from a 2007 assessment that is now dated. Numbers are naturally low, the animal matures slowly and lives a long time, and the main pressures — desert housing and solar development, road mortality and illegal collection — have all increased since the assessment was made. It has been legally protected in Arizona since 1952, the first venomous animal in the United States to be given that status.",
    },
  ],

  seo: {
    title: "Gila Monster — Venom, Exendin-4 and the Diabetes Drug",
    description:
      "A researched profile of the Gila monster (Heloderma suspectum): how its venom is delivered by chewing rather than injection, how exendin-4 from its saliva became the drug exenatide, its three-meals-a-year lifestyle, and its Near Threatened status.",
    keywords: [
      "gila monster facts",
      "heloderma suspectum",
      "venomous lizard",
      "exendin-4 exenatide",
      "gila monster bite",
    ],
  },

  sources: [
    {
      label: "Heloderma suspectum — Red List assessment (Hammerson et al., 2007)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/9865/13022716",
    },
    {
      label: "Heloderma suspectum entry",
      publisher: "The Reptile Database",
      url: "https://reptile-database.reptarium.cz/species?genus=Heloderma&species=suspectum",
    },
    {
      label: "Heloderma suspectum — species account",
      publisher: "Animal Diversity Web, University of Michigan",
      url: "https://animaldiversity.org/accounts/Heloderma_suspectum/",
    },
    {
      label: "Exendin-4: from lizard to laboratory, and beyond",
      publisher: "National Institute on Aging, US National Institutes of Health",
      url: "https://www.nia.nih.gov/news/exendin-4-lizard-laboratory-and-beyond",
    },
  ],

  updatedAt: "2026-07-29",
};

export default gilaMonster;
