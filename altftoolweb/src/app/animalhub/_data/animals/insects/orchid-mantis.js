// Orchid mantis — Animal Hub content file.
//
// Follows the canonical contract documented in _lib/animalModel.js.
// Plain serialisable data only: no imports, no functions, no JSX.

const orchidMantis = {
  slug: "orchid-mantis",
  category: "insects",
  name: "Orchid Mantis",
  scientificName: "Hymenopus coronatus",
  otherNames: ["Walking flower mantis", "Orchid-blossom mantis", "Pink orchid mantis"],

  summary:
    "A pink-and-white mantis with petal-shaped legs that does not, in fact, imitate any particular orchid — it is a generalised flower lure, and field tests found it pulled in pollinators faster than real blooms did.",

  heroImage: {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Mantis_Hymenopus_coronatus_6_Luc_Viatour.jpg/1920px-Mantis_Hymenopus_coronatus_6_Luc_Viatour.jpg",
    alt: "A pink and white orchid mantis with broad petal-shaped lobes on its four walking legs",
    credit: "Luc Viatour / Wikimedia Commons",
  },
  gallery: [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Orchid_mantis_%28Hymenopus_coronatus%29%2C_Entomica.jpg",
      alt: "A small pink and white orchid mantis perched on a person's fingertips at an insect exhibit",
      credit: "Fungus Guy / Wikimedia Commons",
      title: "The lure begins early",
      caption:
        "Nymphs take up the flower form from their second stage onward. The very first instar is different — small, red and black, and thought to resemble an assassin bug, an insect with a bad bite and a worse taste.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Hymenopus_coronatus_Resting_on_Orchid_Petals.jpg/1920px-Hymenopus_coronatus_Resting_on_Orchid_Petals.jpg",
      alt: "A cream-white orchid mantis standing on the magenta petals of an orchid bloom against a black background",
      credit: "MicrocosmicWorld / Wikimedia Commons",
      title: "The flower is optional",
      caption:
        "Photographs like this created the myth. Field experiments found the opposite: a mantis sitting on nothing at all attracted more pollinators than the surrounding flowers, so the bloom is scenery rather than a requirement.",
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Mantis_Hymenopus_coronatus_1_Luc_Viatour.jpg/1920px-Mantis_Hymenopus_coronatus_1_Luc_Viatour.jpg",
      alt: "Close view of a pale orchid mantis against blue sky, showing the toothed edge of its folded raptorial foreleg beside a broad petal-like leg lobe",
      credit: "Luc Viatour / Wikimedia Commons",
      title: "Four petals and two blades",
      caption:
        "Only the four walking legs carry the petal lobes. The front pair is an ordinary mantis strike apparatus — spined, folded and fast — kept tucked beneath the head until something lands.",
    },
  ],

  headline: "Not a flower mimic. Something better.",
  intro: [
    "For more than a century the orchid mantis was the textbook case of aggressive mimicry: an insect shaped and coloured like an orchid bloom, sitting among real orchids, snatching the pollinators that came to the wrong flower. It is a good story, and almost every part of it turned out to be wrong.",
    "When researchers finally tested it in the Malaysian forest, they found the mantis does not match any particular flower species in shape or colour, is not usually found on flowers at all, and — sitting alone on bare vegetation — attracted more pollinating insects than the surrounding blooms did. It is not impersonating an orchid. It is a generalised flower signal that outperforms the real thing.",
  ],

  taxonomy: {
    kingdom: "Animalia",
    phylum: "Arthropoda",
    class: "Insecta",
    order: "Mantodea",
    family: "Hymenopodidae",
    genus: "Hymenopus",
    species: "Hymenopus coronatus",
  },

  conservation: {
    status: "NE",
    assessmentYear: null,
    populationTrend: "unknown",
    populationEstimate:
      "No population estimate exists for any part of the range; the species is rarely encountered in the field even where it is known to occur",
    note: "Never assessed against the Red List criteria, which is the norm for mantises rather than a finding that the species is secure. Two pressures are documented rather than inferred. The first is the clearance and fragmentation of Southeast Asian lowland rainforest across Malaysia, Indonesia and Indochina, which is the only habitat the species is known from. The second is the live pet trade: the orchid mantis is one of the most sought-after mantises in captivity, and while much of the supply is now captive-bred, wild collection continues and there is no monitoring of what it removes. Nobody knows whether the population is stable, because nobody has counted.",
  },

  measurements: [
    {
      key: "body-length",
      label: "Body length (female)",
      value: "About 6–8 cm",
      min: 6,
      max: 8,
      unit: "cm",
      note: "Males reach only about 2.5–3 cm — among the most extreme size differences of any mantis. These figures come from captive rearing rather than a published field survey.",
    },
    {
      key: "lifespan",
      label: "Lifespan",
      value: "About 5–9 months",
      min: 5,
      max: 9,
      unit: "months",
      note: "Males mature after fewer moults, several weeks ahead of females, and die correspondingly sooner",
    },
    {
      key: "nymphal-moults",
      label: "Nymphal moults",
      value: "About six (male) to seven (female)",
      min: 6,
      max: 7,
      unit: "moults",
      note: "The extra moult is most of the reason females end up so much larger",
    },
    {
      key: "eggs-laid",
      label: "Eggs per ootheca",
      value: "Roughly 40–130",
      min: 40,
      max: 130,
      unit: "eggs",
      note: "Counts come from captive breeding and vary widely between reports; the case is a small frothed pad glued to a stem or the underside of a leaf, and hatches after about four to six weeks",
    },
  ],

  traits: [
    { key: "diet-type", label: "Diet", value: "Flying insects, especially bees, flies and butterflies", icon: "Bug" },
    { key: "hunting-strategy", label: "Hunting", value: "Aggressive mimicry — attracts prey rather than pursuing it", icon: "Flower" },
    { key: "camouflage", label: "Colour change", value: "Shifts between pink and brown over successive moults", icon: "Palette" },
    { key: "activity", label: "Activity", value: "Diurnal; sits still for hours, swaying in the breeze", icon: "Sun" },
    { key: "ecological-role", label: "Ecological role", value: "Ambush predator of pollinating insects", icon: "Target" },
  ],

  highlights: ["body-length", "hunting-strategy", "camouflage", "lifespan"],

  distribution: {
    continents: ["Asia"],
    regions: [
      "Peninsular Malaysia and Singapore",
      "Indonesia, principally Sumatra and Java",
      "Thailand, Myanmar, Cambodia, Laos and Vietnam",
      "Possibly far northeastern India and Bangladesh",
    ],
    habitats: [
      "Lowland tropical rainforest",
      "Forest edge and secondary growth",
      "Shrub layer and understorey vegetation",
    ],
    elevation: "Lowland forest; no reliable upper limit has been published",
    note: "The species is patchily recorded across Southeast Asia and is genuinely uncommon to find, which is one reason so much of what was written about it went untested for so long. The northernmost historic record, from Assam in 1878, sits well outside the core range and has not been repeated.",
  },

  sections: [
    {
      id: "the-correction",
      title: "What the mantis actually does",
      body: [
        "The classic account goes back to a description by Nelson Annandale in 1900, popularised by Hugh Cott, of a pink-and-white mantis nymph hunting on the blooms of a Straits rhododendron and functioning, in Cott's phrase, as a decoy. From there it hardened into the version everyone repeats: the orchid mantis mimics an orchid, hides among orchids, and eats the pollinators that mistake it for one.",
        "James O'Hanlon, Gregory Holwell and Marie Herberstein tested it in peninsular Malaysia and published the results in 2014. Using bee, fly and bird vision models they showed the mantis's colour is indistinguishable from that of sympatric flowers to a hymenopteran eye — but not from any one flower in particular. A second paper the same year compared the shape of the mantis's femoral lobes with the petals of local flowers using geometric morphometrics and found no specific model either. Their conclusion was that the mantis works by generalised food deception, not by mimicking a species.",
        "The field experiment settled the more important question. Mantises placed alone on vegetation, with no flowers nearby, attracted wild pollinators at a higher rate than the surrounding flowers themselves — and then ate them. That is the part worth holding on to: this is not an insect hiding in a flower. It is an insect that has become a better advertisement for nectar than the flowers are, and it does not need a flower to work.",
      ],
    },
    {
      id: "anatomy",
      title: "How the signal is built",
      body: [
        "The four walking legs carry broad, flattened lobes on the femora, cream to pink, edged in a slightly deeper shade. They are what reads as petals. The abdomen is held raised and curled, adding bulk to the outline, and the whole animal rocks gently from side to side in a way that resembles a bloom moving in wind — a behaviour shared with other flower mantises and with several stick insects.",
        "The raptorial forelegs are not disguised at all. They are the standard mantis apparatus: spined tibiae that fold against spined femora, held under the head, capable of closing on a target in a few hundredths of a second. A mantis that has been advertising for an hour needs the strike to take only one.",
        "Colour is not fixed. Individuals shift between pink and brown across moults, tracking the background they are sitting against, so a mantis on a green leaf and one on a dying frond are not necessarily different individuals photographed differently. The first-stage nymph is the exception to everything else here: it is red and black, and is generally interpreted as a mimic of assassin bugs, which bite hard and taste foul.",
      ],
    },
    {
      id: "size-gap",
      title: "Why the female is a giant",
      body: [
        "Adult females reach six to eight centimetres. Adult males rarely exceed three, and are slender, long-winged and mobile where the female is broad and sedentary. Sexual size dimorphism this extreme is unusual even among mantises, which are dimorphic to begin with.",
        "The standard explanation for large females in insects is fecundity: a bigger body carries more eggs. A 2016 analysis of flower mantises tested that and found it did not hold. Female size correlated with the degree of dimorphism while male size did not, which points to female gigantism as the thing being selected rather than male dwarfism.",
        "The alternative the authors proposed is predatory. A large female can handle large pollinators — butterflies, big bees — that a small mantis cannot subdue, and the flower-lure strategy delivers exactly that class of prey. Size and the deception evolved together: the bigger the lure, the bigger the visitor it can attract, and the bigger the visitor it can then hold on to.",
      ],
    },
    {
      id: "captivity",
      title: "In captivity, and what that costs",
      body: [
        "The orchid mantis is among the most popular mantises in the international invertebrate trade, sold as nymphs and reared through to adults by hobbyists on a diet of flies and small crickets. Much of the trade is now supplied by captive breeding, which is genuinely better than the alternative, and a large share of what is known about the species' moulting, lifespan and colour change comes from those keepers rather than from fieldwork.",
        "That is also the problem. Almost every figure quoted for this species — adult size, number of moults, lifespan — traces back to captive animals, where temperature, humidity and food supply are nothing like a Malaysian forest. Field data on the species is thin enough that its distribution is still described in terms of country lists rather than populations.",
        "Wild collection continues alongside the captive supply, and there is no monitoring of it. Combined with the steady loss of Southeast Asian lowland forest, that leaves a species famous worldwide, photographed constantly, and effectively unmeasured in the place it actually lives.",
      ],
    },
  ],

  related: ["european-mantis", "atlas-moth", "western-honey-bee"],
  tags: ["mantis", "mantodea", "mimicry", "southeast asia", "ambush predator", "pollinators"],
  searchTerms: [
    "hymenopus coronatus",
    "pink orchid mantis",
    "walking flower mantis",
    "flower mantis",
    "does the orchid mantis mimic an orchid",
  ],

  faqs: [
    {
      q: "Does the orchid mantis really mimic an orchid?",
      a: "No. Research published in 2014 compared the mantis's colour and the shape of its leg lobes against the flowers growing around it in Malaysia and found no match to any particular species, orchid or otherwise. It works as a generalised flower-like signal instead — attractive to pollinators in the abstract rather than an impersonation of one bloom.",
    },
    {
      q: "Does the orchid mantis have to sit on a flower to hunt?",
      a: "No, and that is the surprising part. In field trials, mantises placed alone on bare vegetation attracted wild pollinators at a higher rate than the real flowers nearby. The insect is the lure; the flower adds nothing. Photographs of orchid mantises on blooms are mostly staged or opportunistic.",
    },
    {
      q: "Why are female orchid mantises so much bigger than males?",
      a: "Females reach six to eight centimetres and males only about two and a half to three. Analysis of flower mantises found this is driven by selection on female size rather than by egg-carrying capacity: a larger female can subdue large pollinators such as butterflies and big bees, which is exactly the prey the flower lure brings in.",
    },
    {
      q: "Are orchid mantises endangered?",
      a: "The species has never been assessed by the IUCN, so it holds no status — which is true of nearly all mantises and is not a verdict of safety. Its lowland Southeast Asian rainforest habitat is being cleared and fragmented, and wild individuals are still collected for the pet trade, but no population data exists to measure the effect.",
    },
    {
      q: "Why are baby orchid mantises red and black?",
      a: "Only the first nymphal stage looks like that, and it is a completely different disguise. The red-and-black first instar is thought to mimic assassin bugs of the family Reduviidae, which bite painfully and taste unpleasant. From the next moult onward the nymph switches to the pale, petal-lobed flower form the species is known for.",
    },
  ],

  seo: {
    title: "Orchid Mantis — Flower Lure, Not Flower Mimic",
    description:
      "A researched profile of the orchid mantis (Hymenopus coronatus): why the famous orchid-mimicry story was overturned, how its generalised flower signal out-attracts real blooms, and the extreme size gap between the sexes.",
    keywords: [
      "orchid mantis facts",
      "hymenopus coronatus",
      "orchid mantis mimicry",
      "flower mantis",
      "pink orchid mantis",
    ],
  },

  sources: [
    {
      label: "Pollinator deception in the orchid mantis (O'Hanlon, Holwell & Herberstein, 2014)",
      publisher: "The American Naturalist, via PubMed",
      url: "https://pubmed.ncbi.nlm.nih.gov/24334741/",
    },
    {
      label: "Predatory pollinator deception: does the orchid mantis resemble a model species? (2014)",
      publisher: "Current Zoology, Oxford Academic",
      url: "https://academic.oup.com/cz/article/60/1/90/1800993",
    },
    {
      label: "Selection for predation, not female fecundity, explains sexual size dimorphism in the orchid mantises (2016)",
      publisher: "Scientific Reports, via PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5131372/",
    },
    {
      label: "Hymenopus coronatus Olivier, 1792 — taxonomic record",
      publisher: "Global Biodiversity Information Facility (GBIF)",
      url: "https://www.gbif.org/species/1406471",
    },
  ],

  updatedAt: "2026-07-29",
  featured: true,
};

export default orchidMantis;
