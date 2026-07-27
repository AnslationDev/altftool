/**
 * Temple visit etiquette checklist.
 *
 * Every tradition has three tiers of rule, and travellers routinely confuse them:
 *
 *  - BLOCKER   you will be refused entry, or you will cause genuine offence. These are
 *              the rules the site itself enforces at the door.
 *  - IMPORTANT the regular worshippers will notice, and it reads as disrespect, but no
 *              one stops you.
 *  - COURTESY  the small conventions that mark a considerate visitor.
 *
 * The score below is a weighted readiness percentage, and it deliberately does not let a
 * pile of small courtesies compensate for a missed blocker: any unmet blocker caps the
 * verdict at "not ready" no matter how high the percentage climbs.
 */

/** Weights by tier. A blocker is worth five courtesies because it is categorical. */
export const TIER_WEIGHTS = { blocker: 5, important: 3, courtesy: 1 };

/** Percentage bands used once every blocker has been met. */
export const READY_THRESHOLD = 100;
export const ALMOST_THRESHOLD = 85;
export const GAPS_THRESHOLD = 60;

/**
 * Checklists by tradition. Each item is { id, tier, text, detail }.
 * These are the standing conventions of each tradition; individual sites add their own
 * signage, and a posted rule always overrides a general convention.
 */
export const TRADITIONS = [
  {
    id: "theravada",
    label: "Theravada Buddhist temple (Thailand, Sri Lanka, Myanmar, Laos, Cambodia)",
    items: [
      {
        id: "tv-cover",
        tier: "blocker",
        text: "Shoulders and knees covered",
        detail:
          "Sleeveless tops, shorts and short skirts are refused. A sarong carried in a day bag solves it at the gate.",
      },
      {
        id: "tv-shoes",
        tier: "blocker",
        text: "Shoes removed before entering the image hall",
        detail:
          "Shoes come off at the step of the ubosot or viharn, and often before the surrounding terrace as well. Slip-ons save a great deal of time.",
      },
      {
        id: "tv-buddha-decor",
        tier: "blocker",
        text: "No Buddha image worn as decoration",
        detail:
          "Buddha images on t-shirts, bags and tattoos cause real offence in Buddhist countries. Thailand also restricts taking Buddha images out of the country as souvenirs.",
      },
      {
        id: "tv-feet",
        tier: "important",
        text: "Feet never pointed at a Buddha image or a monk",
        detail:
          "Sit with your legs folded back to one side, the posture locally described as sitting like a mermaid, rather than cross-legged with soles forward.",
      },
      {
        id: "tv-monk",
        tier: "important",
        text: "Women do not touch or hand objects directly to a monk",
        detail:
          "An offering is placed on the receiving cloth the monk sets down, or passed via a male companion.",
      },
      {
        id: "tv-head",
        tier: "important",
        text: "Head kept lower than seated worshippers and the main image",
        detail: "Stoop slightly when passing in front of people who are praying.",
      },
      {
        id: "tv-hats",
        tier: "important",
        text: "Hats and sunglasses removed inside",
        detail: "Both come off at the same point the shoes do.",
      },
      {
        id: "tv-clockwise",
        tier: "courtesy",
        text: "Walk clockwise around a stupa or chedi",
        detail: "Keeping the monument on your right is the traditional direction of circumambulation.",
      },
      {
        id: "tv-selfie",
        tier: "courtesy",
        text: "No photographs with your back to the main image",
        detail: "Posing in front of the Buddha with your back turned is the classic tourist offence.",
      },
      {
        id: "tv-donate",
        tier: "courtesy",
        text: "Donations go in the box, not to individuals",
        detail: "It also avoids the common entrance-gate donation scam.",
      },
    ],
  },
  {
    id: "mahayana",
    label: "East Asian Buddhist temple (China, Japan, Korea, Vietnam)",
    items: [
      {
        id: "mh-cover",
        tier: "blocker",
        text: "Shoulders and knees covered",
        detail: "Shorts and sleeveless tops are not worn inside the halls.",
      },
      {
        id: "mh-shoes",
        tier: "blocker",
        text: "Shoes removed before the Dharma hall",
        detail: "Shoes are left on the racks provided; socks stay on.",
      },
      {
        id: "mh-threshold",
        tier: "important",
        text: "Step over the raised threshold, never on it",
        detail:
          "The raised wooden beam across a temple doorway is stepped over. Entering by a side of the doorway rather than the exact centre is also standard.",
      },
      {
        id: "mh-incense",
        tier: "important",
        text: "Incense lit correctly and never blown out with the mouth",
        detail:
          "An odd number of sticks, commonly three, is lit from the flame provided and the flame is waved out with the hand.",
      },
      {
        id: "mh-bow",
        tier: "important",
        text: "Palms together and a short bow before the image",
        detail: "Gassho in Japan, hapjang in Korea — a shallow bow with palms joined at chest height.",
      },
      {
        id: "mh-photo",
        tier: "important",
        text: "No photography where it is posted, especially of the main image",
        detail: "Many halls permit exterior photography and forbid it inside; the sign is at the door.",
      },
      {
        id: "mh-quiet",
        tier: "courtesy",
        text: "Voices low and phones silent",
        detail: "Working temples run services throughout the day.",
      },
      {
        id: "mh-point",
        tier: "courtesy",
        text: "No pointing at statues or worshippers",
        detail: "Gesture with an open hand rather than an index finger.",
      },
      {
        id: "mh-queue",
        tier: "courtesy",
        text: "Let worshippers reach the altar first",
        detail: "Visitors step aside for anyone who has come to pray rather than to look.",
      },
    ],
  },
  {
    id: "hindu",
    label: "Hindu temple (India, Nepal, Bali, diaspora mandirs)",
    items: [
      {
        id: "hi-shoes",
        tier: "blocker",
        text: "Shoes left outside the temple compound",
        detail: "Shoes go on the rack or with the attendant outside the outer wall, not just the inner hall.",
      },
      {
        id: "hi-cover",
        tier: "blocker",
        text: "Shoulders and knees covered",
        detail:
          "Many South Indian temples go further and ask men to remove upper garments and to wear a dhoti or mundu rather than trousers.",
      },
      {
        id: "hi-leather",
        tier: "blocker",
        text: "Leather items left outside where the temple asks",
        detail: "Belts, wallets, bags and watch straps in leather are refused at many temples.",
      },
      {
        id: "hi-access",
        tier: "blocker",
        text: "Access restrictions checked before arriving",
        detail:
          "Some temples, including Jagannath in Puri and Guruvayur in Kerala, admit Hindus only, and many restrict the inner sanctum to priests.",
      },
      {
        id: "hi-pradakshina",
        tier: "important",
        text: "Circumambulate clockwise",
        detail: "Pradakshina keeps the sanctum on your right.",
      },
      {
        id: "hi-touch",
        tier: "important",
        text: "Nothing touched — deity, offerings or lamps",
        detail: "The murti is handled only by priests, and offerings on the tray belong to whoever brought them.",
      },
      {
        id: "hi-prasad",
        tier: "important",
        text: "Prasad accepted with the right hand",
        detail: "The left hand is considered unclean for receiving food and offerings.",
      },
      {
        id: "hi-photo",
        tier: "courtesy",
        text: "No photography of the sanctum",
        detail: "Cameras and often phones are deposited at the entrance at larger temples.",
      },
      {
        id: "hi-hundi",
        tier: "courtesy",
        text: "Donations placed in the hundi",
        detail: "The temple donation box, rather than handed to anyone who approaches you.",
      },
    ],
  },
  {
    id: "gurdwara",
    label: "Sikh gurdwara",
    items: [
      {
        id: "gu-head",
        tier: "blocker",
        text: "Head covered by everyone, regardless of gender",
        detail: "Scarves and bandanas are provided in a basket at the entrance; a cap is not sufficient.",
      },
      {
        id: "gu-shoes",
        tier: "blocker",
        text: "Shoes removed and hands washed",
        detail: "There is a shoe rack and a washing area before the prayer hall, and both are used.",
      },
      {
        id: "gu-intoxicants",
        tier: "blocker",
        text: "No tobacco, alcohol or other intoxicants anywhere on the premises",
        detail:
          "This includes carrying cigarettes in a bag, and arriving having been drinking. It is one of the few absolute prohibitions in this list.",
      },
      {
        id: "gu-sit",
        tier: "important",
        text: "Sit on the floor, below the level of the Guru Granth Sahib",
        detail: "Nobody sits higher than the scripture, and chairs are only for those who cannot sit on the floor.",
      },
      {
        id: "gu-feet",
        tier: "important",
        text: "Feet never pointed at the Guru Granth Sahib",
        detail: "Sit cross-legged or with legs folded to the side, and back away rather than turning your back when leaving.",
      },
      {
        id: "gu-prasad",
        tier: "important",
        text: "Karah prasad accepted in both hands, cupped",
        detail: "It is offered to every visitor and refusing is discourteous; a small portion is fine.",
      },
      {
        id: "gu-langar",
        tier: "courtesy",
        text: "Langar accepted and eaten sitting in the rows",
        detail:
          "The free community kitchen is offered to everyone of any faith, and sitting in the pangat rows is the point of it.",
      },
      {
        id: "gu-quiet",
        tier: "courtesy",
        text: "Enter quietly and bow before the scripture",
        detail: "Visitors usually approach, bow, place an offering if they wish, and sit at the side.",
      },
    ],
  },
  {
    id: "jain",
    label: "Jain temple (derasar)",
    items: [
      {
        id: "ja-leather",
        tier: "blocker",
        text: "No leather at all, on you or in your bag",
        detail:
          "Belts, wallets, watch straps, camera cases and bags in leather are all prohibited, because they come from a killed animal. This is stricter than at Hindu temples and is enforced.",
      },
      {
        id: "ja-shoes",
        tier: "blocker",
        text: "Shoes removed outside",
        detail: "Left at the rack outside the compound.",
      },
      {
        id: "ja-food",
        tier: "blocker",
        text: "No food, drink or chewing gum carried inside",
        detail: "Eating and drinking inside a derasar is not permitted, water included at many temples.",
      },
      {
        id: "ja-wash",
        tier: "important",
        text: "Wash before entering, and wear clean clothes",
        detail:
          "Bathing before puja is expected of worshippers; visitors should at minimum arrive clean and in fresh clothes.",
      },
      {
        id: "ja-touch",
        tier: "important",
        text: "The idol is not touched without prescribed purity",
        detail: "Only those who have performed the ritual bathing and are wearing puja clothes approach the idol.",
      },
      {
        id: "ja-notice",
        tier: "important",
        text: "Entry notices read and followed",
        detail:
          "Many derasars post their own conditions at the door, including a traditional request that menstruating women do not enter.",
      },
      {
        id: "ja-silence",
        tier: "courtesy",
        text: "Silence inside, phones off",
        detail: "Derasars are markedly quieter than Hindu temples.",
      },
      {
        id: "ja-circle",
        tier: "courtesy",
        text: "Three clockwise circumambulations",
        detail: "The traditional pattern of pradakshina in a derasar is three times around the sanctum.",
      },
    ],
  },
  {
    id: "shinto",
    label: "Shinto shrine (jinja, Japan)",
    items: [
      {
        id: "sh-temizu",
        tier: "blocker",
        text: "Purify at the temizuya before approaching",
        detail:
          "Rinse the left hand, then the right, then pour water into the left hand to rinse the mouth, then tip the ladle upright to rinse the handle. Never drink from the ladle.",
      },
      {
        id: "sh-centre",
        tier: "blocker",
        text: "Do not walk down the exact centre of the approach path",
        detail: "The middle of the sando is left for the kami; visitors walk to one side.",
      },
      {
        id: "sh-bow-torii",
        tier: "important",
        text: "A short bow at the torii, entering and leaving",
        detail: "It marks the boundary of the sacred precinct.",
      },
      {
        id: "sh-ritual",
        tier: "important",
        text: "Two bows, two claps, one bow at the main hall",
        detail:
          "Nirei nihakushu ichirei: bow twice deeply, clap twice, offer your prayer, then bow once more. Buddhist temples in Japan do not use the claps.",
      },
      {
        id: "sh-offering",
        tier: "important",
        text: "Coin offered into the saisen box before praying",
        detail: "A five-yen coin is traditional because its name puns on good fortune, but any coin is fine.",
      },
      {
        id: "sh-photo",
        tier: "courtesy",
        text: "No photography inside the honden or of ceremonies",
        detail: "Exterior photography is generally fine unless posted otherwise.",
      },
      {
        id: "sh-omamori",
        tier: "courtesy",
        text: "Charms and ema treated as objects, not souvenirs",
        detail: "Omamori are not opened, and old ones are returned to a shrine rather than thrown away.",
      },
      {
        id: "sh-quiet",
        tier: "courtesy",
        text: "Quiet, and no eating on the approach",
        detail: "Food from the stalls outside is eaten before passing the torii.",
      },
    ],
  },
];

/**
 * Score a traveller's readiness for a temple visit.
 *
 * @param {object} input
 * @param {string} input.traditionId id from TRADITIONS
 * @param {string[]} input.checkedIds item ids the traveller has confirmed
 * @returns {object} score breakdown, or { error } for unusable input
 */
export function scoreChecklist({ traditionId, checkedIds = [] } = {}) {
  const tradition = TRADITIONS.find((t) => t.id === traditionId);
  if (!tradition) return { error: "Pick the tradition you are visiting." };
  if (!Array.isArray(checkedIds)) return { error: "Checked items must be a list." };

  const validIds = new Set(tradition.items.map((item) => item.id));
  const checked = new Set(checkedIds.filter((id) => validIds.has(id)));

  let totalWeight = 0;
  let earnedWeight = 0;
  const unmet = { blocker: [], important: [], courtesy: [] };
  const met = [];

  for (const item of tradition.items) {
    const weight = TIER_WEIGHTS[item.tier];
    totalWeight += weight;
    if (checked.has(item.id)) {
      earnedWeight += weight;
      met.push(item);
    } else {
      unmet[item.tier].push(item);
    }
  }

  /* totalWeight can never be zero because every tradition ships at least one item,
     but guard anyway so the function is total. */
  const percent = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0;

  const blockersOutstanding = unmet.blocker.length;

  let band;
  let verdict;
  if (blockersOutstanding > 0) {
    band = "blocked";
    verdict =
      blockersOutstanding === 1
        ? "One rule outstanding that can get you turned away at the door."
        : `${blockersOutstanding} rules outstanding that can get you turned away at the door.`;
  } else if (percent >= READY_THRESHOLD) {
    band = "ready";
    verdict = "Everything on the list is covered.";
  } else if (percent >= ALMOST_THRESHOLD) {
    band = "almost";
    verdict = "Nothing will stop you at the door; a couple of courtesies are still open.";
  } else if (percent >= GAPS_THRESHOLD) {
    band = "gaps";
    verdict = "You will get in, but several conventions worshippers notice are unmet.";
  } else {
    band = "unprepared";
    verdict = "You will get in, but most of the etiquette is still unread.";
  }

  return {
    tradition: { id: tradition.id, label: tradition.label },
    items: tradition.items,
    totalWeight,
    earnedWeight,
    percent,
    band,
    verdict,
    blockersOutstanding,
    unmet,
    metCount: met.length,
    itemCount: tradition.items.length,
  };
}

export default scoreChecklist;
