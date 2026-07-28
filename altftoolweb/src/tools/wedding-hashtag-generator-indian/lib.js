/**
 * Indian wedding hashtag generator.
 *
 * Everything here is deterministic string work — the same two names always
 * produce the same list, in the same order. No randomness, no dates read from
 * the clock (the year is passed in).
 *
 * Platform limits used for the length checks:
 *  - A single Instagram hashtag may be at most 30 characters after the "#",
 *    and only letters, digits and underscores count as part of the tag.
 *  - Instagram accepts at most 30 hashtags on a feed post (3 on a comment
 *    is a myth; the documented cap for a post is 30).
 *  - A hashtag on X is limited by the 280-character post limit rather than a
 *    tag limit of its own, so short tags leave room for the caption.
 */

/** Maximum characters in one Instagram hashtag, excluding the "#". */
export const INSTAGRAM_HASHTAG_MAX_LENGTH = 30;

/** Maximum number of hashtags Instagram accepts on a feed post. */
export const INSTAGRAM_HASHTAGS_PER_POST = 30;

/** Length at which a tag starts to look unwieldy on a printed sign or board. */
export const COMFORTABLE_LENGTH = 20;

const VOWELS = "AEIOU";

/** Categories a generated tag can belong to. */
export const CATEGORIES = [
  { key: "blend", label: "Name blends" },
  { key: "classic", label: "Classic formats" },
  { key: "hindi", label: "Hindi & shaadi puns" },
  { key: "playful", label: "Playful" },
];

/** Strip everything that is not a letter or digit and Title Case the result. */
export function cleanName(value) {
  const letters = String(value ?? "").replace(/[^A-Za-z]/g, "");
  if (letters.length === 0) return "";
  return letters[0].toUpperCase() + letters.slice(1).toLowerCase();
}

/**
 * Opening fragment of a name: everything up to and including the first vowel
 * cluster, never shorter than two characters. Priya → "Pri", Rahul → "Ra".
 */
export function namePrefix(name) {
  const upper = name.toUpperCase();
  let end = -1;
  for (let i = 0; i < upper.length; i += 1) {
    if (VOWELS.includes(upper[i])) {
      end = i;
      while (end + 1 < upper.length && VOWELS.includes(upper[end + 1])) end += 1;
      break;
    }
  }
  const cut = end === -1 ? name.length : end + 1;
  return name.slice(0, Math.max(2, Math.min(cut, name.length)));
}

/**
 * Closing fragment of a name: from the start of the last vowel cluster to the
 * end, never shorter than two characters. Rahul → "ul", Priya → "ya".
 */
export function nameSuffix(name) {
  const upper = name.toUpperCase();
  let start = -1;
  for (let i = upper.length - 1; i >= 0; i -= 1) {
    if (VOWELS.includes(upper[i])) {
      start = i;
      while (start - 1 >= 0 && VOWELS.includes(upper[start - 1])) start -= 1;
      break;
    }
  }
  const cut = start === -1 ? 0 : start;
  return name.slice(Math.min(cut, Math.max(0, name.length - 2)));
}

/** First half of a name by character count, rounded up. */
export function firstHalf(name) {
  return name.slice(0, Math.max(2, Math.ceil(name.length / 2)));
}

/** Second half of a name by character count, rounded down. */
export function secondHalf(name) {
  return name.slice(Math.min(Math.floor(name.length / 2), Math.max(0, name.length - 2)));
}

/** Capitalise a fragment so blends read as one word in camel case. */
const cap = (fragment) =>
  fragment.length === 0 ? "" : fragment[0].toUpperCase() + fragment.slice(1).toLowerCase();

/** Initials of the two names, e.g. Priya + Rahul → "PR". */
export function initials(one, two) {
  return `${one[0] ?? ""}${two[0] ?? ""}`.toUpperCase();
}

/** Every portmanteau this generator makes from an ordered pair. */
export function blendPair(one, two) {
  const blends = [
    cap(namePrefix(one)) + nameSuffix(two).toLowerCase(),
    cap(firstHalf(one)) + secondHalf(two).toLowerCase(),
    cap(namePrefix(one)) + cap(two),
    cap(one) + nameSuffix(two).toLowerCase(),
  ];
  return blends.filter((blend) => blend.length >= 4);
}

/** Reduce a candidate string to a legal hashtag body. */
function toTag(parts) {
  return parts
    .filter(Boolean)
    .join("")
    .replace(/[^A-Za-z0-9]/g, "");
}

/**
 * Build the hashtag list.
 * @param {{partnerOne:string, partnerTwo:string, surname?:string, year?:number|string}} input
 */
export function generateHashtags({ partnerOne, partnerTwo, surname = "", year = "" } = {}) {
  const one = cleanName(partnerOne);
  const two = cleanName(partnerTwo);
  const family = cleanName(surname);

  if (one.length === 0 || two.length === 0) {
    return { error: "Enter both partners' first names using letters A to Z." };
  }
  if (one.length < 2 || two.length < 2) {
    return { error: "Each first name needs at least two letters to blend." };
  }

  const yearText = String(year ?? "").replace(/[^0-9]/g, "");
  if (yearText.length > 0 && yearText.length !== 4) {
    return { error: "Enter the wedding year as four digits, or leave it blank." };
  }
  const shortYear = yearText.length === 4 ? yearText.slice(2) : "";

  const blends = [...new Set([...blendPair(one, two), ...blendPair(two, one)])].filter(
    (blend) => blend.toLowerCase() !== one.toLowerCase() && blend.toLowerCase() !== two.toLowerCase(),
  );

  const both = `${one}${two}`;
  const ini = initials(one, two);
  const candidates = [];

  const push = (category, parts) => {
    const tag = toTag(parts);
    if (tag.length >= 4) candidates.push({ tag, category });
  };

  // Name blends
  for (const blend of blends) {
    push("blend", [blend, yearText]);
    push("blend", ["The", blend, "Wedding"]);
    push("blend", [blend, "ForeverAndEver"]);
  }

  // Classic formats
  push("classic", [one, "Weds", two]);
  push("classic", [one, "And", two, yearText]);
  push("classic", ["The", family || both, "Wedding", shortYear]);
  push("classic", [both, "Forever"]);
  push("classic", [ini, "Wedding", yearText]);
  push("classic", ["Team", family || both]);
  push("classic", ["HappilyEver", two]);
  push("classic", ["MrAndMrs", family || two]);

  // Hindi and shaadi puns
  push("hindi", [both, "KiShaadi"]);
  push("hindi", [both, "KaVivah"]);
  push("hindi", [both, "KiJodi"]);
  push("hindi", ["Baraat", "For", both]);
  push("hindi", ["Sangeet", "Of", both]);
  push("hindi", ["Mehendi", "Mein", one]);
  push("hindi", ["SaatPhere", both]);
  push("hindi", ["ShaadiOf", both, shortYear]);
  push("hindi", ["RishtaPakka", ini]);
  if (family) {
    push("hindi", [family, "KiShaadi"]);
    push("hindi", ["Ghar", "Aayi", "Dulhan", family]);
  }

  // Playful
  push("playful", ["Finally", both]);
  push("playful", [both, "SaidYes"]);
  push("playful", ["Locked", "In", ini, shortYear]);
  push("playful", ["OneLaddooTwo", ini]);
  push("playful", ["From", "Swipe", "To", "SaatPhere", ini]);
  push("playful", [both, "TyingTheKnot"]);
  push("playful", ["TwoBecome", ini, shortYear]);
  push("playful", [ini, "EverAfter", shortYear]);

  const seen = new Set();
  const hashtags = [];
  for (const candidate of candidates) {
    const key = candidate.tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    hashtags.push({
      tag: candidate.tag,
      category: candidate.category,
      length: candidate.tag.length,
      withinInstagramLimit: candidate.tag.length <= INSTAGRAM_HASHTAG_MAX_LENGTH,
      comfortable: candidate.tag.length <= COMFORTABLE_LENGTH,
    });
  }

  if (hashtags.length === 0) {
    return { error: "Those names did not produce any usable hashtags — try fuller spellings." };
  }

  return {
    partnerOne: one,
    partnerTwo: two,
    surname: family,
    year: yearText,
    blends,
    hashtags,
    count: hashtags.length,
    withinLimitCount: hashtags.filter((item) => item.withinInstagramLimit).length,
  };
}

/** Filter a generated list by category key, or "all". */
export function filterByCategory(result, categoryKey) {
  if (!result || result.error) return [];
  if (!categoryKey || categoryKey === "all") return result.hashtags;
  return result.hashtags.filter((item) => item.category === categoryKey);
}
