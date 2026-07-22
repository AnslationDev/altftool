/**
 * Character-level scoring for the typing test.
 *
 * For every committed word the characters that match the target at the same
 * position count as correct; mismatches and extra characters count as
 * incorrect. The space after a fully correct word counts as one extra correct
 * character (standard net-WPM convention); after a wrong word it counts as
 * incorrect. The in-progress word contributes its characters too.
 */
export function charStats(targets, typedWords, wordIndex, currentValue) {
  let correct = 0;
  let incorrect = 0;
  let typedTotal = 0;

  for (let i = 0; i < wordIndex; i += 1) {
    const target = targets[i] ?? "";
    const typed = typedWords[i] ?? "";
    typedTotal += typed.length + 1; // +1 for the committed space
    const overlap = Math.min(target.length, typed.length);
    let matches = 0;
    for (let j = 0; j < overlap; j += 1) {
      if (typed[j] === target[j]) matches += 1;
    }
    correct += matches;
    incorrect += typed.length - matches;
    if (typed === target) correct += 1;
    else incorrect += 1;
  }

  if (currentValue) {
    const target = targets[wordIndex] ?? "";
    typedTotal += currentValue.length;
    const overlap = Math.min(target.length, currentValue.length);
    let matches = 0;
    for (let j = 0; j < overlap; j += 1) {
      if (currentValue[j] === target[j]) matches += 1;
    }
    correct += matches;
    incorrect += currentValue.length - matches;
  }

  return { correct, incorrect, typedTotal };
}

/** Net words per minute: correct characters / 5, normalised to a minute. */
export function netWpm(correctChars, seconds) {
  if (seconds <= 0) return 0;
  return Math.max(0, Math.round((correctChars / 5) * (60 / seconds)));
}

/** Raw words per minute: every typed character / 5, normalised to a minute. */
export function rawWpm(typedChars, seconds) {
  if (seconds <= 0) return 0;
  return Math.max(0, Math.round((typedChars / 5) * (60 / seconds)));
}

/** Accuracy percentage over all evaluated characters; 100 before any input. */
export function accuracy(correctChars, incorrectChars) {
  const total = correctChars + incorrectChars;
  if (total === 0) return 100;
  return Math.round((correctChars / total) * 100);
}
