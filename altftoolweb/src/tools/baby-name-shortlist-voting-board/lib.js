/**
 * Baby name shortlist tallying.
 *
 * Ratings are a 1-to-5 scale, which is the standard Likert form used when a small
 * group has to rank options. The lowest rating doubles as a veto, because in
 * practice a name that one parent cannot live with is out regardless of how well
 * it averages — so vetoed names are ranked last rather than being averaged away.
 */

export const RATING_MIN = 1;
export const RATING_MAX = 5;
/** A rating of RATING_MIN is treated as "I cannot live with this name". */
export const VETO_RATING = RATING_MIN;

/** Board size limits — beyond these a shortlist stops being a shortlist. */
export const MAX_NAMES = 40;
export const MAX_VOTERS = 12;
export const MAX_LABEL_LENGTH = 40;

/** Rating labels shown next to each number. */
export const RATING_LABELS = {
  1: "No — veto",
  2: "Not keen",
  3: "Could live with it",
  4: "Like it",
  5: "Love it",
};

/** Consensus bands for the plain-language verdict. */
export const CONSENSUS_BANDS = [
  [100, "Unanimous"],
  [75, "Strong agreement"],
  [50, "Mixed"],
  [0, "Divided"],
];

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * 100 when every voter gave the same rating, 0 when the ratings span the full scale.
 * A single vote counts as unanimous by definition.
 */
export function consensusScore(ratings) {
  if (ratings.length < 2) return 100;
  const spread = Math.max(...ratings) - Math.min(...ratings);
  const widest = RATING_MAX - RATING_MIN;
  if (widest <= 0) return 100;
  return Math.round(100 - (spread / widest) * 100);
}

/** True when the value is an integer rating inside the allowed scale. */
export function isValidRating(value) {
  return Number.isInteger(value) && value >= RATING_MIN && value <= RATING_MAX;
}

/**
 * Tally a whole board.
 *
 * names  = [{ id, label }]
 * voters = [{ id, label }]
 * votes  = { [voterId]: { [nameId]: rating } }
 *
 * Returns { error } for an empty or malformed board.
 */
export function tallyBoard({ names = [], voters = [], votes = {} } = {}) {
  if (!Array.isArray(names) || !Array.isArray(voters)) {
    return { error: "The board is missing its name or voter list." };
  }
  if (names.length === 0) return { error: "Add at least one name to the shortlist." };
  if (voters.length === 0) return { error: "Add at least one person to vote." };
  if (names.length > MAX_NAMES) return { error: `A shortlist tops out at ${MAX_NAMES} names.` };
  if (voters.length > MAX_VOTERS) return { error: `A board tops out at ${MAX_VOTERS} voters.` };

  const blankName = names.find((entry) => !String(entry.label || "").trim());
  if (blankName) return { error: "Every name on the shortlist needs a label." };
  const blankVoter = voters.find((entry) => !String(entry.label || "").trim());
  if (blankVoter) return { error: "Every voter needs a name." };

  const tooLong =
    names.find((entry) => String(entry.label).length > MAX_LABEL_LENGTH) ||
    voters.find((entry) => String(entry.label).length > MAX_LABEL_LENGTH);
  if (tooLong) return { error: `Keep every label under ${MAX_LABEL_LENGTH} characters.` };

  let badRating = false;
  const rows = names.map((name) => {
    const ratings = [];
    const perVoter = voters.map((voter) => {
      const raw = votes[voter.id] ? votes[voter.id][name.id] : undefined;
      if (raw === undefined || raw === null || raw === "") return { voter, rating: null };
      const value = Number(raw);
      if (!isValidRating(value)) {
        badRating = true;
        return { voter, rating: null };
      }
      ratings.push(value);
      return { voter, rating: value };
    });

    const average = mean(ratings);
    const vetoes = ratings.filter((rating) => rating === VETO_RATING).length;
    const consensus = consensusScore(ratings);

    return {
      id: name.id,
      label: String(name.label).trim(),
      ratings,
      perVoter,
      votesCast: ratings.length,
      total: ratings.reduce((sum, value) => sum + value, 0),
      average,
      spread: ratings.length ? Math.max(...ratings) - Math.min(...ratings) : 0,
      consensus,
      consensusBand: CONSENSUS_BANDS.find(([floor]) => consensus >= floor)[1],
      vetoes,
      vetoed: vetoes > 0,
    };
  });

  if (badRating) {
    return { error: `Every rating must be a whole number from ${RATING_MIN} to ${RATING_MAX}.` };
  }

  const ranked = [...rows].sort((a, b) => {
    if (a.vetoed !== b.vetoed) return a.vetoed ? 1 : -1;
    if (b.average !== a.average) return b.average - a.average;
    if (b.consensus !== a.consensus) return b.consensus - a.consensus;
    if (b.votesCast !== a.votesCast) return b.votesCast - a.votesCast;
    return a.label.localeCompare(b.label);
  });

  ranked.forEach((row, index) => {
    row.rank = index + 1;
  });

  const possibleVotes = names.length * voters.length;
  const castVotes = rows.reduce((sum, row) => sum + row.votesCast, 0);
  const contested = rows.filter((row) => row.votesCast > 1);

  return {
    rows: ranked,
    winner: ranked.length && ranked[0].votesCast > 0 && !ranked[0].vetoed ? ranked[0] : null,
    possibleVotes,
    castVotes,
    completion: possibleVotes ? Math.round((castVotes / possibleVotes) * 100) : 0,
    vetoedCount: rows.filter((row) => row.vetoed).length,
    mostDivisive: contested.length
      ? contested.reduce((worst, row) => (row.consensus < worst.consensus ? row : worst), contested[0])
      : null,
    // Counts every row whose consensus band the table actually displays as "Unanimous"
    // (the table only shows a band once a name has at least one vote cast), not just
    // rows with more than one vote — otherwise a name with exactly one vote is labelled
    // "Unanimous" in the table but excluded from this count.
    unanimousCount: rows.filter((row) => row.votesCast > 0 && row.consensus === 100).length,
  };
}

/** Plain-text export of a tallied board, for pasting into a family chat. */
export function boardToText(tally, voters) {
  if (!tally || tally.error) return "";
  const lines = ["Baby name shortlist results", ""];
  tally.rows.forEach((row) => {
    const detail = row.votesCast
      ? `avg ${row.average.toFixed(2)} from ${row.votesCast} vote${row.votesCast === 1 ? "" : "s"}, ${row.consensusBand.toLowerCase()}`
      : "no votes yet";
    lines.push(`${row.rank}. ${row.label} — ${detail}${row.vetoed ? " (VETOED)" : ""}`);
  });
  lines.push("");
  lines.push(`Voters: ${voters.map((voter) => voter.label).join(", ")}`);
  lines.push(`Completion: ${tally.completion}% (${tally.castVotes} of ${tally.possibleVotes} votes)`);
  return lines.join("\n");
}
