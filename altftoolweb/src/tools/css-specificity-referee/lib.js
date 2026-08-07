/**
 * CSS Specificity Referee — selector specificity and cascade-order arithmetic.
 *
 * Everything here is pure: same input, same output, no clocks, no DOM, no
 * network. All parsing is done on the strings the user pastes.
 *
 * RULES IMPLEMENTED (read 2026-07-29):
 *
 * [S4]  Selectors Level 4, §15 "Calculating a selector's specificity"
 *       (W3C Working Draft, 22 January 2026) — https://www.w3.org/TR/selectors-4/
 *       A selector's specificity is the triple (a, b, c):
 *         a = the number of ID selectors,
 *         b = the number of class selectors, attribute selectors and
 *             pseudo-classes,
 *         c = the number of type selectors and pseudo-elements.
 *       The universal selector `*` and all combinators contribute nothing.
 *       :is(), :not() and :has() contribute the specificity of the MOST
 *       SPECIFIC complex selector in their argument list; the pseudo-class
 *       itself adds nothing. :where() always contributes (0,0,0) whatever its
 *       argument. :nth-child()/:nth-last-child() count as one pseudo-class
 *       PLUS the most specific complex selector in an `of S` argument.
 *       :host()/:host-context() count as one pseudo-class plus their argument;
 *       ::slotted() counts as one pseudo-element plus its argument.
 *
 * [C5]  CSS Cascading and Inheritance Level 5, §6.1 "Cascade Sorting Order"
 *       (W3C Candidate Recommendation Snapshot, 13 January 2022)
 *       — https://www.w3.org/TR/css-cascade-5/#cascade-sort
 *       Declarations are sorted on these criteria, in this order, and the
 *       FIRST one that separates them decides. Specificity is criterion 5 —
 *       three tests happen before it:
 *         1. Origin and importance (important author beats normal author),
 *         2. Context (shadow tree encapsulation — out of scope here),
 *         3. Element-attached styles — a `style` attribute declaration beats a
 *            style-rule declaration OF THE SAME IMPORTANCE,
 *         4. Cascade layers — for NORMAL declarations the LAST layer wins, and
 *            unlayered declarations sit in "an implicit final layer" so they
 *            beat every layered one; for IMPORTANT declarations the order is
 *            reversed, the FIRST layer wins, and that same implicit final
 *            layer makes unlayered important declarations LOSE to layered ones,
 *         5. Specificity — the highest (a, b, c) wins,
 *         6. Order of appearance — the last declaration in document order wins.
 *
 * Scope note: this tool compares author-origin declarations only. User and
 * user-agent origins, transitions and animations sort above/below the whole
 * author block and are not modelled.
 */

import { collapseWhitespace, parseCss, splitTopLevelCommas } from "../css-tools/lib.js";

/* ------------------------------------------------------------------ */
/* Citations                                                           */
/* ------------------------------------------------------------------ */

export const SPEC_SELECTORS =
  "Selectors Level 4 §15 (W3C Working Draft, 22 Jan 2026), read 29 Jul 2026";
export const SPEC_CASCADE =
  "CSS Cascading and Inheritance Level 5 §6.1 (W3C CR Snapshot, 13 Jan 2022), read 29 Jul 2026";

/* ------------------------------------------------------------------ */
/* Specificity constants                                               */
/* ------------------------------------------------------------------ */

/** [S4] :where() contributes (0,0,0) no matter what it wraps. */
const ZERO_SPECIFICITY_PSEUDOS = new Set(["where"]);

/**
 * [S4] These take the specificity of the most specific complex selector in
 * their argument list and add nothing of their own. The -moz/-webkit :any()
 * forms are the pre-standard spellings of :is() and behave the same way.
 */
const ARGUMENT_SPECIFICITY_PSEUDOS = new Set([
  "is",
  "not",
  "has",
  "matches",
  "any",
  "-moz-any",
  "-webkit-any",
]);

/**
 * [S4] One pseudo-class of their own, PLUS the most specific complex selector
 * in the argument (the `of S` clause for :nth-child, the shadow-host filter
 * for :host()/:host-context()).
 */
const PSEUDO_PLUS_ARGUMENT = new Set(["nth-child", "nth-last-child", "host", "host-context"]);

/**
 * Pseudo-elements that predate the `::` syntax. CSS2.1 allowed a single colon
 * for exactly these four, and they still count in column c, not b.
 */
const LEGACY_PSEUDO_ELEMENTS = new Set(["before", "after", "first-line", "first-letter"]);

/** [S4] ::slotted(S) is a pseudo-element plus the specificity of S. */
const PSEUDO_ELEMENT_PLUS_ARGUMENT = new Set(["slotted"]);

/** Guard against pathological input; no real selector is anywhere near this. */
const MAX_SELECTOR_LENGTH = 4000;
/** Guard against pathological nesting of :is(:is(:is(...))). */
const MAX_NESTING_DEPTH = 20;
/** Upper bound when searching for the smallest specificity change. */
const MAX_SEARCH_UNITS = 64;

const ZERO = { a: 0, b: 0, c: 0 };

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */

/** CSS ident start: letter, underscore, hyphen, a backslash escape, or non-ASCII. */
function isIdentStart(ch) {
  return /[A-Za-z_\u00A0-\uFFFF\\-]/.test(ch);
}

/** CSS ident continuation: everything an ident may start with, plus digits. */
function isIdentChar(ch) {
  return /[A-Za-z0-9_\u00A0-\uFFFF\\-]/.test(ch);
}

/** Read an identifier starting at index i, honouring backslash escapes. */
function readIdent(s, i) {
  let out = "";
  let j = i;
  while (j < s.length) {
    const ch = s[j];
    if (ch === "\\" && j + 1 < s.length) {
      out += ch + s[j + 1];
      j += 2;
      continue;
    }
    if (!isIdentChar(ch)) break;
    out += ch;
    j += 1;
  }
  return { text: out, next: j };
}

/** Read a balanced (...) group starting at the "(" at index i. */
function readParens(s, i) {
  let depth = 0;
  let quote = null;
  for (let j = i; j < s.length; j += 1) {
    const ch = s[j];
    if (quote) {
      if (ch === "\\") j += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(") depth += 1;
    else if (ch === ")") {
      depth -= 1;
      if (depth === 0) return { inner: s.slice(i + 1, j), next: j + 1 };
    }
  }
  return null;
}

/** Read a balanced [...] attribute selector starting at the "[" at index i. */
function readBrackets(s, i) {
  let quote = null;
  for (let j = i + 1; j < s.length; j += 1) {
    const ch = s[j];
    if (quote) {
      if (ch === "\\") j += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "]") return { text: s.slice(i, j + 1), next: j + 1 };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Specificity                                                         */
/* ------------------------------------------------------------------ */

/** Compare two (a,b,c) triples. Returns 1, 0 or -1. */
export function compareSpecificity(x, y) {
  if (x.a !== y.a) return x.a > y.a ? 1 : -1;
  if (x.b !== y.b) return x.b > y.b ? 1 : -1;
  if (x.c !== y.c) return x.c > y.c ? 1 : -1;
  return 0;
}

/** "1,2,0" — the conventional written form of a specificity triple. */
export function formatSpecificity(spec) {
  if (!spec) return "—";
  return `${spec.a},${spec.b},${spec.c}`;
}

function add(x, y) {
  return { a: x.a + y.a, b: x.b + y.b, c: x.c + y.c };
}

/**
 * Specificity of a selector LIST: the most specific complex selector in it.
 * Used for the arguments of :is(), :not(), :has() and friends. [S4]
 */
function mostSpecificOfList(list, depth) {
  const parts = splitTopLevelCommas(list);
  let best = null;
  for (const part of parts) {
    const scanned = scanComplexSelector(part, depth + 1);
    if (scanned.error) return scanned;
    if (!best || compareSpecificity(scanned.spec, best) > 0) best = scanned.spec;
  }
  return { spec: best || ZERO, tokens: [] };
}

/**
 * Scan one complex selector and total its (a,b,c) contributions.
 * Returns { spec, tokens } or { error }.
 */
function scanComplexSelector(input, depth = 0) {
  if (depth > MAX_NESTING_DEPTH) {
    return { error: "Selector nests functional pseudo-classes too deeply to read." };
  }
  const s = collapseWhitespace(String(input)).trim();
  if (!s) return { error: "Selector is empty." };

  let spec = { ...ZERO };
  const tokens = [];
  let i = 0;

  const push = (text, column, note) => {
    tokens.push({ text, column, note });
  };

  while (i < s.length) {
    const ch = s[i];

    // Combinators contribute nothing. [S4]
    if (ch === " ") {
      push(" ", null, "descendant combinator — contributes nothing");
      i += 1;
      continue;
    }
    if (ch === ">" || ch === "+" || ch === "~") {
      push(ch, null, "combinator — contributes nothing");
      i += 1;
      continue;
    }
    if (ch === "|" && s[i + 1] === "|") {
      push("||", null, "column combinator — contributes nothing");
      i += 2;
      continue;
    }

    // Universal selector contributes nothing. [S4]
    if (ch === "*") {
      push("*", null, "universal selector — contributes nothing");
      i += 1;
      continue;
    }

    // Namespace separator: ns|type, *|type, |type.
    if (ch === "|") {
      i += 1;
      continue;
    }

    // Nesting selector — its specificity is that of the enclosing rule, which
    // this page cannot see, so it is reported rather than guessed.
    if (ch === "&") {
      push("&", null, "nesting selector — takes the parent rule's specificity, not known here");
      i += 1;
      continue;
    }

    if (ch === "#") {
      const { text, next } = readIdent(s, i + 1);
      if (!text) return { error: 'A "#" is not followed by an ID name.' };
      spec.a += 1;
      push(`#${text}`, "a", "ID selector");
      i = next;
      continue;
    }

    if (ch === ".") {
      const { text, next } = readIdent(s, i + 1);
      if (!text) return { error: 'A "." is not followed by a class name.' };
      spec.b += 1;
      push(`.${text}`, "b", "class selector");
      i = next;
      continue;
    }

    if (ch === "[") {
      const bracket = readBrackets(s, i);
      if (!bracket) return { error: 'An attribute selector "[" is never closed.' };
      spec.b += 1;
      push(bracket.text, "b", "attribute selector");
      i = bracket.next;
      continue;
    }

    if (ch === ":") {
      const isDoubleColon = s[i + 1] === ":";
      const nameStart = i + (isDoubleColon ? 2 : 1);
      const { text: rawName, next } = readIdent(s, nameStart);
      if (!rawName) return { error: 'A ":" is not followed by a pseudo name.' };
      const name = rawName.toLowerCase();
      let after = next;
      let args = null;
      if (s[after] === "(") {
        const paren = readParens(s, after);
        if (!paren) return { error: `The "(" after :${rawName} is never closed.` };
        args = paren.inner;
        after = paren.next;
      }
      const written = `${isDoubleColon ? "::" : ":"}${rawName}${args === null ? "" : `(${args})`}`;

      if (isDoubleColon || (!args && LEGACY_PSEUDO_ELEMENTS.has(name))) {
        if (PSEUDO_ELEMENT_PLUS_ARGUMENT.has(name) && args !== null) {
          const inner = mostSpecificOfList(args, depth);
          if (inner.error) return inner;
          spec.c += 1;
          spec = add(spec, inner.spec);
          push(written, "c", `pseudo-element + its argument (${formatSpecificity(inner.spec)})`);
        } else {
          spec.c += 1;
          push(written, "c", "pseudo-element");
        }
        i = after;
        continue;
      }

      if (ZERO_SPECIFICITY_PSEUDOS.has(name)) {
        push(written, null, ":where() always contributes 0,0,0");
        i = after;
        continue;
      }

      if (ARGUMENT_SPECIFICITY_PSEUDOS.has(name)) {
        if (args === null) {
          spec.b += 1;
          push(written, "b", "pseudo-class");
          i = after;
          continue;
        }
        const inner = mostSpecificOfList(args, depth);
        if (inner.error) return inner;
        spec = add(spec, inner.spec);
        push(
          written,
          inner.spec.a || inner.spec.b || inner.spec.c ? "arg" : null,
          `takes its most specific argument (${formatSpecificity(inner.spec)})`,
        );
        i = after;
        continue;
      }

      if (PSEUDO_PLUS_ARGUMENT.has(name)) {
        spec.b += 1;
        let innerSpec = ZERO;
        if (args !== null) {
          // :nth-child(An+B of S) — only the part after "of" is a selector.
          let selectorArg = null;
          if (name === "nth-child" || name === "nth-last-child") {
            const ofMatch = /\sof\s([\s\S]+)$/i.exec(args);
            if (ofMatch) selectorArg = ofMatch[1];
          } else {
            selectorArg = args;
          }
          if (selectorArg && selectorArg.trim()) {
            const inner = mostSpecificOfList(selectorArg, depth);
            if (inner.error) return inner;
            innerSpec = inner.spec;
            spec = add(spec, innerSpec);
          }
        }
        push(
          written,
          "b",
          innerSpec === ZERO
            ? "pseudo-class"
            : `pseudo-class + its selector argument (${formatSpecificity(innerSpec)})`,
        );
        i = after;
        continue;
      }

      spec.b += 1;
      push(written, "b", "pseudo-class");
      i = after;
      continue;
    }

    if (isIdentStart(ch)) {
      const { text, next } = readIdent(s, i);
      if (!text) return { error: `Cannot read the selector at "${s.slice(i, i + 12)}".` };
      // A namespace prefix is followed by "|" and is not itself a type.
      if (s[next] === "|" && s[next + 1] !== "|" && s[next + 1] !== "=") {
        i = next + 1;
        continue;
      }
      spec.c += 1;
      push(text, "c", "type selector");
      i = next;
      continue;
    }

    return { error: `Unexpected character "${ch}" in the selector.` };
  }

  return { spec, tokens };
}

/**
 * Specificity of a single complex selector (no commas).
 * Returns { a, b, c, tokens, selector } or { error }.
 */
export function computeSpecificity(selector) {
  const raw = String(selector == null ? "" : selector).trim();
  if (!raw) return { error: "Enter a selector." };
  if (raw.length > MAX_SELECTOR_LENGTH) {
    return { error: `Selector is longer than ${MAX_SELECTOR_LENGTH} characters.` };
  }
  if (raw.includes("{") || raw.includes("}")) {
    return { error: "That looks like a whole rule — paste the selector only, without { }." };
  }
  const parts = splitTopLevelCommas(raw);
  if (parts.length > 1) {
    return {
      error:
        "A selector list has no single specificity — each comma-separated selector is judged on its own.",
    };
  }
  const scanned = scanComplexSelector(raw, 0);
  if (scanned.error) return { error: scanned.error };
  return { ...scanned.spec, tokens: scanned.tokens, selector: raw };
}

/**
 * Specificity of every selector in a comma-separated list.
 * Returns { entries: [{ selector, a, b, c, tokens }] } or { error }.
 */
export function computeSelectorList(selectorList) {
  const raw = String(selectorList == null ? "" : selectorList).trim();
  if (!raw) return { error: "Enter a selector." };
  const parts = splitTopLevelCommas(raw);
  if (!parts.length) return { error: "Enter a selector." };
  const entries = [];
  for (const part of parts) {
    const scanned = scanComplexSelector(part, 0);
    if (scanned.error) return { error: `${part.trim() || "(empty)"} — ${scanned.error}` };
    entries.push({ selector: part.trim(), ...scanned.spec, tokens: scanned.tokens });
  }
  return { entries };
}

/* ------------------------------------------------------------------ */
/* Cascade sorting                                                     */
/* ------------------------------------------------------------------ */

export const CRITERION_LABELS = {
  importance: "Importance",
  inline: "Element-attached style",
  layer: "Cascade layer",
  specificity: "Specificity",
  order: "Order of appearance",
  tie: "Identical on every criterion",
};

/**
 * Rank of a cascade layer. [C5] Unlayered declarations sit in an implicit
 * FINAL layer, so they get a rank above every named layer.
 */
export function layerRank(layer, layerOrder) {
  if (!layer) return Number.POSITIVE_INFINITY;
  const index = layerOrder.indexOf(layer);
  return index === -1 ? layerOrder.length : index;
}

/**
 * Sort two author-origin declarations by the [C5] cascade order.
 * Each declaration: { selector, spec:{a,b,c}, important, inline, layer, order }.
 * Returns { winner: "x" | "y" | "tie", criterion, reason }.
 */
export function compareDeclarations(x, y, layerOrder = []) {
  // 1. Origin and importance.
  if (Boolean(x.important) !== Boolean(y.important)) {
    const winner = x.important ? "x" : "y";
    return {
      winner,
      criterion: "importance",
      reason:
        "Importance is sorted before everything else, so the !important declaration wins whatever its specificity.",
    };
  }
  const important = Boolean(x.important);

  // 3. Element-attached styles (criterion 2, context, is out of scope).
  if (Boolean(x.inline) !== Boolean(y.inline)) {
    const winner = x.inline ? "x" : "y";
    return {
      winner,
      criterion: "inline",
      reason: important
        ? "A style-attribute declaration beats a style rule of the same importance, and both are !important here."
        : "A style-attribute declaration beats a style rule of the same importance, and specificity is never consulted.",
    };
  }

  // 4. Cascade layers.
  const rx = layerRank(x.layer, layerOrder);
  const ry = layerRank(y.layer, layerOrder);
  if (rx !== ry) {
    // Normal: last layer wins (unlayered is the implicit final layer).
    // Important: order inverted, first layer wins, unlayered loses.
    const winner = important ? (rx < ry ? "x" : "y") : rx > ry ? "x" : "y";
    return {
      winner,
      criterion: "layer",
      reason: important
        ? "For !important declarations the layer order is reversed: the earliest layer wins, and unlayered !important loses to every layered one."
        : "Layers are sorted before specificity: for normal declarations the last layer wins, and unlayered styles sit in the implicit final layer, so they beat layered ones.",
    };
  }

  // 5. Specificity.
  const bySpec = compareSpecificity(x.spec, y.spec);
  if (bySpec !== 0) {
    return {
      winner: bySpec > 0 ? "x" : "y",
      criterion: "specificity",
      reason: `Same importance, same layer, so the higher (a,b,c) wins: ${formatSpecificity(
        x.spec,
      )} vs ${formatSpecificity(y.spec)}.`,
    };
  }

  // 6. Order of appearance.
  const ox = Number(x.order) || 0;
  const oy = Number(y.order) || 0;
  if (ox !== oy) {
    return {
      winner: ox > oy ? "x" : "y",
      criterion: "order",
      reason: "Specificity ties, so the declaration that appears last in source order wins.",
    };
  }

  return { winner: "tie", criterion: "tie", reason: "The two declarations are indistinguishable." };
}

/** Rank a list of declarations from winner to loser. Returns a new array. */
export function rankDeclarations(declarations, layerOrder = []) {
  return [...declarations].sort((x, y) => {
    const result = compareDeclarations(x, y, layerOrder);
    if (result.winner === "tie") return 0;
    return result.winner === "x" ? -1 : 1;
  });
}

/* ------------------------------------------------------------------ */
/* Minimum specificity change                                          */
/* ------------------------------------------------------------------ */

const COLUMN_UNITS = {
  a: "ID selector",
  b: "class, attribute or pseudo-class selector",
  c: "type selector or pseudo-element",
};

/**
 * Smallest number of units to add to `loser` in each column so that it
 * outranks `target` on specificity alone.
 * Returns [{ column, add, result, unit }] sorted cheapest first.
 */
export function minimumSpecificityChange(loser, target) {
  const options = [];
  for (const column of ["c", "b", "a"]) {
    for (let k = 1; k <= MAX_SEARCH_UNITS; k += 1) {
      const trial = { ...loser, [column]: loser[column] + k };
      if (compareSpecificity(trial, target) > 0) {
        options.push({ column, add: k, result: trial, unit: COLUMN_UNITS[column] });
        break;
      }
    }
  }
  return options.sort((x, y) => x.add - y.add || "cba".indexOf(x.column) - "cba".indexOf(y.column));
}

/* ------------------------------------------------------------------ */
/* Two-selector mode (the hero)                                        */
/* ------------------------------------------------------------------ */

function buildSide(input, order, label) {
  const layer = String(input.layer || "").trim();
  const inline = Boolean(input.inline);
  const base = {
    label,
    important: Boolean(input.important),
    inline,
    // A style attribute is never inside a cascade layer.
    layer: inline ? "" : layer,
    order,
  };
  // A style attribute has no selector, so it has no specificity to compute —
  // it is sorted at criterion 3, above every style rule of the same importance.
  if (base.inline) {
    return { ...base, selector: "element.style", spec: { ...ZERO }, tokens: [] };
  }
  const spec = computeSpecificity(input.selector);
  if (spec.error) return { error: `${label}: ${spec.error}` };
  return {
    ...base,
    selector: spec.selector,
    spec: { a: spec.a, b: spec.b, c: spec.c },
    tokens: spec.tokens,
  };
}

/**
 * The hero comparison: the rule that IS winning (`current`) against the rule
 * you want to win (`wanted`).
 *
 * current / wanted: { selector, important, inline, layer }
 * options: { layerOrder: string[], wantedIsLater: boolean }
 *
 * Returns { incumbent, challenger, layerOrder, winner, criterion, reason, wantedWins, flips[] }
 * or { error }.
 */
export function refereeTwoSelectors(current, wanted, options = {}) {
  const layerOrderRaw = Array.isArray(options.layerOrder)
    ? options.layerOrder
    : splitTopLevelCommas(String(options.layerOrder || "")).map((name) => name.trim());
  const layerOrder = layerOrderRaw.filter(Boolean);
  const wantedIsLater = options.wantedIsLater !== false;

  const x = buildSide(current || {}, 0, "Winning now");
  if (x.error) return { error: x.error };
  const y = buildSide(wanted || {}, wantedIsLater ? 1 : -1, "Want to win");
  if (y.error) return { error: y.error };

  for (const side of [x, y]) {
    if (side.layer && !layerOrder.includes(side.layer)) layerOrder.push(side.layer);
  }

  const verdict = compareDeclarations(x, y, layerOrder);
  const wantedWins = verdict.winner === "y";

  const flips = wantedWins ? [] : buildFlips(x, y, layerOrder, verdict);

  return {
    incumbent: x,
    challenger: y,
    layerOrder,
    winner:
      verdict.winner === "x" ? "incumbent" : verdict.winner === "y" ? "challenger" : "tie",
    criterion: verdict.criterion,
    reason: verdict.reason,
    wantedWins,
    flips,
  };
}

/**
 * Every single change that, on its own, makes `y` win, with the criterion that
 * then decides. Facts of the form "if X, then Y wins at step Z".
 */
function buildFlips(x, y, layerOrder, verdict) {
  const flips = [];
  const test = (patch) => {
    const trial = { ...y, ...patch };
    const result = compareDeclarations(x, trial, layerOrder);
    return { wins: result.winner === "y", criterion: result.criterion, reason: result.reason };
  };

  if (!y.important) {
    const marked = test({ important: true });
    flips.push({
      lever: "important",
      change: "Mark the wanted declaration !important",
      outcome: marked.wins
        ? `It wins — ${CRITERION_LABELS[marked.criterion].toLowerCase()} decides.`
        : `It still loses — ${CRITERION_LABELS[marked.criterion].toLowerCase()} decides, because the other declaration is ${
            x.important ? "also !important" : "an element-attached style"
          }.`,
      wins: marked.wins,
    });
  }

  if (!y.inline) {
    const moved = test({ inline: true, layer: "", spec: { ...ZERO } });
    flips.push({
      lever: "inline",
      change: "Move it to the element's style attribute",
      outcome: moved.wins
        ? "It wins — element-attached styles are sorted above style rules of the same importance, before specificity is looked at."
        : `It still loses — ${CRITERION_LABELS[moved.criterion].toLowerCase()} decides.`,
      wins: moved.wins,
    });
  }

  if (verdict.criterion === "layer") {
    const target = x.layer || "the unlayered block";
    flips.push({
      lever: "layer",
      change: y.important
        ? `Declare its layer before ${target}, or remove the !important from the other rule`
        : `Move it out of @layer ${y.layer || "(none)"} into ${
            x.layer ? `a layer declared after ${x.layer}, or out of layers entirely` : "unlayered CSS"
          }`,
      outcome: y.important
        ? "For !important declarations the earliest layer wins, so only an earlier layer (or dropping importance on the other side) changes the result."
        : "For normal declarations the last layer wins and unlayered CSS is the implicit final layer.",
      wins: true,
    });
  }

  if (!x.inline && Boolean(x.important) === Boolean(y.important)) {
    const sameLayer = layerRank(x.layer, layerOrder) === layerRank(y.layer, layerOrder);
    if (sameLayer) {
      const needed = minimumSpecificityChange(y.spec, x.spec);
      for (const option of needed) {
        flips.push({
          lever: "specificity",
          change: `Add ${option.add} ${option.unit}${option.add > 1 ? "s" : ""} to the wanted selector`,
          outcome: `Its specificity becomes ${formatSpecificity(option.result)}, above ${formatSpecificity(
            x.spec,
          )}.`,
          wins: true,
        });
      }
      if (compareSpecificity(y.spec, x.spec) === 0 && verdict.criterion === "order") {
        flips.push({
          lever: "order",
          change: "Move the wanted rule after the other one in source order",
          outcome:
            "Specificity is identical, so order of appearance is the last criterion and the later rule wins.",
          wins: true,
        });
      }
      // :where() zeroes its argument, so wrapping the other selector only
      // decides the fight when the wanted selector is itself above 0,0,0.
      if (compareSpecificity(y.spec, ZERO) > 0) {
        flips.push({
          lever: "where",
          change: `Wrap the other selector in :where() — :where(${x.selector})`,
          outcome: `Its specificity drops to 0,0,0, below the wanted selector's ${formatSpecificity(
            y.spec,
          )}.`,
          wins: true,
        });
      }
    }
  }

  return flips.filter((flip) => flip.wins !== false || flip.lever === "important" || flip.lever === "inline");
}

/* ------------------------------------------------------------------ */
/* Stylesheet parsing with layer context                               */
/* ------------------------------------------------------------------ */

const AT_RULE_TRANSPARENT = /^@(media|supports|container|scope|document)\b/i;
const AT_LAYER_BLOCK = /^@layer\b\s*([^{]*)$/i;
const AT_LAYER_STATEMENT = /^@layer\b\s*([^;]*)$/i;

/** Strip a trailing !important from a value. Returns { value, important }. */
export function splitImportant(value) {
  const text = String(value == null ? "" : value).trim();
  const match = /!\s*important\s*$/i.exec(text);
  if (!match) return { value: text, important: false };
  return { value: text.slice(0, match.index).trim(), important: true };
}

/**
 * Flatten a parsed stylesheet into declarations, tracking cascade layers.
 * Returns { rules: [{ selector, spec, property, value, important, layer, order }],
 *           layerOrder: string[] } or { error }.
 */
export function flattenStylesheet(css) {
  const parsed = parseCss(String(css == null ? "" : css));
  if (parsed.error) return { error: parsed.error };

  const layerOrder = [];
  const rules = [];
  let order = 0;
  let failure = null;

  const noteLayer = (name) => {
    if (name && !layerOrder.includes(name)) layerOrder.push(name);
  };

  const walk = (nodes, layer) => {
    for (const node of nodes) {
      if (failure) return;
      if (node.type === "at-statement") {
        const statement = AT_LAYER_STATEMENT.exec(node.text.trim());
        if (statement && /^@layer/i.test(node.text.trim())) {
          for (const name of splitTopLevelCommas(statement[1])) {
            noteLayer(layer ? `${layer}.${name.trim()}` : name.trim());
          }
        }
        continue;
      }
      if (node.type !== "rule") continue;

      const prelude = node.prelude.trim();
      if (prelude.startsWith("@")) {
        const layerBlock = AT_LAYER_BLOCK.exec(prelude);
        if (layerBlock && /^@layer/i.test(prelude)) {
          const name = layerBlock[1].trim();
          const full = name ? (layer ? `${layer}.${name}` : name) : layer;
          if (name) noteLayer(full);
          walk(node.nodes, full);
          continue;
        }
        if (AT_RULE_TRANSPARENT.test(prelude)) {
          walk(node.nodes, layer);
          continue;
        }
        // @keyframes, @font-face and friends hold no cascading declarations
        // that this tool compares.
        continue;
      }

      for (const selector of splitTopLevelCommas(prelude)) {
        const scanned = scanComplexSelector(selector, 0);
        if (scanned.error) {
          failure = `${selector.trim()} — ${scanned.error}`;
          return;
        }
        for (const child of node.nodes) {
          if (child.type !== "declaration") continue;
          const { value, important } = splitImportant(child.value);
          order += 1;
          rules.push({
            selector: selector.trim(),
            spec: scanned.spec,
            tokens: scanned.tokens,
            property: child.property.toLowerCase(),
            value,
            important,
            inline: false,
            layer: layer || "",
            order,
          });
        }
      }
    }
  };

  walk(parsed.nodes, "");
  if (failure) return { error: failure };
  return { rules, layerOrder };
}

/* ------------------------------------------------------------------ */
/* Element descriptor matching                                         */
/* ------------------------------------------------------------------ */

/**
 * Parse an element descriptor such as `button#save.btn.primary[type=submit]`.
 * Returns { type, id, classes, attributes } or { error }.
 */
export function parseElementDescriptor(input) {
  const s = collapseWhitespace(String(input == null ? "" : input)).trim();
  if (!s) return { error: "Describe the element, for example button#save.btn." };
  if (/[\s>+~,]/.test(s)) {
    return { error: "Describe one element only — no spaces, commas or combinators." };
  }
  const out = { type: "", id: "", classes: [], attributes: {} };
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === "#") {
      const { text, next } = readIdent(s, i + 1);
      if (!text) return { error: 'A "#" is not followed by an ID.' };
      out.id = text;
      i = next;
      continue;
    }
    if (ch === ".") {
      const { text, next } = readIdent(s, i + 1);
      if (!text) return { error: 'A "." is not followed by a class name.' };
      out.classes.push(text);
      i = next;
      continue;
    }
    if (ch === "[") {
      const bracket = readBrackets(s, i);
      if (!bracket) return { error: 'An attribute "[" is never closed.' };
      const body = bracket.text.slice(1, -1).trim();
      const eq = body.indexOf("=");
      if (eq === -1) out.attributes[body.toLowerCase()] = null;
      else {
        const name = body.slice(0, eq).replace(/[~^|$*]$/, "").trim().toLowerCase();
        out.attributes[name] = body
          .slice(eq + 1)
          .trim()
          .replace(/^["']|["']$/g, "");
      }
      i = bracket.next;
      continue;
    }
    if (isIdentStart(ch)) {
      const { text, next } = readIdent(s, i);
      out.type = text.toLowerCase();
      i = next;
      continue;
    }
    return { error: `Unexpected character "${ch}" in the element description.` };
  }
  return out;
}

/** The subject compound of a complex selector: everything after the last combinator. */
export function subjectCompound(selector) {
  const s = collapseWhitespace(selector).trim();
  let depth = 0;
  let quote = null;
  let start = 0;
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (quote) {
      if (ch === "\\") i += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(" || ch === "[") depth += 1;
    else if (ch === ")" || ch === "]") depth = Math.max(0, depth - 1);
    else if (depth === 0 && (ch === " " || ch === ">" || ch === "+" || ch === "~")) start = i + 1;
  }
  return s.slice(start);
}

/**
 * Does the subject compound of `selector` match the element descriptor?
 * Ancestor parts, pseudo-classes and element state cannot be checked without a
 * DOM, so they are reported as assumptions instead of being guessed at.
 * Returns { match, assumptions: string[] }.
 */
export function matchesSubject(selector, element) {
  const compound = subjectCompound(selector);
  const scanned = scanComplexSelector(compound, 0);
  if (scanned.error) return { match: false, assumptions: [] };

  const assumptions = [];
  if (compound !== collapseWhitespace(selector).trim()) {
    assumptions.push("ancestor and combinator parts assumed to match");
  }

  for (const token of scanned.tokens) {
    const text = token.text;
    if (text === "*" || token.column === null) continue;
    if (text.startsWith("#")) {
      if (text.slice(1) !== element.id) return { match: false, assumptions };
      continue;
    }
    if (text.startsWith(".")) {
      if (!element.classes.includes(text.slice(1))) return { match: false, assumptions };
      continue;
    }
    if (text.startsWith("[")) {
      const body = text.slice(1, -1).trim();
      const eq = body.indexOf("=");
      const name = (eq === -1 ? body : body.slice(0, eq).replace(/[~^|$*]$/, ""))
        .trim()
        .toLowerCase();
      if (!(name in element.attributes)) return { match: false, assumptions };
      if (eq !== -1) {
        const wanted = body
          .slice(eq + 1)
          .trim()
          .replace(/^["']|["']$/g, "")
          .replace(/\s+i$/i, "");
        const actual = element.attributes[name];
        if (actual !== null && actual !== wanted) return { match: false, assumptions };
      }
      continue;
    }
    if (text.startsWith(":")) {
      assumptions.push(`${text} assumed to match`);
      continue;
    }
    // Type selector.
    if (element.type && text.toLowerCase() !== element.type) return { match: false, assumptions };
    if (!element.type) assumptions.push(`type selector ${text} assumed to match`);
  }

  return { match: true, assumptions: [...new Set(assumptions)] };
}

/**
 * Full stylesheet mode: which rules in `css` fight over `property` on the
 * element described by `element`, and which declaration wins.
 * Returns { property, element, matches, ranked, winner, layerOrder, assumptions }
 * or { error }.
 */
export function analyseStylesheet({ css, element, property, inlineValue = "" }) {
  const flat = flattenStylesheet(css);
  if (flat.error) return { error: flat.error };
  if (!flat.rules.length) return { error: "No style rules with declarations were found in that CSS." };

  const target = parseElementDescriptor(element);
  if (target.error) return { error: target.error };

  const prop = String(property || "").trim().toLowerCase();
  if (!prop) return { error: "Name the property you are chasing, for example color." };

  const assumptions = new Set();
  const matches = [];
  for (const rule of flat.rules) {
    if (rule.property !== prop) continue;
    const test = matchesSubject(rule.selector, target);
    if (!test.match) continue;
    for (const note of test.assumptions) assumptions.add(note);
    matches.push(rule);
  }

  const inline = splitImportant(inlineValue);
  if (inline.value) {
    matches.push({
      selector: "element.style",
      spec: { ...ZERO },
      tokens: [],
      property: prop,
      value: inline.value,
      important: inline.important,
      inline: true,
      layer: "",
      order: Number.MAX_SAFE_INTEGER,
    });
  }

  if (!matches.length) {
    return {
      error: `No rule in that CSS sets ${prop} on an element matching ${collapseWhitespace(String(element)).trim()}.`,
    };
  }

  const ranked = rankDeclarations(matches, flat.layerOrder);
  const winner = ranked[0];
  const runnerUp = ranked[1];
  const verdict = runnerUp ? compareDeclarations(winner, runnerUp, flat.layerOrder) : null;

  return {
    property: prop,
    element: target,
    matches,
    ranked,
    winner,
    criterion: verdict ? verdict.criterion : "only",
    reason: verdict ? verdict.reason : "Only one declaration matches, so nothing has to be sorted.",
    layerOrder: flat.layerOrder,
    assumptions: [...assumptions],
  };
}

/* ------------------------------------------------------------------ */
/* DevTools paste mode                                                 */
/* ------------------------------------------------------------------ */

/** Lines DevTools adds around the CSS that are not CSS. */
const DEVTOOLS_NOISE =
  /^\s*(user agent stylesheet|inherited from\b.*|<style>.*|injected stylesheet|constructed stylesheet|\(index\).*|[\w./\\-]+\.(css|html?|jsx?|tsx?|vue|svelte|php):\d+(:\d+)?|show all|filter)\s*$/i;

/** A trailing "  style.css:42" / "<style>" source column on a selector line. */
const SOURCE_SUFFIX = /\s+(?:[\w./\\-]+\.(?:css|html?|jsx?|tsx?|vue|svelte|php):\d+(?::\d+)?|<style>[^\s]*|user agent stylesheet)\s*$/i;

/**
 * Turn a Chrome/Firefox Styles-pane paste into parseable CSS: drop the source
 * columns and the pane's own labels, and close any block the paste cut off.
 */
export function cleanDevToolsPaste(text) {
  const lines = String(text == null ? "" : text).split(/\r?\n/);
  const kept = [];
  for (const line of lines) {
    let cleaned = line.replace(/^[\s✓✔✗×-]*/, (prefix) =>
      prefix.replace(/[✓✔✗×]/g, ""),
    );
    if (!cleaned.trim()) continue;
    if (DEVTOOLS_NOISE.test(cleaned)) continue;
    if (cleaned.includes("{") && !cleaned.includes("}")) {
      cleaned = cleaned.slice(0, cleaned.indexOf("{") + 1);
    } else {
      cleaned = cleaned.replace(SOURCE_SUFFIX, "");
    }
    kept.push(cleaned);
  }
  let joined = kept.join("\n");
  const opens = (joined.match(/\{/g) || []).length;
  const closes = (joined.match(/\}/g) || []).length;
  if (opens > closes) joined += "\n" + "}".repeat(opens - closes);
  return joined;
}

/**
 * DevTools paste mode: paste the Styles pane and get the winner for one
 * property. `element.style { }` in the paste is read as an element-attached
 * style, exactly as DevTools labels it.
 * Returns { property, ranked, winner, criterion, reason, layerOrder } or { error }.
 */
export function analyseDevToolsPaste({ paste, property }) {
  const cleaned = cleanDevToolsPaste(paste);
  if (!cleaned.trim()) return { error: "Paste the Styles pane from DevTools." };

  const flat = flattenStylesheet(cleaned);
  if (flat.error) return { error: flat.error };
  if (!flat.rules.length) {
    return { error: "No declarations were found in that paste — copy the rule blocks, braces and all." };
  }

  const wanted = String(property || "").trim().toLowerCase();
  const properties = [...new Set(flat.rules.map((rule) => rule.property))];
  const prop = wanted || properties[0];

  const matches = flat.rules
    .filter((rule) => rule.property === prop)
    .map((rule) =>
      /^element\.style$/i.test(rule.selector)
        ? { ...rule, inline: true, spec: { ...ZERO }, order: Number.MAX_SAFE_INTEGER }
        : rule,
    );

  if (!matches.length) {
    return { error: `No declaration for "${prop}" is in that paste. Found: ${properties.join(", ")}.` };
  }

  const ranked = rankDeclarations(matches, flat.layerOrder);
  const winner = ranked[0];
  const runnerUp = ranked[1];
  const verdict = runnerUp ? compareDeclarations(winner, runnerUp, flat.layerOrder) : null;

  return {
    property: prop,
    properties,
    ranked,
    winner,
    criterion: verdict ? verdict.criterion : "only",
    reason: verdict ? verdict.reason : "Only one declaration sets this property, so nothing has to be sorted.",
    layerOrder: flat.layerOrder,
  };
}
