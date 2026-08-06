// Goliath beetle — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const goliathBeetle = {
  slug: "goliath-beetle",
  category: "insects",
  name: "Goliath Beetle",
  scientificName: "Goliathus goliatus",
  otherNames: ["African goliath beetle", "Goliath flower beetle"],

  summary:
    "One of the heaviest insects alive — though the famous 100-gram figure belongs to the grub, not the beetle, and the adult that emerges from it weighs roughly half as much.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Goliath_beetle_%28Goliathus_goliatus%29%2C_Entomica.jpg",
    alt: "A live goliath beetle filling an open human palm, with deep brown wing cases and a black-and-white striped pronotum",
    credit: "Fungus Guy / Wikimedia Commons",
  },
  gallery: [],

  headline: "The heaviest insect is not the beetle",
  intro: [
    "Goliathus goliatus is a scarab from the equatorial forests of Africa, big enough that an adult fills an adult human palm and heavy enough that its flight is audible across a clearing. It is routinely listed among the heaviest insects on Earth, and it deserves the listing — but the number usually attached to it is being applied to the wrong life stage.",
    "The 80 to 100 grams so often quoted is the weight of the larva, a pale grub that can exceed twenty centimetres before it stops feeding. The adult beetle that eventually climbs out of the soil is a lighter, harder, flying animal at roughly half that mass. Both facts are remarkable. Only one of them is usually reported correctly.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Arthropoda",
    class: "Insecta",
    order: "Coleoptera",
    family: "Scarabaeidae",
    genus: "Goliathus",
    species: "Goliathus goliatus",
  },

  conservation: {
    status: "NE",
    assessmentYear: null,
    populationTrend: "unknown",
    populationEstimate:
      "No population estimate exists; the species is recorded across a broad equatorial band from Nigeria to western Kenya, but nothing has been counted",
    note: "Never assessed against the Red List criteria. That is the normal situation for tropical beetles and says nothing about whether the species is secure. Two pressures are real and documented: the clearance of West and Central African equatorial forest, which removes both the sap trees adults feed at and the rotting substrate larvae grow in, and sustained collection for the international specimen and live-beetle trade, where large Goliathus command high prices. Captive breeding now supplies a share of that demand, but wild-caught material still moves in volume and nobody tracks the total.",
  },

  measurements: [
    {
      key: "length",
      label: "Body length (male)",
      value: "5–11 cm",
      min: 5,
      max: 11,
      unit: "cm",
      note: "Females are shorter at roughly 5.4–8 cm and lack the head horn; accounts differ slightly at the lower end, with some giving 6 cm as the male minimum",
    },
    {
      key: "weight",
      label: "Adult weight",
      value: "About 40–60 g",
      min: 40,
      max: 60,
      unit: "g",
      note: "Sources disagree within this band. What they agree on is that the adult weighs around half what the final-instar larva did — and that the heaviest adult insect ever confirmed on a scale is a 71 g gravid giant wētā, not a beetle",
    },
    {
      key: "larval-weight",
      label: "Larval weight",
      value: "80–100 g, and at least 115 g recorded",
      min: 80,
      max: 115,
      unit: "g",
      note: "This is the figure behind the 'heaviest insect' claim. It is a grub, not a beetle, and it is the heaviest insect stage measured anywhere",
    },
    {
      key: "larval-length",
      label: "Larval length",
      value: "Up to about 25 cm",
      unit: "cm",
      note: "A soft, C-shaped white grub far longer than the adult it becomes",
    },
    {
      key: "lifespan-adult",
      label: "Adult lifespan",
      value: "Up to about a year in captivity",
      unit: "months",
      note: "Wild adults are thought to be shorter-lived; captive figures come from breeders rather than field studies",
    },
  ],

  traits: [
    { key: "diet-adult", label: "Adult diet", value: "Tree sap and ripe fruit", icon: "Apple" },
    { key: "diet-larva", label: "Larval diet", value: "Decaying plant matter, with an unusually high protein requirement", icon: "Leaf" },
    { key: "weapon", label: "Head horn", value: "Y-shaped, male only — used as a pry bar", icon: "Swords" },
    { key: "activity", label: "Activity", value: "Diurnal; flies strongly in warm daylight", icon: "Sun" },
    { key: "ecological-role", label: "Ecological role", value: "Sap feeder as an adult, decomposer as a larva", icon: "Recycle" },
  ],

  highlights: ["length", "larval-weight", "weight", "weapon"],

  distribution: {
    continents: ["Africa"],
    regions: [
      "Nigeria and Cameroon",
      "Central African Republic, Gabon and both Congos",
      "Uganda and western Kenya",
      "Northwestern Tanzania",
    ],
    habitats: [
      "Equatorial rainforest",
      "Sub-equatorial savannah and woodland",
      "Forest canopy around sap runs",
    ],
    elevation: "Lowland to mid-altitude equatorial forest; no published upper limit",
    note: "The species runs in a broad band across equatorial Africa from the Gulf of Guinea to the East African lakes. Colour form varies geographically: the typical form has dark brown elytra, while the mostly white 'quadrimaculatus' form and several named intermediates occur alongside it in Benin, eastern Nigeria and western Cameroon.",
  },

  sections: [
    {
      id: "heaviest",
      title: "Heaviest insect: what the record actually says",
      body: [
        "Goliath beetles appear in almost every list of the world's heaviest insects, usually with a figure of 80 to 100 grams. That number is accurate and it is also misapplied. It refers to the final-instar larva — a fat, legless-looking white grub — and larval Goliathus have been weighed at at least 115 grams, which makes them the heaviest insect stage anyone has measured.",
        "The adult is a different animal. Metamorphosis discards a great deal of that mass in favour of a hard, flight-capable body, and the beetle that emerges weighs somewhere in the region of 40 to 60 grams. That is still enormous for an insect, and goliath and elephant beetles are the two groups routinely reported above 50 grams.",
        "The heaviest adult insect ever confirmed on a scale is not a beetle at all: it is a gravid female giant wētā from New Zealand at 71 grams. Whether an exceptional goliath could beat that is an open question, because nobody has produced a verified weighing that does. The honest version of the record is that the larvae are the heaviest insects known and the adults are among the heaviest.",
      ],
    },
    {
      id: "horn",
      title: "The Y-shaped horn, and what it is for",
      body: [
        "Only males carry the head horn. It is black, forked at the tip into a shallow Y, and it is not a piercing weapon — it works as a lever. In contests at sap runs a male wedges the fork under a rival's body and prises him off the branch, which is enough to end the dispute without either beetle being injured.",
        "What they are fighting over is access: to a good sap flow, and to the females that come to it. Sap runs on damaged trees are a limited, concentrated resource, and a beetle that holds one is well placed for both feeding and mating.",
        "Females have no horn at all and use the head as a wedge for burrowing instead. The difference is the standard scarab arrangement — the same trade-off seen in rhinoceros and hercules beetles — and it is why male and female goliaths can look, at a glance, like two different species.",
      ],
    },
    {
      id: "life-cycle",
      title: "From protein to flight",
      body: [
        "The larval stage is where the size is built. Goliathus larvae feed in decaying plant material, and captive breeding uncovered something unusual about them: unlike almost every other flower-chafer grub, they cannot reach full size on rotten wood and leaf litter alone and need a substantial supply of protein. Breeders routinely supplement with commercial cat or dog food, which is odd but works, and the natural equivalent is still not properly understood.",
        "When the larva finishes feeding it builds a thin-walled cell of sandy soil, bound together and hardened, and pupates inside it. The adult forms within that cell and then stays there, dormant, until the dry season breaks.",
        "The rains are the trigger. Adults dig out, fly to sap runs and fruit, feed on the sugars that fuel flight, mate, and the females return to decaying matter to lay. In captivity the adult can live around a year; how long one lasts in an African forest, with birds, mammals and driver ants in it, has not been measured.",
      ],
    },
    {
      id: "collection",
      title: "Collected, bred and never assessed",
      body: [
        "Goliathus goliatus has been a prize for collectors since Europeans first encountered the genus, and it still is. Large males in good condition are valuable, and the species moves through the international trade both as dried specimens and as live stock for breeders — a market centred on Japan, Taiwan and Europe.",
        "That trade has one genuinely positive consequence: because hobbyists worked out how to rear the larvae, a great deal of what is known about the life cycle exists at all. It is also the reason nearly every figure quoted for the species — adult lifespan, larval duration, weight — describes a beetle raised in a plastic tub rather than one from a Cameroonian forest.",
        "Neither the trade nor the habitat loss underneath it has been evaluated by the IUCN. The species holds no Red List status, which is the case for the overwhelming majority of tropical insects. It means the work has not been done, not that the answer came back reassuring.",
      ],
    },
  ],

  related: ["hercules-beetle", "japanese-rhinoceros-beetle", "european-stag-beetle"],
  tags: ["beetle", "coleoptera", "africa", "scarab", "largest insects", "rainforest"],
  searchTerms: [
    "goliathus goliatus",
    "heaviest insect in the world",
    "goliath beetle size",
    "biggest beetle",
    "goliath beetle larvae",
  ],

  faqs: [
    {
      q: "Is the goliath beetle the heaviest insect in the world?",
      a: "Its larva almost certainly is — final-instar goliath grubs weigh 80 to 100 grams and at least one has been recorded at 115 grams, more than any other insect stage measured. The adult beetle is lighter, roughly 40 to 60 grams. The heaviest adult insect ever confirmed on a scale is a 71-gram gravid giant wētā from New Zealand.",
    },
    {
      q: "How big is a goliath beetle?",
      a: "Males of Goliathus goliatus reach about 5 to 11 centimetres in body length and females about 5.4 to 8 centimetres, which puts a large male comfortably across an adult human palm. Larvae are longer still — up to around 25 centimetres — but soft-bodied and C-shaped rather than armoured.",
    },
    {
      q: "What do goliath beetles eat?",
      a: "Adults feed on tree sap and ripe fruit, concentrating at sap runs on damaged trees where males compete for position. Larvae eat decaying plant material, but unusually for flower-chafer grubs they need a high-protein diet to reach full size; captive breeders supply this with commercial pet food.",
    },
    {
      q: "What is the goliath beetle's horn for?",
      a: "Only the male has one, and it is a lever rather than a spear. The Y-shaped head horn is wedged under a rival male and used to prise him off a branch during contests over sap runs and females. Fights are trials of leverage and rarely cause injury.",
    },
    {
      q: "Are goliath beetles endangered?",
      a: "The species has never been assessed by the IUCN, so it carries no status — which is true of most tropical insects and is not a finding of safety. Equatorial African forest is being cleared across its range, and large specimens are collected in quantity for the international beetle trade, but no population data exists to judge the effect.",
    },
  ],

  seo: {
    title: "Goliath Beetle — Size, Weight & the Heaviest-Insect Claim",
    description:
      "A researched profile of the goliath beetle (Goliathus goliatus): why the 100-gram record belongs to the larva rather than the adult, how the male's Y-shaped horn works, and what its unassessed status means.",
    keywords: [
      "goliath beetle facts",
      "goliathus goliatus",
      "heaviest insect",
      "goliath beetle size",
      "biggest beetle in the world",
    ],
  },

  sources: [
    {
      label: "Goliath beetle — entomologists' glossary",
      publisher: "Amateur Entomologists' Society",
      url: "https://www.amentsoc.org/insects/glossary/terms/goliath-beetle/",
    },
    {
      label: "Heaviest insect",
      publisher: "Guinness World Records",
      url: "https://www.guinnessworldrecords.com/world-records/heaviest-insect",
    },
    {
      label: "Goliathus goliatus (Linnaeus, 1771) — taxonomic record",
      publisher: "Global Biodiversity Information Facility (GBIF)",
      url: "https://www.gbif.org/species/1076779",
    },
    {
      label: "List of largest insects — weight comparisons and the giant wētā record",
      publisher: "Wikipedia",
      url: "https://en.wikipedia.org/wiki/List_of_largest_insects",
    },
  ],

  updatedAt: "2026-07-29",
};

export default goliathBeetle;
