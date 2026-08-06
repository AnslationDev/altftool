// Tuatara — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const tuatara = {
  slug: "tuatara",
  category: "reptiles",
  name: "Tuatara",
  scientificName: "Sphenodon punctatus",
  otherNames: ["Sphenodon", "Beak-head"],

  summary:
    "Not a lizard but the last survivor of Rhynchocephalia, an order that separated from lizards and snakes around 250 million years ago and now has exactly one species left.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/7/70/Tuatara_%285205719005%29.jpg",
    alt: "A tuatara resting on the ground, the spiny crest along its back visible",
    credit: "Sid Mosdell from New Zealand / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Sphenodon_punctatus_%281%29.jpg/1920px-Sphenodon_punctatus_%281%29.jpg",
      alt: "A tuatara photographed side-on, showing its heavy head and loose grey-brown skin",
      credit: "TimVickers / Wikimedia Commons",
      title: "A body plan 200 million years old",
      caption:
        "The fused temporal bar behind the eye, the gastralia in the belly wall and the proatlas bones in the neck are all features lizards lost. What looks like a lizard is a separate structural design that never became one.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Sphenodon_punctatus_%282%29.jpg/1920px-Sphenodon_punctatus_%282%29.jpg",
      alt: "Close view of a tuatara's head, with the eye and the row of small spines behind it",
      credit: "TimVickers / Wikimedia Commons",
      title: "The head that gave the order its name",
      caption:
        "Rhynchocephalia means beak-head, after the overhanging premaxillary bones at the front of the upper jaw. Behind them sit two rows of upper teeth; the lower jaw closes into the gap between them and saws backwards.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sphenodon_punctatus_%284%29.jpg/1920px-Sphenodon_punctatus_%284%29.jpg",
      alt: "A tuatara on bare ground, its crest of soft spines running down the neck and back",
      credit: "TimVickers / Wikimedia Commons",
      title: "The crest that names it",
      caption:
        "Tuatara is Māori for peaks on the back. The crest is a row of soft folds rather than bone, and males can raise it during territorial display; theirs is much more pronounced than a female's.",
    },
  ],

  headline: "The last of an order, running at 18 °C",
  intro: [
    "The tuatara looks like a stout brown lizard and is not one. It is the only living member of Rhynchocephalia, an order whose lineage separated from the ancestors of lizards and snakes roughly 250 million years ago, and which was the dominant group of small reptiles worldwide through the Jurassic. Every other rhynchocephalian is gone; outside New Zealand the youngest fossils are Paleocene. One species remains, on scattered islands off a country at the bottom of the Pacific.",
    "Almost everything about it runs slow and cold. Its preferred body temperature, 16 to 21 °C, is the lowest known for any reptile, and it stays active at 5 °C in conditions that would immobilise most lizards. Eggs take a year or more to hatch, females breed only every two to five years, and individuals are still growing at 35 and can pass 100.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Rhynchocephalia",
    family: "Sphenodontidae",
    genus: "Sphenodon",
    species: "Sphenodon punctatus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2019,
    populationTrend: "stable",
    populationEstimate: "Roughly 50,000–100,000, the great majority on a single island",
    note: "Listed Least Concern in 2019 because the total number is large and the islands holding it are protected, which understates how narrow the base is: around 30,000 of them live on Takapourewa (Stephens Island) alone. New Zealand's own threat classification calls the species Relict. It has been protected by law since 1895 and is listed on CITES Appendix I.",
  },

  measurements: [
    {
      key: "length",
      label: "Total length",
      value: "Up to about 80 cm from snout to tail tip",
      min: 45,
      max: 80,
      unit: "cm",
      note: "Males average around 61 cm and females around 45 cm; males are also markedly heavier-built",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Males up to about 1 kg; females roughly half that",
      min: 0.5,
      max: 1.3,
      unit: "kg",
      note: "Exceptional males have been recorded to 1.3 kg",
    },
    {
      key: "optimal-body-temperature",
      label: "Optimal body temperature",
      value: "16–21 °C — the lowest of any reptile",
      min: 16,
      max: 21,
      unit: "°C",
      note: "Field body temperatures often sit lower still, and the animal remains active at around 5 °C. Above about 28 °C is generally fatal",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "Usually about 9–10 eggs, ranging from 1 to 19",
      min: 1,
      max: 19,
      unit: "eggs",
      note: "Laid in a burrow the female digs, back-filled and guarded for a few days, then left",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "12–15 months — probably the longest of any reptile",
      min: 365,
      max: 455,
      unit: "days",
      note: "Embryonic development halts entirely through the New Zealand winter and resumes in spring, which is why the eggs take more than a year",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "10–20 years",
      min: 10,
      max: 20,
      unit: "years",
      note: "Growth continues for roughly the first 35 years of life",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Commonly over 60 years; more than 100 is possible",
      min: 60,
      max: 100,
      unit: "years",
      note: "A male named Henry at the Southland Museum bred successfully at an estimated 111 years old",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Carnivore — beetles, wētā and other invertebrates, plus lizards, seabird eggs and chicks", icon: "Bug" },
    { key: "activity", label: "Activity", value: "Mainly nocturnal; basks by day at burrow entrances", icon: "Moon" },
    { key: "parietal-eye", label: "Third eye", value: "A genuine parietal eye with lens, retina and nerve — visible in hatchlings, buried under scales and pigment by four to six months", icon: "Eye" },
    { key: "dentition", label: "Teeth", value: "Two rows in the upper jaw, one in the lower; fused to the bone and never replaced, so they simply wear down with age", icon: "Bone" },
    { key: "breeding-season", label: "Breeding season", value: "Mates in late summer; females reproduce only once every two to five years", icon: "Calendar" },
    { key: "heat-sensing", label: "Heat sensing", value: "None — no infrared pits. The parietal eye reads light, not heat", icon: "Thermometer" },
    { key: "shedding-frequency", label: "Shedding", value: "At least once a year as an adult; three or four times a year while growing", icon: "RefreshCw" },
    { key: "ecological-role", label: "Ecological role", value: "Top invertebrate predator on seabird islands, where burrow-nesting birds fertilise the whole system", icon: "Globe" },
  ],

  highlights: ["optimal-body-temperature", "incubation", "lifespan", "parietal-eye"],

  distribution: {
    continents: ["Oceania"],
    regions: [
      "Cook Strait islands, New Zealand",
      "Islands off the north-east North Island",
      "Takapourewa (Stephens Island)",
      "Zealandia sanctuary, Wellington",
    ],
    habitats: [
      "Coastal forest and scrub on offshore islands",
      "Seabird burrow colonies",
      "Fenced mainland sanctuary",
    ],
    elevation: "Sea level to a few hundred metres",
    note: "Tuatara were once found across both main islands of New Zealand. By the twentieth century they survived only on around 32 offshore islands free of introduced mammals. Translocations have since raised that to roughly 37 populations, and a release into the fenced Zealandia sanctuary in 2005 produced the first known mainland hatching in about two centuries, found in 2009.",
  },

  sections: [
    {
      id: "not-a-lizard",
      title: "Why it is not a lizard",
      body: [
        "The resemblance is real but superficial. Lizards and snakes are squamates; the tuatara belongs to Rhynchocephalia, a sister order whose lineage diverged from theirs in the Permian or early Triassic, roughly a quarter of a billion years ago. Rhynchocephalians first appear in the fossil record about 244 to 241 million years ago, spread worldwide, and were the dominant small reptiles of the Jurassic before declining through the Cretaceous.",
        "The differences are structural. The tuatara has a complete second temporal bar at the back of the skull, closing an arch that squamates opened up. It carries gastralia — free-floating belly ribs — and a proatlas bone in the neck, both absent in lizards. Its teeth are not sockets full of replaceable teeth but serrated projections of the jawbone itself, which wear flat over decades. Males lack a hemipenis, the paired copulatory organ every lizard and snake has.",
        "It is often called a living fossil, a term palaeontologists now avoid. The tuatara has kept much of the body plan of its Mesozoic relatives, but there is no continuous fossil record showing it sat unchanged for 240 million years, and its genome turns out to have been evolving briskly the whole time.",
      ],
    },
    {
      id: "third-eye",
      title: "The parietal eye",
      body: [
        "On the top of a hatchling tuatara's skull, between the two normal eyes, is a translucent patch. Underneath it is a third eye — not a metaphor, an actual photoreceptive organ with a lens, a retina and a nerve running to the brain. It is the best-developed parietal eye of any living reptile.",
        "It does not form images. Within four to six months of hatching it is covered over by opaque scales and pigment, and its function afterwards is thought to be measuring light rather than seeing by it: setting the circadian rhythm, registering the changing length of the day through the year, and helping the animal judge how much basking it has had.",
        "For a reptile living at the temperatures the tuatara does, that last job is not trivial. Its whole activity budget depends on collecting small amounts of warmth reliably, and a dedicated light meter on the roof of the skull is a reasonable way to manage it.",
      ],
    },
    {
      id: "cold",
      title: "Living cold and slow",
      body: [
        "The tuatara's preferred body temperature, 16 to 21 °C, is the lowest recorded for any reptile, and in the field its body often runs colder than that. It stays active at around 5 °C, hunting on nights that would leave most lizards immobile, and temperatures above roughly 28 °C are generally fatal. New Zealand's cool maritime climate is not something it tolerates; it is what the animal is built for.",
        "Everything downstream of that is slow. Metabolism is low, growth continues for about 35 years, and sexual maturity arrives somewhere between 10 and 20. Individuals routinely pass 60 years and can exceed 100 — a male named Henry at the Southland Museum fathered a clutch at an estimated 111.",
        "The reproductive rate may be the slowest of any reptile. A female mates and lays only once every two to five years. She digs a burrow, lays around nine or ten soft-shelled eggs, fills it in and guards it briefly, then leaves. The eggs then sit for 12 to 15 months, because development stops completely over winter and only restarts when the ground warms again the following spring.",
      ],
    },
    {
      id: "sex-and-warming",
      title: "Nest temperature decides sex",
      body: [
        "Tuatara have temperature-dependent sex determination, and it runs the opposite way to most turtles: warmer nests make males. At about 21 °C a clutch comes out roughly half and half. A degree warmer, around 22 °C, and roughly 80 per cent hatch male. A degree cooler, near 20 °C, and about 80 per cent hatch female; at 18 °C the whole clutch is female.",
        "The window is therefore about four degrees wide, which makes a warming climate a direct demographic problem rather than an abstract one. Populations on small, low islands with little shade have no easy way to find cooler nesting ground, and modelling suggests some could become male-biased enough to stop replacing themselves.",
        "This is one of the reasons conservation work has focused on establishing new populations across a wider spread of islands and latitudes, rather than simply protecting the ones that already exist.",
      ],
    },
    {
      id: "threats",
      title: "Rats, islands and recovery",
      body: [
        "What removed tuatara from mainland New Zealand was not habitat loss alone but the Polynesian rat, kiore, which arrived with human settlement. Rats take eggs and hatchlings, and a population can persist for decades as ageing adults while recruiting nothing — a slow-motion extinction that looks stable right up until it is not.",
        "Protection came early: the species has been legally protected since 1895, and it is listed on CITES Appendix I. The modern work has been island restoration. Eradicating rodents from offshore islands, then translocating tuatara to them, has raised the number of populations from around 32 to roughly 37.",
        "The most visible result came on the mainland. Tuatara were released into the fenced Zealandia sanctuary in Wellington in 2005; a nest was uncovered during maintenance in late 2008 and a hatchling found the following autumn, thought to be the first tuatara born on the New Zealand mainland in about 200 years.",
      ],
    },
  ],

  related: ["galapagos-tortoise", "veiled-chameleon", "komodo-dragon"],
  tags: ["reptile", "new zealand", "island", "relict lineage", "nocturnal"],
  searchTerms: ["sphenodon", "rhynchocephalia", "living fossil", "third eye lizard", "tuatera"],

  faqs: [
    {
      q: "Is a tuatara a lizard?",
      a: "No. Lizards and snakes are squamates; the tuatara is the only surviving member of a separate order, Rhynchocephalia, whose lineage split from the squamates roughly 250 million years ago. The differences are structural rather than cosmetic: a fully fused second temporal bar in the skull, belly ribs called gastralia, a proatlas bone in the neck, teeth fused to the jawbone rather than set in sockets, and no hemipenis in males.",
    },
    {
      q: "Do tuatara really have a third eye?",
      a: "Yes, a genuine parietal eye on top of the skull with a lens, a retina and a nerve connection to the brain — the best developed of any living reptile. It is visible as a translucent patch in hatchlings and is covered over by scales and pigment within four to six months. It does not form images; it is thought to measure light for setting circadian and seasonal rhythms and for judging basking.",
    },
    {
      q: "Why do tuatara eggs take more than a year to hatch?",
      a: "Because development stops for the winter. Eggs are laid in a burrow in early summer, grow through autumn, then halt completely while the ground is cold, and resume the following spring. The result is an incubation of 12 to 15 months, probably the longest of any reptile.",
    },
    {
      q: "How long do tuatara live?",
      a: "Commonly more than 60 years, and over 100 is possible. They keep growing for their first 35 years or so and do not reach sexual maturity until somewhere between 10 and 20. A male named Henry at the Southland Museum in Invercargill bred successfully at an estimated 111 years of age.",
    },
    {
      q: "If tuatara are Least Concern, why are they a conservation priority?",
      a: "Because the total number is large but the base is narrow. There are perhaps 50,000 to 100,000 tuatara, and around 30,000 of those live on one island, Takapourewa. The species was wiped off the mainland by introduced rats and survived only on predator-free offshore islands. New Zealand's own threat classification lists it as Relict, and warming nest temperatures — which skew clutches towards males — add a threat the Red List category does not capture.",
    },
  ],

  seo: {
    title: "Tuatara — The Last Rhynchocephalian, Third Eye & Slow Life",
    description:
      "A researched profile of the tuatara (Sphenodon punctatus): the sole survivor of the order Rhynchocephalia, its genuine parietal third eye, the lowest optimal body temperature of any reptile, year-long egg incubation and island conservation.",
    keywords: [
      "tuatara facts",
      "sphenodon punctatus",
      "rhynchocephalia",
      "tuatara third eye",
      "tuatara not a lizard",
    ],
  },

  sources: [
    {
      label: "Sphenodon punctatus — Red List assessment (Hitchmough, 2019)",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/131735762/120191347",
    },
    {
      label: "Tuatara — biology, islands, decline and recovery",
      publisher: "Te Ara: The Encyclopedia of New Zealand",
      url: "https://teara.govt.nz/en/tuatara",
    },
    {
      label: "Tuatara species account",
      publisher: "San Diego Zoo Wildlife Alliance",
      url: "https://animals.sandiegozoo.org/animals/tuatara",
    },
    {
      label: "Sphenodon punctatus entry",
      publisher: "The Reptile Database",
      url: "https://reptile-database.reptarium.cz/species?genus=Sphenodon&species=punctatus",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default tuatara;
