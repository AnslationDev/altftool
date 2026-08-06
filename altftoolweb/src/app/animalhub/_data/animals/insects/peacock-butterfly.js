// Peacock butterfly — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const peacockButterfly = {
  slug: "peacock-butterfly",
  category: "insects",
  name: "Peacock Butterfly",
  scientificName: "Aglais io",
  otherNames: ["European peacock", "Inachis io"],

  summary:
    "A dead leaf on the outside and four staring eyes on the inside — and in a controlled experiment those eyespots were the difference between 97% of butterflies surviving a blue tit and 35%.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Peacock_butterfly_%28Aglais_io%29_2.jpg/1920px-Peacock_butterfly_%28Aglais_io%29_2.jpg",
    alt: "A peacock butterfly with open rust-red wings, each bearing a blue, black and yellow eyespot, feeding on white blackthorn blossom",
    credit: "Charles J. Sharp / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Aglais_%28Inachis%29_io_-_European_Peacock_-_Flickr_-_S._Rae_%282%29.jpg/1920px-Aglais_%28Inachis%29_io_-_European_Peacock_-_Flickr_-_S._Rae_%282%29.jpg",
      alt: "A peacock butterfly with wings spread flat, the four eyespots clearly visible against rust-red wings",
      credit: "S. Rae from Scotland, UK / Wikimedia Commons",
      title: "Four eyes, opened suddenly",
      caption:
        "The display only works because it is abrupt. A resting peacock is closed and near-black; the flick that exposes all four eyespots at once is what makes a small bird break off an attack.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/0Peacock%2C_Aglais_io_-_Flickr_-_Many_thanks_for_all_your_likes_and_comments._Great.jpg/1920px-0Peacock%2C_Aglais_io_-_Flickr_-_Many_thanks_for_all_your_likes_and_comments._Great.jpg",
      alt: "A peacock butterfly basking with wings held wide open on bare, stony ground",
      credit: "pete beard / Wikimedia Commons",
      title: "Basking on bare ground",
      caption:
        "A butterfly that has just come out of hibernation cannot fly until its flight muscles are warm. Spreading the dark wings flat against sun-warmed stone or soil is how a peacock gets airborne on a cold March morning.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Butterfly_Aglais_io.jpg/1920px-Butterfly_Aglais_io.jpg",
      alt: "A peacock butterfly at rest on vegetation with its wings open, eyespots facing the camera",
      credit: "Sergei Mosin / Wikimedia Commons",
      title: "Common, and getting commoner",
      caption:
        "Unusually for a European butterfly, the peacock is expanding rather than retreating — it has pushed north through Britain and Ireland in recent decades, and in 2026 was voted Britain's favourite butterfly.",
    },
  ],

  headline: "A dead leaf that opens into a face",
  intro: [
    "Closed, a peacock butterfly is a ragged piece of blackish-brown litter, almost invisible against bark or leaf mould. Open, it is rust-red with four large eyespots in blue, black and yellow, one on each wing. The switch between those two states is the entire defensive system, and it is one of the best-tested in any insect.",
    "It also runs its life backwards relative to most butterflies. Adults emerging in late summer do not breed; they feed hard, find a shed or a hollow tree, and hibernate as adults through the winter. That is why the peacock is often the first large butterfly on the wing in March, weeks before anything has had time to develop from an egg.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Arthropoda",
    class: "Insecta",
    order: "Lepidoptera",
    family: "Nymphalidae",
    genus: "Aglais",
    species: "Aglais io",
  },

  conservation: {
    status: "NE",
    assessmentYear: null,
    populationTrend: "increasing",
    populationEstimate:
      "No population figure; among the most frequently recorded butterflies in Europe, and expanding northwards through Britain and Ireland",
    note: "There is no global Red List assessment for this species — the status here is Not Evaluated, and any 'Least Concern' you see attached to the peacock is a regional listing rather than a world one. It was assessed as Least Concern for Europe in the 2010 European Red List of Butterflies, and holds the same regional status in Britain, but neither of those is a global assessment. In this case the distinction is less alarming than usual: the peacock is genuinely common, is one of the few European butterflies expanding its range rather than contracting, and has moved steadily north through Britain and Ireland over recent decades. Its food plant, common nettle, is abundant everywhere fertile ground is disturbed, which is most of the continent.",
  },

  measurements: [
    {
      key: "wingspan",
      label: "Wingspan",
      value: "6.3–7.5 cm",
      min: 6.3,
      max: 7.5,
      unit: "cm",
      note: "Males 6.3–6.9 cm and females 6.7–7.5 cm; a medium-large nymphalid and a strong flier",
    },
    {
      key: "clutch-size",
      label: "Eggs per batch",
      value: "Up to about 400",
      max: 400,
      unit: "eggs",
      note: "Laid in a single mass on the underside of a nettle leaf, usually on a large patch in full sun",
    },
    {
      key: "lifespan-overwintering",
      label: "Lifespan (overwintering generation)",
      value: "Up to about 11 months",
      max: 11,
      unit: "months",
      note: "Butterflies emerging in July and August hibernate through the winter and breed the following spring, so a single individual spans most of a year",
    },
    {
      key: "lifespan-summer",
      label: "Lifespan (summer generation)",
      value: "A few weeks",
      unit: "weeks",
    },
    {
      key: "egg-duration",
      label: "Egg stage",
      value: "About one week",
      min: 1,
      max: 1,
      unit: "weeks",
    },
    {
      key: "elevation-limit",
      label: "Upper elevation",
      value: "Lowland to about 2,500 m",
      min: 0,
      max: 2500,
      unit: "m",
    },
  ],

  traits: [
    { key: "diet-larva", label: "Larval diet", value: "Common nettle, occasionally hop", icon: "Leaf" },
    { key: "diet-adult", label: "Adult diet", value: "Nectar — buddleia, thistles, ivy, and tree sap in spring", icon: "Flower" },
    { key: "defence", label: "Defence", value: "Eyespot startle display, backed by a hiss and a dead-leaf underside", icon: "Eye" },
    { key: "activity", label: "Activity", value: "Diurnal; males hold territories on the routes females use", icon: "Sun" },
    { key: "overwintering", label: "Overwintering", value: "As an adult, in sheds, hollow trees and outbuildings", icon: "Snowflake" },
  ],

  highlights: ["wingspan", "defence", "overwintering", "lifespan-overwintering"],

  distribution: {
    continents: ["Europe", "Asia"],
    regions: [
      "Almost all of Europe, north to central Scandinavia",
      "Britain and Ireland, expanding northwards",
      "Temperate Asia east to Japan",
      "The Caucasus and Russian Far East",
    ],
    habitats: [
      "Gardens and parks",
      "Woodland ride and edge",
      "Hedgerow, field margin and rough ground",
      "Meadow and pasture",
    ],
    elevation: "Lowland to around 2,500 m",
    note: "Two subspecies are recognised at the edges of the range: A. io caucasica in Azerbaijan and A. io geisha in Japan and the Russian Far East. In Britain the species has spread markedly northwards through Scotland over recent decades, one of a small number of butterflies whose range is growing rather than shrinking.",
  },

  sections: [
    {
      id: "eyespots",
      title: "The experiment that settled the eyespots",
      body: [
        "Eyespots are everywhere in the Lepidoptera, and for a long time their function was argued rather than measured — do they intimidate a predator, or simply deflect a strike away from the body? The peacock is the species on which the question was answered directly.",
        "Adrian Vallin, Sven Jakobsson, Johan Lind and Christer Wiklund published the trial in Proceedings of the Royal Society B in 2005. They painted out the eyespots on some butterflies, left others intact, and presented both to blue tits — a real predator of hibernating butterflies. The result was not marginal. Of 34 butterflies with intact eyespots, 33 survived. Of 20 with the eyespots painted over, only 7 did.",
        "The team tested the hissing separately, by disabling the sound. It made no measurable difference: seven of eight sound-producing butterflies survived and eight of eight silent ones did. The eyespots alone were so effective that any additional benefit from the noise could not be detected. When both were removed together, survival collapsed from nine out of nine to two out of ten.",
      ],
    },
    {
      id: "the-display",
      title: "How the display works",
      body: [
        "A peacock at rest holds its wings closed above its back, showing only the underside — near-black, finely striated, and an extremely good imitation of a dead leaf. Against tree bark or in a woodpile it disappears.",
        "Disturbed, it does something abrupt: it flicks the wings open and shut in a repeated sequence, exposing all four eyespots at once, and rubs the forewings against the hindwings to produce an audible hiss. To a small bird a few centimetres away, a piece of leaf litter has just become a face that is looking back.",
        "There is a second, inaudible channel as well. Bertel Møhl and Lee Miller showed in 1976 that as the wings open, a stiffened patch of membrane near the forewing base emits intense ultrasonic clicks whose frequency sits squarely in the most sensitive part of a bat's hearing. Captive bats presented with a clicking peacock jumped, called and retreated. Later work found the clicks send mice away without attacking. The hiss and the eyespots handle birds; the ultrasound handles the things that hunt by ear.",
        "The important word is abrupt. The defence is not camouflage plus decoration — it is a two-stage system in which the first stage is not being noticed and the second is being suddenly, alarmingly conspicuous. A peacock that is discovered anyway still has a full second line of defence available, which is more than most butterflies can say.",
      ],
    },
    {
      id: "nettles",
      title: "Nettles, and the caterpillars on them",
      body: [
        "Females lay in batches of up to around 400 eggs on the underside of a common nettle leaf, choosing large sunny patches over shaded ones. The eggs are olive-green and ribbed, and hatch in about a week.",
        "The caterpillars are gregarious and unmissable: glossy black, covered in branched spines, spotted with white, and living together inside a communal silk web spun over the top of the nettle patch. They move as a group to fresh growth as they strip it, enlarging the web each time, and only disperse to pupate. The chrysalis hangs head-down from a stem, grey, brown or greenish, shaped rather like a curled leaf.",
        "Nettle is the whole story. Because common nettle thrives on disturbed, nitrogen-rich ground — field margins, roadsides, farmyards, neglected corners of gardens — the peacock has an essentially unlimited food supply across Europe, which is a large part of why it is doing well while more specialised butterflies are not.",
      ],
    },
    {
      id: "hibernation",
      title: "Wintering as a butterfly",
      body: [
        "Most butterflies overwinter as an egg, a caterpillar or a chrysalis. The peacock does it as an adult, which is a much harder trick and shapes its whole calendar. Individuals emerging in July and August feed heavily on buddleia, thistles and ivy, laying down fat, and then seek out somewhere dark, cool and dry — a shed, a garage, a hollow tree, a log pile — and shut down.",
        "One consequence is that the peacock is often the first big butterfly of the year, on the wing in March or even late February on a warm day, long before anything could have developed from an egg. Another is that individuals of the overwintering generation can live the better part of a year, against a few weeks for a summer butterfly.",
        "A third is that peacocks turn up indoors. A butterfly that settled into a cold outbuilding in September and then finds itself in a heated room in January has been woken far too early. The standard advice from butterfly conservation groups is to move it gently into an unheated shed or garage rather than releasing it into a frost — it needs cold and dark, not warmth.",
      ],
    },
  ],

  related: ["monarch-butterfly", "atlas-moth", "seven-spot-ladybird"],
  tags: ["butterfly", "lepidoptera", "eyespots", "europe", "nettle", "hibernation"],
  searchTerms: [
    "aglais io",
    "inachis io",
    "peacock butterfly eyespots",
    "peacock butterfly caterpillar",
    "butterfly hibernating in shed",
  ],

  faqs: [
    {
      q: "What are the peacock butterfly's eyespots for?",
      a: "They intimidate predators. In a 2005 experiment with blue tits, 33 of 34 butterflies with intact eyespots survived an attack, against only 7 of 20 whose eyespots had been painted over. The butterfly keeps its wings closed and looks like a dead leaf until disturbed, then flicks them open so that four eyes appear at once.",
    },
    {
      q: "Does the peacock butterfly make a noise?",
      a: "Yes — it rubs its forewings against its hindwings to produce an audible hiss, and the wing bases also emit intense ultrasonic clicks. In the 2005 blue tit trial the sound made no measurable difference; the eyespots did all the work. Against predators that hunt by ear it is a different story: work published in 1976 showed the clicks startle bats into retreating, and later trials found they turn mice away too.",
    },
    {
      q: "Where do peacock butterflies go in winter?",
      a: "They hibernate as adults in dark, cool, dry places — sheds, garages, hollow trees, log piles and outbuildings. That is why they can appear on the wing in March, before any butterfly could have developed from an egg that year, and why the overwintering generation can live close to eleven months.",
    },
    {
      q: "What do peacock butterfly caterpillars eat?",
      a: "Common nettle, and occasionally hop. Eggs are laid in batches of up to 400 on the underside of a nettle leaf in a sunny patch, and the black, white-speckled, spiny caterpillars feed communally inside a silk web spun over the nettle tops, moving to fresh growth as they strip it.",
    },
    {
      q: "Is the peacock butterfly rare?",
      a: "No. It is one of the commonest and most widespread butterflies in Europe and one of the few whose range is expanding rather than contracting, having spread north through Britain and Ireland in recent decades. It has never been assessed globally by the IUCN; the Least Concern listings attached to it are regional European and British assessments.",
    },
  ],

  seo: {
    title: "Peacock Butterfly — Eyespots, Hibernation & Nettle Caterpillars",
    description:
      "A researched profile of the peacock butterfly (Aglais io): the blue tit experiment that proved its eyespots work, the dead-leaf underside and hiss, its adult hibernation, and why nettles explain its success.",
    keywords: [
      "peacock butterfly",
      "aglais io",
      "peacock butterfly eyespots",
      "butterfly hibernating in shed",
      "peacock butterfly caterpillar",
    ],
  },

  sources: [
    {
      label: "Prey survival by predator intimidation: an experimental study of peacock butterfly defence against blue tits (Vallin et al., 2005)",
      publisher: "Proceedings of the Royal Society B, via PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC1564111/",
    },
    {
      label: "Ultrasonic clicks produced by the peacock butterfly: a possible bat-repellent mechanism (Møhl & Miller, 1976)",
      publisher: "Journal of Experimental Biology",
      url: "https://journals.biologists.com/jeb/article/64/3/639/22304/Ultrasonic-Clicks-Produced-by-the-Peacock",
    },
    {
      label: "European Red List of Butterflies (van Swaay et al., 2010) — regional assessment",
      publisher: "IUCN",
      url: "https://portals.iucn.org/library/efiles/documents/RL-4-011.pdf",
    },
    {
      label: "Peacock — species profile, status and life cycle",
      publisher: "Butterfly Conservation",
      url: "https://butterfly-conservation.org/butterflies/peacock",
    },
    {
      label: "Aglais io (Linnaeus, 1758) — taxonomic record",
      publisher: "Global Biodiversity Information Facility (GBIF)",
      url: "https://www.gbif.org/species/4535827",
    },
  ],

  updatedAt: "2026-07-29",
};

export default peacockButterfly;
