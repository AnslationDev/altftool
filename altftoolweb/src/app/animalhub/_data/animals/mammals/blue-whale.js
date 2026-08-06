// Blue whale — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const blueWhale = {
  slug: "blue-whale",
  category: "mammals",
  name: "Blue Whale",
  scientificName: "Balaenoptera musculus",
  otherNames: ["Sulphur-bottom whale", "Sibbald's rorqual", "Great blue whale"],

  summary:
    "The largest animal known to have existed, heavier than any dinosaur for which there is reliable evidence, sustained entirely by shrimp-sized krill and reduced by twentieth-century whaling to a fraction of its original numbers.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Anim1754_-_Flickr_-_NOAA_Photo_Library.jpg/1920px-Anim1754_-_Flickr_-_NOAA_Photo_Library.jpg",
    alt: "A blue whale at the ocean surface",
    credit: "NOAA Photo Library / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Blue_Whale_%28Balaenoptera_musculus%29_%2816108163937%29.jpg/1920px-Blue_Whale_%28Balaenoptera_musculus%29_%2816108163937%29.jpg",
      alt: "A blue whale at the surface off Half Moon Bay, California, part of a loose group of about twenty-five animals",
      credit: "Gregory \"Slobirdr\" Smith / Wikimedia Commons",
      title: "Where the krill is",
      caption:
        "Blue whales are not social in the way dolphins are, but they aggregate wherever krill concentrates. Off California, cold water driven up from depth along the shelf edge fuels dense krill swarms in summer and autumn, and the whales arrive in loose groups that reflect the food rather than any bond between them.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/2023-08-04_Blue_whale_Isfjord_Svalbard_01.jpg/1920px-2023-08-04_Blue_whale_Isfjord_Svalbard_01.jpg",
      alt: "A blue whale in Isfjord, Svalbard, in the high Arctic",
      credit: "Carina Gsottbauer / Wikimedia Commons",
      title: "A return to Arctic water",
      caption:
        "Svalbard's waters were among the first grounds worked by industrial whaling, and blue whales disappeared from them almost entirely. Their reappearance around Isfjord is one of the visible signs that the North Atlantic population is rebuilding, more than half a century after protection.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/2023-08-04_Blue_whale_Isfjord_Svalbard_02.jpg/1920px-2023-08-04_Blue_whale_Isfjord_Svalbard_02.jpg",
      alt: "A blue whale surfacing in Isfjord, Svalbard",
      credit: "Carina Gsottbauer / Wikimedia Commons",
      title: "Breathing at the surface",
      caption:
        "A blue whale breathes through paired blowholes set behind a raised splash guard, exhaling a tall columnar blow that is the usual way the species is spotted at distance. Between breaths it can stay down for around a quarter of an hour, though most foraging dives are far shorter.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/2023-08-04_Blue_whale_Isfjord_Svalbard_03.jpg/1920px-2023-08-04_Blue_whale_Isfjord_Svalbard_03.jpg",
      alt: "A blue whale showing its long back and small dorsal fin in Isfjord, Svalbard",
      credit: "Carina Gsottbauer / Wikimedia Commons",
      title: "Only a fraction is ever visible",
      caption:
        "The dorsal fin sits far back along a body that can run to thirty metres, so what a surfacing animal shows is a long rolling stretch of back and very little else. Judging size from the surface is close to impossible, which is one reason reliable measurements came almost entirely from the whaling stations.",
    },
  ],

  headline: "The largest animal that has ever lived",
  intro: [
    "A large blue whale is about thirty metres long and can weigh 150 tonnes or more. Nothing in the fossil record is heavier on evidence that stands up: the biggest sauropod dinosaurs were longer in a few cases but far lighter, because a land animal has to hold itself up and a whale does not. Water carries the weight, and that single fact is what makes an animal of this size possible at all.",
    "It is sustained by krill — crustaceans a few centimetres long — which it takes by opening a pleated throat, engulfing a volume of water greater than its own body, and straining the catch through baleen. Twentieth-century whaling reduced the species by well over 90%, and it is still Endangered, though for the first time in a century the numbers are going up.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Chordata",
    class: "Mammalia",
    order: "Artiodactyla",
    family: "Balaenopteridae",
    genus: "Balaenoptera",
    species: "Balaenoptera musculus",
  },

  conservation: {
    status: "EN",
    assessmentYear: 2018,
    populationTrend: "increasing",
    populationEstimate: "Roughly 5,000–15,000 mature individuals; 10,000–25,000 in total",
    note: "Endangered globally, but increasing — the current listing is the 2019 errata version of the 2018 assessment. Recovery is uneven between populations. The Antarctic blue whale, the largest subspecies, is assessed separately as Critically Endangered: it fell from about 125,000 mature individuals in 1926 to around 3,000 in 2018, a decline of more than 97%. Whaling ended for the species in the 1960s and 1970s, and the modern threats are ship strikes, entanglement in fishing gear, underwater noise and the effect of a warming ocean on krill.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Length",
      value: "21–30 m",
      min: 21,
      max: 30,
      unit: "m",
      note: "Sexually mature females average 21–26.6 m depending on subspecies. The longest scientifically measured individual was 29.9 m; larger figures from whaling records are unreliable. Antarctic blue whales are the biggest",
    },
    {
      key: "weight",
      label: "Weight",
      value: "72–135 tonnes",
      min: 72,
      max: 135,
      unit: "t",
      note: "The heaviest reliably recorded blue whale weighed about 190 tonnes. Its heart alone weighs around 180 kg, the largest of any animal",
    },
    {
      key: "swimming-speed",
      label: "Swimming speed",
      value: "5–8 km/h cruising",
      min: 5,
      max: 8,
      unit: "km/h",
      note: "Bursts of over 30 km/h are recorded when the animal is disturbed by vessels or predators",
    },
    {
      key: "dive-depth",
      label: "Maximum dive depth",
      value: "About 315 m",
      min: 315,
      max: 315,
      unit: "m",
      note: "The deepest dive recorded from a tagged blue whale. Most feeding dives are far shallower, tracking the depth of the krill layer",
    },
    {
      key: "dive-duration",
      label: "Maximum dive time",
      value: "About 15 minutes",
      min: 15,
      max: 15,
      unit: "minutes",
      note: "Typical foraging dives run closer to ten minutes",
    },
    {
      key: "call-loudness",
      label: "Call loudness",
      value: "Up to 188 dB",
      min: 188,
      max: 188,
      unit: "dB",
      note: "Measured underwater on the marine scale (re 1 µPa at 1 m), which is not directly comparable with airborne decibel figures. The calls are very low in frequency and carry across whole ocean basins",
    },
    {
      key: "daily-food-intake",
      label: "Daily food intake",
      value: "Roughly 4 tonnes of krill",
      min: 4,
      max: 4,
      unit: "t/day",
      note: "Estimates vary widely. Older calculations put average intake nearer one tonne, while tag-based work published in 2021 suggests feeding-season consumption may be several times higher again. Blue whales feed intensively for part of the year and largely fast for the rest",
    },
    {
      key: "sexual-maturity",
      label: "Sexual maturity",
      value: "5–15 years",
      min: 5,
      max: 15,
      unit: "years",
      note: "Females average about ten years, males about twelve",
    },
    {
      key: "gestation",
      label: "Gestation",
      value: "About 10–12 months",
      min: 300,
      max: 365,
      unit: "days",
      note: "Females calve every two to three years",
    },
    {
      key: "litter-size",
      label: "Litter size",
      value: "1 calf",
      min: 1,
      max: 1,
      unit: "calf",
      note: "Born 6–7 m long and weighing 2–3 tonnes, gaining around 90 kg a day on milk alone",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "80–90 years",
      min: 80,
      max: 90,
      unit: "years",
      note: "The oldest individual aged from earplug growth layers was about 110",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Filter feeder — almost entirely krill", icon: "Fish" },
    { key: "social-structure", label: "Social structure", value: "Alone or in pairs; aggregates where food is dense", icon: "User" },
    { key: "echolocation", label: "Echolocation", value: "Absent — baleen whales use low-frequency calls instead", icon: "Waves" },
    { key: "ocean-range", label: "Ocean range", value: "All major oceans; scarce only in the high Arctic", icon: "Globe" },
  ],

  highlights: ["body-length", "weight", "call-loudness", "diet-type"],

  distribution: {
    continents: ["Africa", "Antarctica", "Asia", "Australia", "Europe", "North America", "South America"],
    regions: [
      "Southern Ocean and Antarctic waters",
      "Eastern North Pacific, from Costa Rica to the Gulf of Alaska",
      "North Atlantic, including Iceland and Svalbard",
      "Northern Indian Ocean and Arabian Sea",
      "Southern Chile",
      "Southern Australia and New Zealand",
    ],
    habitats: [
      "Open ocean",
      "Continental shelf edge and upwelling zones",
      "Polar feeding grounds",
      "Tropical and subtropical breeding waters",
    ],
    elevation: "Surface waters down to about 315 m on recorded dives",
    note: "Blue whales occur in every ocean but are unevenly spread, because they follow krill rather than coastline. Most populations move between cold, productive high-latitude feeding grounds in summer and warmer low-latitude waters in winter, though the pattern is not as rigid as it is in some other baleen whales. The northern Indian Ocean population is unusual in appearing to stay put year-round.",
  },

  sections: [
    {
      id: "size",
      title: "Why it can be this big",
      body: [
        "Size on land is limited by structure. A skeleton has to carry the animal, and the strength of bone scales more slowly than mass does, which is what caps terrestrial giants. In water, buoyancy removes that constraint almost entirely, and the limit shifts to something else: whether the animal can catch food fast enough to pay for its own metabolism.",
        "Blue whales solved that with lunge feeding, which is efficient at large scale in a way it is not at small scale. The bigger the mouth, the more water each lunge processes relative to the energy the lunge costs, so growth and feeding efficiency reinforce each other. That is the mechanism behind an animal that can reach thirty metres and 150 tonnes or more, with a heart of about 180 kg.",
        "The comparison with dinosaurs is often muddled. A few sauropods were longer than a blue whale, but reliable mass estimates put even the largest well below it. No animal for which there is solid evidence has been heavier.",
      ],
    },
    {
      id: "feeding",
      title: "Lunge feeding and krill",
      body: [
        "A blue whale feeds by accelerating into a krill swarm with its mouth open, letting the pleated grooves along its throat balloon outward until it has engulfed a volume of water greater than its own body. It then closes the mouth and forces the water out through several hundred baleen plates, which strain the krill and hold them back.",
        "The manoeuvre is violently expensive. The drag of an open mouth at speed brings the whale almost to a stop, and the jaw and throat have to absorb the load. It is only worth doing against dense prey, so the whale spends much of its time not feeding at all but searching, using dives that follow the depth of the krill layer up and down through the day.",
        "How much a blue whale actually eats is unsettled. Older calculations put the daily average near a tonne of krill; the commonly quoted figure is around four tonnes, and tag-based work published in 2021 suggested feeding-season intake may be several times higher still. What is not in doubt is the pattern: intense feeding in the productive months, and long stretches of the year running on stored blubber.",
      ],
    },
    {
      id: "voice",
      title: "The loudest voice in the ocean",
      body: [
        "Blue whale calls reach 188 dB on the underwater scale, making them among the loudest sounds any animal produces. They are also extremely low in frequency — near or below the bottom of human hearing — and low frequencies travel much further through seawater than high ones do, so the calls carry across ocean basins.",
        "What the calls are for is only partly understood. The long patterned songs appear to be produced by males and are probably reproductive, while shorter calls seem to keep dispersed animals in contact. There is no evidence that baleen whales echolocate: unlike dolphins and sperm whales they have no melon and no biosonar, and they appear to find food by memory, oceanography and possibly by listening.",
        "One well-documented change is that blue whale song across several populations has been dropping in pitch for decades. No explanation is settled, and proposals range from recovering population density to shifting ocean acoustics.",
      ],
    },
    {
      id: "migration",
      title: "Range and movement",
      body: [
        "Blue whales occur in every ocean, but they are distributed by food rather than by geography. The general pattern is a seasonal shift between cold, productive high-latitude waters where krill is abundant in summer and warmer waters at lower latitudes in winter, where calves are born.",
        "The pattern is looser than it is in humpbacks or gray whales. Some animals stay on feeding grounds year-round, some move on schedules that vary between individuals, and the northern Indian Ocean population appears to be resident rather than migratory. Eastern North Pacific animals make one of the better-documented movements, ranging between the waters off Central America and the Gulf of Alaska.",
        "That habit of following productivity to a small number of predictable places is also what makes blue whales vulnerable. Feeding aggregations tend to sit on continental shelf edges where upwelling occurs, and those are frequently the same waters that carry heavy shipping traffic.",
      ],
    },
    {
      id: "whaling",
      title: "Whaling and recovery",
      body: [
        "Blue whales were largely beyond the reach of hunters until the explosive harpoon and the steam catcher made it possible to kill and hold an animal that sinks when dead. Once factory ships could process carcasses at sea, the Southern Ocean population was destroyed within a few decades: catch records account for roughly 380,000 blue whales killed worldwide during the whaling era.",
        "The Antarctic subspecies took the worst of it, falling from about 125,000 mature individuals in 1926 to around 3,000 by 2018 — a decline of more than 97%, and the reason it is assessed separately as Critically Endangered. Protection came in 1966 in most waters, though illegal Soviet whaling continued for some years after.",
        "The global population is now estimated at 5,000 to 15,000 mature individuals and is increasing, which is why the assessment records an upward trend within an Endangered listing. Recovery is uneven: the eastern North Pacific has rebuilt substantially, while the Antarctic remains at a small fraction of its original size.",
        "The threats that remain are different in kind from whaling. Ship strikes kill whales on shipping lanes that overlap feeding grounds, entanglement in fishing gear drowns or slowly debilitates them, chronic vessel noise masks the low-frequency calls the species depends on, and warming and acidification are changing where and how much krill there is.",
      ],
    },
  ],

  related: ["african-savanna-elephant", "great-white-shark", "tiger"],
  tags: ["marine", "cetacean", "baleen whale", "filter feeder", "endangered", "largest animal"],
  searchTerms: ["balaenoptera musculus", "biggest animal in the world", "largest animal ever", "krill", "whale song"],

  faqs: [
    {
      q: "Is the blue whale really the largest animal that has ever lived?",
      a: "By mass, yes. A large blue whale can exceed 150 tonnes, and the heaviest reliably recorded weighed about 190. A few sauropod dinosaurs were longer, but the best mass estimates put all of them well below a blue whale, because a land animal has to support its own weight while a whale is held up by water.",
    },
    {
      q: "What do blue whales eat?",
      a: "Almost nothing but krill — crustaceans a few centimetres long. The whale lunges into a swarm with its mouth open, engulfing a volume of water greater than its own body, then forces the water out through baleen plates that trap the krill. Estimates of daily intake vary from around one tonne to several times that, and blue whales feed intensively for part of the year and largely fast for the rest.",
    },
    {
      q: "How loud is a blue whale?",
      a: "Their calls reach 188 dB on the underwater scale, among the loudest sounds produced by any animal — though underwater decibels are measured differently from airborne ones and the two figures cannot be compared directly. The calls are very low in frequency, which is why they carry for hundreds of kilometres through seawater.",
    },
    {
      q: "How many blue whales are left?",
      a: "Roughly 5,000 to 15,000 mature individuals, out of a total of perhaps 10,000 to 25,000. The species remains Endangered but the trend is upward. The Antarctic subspecies is the exception: it fell from about 125,000 mature animals in 1926 to around 3,000, and is assessed separately as Critically Endangered.",
    },
    {
      q: "Do blue whales echolocate?",
      a: "No. Echolocation belongs to the toothed whales — dolphins, porpoises and sperm whales — which have a melon and a biosonar system. Baleen whales have neither. Blue whales communicate with extremely low-frequency calls and appear to locate food through memory, oceanographic cues and possibly by listening rather than by projecting sound.",
    },
  ],

  seo: {
    title: "Blue Whale — Size, Feeding, Song & Conservation Status",
    description:
      "A researched profile of the blue whale (Balaenoptera musculus): the largest animal ever, how lunge feeding on krill makes that size possible, its ocean-crossing calls, and recovery after whaling.",
    keywords: [
      "blue whale facts",
      "balaenoptera musculus",
      "largest animal in the world",
      "how many blue whales are left",
      "blue whale size",
    ],
  },

  sources: [
    {
      label: "Balaenoptera musculus — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/2477/156923585",
    },
    {
      label: "Balaenoptera musculus ssp. intermedia (Antarctic blue whale) — Red List assessment",
      publisher: "IUCN Red List of Threatened Species",
      url: "https://www.iucnredlist.org/species/41713/50226962",
    },
    {
      label: "Blue whale species directory",
      publisher: "NOAA Fisheries",
      url: "https://www.fisheries.noaa.gov/species/blue-whale",
    },
    {
      label: "Blue whale species profile",
      publisher: "WWF",
      url: "https://www.worldwildlife.org/species/blue-whale",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default blueWhale;
