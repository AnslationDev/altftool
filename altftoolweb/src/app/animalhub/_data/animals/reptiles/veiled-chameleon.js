// Veiled chameleon — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const veiledChameleon = {
  slug: "veiled-chameleon",
  category: "reptiles",
  name: "Veiled Chameleon",
  scientificName: "Chamaeleo calyptratus",
  otherNames: ["Yemen chameleon", "Cone-head chameleon"],

  summary:
    "An Arabian chameleon with a helmet-like casque, a tongue fired by elastic recoil, and the unusual habit of eating leaves — now established as an invasive population in Florida and on Maui.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Yemen_Chameleon.jpg/1920px-Yemen_Chameleon.jpg",
    alt: "A veiled chameleon showing the tall casque on top of its head",
    credit: "Kupos / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/2017-03-30_AT_Wien_22_Donaustadt%2C_Palmenhaus_Hirschstetten%2C_Chamaeleo_calyptratus_%2851675800864%29.jpg/1920px-2017-03-30_AT_Wien_22_Donaustadt%2C_Palmenhaus_Hirschstetten%2C_Chamaeleo_calyptratus_%2851675800864%29.jpg",
      alt: "A veiled chameleon photographed among foliage in the Palmenhaus Hirschstetten glasshouse, Vienna",
      credit: "Paul Korecky / Wikimedia Commons",
      title: "Built entirely for branches",
      caption:
        "The toes are fused into two opposed bundles — two on one side, three on the other — so each foot closes on a stem like a pair of tongs. Combined with a prehensile tail used as a fifth limb, it gives a grip secure enough that a chameleon can hold position with no muscular effort while it waits for prey.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/2017-03-30_AT_Wien_22_Donaustadt%2C_Palmenhaus_Hirschstetten%2C_Chamaeleo_calyptratus_%2851677675249%29.jpg/1920px-2017-03-30_AT_Wien_22_Donaustadt%2C_Palmenhaus_Hirschstetten%2C_Chamaeleo_calyptratus_%2851677675249%29.jpg",
      alt: "A veiled chameleon in the Palmenhaus Hirschstetten glasshouse, Vienna, with the raised casque visible above its head",
      credit: "Paul Korecky / Wikimedia Commons",
      title: "The casque, and what it is for",
      caption:
        "The bony crest reaches about 5 cm in adult males and stays much lower in females, making it the easiest way to sex an adult. Its function is still argued over — water collection from overnight condensation is the most commonly cited explanation, with heat loss and sound production as competing ideas.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/2017-03-30_AT_Wien_22_Donaustadt%2C_Palmenhaus_Hirschstetten%2C_Chamaeleo_calyptratus_%2851677885020%29.jpg/1920px-2017-03-30_AT_Wien_22_Donaustadt%2C_Palmenhaus_Hirschstetten%2C_Chamaeleo_calyptratus_%2851677885020%29.jpg",
      alt: "A veiled chameleon photographed in the Palmenhaus Hirschstetten glasshouse, Vienna",
      credit: "Paul Korecky / Wikimedia Commons",
      title: "Two eyes, two directions",
      caption:
        "Each eye sits in a scaled turret and swivels independently, so the animal can scan behind and in front at once without moving its body. Only when a target is chosen do both eyes lock forward together, giving the depth judgement the tongue strike depends on.",
    },
  ],

  headline: "A desert chameleon with a helmet and a ballistic tongue",
  intro: [
    "The veiled chameleon comes from the south-western corner of the Arabian Peninsula — the highlands and wadis of Yemen and Saudi Arabia's Asir province — which is a dry, seasonal place for an animal that most people picture in rainforest. Much of what makes it distinctive follows from that: a tall bony casque above the head, a tolerance of temperature swings, and the habit, rare among chameleons, of eating leaves as well as insects.",
    "It is also one of the few chameleons that breeds readily in captivity, so nearly every one in the pet trade is captive-bred rather than wild-caught. That same hardiness is why escaped and released animals have taken hold outside their range, with established breeding populations now in southern Florida and Upcountry Maui.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Reptilia",
    order: "Squamata",
    family: "Chamaeleonidae",
    genus: "Chamaeleo",
    species: "Chamaeleo calyptratus",
  },

  conservation: {
    status: "LC",
    assessmentYear: 2012,
    populationTrend: "unknown",
    populationEstimate: "No population estimate published",
    note: "Genuinely assessed, not merely unlisted: Wilms, Sindaco and Shobrak evaluated the species for the Red List in 2012 and found it common and widespread across its native range, with collection for the pet trade not judged to threaten it. The assessment is now well over a decade old and carries no population figure. International trade is regulated under CITES Appendix II, which covers the genus Chamaeleo. Outside its native range the concern runs the other way — established populations in Florida and Hawaii are treated as invasive, and Hawaii state law prohibits importing or moving chameleons within the islands.",
  },

  measurements: [
    {
      key: "length",
      label: "Total length",
      value: "Males 43–61 cm; females up to about 35 cm",
      min: 25,
      max: 61,
      unit: "cm",
      note: "Including the prehensile tail, which is roughly half the total. Females are shorter but noticeably heavier-bodied for their size",
    },
    {
      key: "weight",
      label: "Weight",
      value: "Males 100–200 g; females 90–120 g",
      min: 90,
      max: 200,
      unit: "g",
    },
    {
      key: "casque-height",
      label: "Casque height",
      value: "Up to about 5 cm in adult males",
      min: 5,
      max: 5,
      unit: "cm",
      note: "Much lower in females, which is the clearest way to tell the sexes apart in adults",
    },
    {
      key: "clutch-size",
      label: "Clutch size",
      value: "30–95 eggs",
      min: 30,
      max: 95,
      unit: "eggs",
      note: "Up to three clutches a year, each buried in a burrow the female digs in the ground",
    },
    {
      key: "incubation",
      label: "Incubation",
      value: "Around 200 days",
      min: 150,
      max: 270,
      unit: "days",
      note: "Development pauses first: embryos sit in diapause for roughly 60 to 75 days before growth begins, which is why the eggs take six to eight months to hatch",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "4–5 months",
      min: 4,
      max: 5,
      unit: "months",
      note: "Extremely fast for a reptile, and a large part of why introduced populations establish so readily",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "Males up to about 8 years; females around 5",
      min: 5,
      max: 8,
      unit: "years",
      note: "The gap is generally attributed to the physiological cost of producing repeated large clutches",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Insectivore — and, unusually for a chameleon, also eats leaves", icon: "Bug" },
    { key: "activity", label: "Activity", value: "Diurnal", icon: "Sun" },
    { key: "tongue-projection", label: "Tongue", value: "Ballistic, powered by elastic recoil rather than muscle contraction", icon: "Zap" },
    { key: "heat-sensing", label: "Heat sensing", value: "None — hunts entirely by sight, with eyes that aim independently", icon: "Thermometer" },
    { key: "shedding-frequency", label: "Shedding", value: "Often while growing, in flakes and patches rather than one whole skin", icon: "RefreshCw" },
    { key: "ecological-role", label: "Ecological role", value: "Arboreal insect predator — and an invasive one where it has been released", icon: "Globe" },
  ],

  highlights: ["length", "casque-height", "tongue-projection", "clutch-size"],

  distribution: {
    continents: ["Asia"],
    regions: [
      "Yemen",
      "South-western Saudi Arabia (Asir province)",
      "Introduced: southern Florida, United States",
      "Introduced: Maui, Hawaii",
    ],
    habitats: [
      "Arid mountain plateau",
      "Wadi and valley scrub",
      "Coastal woodland",
      "Gardens, orchards and agricultural edge",
    ],
    elevation: "Sea level to around 2,500 m",
    note: "Two subspecies are recognised — Chamaeleo calyptratus calyptratus in Yemen and C. c. calcarifer in south-western Saudi Arabia and possibly southern Yemen. The species does well on the edges of cultivation, which is one reason it settles so easily into suburban Florida and Hawaii.",
  },

  sections: [
    {
      id: "casque",
      title: "The casque",
      body: [
        "The casque is the ridge of bone running up and back from the snout, and in a large male it stands about five centimetres above the skull. Females have one too, but far lower, which makes it the standard way to sex an adult. Hatchlings emerge with only a slight rise; the crest grows with the animal.",
        "What it is for has never been settled. The explanation given most often is water: on cold nights in an arid landscape, condensation forms on the crest and runs down the channel towards the mouth, which would matter a great deal to an animal that does not recognise standing water as something to drink from. Competing suggestions are that it sheds heat, or that it amplifies the low buzzing vibration the species uses in close-range communication.",
        "There is no reason all three cannot be partly true, and no reason the structure needs a single function. What is clear is that it is under sexual selection — the size difference between males and females is too large to be explained by physiology alone.",
      ],
    },
    {
      id: "tongue",
      title: "A tongue fired by elastic recoil",
      body: [
        "A chameleon does not throw its tongue with muscle. Muscle contraction is too slow. Instead, an accelerator muscle squeezes along a stiff cartilage core, stretching sheets of collagen wrapped around it; when the tongue clears the end of the core, those sheets snap back and release their stored energy in a few thousandths of a second. The tongue leaves the mouth ballistically, reaching well beyond a body length, and a sticky, suction-cupping pad at the tip does the rest.",
        "The advantage of storing energy elastically shows up in the cold. Muscle loses power sharply as temperature drops; a stretched spring does not care. Anderson and Deban, working with veiled chameleons, found that peak projection velocity and power fell by only 10 to 19% for each 10 °C drop, while muscle-powered tongue retraction lost more than 42% over the same interval. The animals caught prey at the same distances across the whole range from 15 °C to 35 °C.",
        "For a lizard in the Yemeni highlands, where mornings are cold and the day heats fast, that is the difference between eating early and waiting. It is also a neat demonstration of a general principle: elastic mechanisms buy ectotherms performance that their muscles alone could not deliver.",
      ],
    },
    {
      id: "senses",
      title: "Eyes, and what colour change is really doing",
      body: [
        "The eyes are the other half of the hunting system. Each sits in a conical scaled turret with only a pinhole of pupil showing, and each rotates independently through a wide arc, so a chameleon can watch two directions at once and cover nearly its whole surroundings without moving. When a target is selected, both eyes swing forward and converge, and the strike follows from that binocular fix.",
        "Colour change is more misunderstood. Chameleons do not primarily match their backgrounds. The colours come from layers of iridophore cells containing lattices of guanine nanocrystals; by relaxing or tightening the spacing between crystals, the animal changes which wavelengths the lattice reflects. Pigment cells above and below modify the result.",
        "What that machinery is mostly used for is signalling and temperature. A male displaying at a rival turns bright and high-contrast; a submissive or gravid female has her own distinct pattern, and in this species a gravid female's colouration is unmistakable enough that keepers read it directly. Darkening also absorbs more heat on a cold morning, and paling reflects it at midday.",
      ],
    },
    {
      id: "reproduction",
      title: "Eggs, diapause and a fast start",
      body: [
        "Veiled chameleons lay eggs rather than bearing live young. A female descends to the ground, digs a burrow, deposits 30 to 95 eggs and covers them over, and may do this up to three times in a year. The clutches are enormous for the size of the animal, and producing them repeatedly is the usual explanation for why females live noticeably shorter lives than males.",
        "The eggs then do almost nothing for two months. Embryos enter a diapause lasting roughly 60 to 75 days before development begins at all, so the full incubation runs to around 200 days — six to eight months — at typical temperatures. In the wild this stalls hatching until conditions are right; in captivity it regularly convinces first-time keepers that a clutch has failed.",
        "Unlike crocodilians and sea turtles, this species does not let temperature choose the sex of its young. A controlled incubation study found sex ratios close to one to one across the whole viable temperature range, establishing genetic rather than temperature-dependent sex determination — and undercutting anecdotal claims among breeders that incubation temperature could be used to skew a clutch.",
        "Hatchlings are independent immediately and reach breeding condition in four to five months, which for a vertebrate is very quick indeed.",
      ],
    },
    {
      id: "invasive",
      title: "The populations that were not supposed to be there",
      body: [
        "The species reached the United States through the pet trade, and stayed. The first Florida record came from a vacant lot in Fort Myers, Lee County, in 2002, and the state now has animals at several independent sites including Alachua, Collier, Hendry and Lee counties. Some of the introductions look less like escapes than deliberate seeding by collectors intending to harvest the offspring.",
        "Hawaii's problem is on Maui, where a breeding population is established in Upcountry districts; a single animal turned up on Kauai in 2004 and was not recovered. Hawaii regulates chameleons as injurious wildlife, and importing them or moving them between islands is prohibited — the concern being an arboreal, visually hunting predator loose in an island fauna of native birds and invertebrates that evolved without anything of the kind.",
        "The traits that make it a good pet are exactly the traits that make it a good invader: a broad temperature tolerance, a willingness to eat plants when insects are short, maturity in under half a year, and clutches of up to 95 eggs three times annually. A species assessed as Least Concern at home can still be a serious management problem three thousand miles away, and this one is a clean example of the distinction.",
      ],
    },
  ],

  related: ["komodo-dragon", "king-cobra"],
  tags: ["chameleon", "lizard", "arabia", "invasive", "pet trade", "reptile"],
  searchTerms: ["chamaeleo calyptratus", "yemen chameleon", "cone-head chameleon", "chameleon tongue", "casque"],

  faqs: [
    {
      q: "What is the veiled chameleon's casque for?",
      a: "It is not settled. The most commonly cited explanation is water collection — overnight condensation forms on the crest and runs down towards the mouth, which would be valuable in the dry Arabian highlands where the species lives. Heat dissipation and amplification of a low buzzing vibration used in communication have also been proposed. Males have much taller casques than females, so display almost certainly plays a part.",
    },
    {
      q: "How does a chameleon's tongue work?",
      a: "By elastic recoil, not muscle power. An accelerator muscle squeezes along a stiff cartilage core and stretches collagen sheaths around it; when the tongue slides off the end of the core the sheaths snap back and launch it ballistically in a few thousandths of a second. Because the energy is stored in elastic tissue rather than delivered by contracting muscle, the strike stays fast in the cold — veiled chameleons caught prey equally well at 15 °C and 35 °C in laboratory tests.",
    },
    {
      q: "Do veiled chameleons change colour to match their surroundings?",
      a: "Not really. Colour change comes from lattices of guanine nanocrystals in iridophore cells, which shift the wavelengths they reflect as the animal adjusts the spacing between them. It is used mainly for signalling — dominance, submission, and pregnancy in females — and for thermoregulation, with darker colouration absorbing heat. Camouflage is a secondary effect at best.",
    },
    {
      q: "Is the veiled chameleon endangered?",
      a: "No. It was assessed for the IUCN Red List in 2012 and listed as Least Concern, being common and widespread in Yemen and south-western Saudi Arabia, with pet-trade collection not judged to threaten it. Trade is nonetheless regulated under CITES Appendix II, and almost all animals in the trade today are captive-bred.",
    },
    {
      q: "Why are veiled chameleons a problem in Florida and Hawaii?",
      a: "Because escaped and released pets have established breeding populations outside their native range — at several sites in Florida since 2002, and in Upcountry Maui. They mature in four to five months, lay up to 95 eggs as often as three times a year, tolerate a wide temperature range and will eat plants when insects are scarce. In Hawaii in particular, an arboreal visual predator poses a real risk to native birds and insects, and state law prohibits importing chameleons or moving them between islands.",
    },
  ],

  seo: {
    title: "Veiled Chameleon — Casque, Tongue, Colour Change & Invasive Range",
    description:
      "A researched profile of the veiled chameleon (Chamaeleo calyptratus): its Arabian range, the function of the casque, an elastically powered ballistic tongue, how colour change actually works, and its invasive populations in Florida and Hawaii.",
    keywords: [
      "veiled chameleon facts",
      "chamaeleo calyptratus",
      "yemen chameleon",
      "chameleon tongue",
      "veiled chameleon invasive florida",
    ],
  },

  sources: [
    {
      label: "Chamaeleo calyptratus — Red List assessment",
      publisher: "IUCN Red List of Threatened Species (Wilms, Sindaco & Shobrak, 2012)",
      url: "https://www.iucnredlist.org/species/176306/1437838",
    },
    {
      label: "Chamaeleo calyptratus entry",
      publisher: "The Reptile Database",
      url: "https://reptile-database.reptarium.cz/species?genus=Chamaeleo&species=calyptratus",
    },
    {
      label: "Ballistic tongue projection in chameleons maintains high performance at low temperature",
      publisher: "PNAS (Anderson & Deban, 2010)",
      url: "https://www.pnas.org/doi/10.1073/pnas.0910778107",
    },
    {
      label: "Veiled chameleon — invasive species profile",
      publisher: "Hawaii Invasive Species Council",
      url: "https://dlnr.hawaii.gov/hisc/info/invasive-species-profiles/veiled-chameleon/",
    },
  ],

  updatedAt: "2026-07-29",
};

export default veiledChameleon;
