// American alligator — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const americanAlligator = {
  slug: "american-alligator",
  category: "reptiles",
  name: "American Alligator",
  scientificName: "Alligator mississippiensis",
  otherNames: ["Gator", "Common alligator"],

  summary:
    "The crocodilian that lives furthest from the tropics, an engineer of southern US wetlands that was listed as endangered in 1967 and taken off the list, fully recovered, twenty years later.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/American_Alligator.jpg/1920px-American_Alligator.jpg",
    alt: "An American alligator in captivity at the Columbus Zoo, Ohio",
    credit: "User:Postdlf / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Alligator_mississippiensis_%28American_alligator%29_6.jpg/1920px-Alligator_mississippiensis_%28American_alligator%29_6.jpg",
      alt: "An American alligator at Bear Island Campground, Big Cypress National Preserve, Florida",
      credit: "Bobyellow / Wikimedia Commons",
      title: "The broad snout gives it away",
      caption:
        "A rounded, shovel-like snout separates an alligator from a crocodile at a glance. It trades the crocodile's narrow, fish-catching jaw for crushing leverage, which is why turtles are a routine part of the diet.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/American_Alligator_%28Alligator_mississippiensis%29_%2838578892461%29.jpg/1920px-American_Alligator_%28Alligator_mississippiensis%29_%2838578892461%29.jpg",
      alt: "A very large American alligator in the Okefenokee Swamp near Waycross, Georgia",
      credit: "gailhampshire from Cradley, Malvern, U.K / Wikimedia Commons",
      title: "Growth that never quite stops",
      caption:
        "Alligators keep growing throughout life, slowing to almost nothing after about forty years in males. An animal this size is therefore not just large but old — and old animals are the ones hide hunting removed first.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/American_alligator_%28Alligator_mississippiensis%29_%288502582483%29.jpg/1920px-American_alligator_%28Alligator_mississippiensis%29_%288502582483%29.jpg",
      alt: "An American alligator in the Florida Everglades",
      credit: "Pavel Kirillov from St.Petersburg, Russia / Wikimedia Commons",
      title: "Everglades keystone",
      caption:
        "In the Everglades the alligator is not simply a resident but an engineer. The depressions it clears and maintains hold water through the dry season and become refuges for fish, turtles, wading birds and almost everything else in the marsh.",
    },
  ],

  headline: "A cold-tolerant crocodilian, and a conservation success",
  intro: [
    "The American alligator lives further from the equator than any other crocodilian, ranging from the Rio Grande in Texas to the coastal swamps of North Carolina. That tolerance for cold is what separates it from its relatives: it can survive water near freezing, and it does so by holding its snout above a forming ice sheet and waiting the winter out.",
    "It is also one of the clearest wins in the history of American wildlife law. Unregulated hide hunting reduced the species so severely that it was listed as endangered in 1967. It was removed from the list in 1987, fully recovered, and the wild population now runs to hundreds of thousands of adults with a managed harvest on top.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Crocodylia",
    family: "Alligatoridae",
    genus: "Alligator",
    species: "Alligator mississippiensis",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2019,
    populationTrend: "stable",
    populationEstimate: "Roughly 0.75–1.06 million adults",
    note: "Assessed as Least Concern in 2019, occupying essentially all of its historic range at or near carrying capacity. In United States law it is still listed under the Endangered Species Act as 'threatened due to similarity of appearance' — not because it is at risk, but because its hides are hard to tell from those of genuinely threatened crocodilians, so keeping it listed makes the trade enforceable. Listed on CITES Appendix II.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "Males 3.4–4.6 m; females 2.6–3 m",
      min: 2.6,
      max: 4.6,
      unit: "m",
      note: "The largest verified individual, taken in Alabama in 2014, measured 4.5 m and weighed 458.8 kg. Claims beyond 5.8 m are historical and unverified",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Males up to about 450 kg; females rarely above 100 kg",
      min: 45,
      max: 460,
      unit: "kg",
      note: "The Alabama record animal weighed 458.8 kg, which remains the heaviest reliably weighed wild individual",
    },
    {
      key: "bite-force",
      label: "Bite force",
      value: "Up to 9,452 N (2,125 lbf) measured",
      min: 2442,
      max: 9452,
      unit: "N",
      note: "The maximum from fifteen individuals up to 297 kg tested on a force transducer by Erickson and colleagues in 2012. The same figure circulates as '2,125 PSI', which is a unit error — 2,125 is the reading converted to pounds of force, not a pressure",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "20–50 eggs",
      min: 20,
      max: 50,
      unit: "eggs",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "About 65 days",
      min: 60,
      max: 70,
      unit: "days",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "Around 10–12 years",
      min: 10,
      max: 12,
      unit: "years",
      note: "Tied to length rather than age — roughly 1.8 m in both sexes, which northern animals take longer to reach",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Around 50 years, sometimes over 70",
      min: 50,
      max: 70,
      unit: "years",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — fish, turtles, birds, mammals; adults also swallow fruit", icon: "Drumstick" },
    { key: "activity", label: "Activity", value: "Most active at dusk and through the night", icon: "Moon" },
    { key: "water-type", label: "Water type", value: "Fresh water above all; tolerates brackish marsh only for short spells", icon: "Droplet" },
    { key: "nest-type", label: "Nest type", value: "A mound of vegetation and mud the female builds, guards and opens at hatching", icon: "Egg" },
    { key: "heat-sensing", label: "Heat sensing", value: "None — dome pressure receptors on the jaws read surface ripples instead", icon: "Thermometer" },
    { key: "shedding-frequency", label: "Shedding", value: "Continuous — individual scales are replaced piecemeal", icon: "RefreshCw" },
    { key: "ecological-role", label: "Ecological role", value: "Keystone species — its water holes carry southern wetlands through the dry season", icon: "Globe" },
  ],

  highlights: ["length", "bite-force", "ecological-role", "nest-type"],

  distribution: {
    continents: ["North America"],
    regions: [
      "Florida",
      "Louisiana and the Mississippi delta",
      "Georgia and the Carolinas",
      "Alabama and Mississippi",
      "Eastern Texas and southern Oklahoma",
      "Southern Arkansas",
    ],
    habitats: [
      "Freshwater marsh",
      "Cypress swamp",
      "Slow river and bayou",
      "Lake and pond",
      "Brackish coastal marsh",
    ],
    elevation: "Sea level to a few hundred metres",
    note: "Louisiana and Florida hold the great majority of the population. Southern Florida is the only place on Earth where alligators and crocodiles occur together — the American crocodile reaches its northern limit in the same mangroves where the alligator reaches its southern one.",
  },

  sections: [
    {
      id: "cold",
      title: "How a crocodilian survives winter",
      body: [
        "Crocodilians are tropical animals almost without exception. The American alligator is the conspicuous one that is not, and its range reaches roughly 35 degrees north — through Arkansas and into North Carolina, where water regularly freezes.",
        "Its answer is not antifreeze but posture. As a pond ices over, an alligator positions itself with the tip of its snout breaking the surface and lets the ice form around it. The nostrils stay clear, the body goes dormant beneath, and the animal simply waits. Videos of snouts protruding from a sheet of ice are not a curiosity; they are the normal overwintering behaviour of the species.",
        "Below about 20 °C alligators stop feeding, because digestion needs heat they no longer have. Winter is therefore months of fasting, and it is why northern alligators grow more slowly and take longer to reach breeding size than animals in Florida.",
      ],
    },
    {
      id: "holes",
      title: "The alligator hole",
      body: [
        "Alligators dig. Using snout, feet and tail they clear depressions in marsh and peat, and they keep working them year after year. In the Everglades these 'gator holes' hold water when everything around them dries out, and through the dry season they become the last refuge for fish, turtles, snakes, frogs and the wading birds that hunt them.",
        "That makes the alligator a keystone species in the strict sense: remove it and the community changes out of all proportion to the animal's own numbers. The excavated spoil forms raised rims that support tree islands, so the species shapes the vegetation as well as the hydrology.",
        "Nests do similar work on a smaller scale. Abandoned alligator mounds are high, dry, well-drained ground in a flooded landscape, and turtles — including several species that lay nowhere else nearby — use them as nesting sites.",
      ],
    },
    {
      id: "nesting",
      title: "Nests, temperature and sex",
      body: [
        "The female rakes vegetation and mud into a mound close to a metre high, opens a chamber in the top, lays 20 to 50 eggs and covers them. Rotting plant matter warms the interior. She stays nearby for the two months of incubation and drives off raccoons, which are the main nest predator.",
        "Sex is set by the temperature of the chamber, not by chromosomes. Eggs held at 32.5 to 33.5 °C produce males; below about 31.5 °C and above about 34.5 °C they produce females. A degree of difference between the top and bottom of the same mound can split a clutch.",
        "When the young are ready they call from inside the eggs and the mother digs the mound open, sometimes carrying hatchlings to the water in her mouth. The pod stays together, and near her, for up to two years — long parental care by reptile standards, and necessary, because almost everything in the marsh eats a 20 cm alligator.",
      ],
    },
    {
      id: "diet",
      title: "What alligators actually eat",
      body: [
        "The broad snout is a crushing tool, and it shapes the menu. Fish, turtles, snakes, birds and small mammals make up most of it, with hatchlings living on insects, snails and other invertebrates. Turtles are eaten shell and all — few other predators can manage them.",
        "Two findings have complicated the picture of a pure carnivore. Alligators eat fruit deliberately, not accidentally, and viable seeds pass through them, which makes them seed dispersers in bottomland forest. And in Louisiana and Mississippi, alligators have been recorded balancing sticks on their snouts during the season when wading birds are collecting nest material, then taking the birds that come for them — one of very few documented cases of tool use in a reptile.",
        "Attacks on people are rare and overwhelmingly linked to feeding. An alligator fed by hand loses its avoidance of humans, which is why feeding them is illegal in every state where they occur.",
      ],
    },
    {
      id: "recovery",
      title: "Listed, recovered, delisted",
      body: [
        "Commercial hide hunting through the nineteenth and twentieth centuries took millions of alligators. By the 1950s the species was scarce across much of its range, and it was listed as endangered under the precursor to the Endangered Species Act in 1967.",
        "Recovery came from stopping the hunt, protecting habitat, and — critically — building an enforcement regime around the skin trade. Numbers rebounded fast enough that the US Fish and Wildlife Service declared the species recovered and removed it from the endangered list in 1987, twenty years after listing.",
        "It stayed on the books in one respect. The alligator is still classified as 'threatened due to similarity of appearance', because its hides resemble those of crocodilians that remain at risk. Keeping it listed keeps the paperwork requirement in place, and that is what makes illegal skins traceable. Today the species supports regulated harvest and egg-collection programmes in several states, which give landowners a direct financial reason to keep wetland intact.",
      ],
    },
  ],

  related: ["nile-crocodile", "saltwater-crocodile"],
  tags: ["crocodilian", "north america", "freshwater", "keystone species", "reptile"],
  searchTerms: ["alligator mississippiensis", "gator", "everglades alligator", "alligator vs crocodile"],

  faqs: [
    {
      q: "What is the difference between an alligator and a crocodile?",
      a: "The clearest field mark is the snout: an alligator's is broad and rounded, a crocodile's narrower and more tapered. With the mouth closed, an alligator's lower teeth sit inside the upper jaw and are largely hidden, while a crocodile's fourth lower tooth stays visible. Alligators are also freshwater animals with weak salt tolerance, whereas crocodiles have functional salt glands.",
    },
    {
      q: "How strong is an alligator's bite?",
      a: "Up to 9,452 newtons, the maximum recorded from fifteen alligators tested on a force transducer by Gregory Erickson and colleagues in 2012. That converts to 2,125 pounds of force — which is where the widely quoted '2,125 PSI' comes from. PSI is a pressure, and the measurement is a force, so the familiar figure is right in magnitude and wrong in units.",
    },
    {
      q: "How do alligators survive freezing weather?",
      a: "By letting the ice form around them. As a pond freezes an alligator holds the tip of its snout above the surface so the nostrils stay clear, and goes dormant beneath the ice until the thaw. Below roughly 20 °C it stops eating altogether, because it no longer has the body heat to digest a meal.",
    },
    {
      q: "Why is the American alligator still on the Endangered Species Act list if it recovered?",
      a: "It was removed from endangered status in 1987 as fully recovered. It remains listed as 'threatened due to similarity of appearance', a separate category that exists because alligator hides are difficult to distinguish from those of crocodilians that are genuinely at risk. The listing keeps trade documentation mandatory and therefore keeps illegal skins traceable.",
    },
    {
      q: "What decides whether an alligator hatchling is male or female?",
      a: "Nest temperature. Eggs incubated between about 32.5 and 33.5 °C produce males; cooler or hotter conditions produce females. Because the top and bottom of a single nest mound can differ by a degree or more, one clutch can yield both.",
    },
  ],

  seo: {
    title: "American Alligator — Size, Bite Force, Nesting & Recovery",
    description:
      "A researched profile of the American alligator (Alligator mississippiensis): its measured bite force, how it survives freezing water, alligator holes and their role in the Everglades, temperature-set sex, and its recovery from endangered listing.",
    keywords: [
      "american alligator facts",
      "alligator mississippiensis",
      "alligator bite force",
      "alligator vs crocodile",
      "alligator conservation",
    ],
  },

  sources: [
    {
      label: "Alligator mississippiensis — Red List assessment (Elsey et al., 2019)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/46583/3009637",
    },
    {
      label: "American alligator species profile",
      publisher: "U.S. Fish & Wildlife Service",
      url: "https://www.fws.gov/species/american-alligator-alligator-mississippiensis",
    },
    {
      label:
        "Insights into the ecology and evolutionary success of crocodilians revealed through bite-force and tooth-pressure experimentation",
      publisher: "PLOS ONE (Erickson et al., 2012)",
      url: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0031781",
    },
    {
      label: "American Alligator Alligator mississippiensis — species account",
      publisher: "IUCN SSC Crocodile Specialist Group",
      url: "https://www.iucncsg.org/365_docs/attachments/protarea/01_A-81db765a.pdf",
    },
  ],

  updatedAt: "2026-07-29",
};

export default americanAlligator;
