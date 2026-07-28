/**
 * Madhubani (Mithila) motif reference and panel layout planner.
 *
 * Two parts:
 *   1. A motif dataset — the local name, what the motif stands for in Mithila
 *      practice, the occasion it belongs to and how it is normally drawn.
 *   2. A layout planner. Madhubani panels are built as a bordered field divided
 *      into cells, each filled with one motif and no empty ground left. Given a
 *      paper size, border width and grid, the planner returns the exact cell
 *      size, the share of the sheet taken by the border and how many motifs the
 *      grid needs:
 *
 *        inner width  = width  - 2 x border
 *        inner height = height - 2 x border
 *        cell width   = inner width  / columns
 *        cell height  = inner height / rows
 *
 * All measurements are in centimetres. Pure functions; no DOM, no randomness
 * except through an explicit seed.
 */

export const STYLES = {
  bharni: {
    label: "Bharni",
    meaning: "Filled",
    note: "Bold outlines filled solidly with colour. Deities and large figures are usually painted this way.",
  },
  kachni: {
    label: "Kachni",
    meaning: "Line",
    note: "Fine hatched line work with little or no fill, so form is built entirely from stroke density.",
  },
  godna: {
    label: "Godna",
    meaning: "Tattoo",
    note: "Repeating tattoo-derived motifs in concentric rows, developed as a painting style in the 1970s.",
  },
  tantrik: {
    label: "Tantrik",
    meaning: "Tantric",
    note: "Symbolic and diagrammatic treatment of deities and cosmic figures rather than narrative scenes.",
  },
  kohbar: {
    label: "Kohbar",
    meaning: "Nuptial chamber",
    note: "The wall painting made in the room where a newly married couple first meet, built around the lotus and bamboo.",
  },
  gobar: {
    label: "Gobar",
    meaning: "Cow dung wash",
    note: "Painted over a cow-dung and mud ground, which gives a warm matte surface and a muted line.",
  },
};

export const STYLE_KEYS = Object.keys(STYLES);

export const THEMES = ["Fertility and marriage", "Nature", "Deities", "Protection", "Prosperity", "Structure"];

export const MOTIFS = [
  {
    id: "purain",
    name: "Lotus",
    localName: "Purain",
    theme: "Fertility and marriage",
    meaning: "The female principle and fertility; the centre of the kohbar panel.",
    occasion: "Weddings",
    drawing: "Concentric rings of petals around a filled core, with the leaf and stalk drawn as a network.",
    styles: ["kohbar", "bharni", "kachni"],
  },
  {
    id: "bans",
    name: "Bamboo",
    localName: "Bans",
    theme: "Fertility and marriage",
    meaning: "The male principle and the continuity of the family line.",
    occasion: "Weddings",
    drawing: "A vertical jointed stem beside the lotus; the pair together makes the kohbar complete.",
    styles: ["kohbar", "kachni"],
  },
  {
    id: "kohbar",
    name: "Kohbar panel",
    localName: "Kohbar ghar",
    theme: "Fertility and marriage",
    meaning: "The whole nuptial composition: lotus, bamboo, fish, birds, sun and moon in one field.",
    occasion: "Weddings",
    drawing: "A large central roundel with subsidiary motifs packed into every remaining space.",
    styles: ["kohbar", "bharni"],
  },
  {
    id: "machh",
    name: "Fish",
    localName: "Machh",
    theme: "Fertility and marriage",
    meaning: "Fertility and abundance; a pair of fish is a standard wedding blessing in Mithila.",
    occasion: "Weddings and festivals",
    drawing: "Drawn in pairs, facing each other, with scales as repeated arcs.",
    styles: ["bharni", "kachni", "godna"],
  },
  {
    id: "suga",
    name: "Parrot",
    localName: "Suga",
    theme: "Fertility and marriage",
    meaning: "Love and the carrying of messages between lovers.",
    occasion: "Weddings",
    drawing: "Usually in facing pairs, often perched on the bamboo stem.",
    styles: ["bharni", "kachni"],
  },
  {
    id: "kachhua",
    name: "Tortoise",
    localName: "Kachhua",
    theme: "Prosperity",
    meaning: "Longevity and steadiness; also the Kurma avatar of Vishnu.",
    occasion: "Weddings and household panels",
    drawing: "Seen from above, the shell divided into patterned compartments.",
    styles: ["kachni", "godna"],
  },
  {
    id: "naag",
    name: "Snake",
    localName: "Naag",
    theme: "Protection",
    meaning: "Guardian of the household and of buried wealth; venerated at Nag Panchami.",
    occasion: "Nag Panchami and protective panels",
    drawing: "Coiled or interlaced, sometimes hooded and flanking a doorway.",
    styles: ["tantrik", "kachni"],
  },
  {
    id: "mor",
    name: "Peacock",
    localName: "Mor",
    theme: "Nature",
    meaning: "Love and the coming of the monsoon; associated with Krishna.",
    occasion: "Festivals and general panels",
    drawing: "Tail spread as concentric eye shapes, each filled with a different pattern.",
    styles: ["bharni", "kachni"],
  },
  {
    id: "hathi",
    name: "Elephant",
    localName: "Hathi",
    theme: "Prosperity",
    meaning: "Royalty and wealth; with lotuses it becomes the Gaja-Lakshmi image of prosperity.",
    occasion: "Festivals and ceremonial panels",
    drawing: "In profile with a patterned caparison, often with a rider or a lotus in the trunk.",
    styles: ["bharni"],
  },
  {
    id: "surya",
    name: "Sun",
    localName: "Surya",
    theme: "Deities",
    meaning: "Life and the witness to vows; drawn as a face ringed with rays.",
    occasion: "Weddings and Chhath",
    drawing: "A circular face with alternating straight and wavy rays, usually paired with the moon.",
    styles: ["bharni", "tantrik"],
  },
  {
    id: "chandra",
    name: "Moon",
    localName: "Chandrama",
    theme: "Deities",
    meaning: "Coolness and the feminine, the counterpart to the sun in the same panel.",
    occasion: "Weddings",
    drawing: "A crescent or a full disc with a face, placed opposite the sun.",
    styles: ["bharni", "kachni"],
  },
  {
    id: "kalpavriksha",
    name: "Tree of life",
    localName: "Kalpavriksha",
    theme: "Nature",
    meaning: "Shelter, continuity and the wish-granting tree of the epics.",
    occasion: "General panels",
    drawing: "A symmetrical trunk with birds and animals filling every branch.",
    styles: ["bharni", "kachni"],
  },
  {
    id: "kadamb",
    name: "Kadamba tree",
    localName: "Kadamb",
    theme: "Deities",
    meaning: "The tree Krishna plays under; a marker of the Radha-Krishna story.",
    occasion: "Janmashtami and devotional panels",
    drawing: "Round clustered flowers on a spreading canopy, with a flute-playing figure below.",
    styles: ["bharni"],
  },
  {
    id: "kela",
    name: "Banana plant",
    localName: "Kela",
    theme: "Fertility and marriage",
    meaning: "Auspiciousness and plenty; real banana stems are tied at the wedding canopy.",
    occasion: "Weddings",
    drawing: "Broad ribbed leaves with a hanging flower, usually at the edge of the panel.",
    styles: ["kachni", "kohbar"],
  },
  {
    id: "paan",
    name: "Betel leaf",
    localName: "Paan",
    theme: "Prosperity",
    meaning: "Hospitality and ritual offering.",
    occasion: "Ceremonies of all kinds",
    drawing: "A heart-shaped leaf with the veins drawn as fine parallel lines.",
    styles: ["kachni", "godna"],
  },
  {
    id: "naina-jogin",
    name: "Guardian eyes",
    localName: "Naina-Jogin",
    theme: "Protection",
    meaning: "A watching pair of eyes placed to guard the couple from harm.",
    occasion: "Weddings",
    drawing: "Two large lidded eyes, often at the top corners of the kohbar.",
    styles: ["kohbar", "tantrik"],
  },
  {
    id: "ardhanarishvara",
    name: "Ardhanarishvara",
    localName: "Ardhanarishvar",
    theme: "Deities",
    meaning: "Shiva and Shakti as one body, the union of male and female principles.",
    occasion: "Devotional panels",
    drawing: "A single figure split down the centre, each half with its own ornament and colour.",
    styles: ["tantrik", "bharni"],
  },
  {
    id: "ram-sita",
    name: "Marriage of Ram and Sita",
    localName: "Ram-Sita vivah",
    theme: "Deities",
    meaning: "The defining Mithila story, since Sita is held to be the daughter of Mithila's king.",
    occasion: "Weddings and Vivah Panchami",
    drawing: "A crowded scene of the wedding party, filled edge to edge with attendants and canopies.",
    styles: ["bharni"],
  },
  {
    id: "radha-krishna",
    name: "Radha and Krishna",
    localName: "Radha-Krishna",
    theme: "Deities",
    meaning: "Devotional love, and by extension marital love.",
    occasion: "Janmashtami and wedding gifts",
    drawing: "Two figures in profile under a tree, surrounded by peacocks and cows.",
    styles: ["bharni", "kachni"],
  },
  {
    id: "durga",
    name: "Durga",
    localName: "Durga",
    theme: "Deities",
    meaning: "Power and protection.",
    occasion: "Navratri and Durga Puja",
    drawing: "Multi-armed and mounted on a lion, with each weapon drawn in detail.",
    styles: ["bharni", "tantrik"],
  },
  {
    id: "ganesh",
    name: "Ganesha",
    localName: "Ganesh",
    theme: "Protection",
    meaning: "Beginnings; drawn first at the top of a panel to open the work.",
    occasion: "Any new painting or ceremony",
    drawing: "Seated, with a mouse below and a patterned halo behind.",
    styles: ["bharni", "kachni"],
  },
  {
    id: "rahu",
    name: "Rahu",
    localName: "Rahu",
    theme: "Deities",
    meaning: "The eclipse-causing head; drawn to confront rather than avoid misfortune.",
    occasion: "Tantrik panels",
    drawing: "A disembodied head with radiating lines, in the flat symbolic tantrik manner.",
    styles: ["tantrik"],
  },
  {
    id: "aripan",
    name: "Ritual floor pattern",
    localName: "Aripan",
    theme: "Structure",
    meaning: "Sacred ground marked out before a rite; the geometric ancestor of the painted panel.",
    occasion: "Every household ceremony",
    drawing: "Rice paste drawn freehand on a swept floor, in dots, lotuses and concentric squares.",
    styles: ["gobar", "kachni"],
  },
  {
    id: "doli",
    name: "Palanquin",
    localName: "Doli",
    theme: "Fertility and marriage",
    meaning: "The bride's journey to her husband's house.",
    occasion: "Weddings",
    drawing: "A curtained litter carried by four bearers, drawn in profile.",
    styles: ["bharni", "kachni"],
  },
  {
    id: "charan",
    name: "Footprints of Lakshmi",
    localName: "Lakshmi ke charan",
    theme: "Prosperity",
    meaning: "Prosperity entering the house; drawn facing inward at the threshold.",
    occasion: "Diwali",
    drawing: "Small paired footprints leading from the door towards the inner room.",
    styles: ["gobar", "kachni"],
  },
  {
    id: "lehariya-border",
    name: "Wave border",
    localName: "Lehariya",
    theme: "Structure",
    meaning: "A running band that closes the panel; Madhubani leaves no ground empty.",
    occasion: "Every panel",
    drawing: "A continuous wave with the troughs filled by dots, leaves or triangles.",
    styles: ["kachni", "godna"],
  },
  {
    id: "double-border",
    name: "Double geometric border",
    localName: "Dohra kinar",
    theme: "Structure",
    meaning: "Two concentric bands that frame and contain the field.",
    occasion: "Every panel",
    drawing: "An outer plain band and an inner patterned band of repeated units.",
    styles: ["godna", "kachni"],
  },
];

/**
 * Traditional pigment sources, described rather than colour-matched, because
 * the actual hue depends on the plant, the season and how long it is boiled.
 */
export const PIGMENT_SOURCES = [
  { colour: "Black", source: "Kajal — soot collected from a lamp, bound with a little gum" },
  { colour: "Yellow", source: "Turmeric, or the pollen of the kesar flower, mixed with banyan milk" },
  { colour: "Red and orange", source: "Kusum flower juice, or the crushed petals of the palash tree" },
  { colour: "Blue", source: "Indigo, or the fermented leaves of the sem creeper" },
  { colour: "Green", source: "Leaves of the bilva tree, ground with water" },
  { colour: "White", source: "Rice paste, the same medium used for aripan floor drawings" },
  { colour: "Brown ground", source: "Cow dung and mud wash, which gives the gobar style its surface" },
];

/** Motif sets that traditionally belong together, by occasion. */
export const OCCASION_SETS = {
  wedding: {
    label: "Wedding kohbar",
    motifs: ["purain", "bans", "machh", "suga", "surya", "chandra", "naina-jogin", "kachhua", "doli", "kela"],
    note: "The lotus and bamboo are the required pair; the rest fill the field around them.",
  },
  festival: {
    label: "Festival panel",
    motifs: ["durga", "ganesh", "mor", "hathi", "kadamb", "radha-krishna", "lehariya-border"],
    note: "Deity at the centre, animals and border bands around it.",
  },
  household: {
    label: "Household and threshold",
    motifs: ["charan", "aripan", "naag", "paan", "kachhua", "double-border"],
    note: "Protective and welcoming motifs, drawn at doors and on floors.",
  },
  nature: {
    label: "Nature panel",
    motifs: ["kalpavriksha", "mor", "machh", "suga", "kela", "lehariya-border", "double-border"],
    note: "A tree at the centre with birds and fish filling the branches and ground.",
  },
};

export const OCCASION_KEYS = Object.keys(OCCASION_SETS);

/* ------------------------------------------------------------------ */
/* Motif search                                                        */
/* ------------------------------------------------------------------ */

const normalise = (value) => String(value == null ? "" : value).toLowerCase().trim();

export function filterMotifs({ query = "", theme = "All", style = "All" } = {}) {
  const q = normalise(query);
  return MOTIFS.filter((motif) => {
    if (theme !== "All" && motif.theme !== theme) return false;
    if (style !== "All" && !motif.styles.includes(style)) return false;
    if (!q) return true;
    return normalise(
      [motif.name, motif.localName, motif.meaning, motif.occasion, motif.drawing].join(" "),
    ).includes(q);
  });
}

export function motifById(id) {
  return MOTIFS.find((motif) => motif.id === id) || null;
}

/* ------------------------------------------------------------------ */
/* Layout planner                                                      */
/* ------------------------------------------------------------------ */

export const MIN_SIDE_CM = 5;
export const MAX_SIDE_CM = 300;
export const MIN_CELL_CM = 2;
export const MAX_GRID = 12;

const round1 = (value) => Math.round(value * 10) / 10;

/**
 * Work out the geometry of a bordered Madhubani panel.
 *
 * @param {object} input
 * @param {number} input.width   sheet width in cm
 * @param {number} input.height  sheet height in cm
 * @param {number} input.border  border band width in cm, applied on all sides
 * @param {number} input.rows
 * @param {number} input.columns
 * @returns {object|{error:string}}
 */
export function planLayout({ width, height, border, rows, columns } = {}) {
  const w = Number(width);
  const h = Number(height);
  if (![w, h].every((value) => Number.isFinite(value))) return { error: "Enter the sheet size as numbers." };
  if (w < MIN_SIDE_CM || w > MAX_SIDE_CM || h < MIN_SIDE_CM || h > MAX_SIDE_CM) {
    return { error: `Sheet sides must be between ${MIN_SIDE_CM} and ${MAX_SIDE_CM} cm.` };
  }

  const b = Number(border);
  if (!Number.isFinite(b) || b < 0) return { error: "Border width cannot be negative." };
  const maxBorder = Math.min(w, h) / 4;
  if (b > maxBorder) {
    return { error: `A border wider than ${round1(maxBorder)} cm leaves too little field on this sheet.` };
  }

  const r = Math.trunc(Number(rows));
  const c = Math.trunc(Number(columns));
  if (!Number.isFinite(r) || !Number.isFinite(c) || r < 1 || c < 1 || r > MAX_GRID || c > MAX_GRID) {
    return { error: `Rows and columns must each be between 1 and ${MAX_GRID}.` };
  }

  const innerWidth = w - 2 * b;
  const innerHeight = h - 2 * b;
  const cellWidth = innerWidth / c;
  const cellHeight = innerHeight / r;

  if (cellWidth < MIN_CELL_CM || cellHeight < MIN_CELL_CM) {
    return {
      error: `Cells would be ${round1(cellWidth)} by ${round1(cellHeight)} cm. Below ${MIN_CELL_CM} cm a motif cannot be drawn by hand — use fewer rows or columns.`,
    };
  }

  const cells = r * c;
  const totalArea = w * h;
  const innerArea = innerWidth * innerHeight;
  const aspect = cellWidth / cellHeight;
  const squareness =
    aspect > 1.25 ? "wide" : aspect < 0.8 ? "tall" : "near square";

  return {
    width: w,
    height: h,
    border: b,
    rows: r,
    columns: c,
    innerWidth: round1(innerWidth),
    innerHeight: round1(innerHeight),
    cellWidth: round1(cellWidth),
    cellHeight: round1(cellHeight),
    cells,
    aspect: round1(aspect * 100) / 100,
    squareness,
    borderSharePercent: round1(((totalArea - innerArea) / totalArea) * 100),
    fieldArea: round1(innerArea),
    totalArea: round1(totalArea),
    borderLength: round1(2 * (w + h)),
  };
}

/* ------------------------------------------------------------------ */
/* Composition                                                         */
/* ------------------------------------------------------------------ */

/** Deterministic 32-bit LCG so the same seed always gives the same layout. */
function lcg(seed) {
  let state = (Math.abs(Math.trunc(seed)) || 1) >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/**
 * Fill a grid of `cells` with motifs from an occasion set, repeating the set in
 * a shuffled order when there are more cells than motifs.
 *
 * @returns {{motifs:object[],set:object}|{error:string}}
 */
export function buildComposition({ occasion = "wedding", cells = 12, seed = 1 } = {}) {
  const set = OCCASION_SETS[occasion];
  if (!set) return { error: "Choose one of the listed occasions." };

  const count = Math.trunc(Number(cells));
  if (!Number.isFinite(count) || count < 1 || count > MAX_GRID * MAX_GRID) {
    return { error: `Ask for between 1 and ${MAX_GRID * MAX_GRID} motifs.` };
  }

  const random = lcg(seed);
  const pool = set.motifs.map(motifById).filter(Boolean);
  if (pool.length === 0) return { error: "That occasion has no motifs listed." };

  const out = [];
  while (out.length < count) {
    const round = [...pool];
    for (let index = round.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(random() * (index + 1));
      [round[index], round[swap]] = [round[swap], round[index]];
    }
    out.push(...round.slice(0, Math.min(round.length, count - out.length)));
  }

  return { motifs: out, set };
}
