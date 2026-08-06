// Arapaima — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const arapaima = {
  slug: "arapaima",
  category: "fish",
  name: "Arapaima",
  scientificName: "Arapaima gigas",
  otherNames: ["Pirarucu", "Paiche"],

  summary:
    "One of the largest freshwater fish alive: an air-breathing Amazon giant armoured in scales that resist piranha bites, and a rare case of a species counted back from collapse by the people who fish it.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Arapaima_gigas_at_Beijing_aquarium.JPG/1920px-Arapaima_gigas_at_Beijing_aquarium.JPG",
    alt: "An arapaima in a large aquarium tank, showing the long grey body and the red-flecked scales towards the tail",
    credit: "Shizhao / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/4/4b/01_-_MG_7212.jpg",
      alt: "An angler holding an arapaima in shallow water before releasing it",
      credit: "Jijiladouceur / Wikimedia Commons",
      title: "A fish that has to surface",
      caption:
        "Arapaima cannot get enough oxygen from water and must come up for air every few minutes. That single fact governs everything about how they are caught: a harpooner does not have to find the fish, only to wait for it. It is also the reason they can be counted at all.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Amazon_1983_-_50734537826.jpg",
      alt: "A fisherman on the Ucayali River in Peru handling a landed paiche in 1983",
      credit: "John Hayes (gravelboy) / Wikimedia Commons",
      title: "Ucayali River, 1983",
      caption:
        "Paiche is a staple food fish across the Peruvian and Brazilian Amazon and its meat is largely boneless, which is exactly why unmanaged fishing emptied whole river reaches of it. Brazil banned arapaima fishing outright between 1996 and 1999 and now allows it only under community quotas set by an annual count.",
    },
  ],

  headline: "A giant that drowns if it cannot reach the surface",
  intro: [
    "The arapaima is among the largest freshwater fish in the world — commonly two metres, with historical reports of four and a half — and it is built around an unusual constraint. Its gills cannot supply enough oxygen for its size in the warm, stagnant, oxygen-poor water of Amazon floodplain lakes, so it has converted its swim bladder into something close to a lung. An arapaima must surface to breathe every few minutes for its whole life. Held underwater, it drowns.",
    "That dependence made it easy to hunt. A fisher with a harpoon needs only to watch the surface, and across much of the Amazon arapaima were fished out of accessible lakes entirely. The same trait then made the recovery possible, because a fish that must surface to breathe can be counted from a canoe by someone who knows what to look for — which is the basis of the community quota systems that have brought the species back along parts of the Juruá and around the Mamirauá Reserve.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Actinopterygii",
    order: "Osteoglossiformes",
    family: "Arapaimidae",
    genus: "Arapaima",
    species: "Arapaima gigas",
  },

  conservation: {
    status: "DD",
    assessmentYear: 1996,
    populationTrend: "unknown",
    populationEstimate:
      "No global figure. A survey along the Juruá River found protected lakes holding an average of 304.8 arapaima against 9.2 in open-access lakes, and counts in the Mamirauá Reserve rose roughly ninefold over the first eight years of community management",
    note: "Assessed as Data Deficient on 1 August 1996 and never revisited — one of the oldest listings on the Red List, and a poor description of a fish that has been locally exterminated in some rivers and deliberately rebuilt in others. Part of why it has not been updated is taxonomic: Arapaima gigas is one of several species in the genus, several type specimens have been lost, and most published work on 'arapaima' does not distinguish between them. The genus has been on CITES Appendix II since 1975. Brazil banned arapaima fishing outright from 1996 to 1999 and now permits harvest only under community management quotas.",
  },

  measurements: [
    {
      key: "length",
      label: "Length",
      value: "Commonly about 2 m; historical reports to 4.5 m",
      min: 2,
      max: 4.5,
      unit: "m",
      note: "FishBase gives a maximum of 450 cm. The largest figures come from older accounts; fish over three metres are now very rare, because heavy fishing removes the biggest individuals first",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Up to about 200 kg",
      min: 100,
      max: 200,
      unit: "kg",
      note: "The head alone accounts for roughly 10 to 13% of total body weight",
    },
    {
      key: "surfacing-interval",
      label: "Surfacing interval",
      value: "Every 5–15 minutes",
      min: 5,
      max: 15,
      unit: "minutes",
      note: "An obligate air breather. The swim bladder is lined with lung-like tissue and supplies most of the fish's oxygen, so it must surface whether or not the water above it is safe",
    },
    {
      key: "scale-size",
      label: "Scale size",
      value: "Typically 5–7 cm, up to 10 cm in large fish",
      min: 5,
      max: 10,
      unit: "cm",
      note: "Each scale is a two-layer composite: a hard mineralised outer shell over a thick, twisted collagen base. Amazonian communities have long used them as nail files",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "Around 5 years, at about 1.65 m",
      min: 5,
      max: 5,
      unit: "years",
    },
    {
      key: "clutch-size",
      label: "Eggs per clutch",
      value: "Fewer than 500, laid in several separate clutches",
      min: 100,
      max: 500,
      unit: "eggs",
      note: "Spawned in a nest excavated in the substrate during the low-water season, roughly August to March",
    },
    {
      key: "water-temperature",
      label: "Water temperature",
      value: "25–29 °C",
      min: 25,
      max: 29,
      unit: "°C",
      note: "Warm water holds less dissolved oxygen than cold, which is a large part of why an air-breathing strategy pays off here",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — mainly fish, plus invertebrates, and occasionally birds and small mammals taken at the surface", icon: "Fish" },
    { key: "respiration", label: "Breathing", value: "Obligate air breather; the swim bladder is lined with lung-like tissue", icon: "Wind" },
    { key: "defence", label: "Armour", value: "Mineralised, layered scales that resist and blunt piranha bites", icon: "Shield" },
    { key: "reproduction", label: "Reproduction", value: "Nest builder; the male guards the fry for three to six months, shepherding them near his head", icon: "Egg" },
    { key: "water-type", label: "Water type", value: "Freshwater", icon: "Droplet" },
    { key: "schooling-behaviour", label: "Schooling", value: "Solitary or loosely grouped; concentrates in floodplain lakes as the water falls", icon: "Users" },
    { key: "ecological-role", label: "Ecological role", value: "Top predator of Amazon floodplain lakes and the region's most valuable food fish", icon: "Crosshair" },
    { key: "taxonomic-status", label: "Taxonomic status", value: "One of several species in the genus; boundaries between them are still unsettled", icon: "GitBranch" },
  ],

  highlights: ["length", "weight", "surfacing-interval", "defence"],

  distribution: {
    continents: ["South America"],
    regions: [
      "Amazon River basin",
      "Tocantins–Araguaia basin",
      "Ucayali and Marañón rivers, Peru",
      "Juruá River, Brazil",
      "Mamirauá Reserve, Amazonas",
      "Rupununi and Essequibo, Guyana",
    ],
    habitats: ["Floodplain lakes (várzea)", "Slow river channels", "Flooded forest"],
    elevation: "Lowland floodplains",
    note: "Native to the Amazon and Tocantins–Araguaia basins, with confirmed occurrence in Brazil and Peru; populations in Bolivia are generally treated as introduced, having spread from Peruvian fish farms. The species follows the flood pulse — dispersing into flooded forest at high water and concentrating into shrinking lakes as the water falls, which is when it is both most catchable and most countable. Arapaima have also been introduced far outside the range, including to Thailand, Malaysia and Indonesia, where they are farmed and stocked for angling and have established in the wild in places.",
  },

  sections: [
    {
      id: "breathing",
      title: "Breathing air, and what it costs",
      body: [
        "Amazon floodplain lakes in the dry season are warm, still and close to anoxic. Warm water holds little dissolved oxygen to begin with, and decaying vegetation strips out much of what remains. Most fish cope by tolerating it, staying near the surface film, or leaving. The arapaima solved it by converting its swim bladder into a respiratory organ — highly vascularised, folded into lung-like chambers, and connected to the gut so it can be filled at the surface.",
        "The result is an obligate air breather. Gills still handle some gas exchange, mostly carbon dioxide, but the bulk of the oxygen comes from air, and an adult surfaces every five to fifteen minutes throughout its life. A netted arapaima held below the surface will suffocate.",
        "This is a superb adaptation to a hostile environment and a catastrophic one in the presence of a person with a harpoon. An arapaima cannot hide, because at a predictable interval it has to come up and make a distinctive rolling gulp at the surface. Every unmanaged arapaima fishery in the Amazon worked on that principle, and every one of them emptied.",
      ],
    },
    {
      id: "armour",
      title: "Scales tested against piranhas",
      body: [
        "Arapaima share their floodplain lakes with piranhas, and their scales have been studied as a model for engineered armour precisely because they hold up. Each scale is a composite of two very different materials. The outer surface is heavily mineralised and hard, with a corrugated profile that lets it bend rather than snap. Beneath it sits a much thicker base of collagen fibres laid down in parallel sheets, each sheet rotated slightly relative to the one below — a Bouligand, or twisted plywood, arrangement.",
        "Under load, the two layers fail differently and that is the point. A piranha tooth can crack the mineralised shell, but the crack cannot run onward into the collagen base: the twisted fibre layers stretch, rotate towards the direction of the load and peel apart locally, absorbing the energy and containing the damage to a small area. Work at Berkeley Lab and UC San Diego, using X-ray imaging of scales loaded in real time, showed the fibres actively reorienting as force was applied — an armour that adapts to the direction it is being attacked from.",
        "The scales also overlap, so a bite has to get through more than one, and they stay flexible enough for a two-metre fish to bend its body. Rigid armour that stopped teeth but stopped swimming would not be a solution.",
      ],
    },
    {
      id: "taxonomy",
      title: "How many arapaimas are there?",
      body: [
        "Arapaima gigas was long treated as the only member of its genus, and most of the literature — including fisheries statistics, aquarium records and popular accounts — uses that name for any large arapaima. That is very probably wrong.",
        "The genus contains several described species: Arapaima agassizii, A. mapae and A. arapaima were named in the nineteenth century, and A. leptosoma was described in 2013. Reviews of the group have found that the historical descriptions are hard to apply because several type specimens have been lost or destroyed, and that specimens collected across the basin do not all fit A. gigas as defined.",
        "This matters for more than pedantry. If 'arapaima' is several species with different ranges, then a fishery, a stock assessment or a Red List category applied to the whole group may be describing an animal that does not exist as a single unit — and it is part of why a Data Deficient listing from 1996 has never been revised.",
      ],
    },
    {
      id: "management",
      title: "Counted back",
      body: [
        "By the 1990s arapaima had been fished out of long stretches of the Amazon. Brazil banned fishing for the species outright between 1996 and 1999. The ban alone would not have worked — enforcement across a floodplain the size of Western Europe is not realistic — and what replaced it is one of the more interesting fisheries stories of the past thirty years.",
        "The Mamirauá Sustainable Development Institute, working with local communities from 1999, built a system around the fish's one weakness. Fishers were trained to count surfacing arapaima from canoes at dawn — a skill that already existed as traditional knowledge, formalised and validated against independent methods. Those counts set an annual quota, typically around 30% of adults in a managed lake, and communities agreed protected lakes where no fishing happens at all.",
        "The numbers are unusually clear. Counts in the Mamirauá Reserve rose roughly ninefold over the scheme's first eight years. A later survey along the Juruá River found protected lakes averaging 304.8 arapaima against 9.2 in open-access lakes, with community management arrangements explaining 71.8% of the variation in population size between lakes — and generating an average annual revenue of about US$10,600 per participating community. Management, not the ban, is what produced that.",
        "It is not universal. A large share of the arapaima sold in Amazonian markets still comes from outside managed schemes, and illegal fishing continues where communities have no stake in a lake's future. The lesson the case is usually taken to teach is not that fishing was stopped, but that the people doing the fishing were given a reason to count.",
      ],
    },
    {
      id: "elsewhere",
      title: "Outside the Amazon",
      body: [
        "Arapaima grow fast, tolerate poor water and convert feed efficiently, which has made them attractive for aquaculture well beyond South America. They are farmed in Peru, Brazil and Colombia and have been introduced to Southeast Asia — Thailand, Malaysia and Indonesia among others — for food production and for stocked angling lakes.",
        "Escapes and deliberate releases have followed. Arapaima are established in the wild in parts of Southeast Asia, and there are records of the species in Bolivian rivers where it is treated as introduced rather than native. A two-metre air-breathing predator dropped into a river system that has never had one is a genuine ecological problem.",
        "The result is a species declining in its native range and expanding outside it at the same time — sometimes called a biodiversity conservation paradox, and a reminder that abundance somewhere is not the same as a species being secure.",
      ],
    },
  ],

  related: ["red-bellied-piranha", "electric-eel", "european-eel", "atlantic-cod"],
  tags: ["arapaima", "freshwater", "bony fish", "amazon", "air breathing", "data deficient"],
  searchTerms: ["arapaima gigas", "pirarucu", "paiche", "largest freshwater fish", "amazon giant fish"],

  faqs: [
    {
      q: "Does an arapaima breathe air?",
      a: "Yes, and it has no choice. Its swim bladder is lined with lung-like tissue and supplies most of its oxygen, because the warm, still floodplain lakes it lives in hold very little dissolved oxygen. An adult surfaces every five to fifteen minutes for its whole life, and an arapaima held underwater will drown.",
    },
    {
      q: "How big does an arapaima get?",
      a: "Commonly about two metres and up to around 200 kilograms. Historical reports go to four and a half metres, and FishBase carries that as the maximum, but fish over three metres are now very rare — heavy fishing removes the largest individuals first, so the giants in the old accounts are largely gone.",
    },
    {
      q: "Can piranhas bite through arapaima scales?",
      a: "Generally not. Each scale is a hard mineralised outer shell over a thick base of collagen fibres laid in sheets, each rotated slightly against the one beneath. A tooth can crack the outer layer, but the crack cannot propagate into the twisted collagen underneath, which stretches and reorients to absorb the energy. The structure has been studied at Berkeley Lab and UC San Diego as a template for engineered armour.",
    },
    {
      q: "Is Arapaima gigas the only arapaima species?",
      a: "Almost certainly not. Several other species have been described — A. agassizii, A. mapae, A. arapaima and, in 2013, A. leptosoma — but the group is hard to work on because some type specimens have been lost. Most fisheries data and most popular accounts still use 'Arapaima gigas' for any large arapaima, which is one reason the species has never had a proper Red List assessment.",
    },
    {
      q: "Are arapaima endangered?",
      a: "The Red List still lists the species as Data Deficient, from a 1996 assessment that has never been updated. In practice the picture is local: arapaima have been fished out of many accessible Amazon lakes, while community-managed lakes have seen populations rise dramatically — one Juruá River survey found an average of 304.8 fish in protected lakes against 9.2 in open-access ones.",
    },
  ],

  seo: {
    title: "Arapaima — Size, Air Breathing, Armoured Scales & Status",
    description:
      "A researched profile of the arapaima (Arapaima gigas): why this Amazon giant must breathe air, how its scales resist piranha bites, the unresolved taxonomy of the genus, and the community counting schemes that brought it back.",
    keywords: [
      "arapaima facts",
      "arapaima gigas",
      "pirarucu",
      "largest freshwater fish",
      "arapaima scales piranha",
    ],
  },

  sources: [
    {
      label: "Arapaima gigas — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/1991/9110195",
    },
    {
      label: "Arapaima gigas — species summary",
      publisher: "FishBase",
      url: "https://www.fishbase.se/summary/Arapaima-gigas.html",
    },
    {
      label: "Community-based management induces rapid recovery of a high-value tropical freshwater fishery",
      publisher: "Campos-Silva & Peres, Scientific Reports (2016)",
      url: "https://www.nature.com/articles/srep34745",
    },
    {
      label: "Of fish scales and adaptable armor — what X-rays can tell you",
      publisher: "Berkeley Lab News Center",
      url: "https://newscenter.lbl.gov/2013/11/07/of-fish-scales-and-adaptable-armor-the-things-that-x-rays-can-tell-you/",
    },
    {
      label: "Protective role of Arapaima gigas fish scales — structure and mechanical behavior",
      publisher: "Yang et al., Acta Biomaterialia (2014)",
      url: "https://www2.lbl.gov/ritchie/Library/PDF/2014_Yang_Acta%20Bio_ProtectiveRole.pdf",
    },
  ],

  updatedAt: "2026-07-29",
};

export default arapaima;
