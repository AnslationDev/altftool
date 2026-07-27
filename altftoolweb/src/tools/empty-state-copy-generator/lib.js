/**
 * Empty, error and loading state microcopy.
 *
 * Templates are deterministic: the same state, tone and noun always produce
 * the same wording. Nothing here calls a model or a network.
 *
 * Pure functions only: no DOM, no React, no Date.now().
 */

/**
 * Heading length that still fits one line on a 375px viewport at a normal
 * display size. Longer headings wrap and lose their scannability.
 */
export const HEADING_MAX_CHARS = 50;

/** Two comfortable lines of supporting text on a phone. */
export const BODY_MAX_CHARS = 140;

/** Button labels read fastest as a verb plus at most two more words. */
export const ACTION_MAX_WORDS = 3;

/**
 * Apologies and blame in an error state waste the line that should carry the
 * fix. Standard product-writing guidance (Nielsen Norman Group, Material,
 * Apple HIG) is the same: say what happened and what to do next.
 */
export const APOLOGY_WORDS = Object.freeze(["oops", "whoops", "uh oh", "sorry", "apologies", "unfortunately"]);
export const BLAME_WORDS = Object.freeze(["you failed", "you forgot", "your mistake", "illegal", "invalid user", "you did not"]);

/** Button labels that tell the reader nothing about what will happen. */
export const WEAK_ACTIONS = Object.freeze(["ok", "yes", "no", "submit", "click here", "here", "go", "continue"]);

/** Words that turn a loading message into a promise you cannot keep. */
export const TIME_PROMISE_WORDS = Object.freeze(["a second", "a moment", "a minute", "shortly", "almost done"]);

export const TONES = Object.freeze([
  { id: "plain", name: "Plain", note: "Neutral and direct. The safe default for tools and dashboards." },
  { id: "friendly", name: "Friendly", note: "Warm but not jokey. Suits consumer products." },
  { id: "formal", name: "Formal", note: "Restrained and precise. Suits finance, health and enterprise." },
  { id: "playful", name: "Playful", note: "Light. Only for low-stakes empty states, never for errors." },
]);

export const STATE_GROUPS = Object.freeze(["Empty", "Error", "Loading"]);

/**
 * Every template uses these placeholders:
 *   {object}   singular noun, lowercase       e.g. invoice
 *   {objects}  plural noun, lowercase         e.g. invoices
 *   {Object}   singular noun, capitalised
 *   {Objects}  plural noun, capitalised
 *   {action}   the verb phrase for creating one e.g. create an invoice
 *   {app}      the product name
 */
export const STATE_TYPES = Object.freeze([
  {
    id: "empty-first-run",
    group: "Empty",
    name: "First run - nothing created yet",
    guidance: "Say what this space is for, then give one action. Do not just say the list is empty.",
    tones: {
      plain: {
        heading: "No {objects} yet",
        body: "{Objects} you {action} will show up here.",
        primary: "New {object}",
        secondary: "Learn more",
      },
      friendly: {
        heading: "Your {objects} will live here",
        body: "Nothing yet. Make your first {object} and it will appear in this list.",
        primary: "Create {object}",
        secondary: "See an example",
      },
      formal: {
        heading: "No {objects} recorded",
        body: "This list will populate once a {object} has been created.",
        primary: "Create {object}",
        secondary: "View documentation",
      },
      playful: {
        heading: "A blank page, for now",
        body: "Your first {object} is one click away. We will keep the seat warm.",
        primary: "Start a {object}",
        secondary: "Show me around",
      },
    },
  },
  {
    id: "empty-no-results",
    group: "Empty",
    name: "Search returned nothing",
    guidance: "Echo the query, then offer a way out: clear the search or broaden it.",
    tones: {
      plain: {
        heading: "No {objects} match that search",
        body: "Check the spelling, or search for a shorter phrase.",
        primary: "Clear search",
        secondary: "Browse all {objects}",
      },
      friendly: {
        heading: "Nothing matched that",
        body: "Try a shorter phrase or a different spelling and we will look again.",
        primary: "Clear search",
        secondary: "Browse all {objects}",
      },
      formal: {
        heading: "No results found",
        body: "No {objects} match the current query. Revise the search terms and try again.",
        primary: "Clear search",
        secondary: "View all {objects}",
      },
      playful: {
        heading: "That one is not here",
        body: "No {objects} matched. Fewer words usually finds more.",
        primary: "Clear search",
        secondary: "Show everything",
      },
    },
  },
  {
    id: "empty-filtered",
    group: "Empty",
    name: "Filters exclude everything",
    guidance: "Make clear the data exists but the filters hide it, and offer a one-tap reset.",
    tones: {
      plain: {
        heading: "No {objects} match these filters",
        body: "Remove a filter to see more {objects}.",
        primary: "Reset filters",
        secondary: "Edit filters",
      },
      friendly: {
        heading: "Your filters are hiding everything",
        body: "There are {objects} here, just none that match all of these filters at once.",
        primary: "Reset filters",
        secondary: "Edit filters",
      },
      formal: {
        heading: "No {objects} match the selected filters",
        body: "Adjust or clear the active filters to display results.",
        primary: "Clear filters",
        secondary: "Edit filters",
      },
      playful: {
        heading: "Filtered down to nothing",
        body: "The {objects} are still there. The filters are just being strict.",
        primary: "Reset filters",
        secondary: "Loosen them up",
      },
    },
  },
  {
    id: "empty-cleared",
    group: "Empty",
    name: "Everything done or archived",
    guidance: "Confirm the completion, do not make it read like a failure, and offer the next step.",
    tones: {
      plain: {
        heading: "All {objects} cleared",
        body: "Nothing left to handle. New {objects} will appear here.",
        primary: "View archive",
        secondary: "New {object}",
      },
      friendly: {
        heading: "You are all caught up",
        body: "Every {object} is handled. Anything new will land right here.",
        primary: "View archive",
        secondary: "New {object}",
      },
      formal: {
        heading: "No outstanding {objects}",
        body: "All {objects} have been processed. The archive holds the completed records.",
        primary: "View archive",
        secondary: "Create {object}",
      },
      playful: {
        heading: "Inbox zero, {object} edition",
        body: "Nothing left. Enjoy it while it lasts.",
        primary: "View archive",
        secondary: "New {object}",
      },
    },
  },
  {
    id: "error-network",
    group: "Error",
    name: "No connection",
    guidance: "State the cause, confirm nothing was lost, give a retry. Never apologise instead of explaining.",
    tones: {
      plain: {
        heading: "Cannot reach {app}",
        body: "Your device looks offline. Nothing you entered was lost.",
        primary: "Try again",
        secondary: "Work offline",
      },
      friendly: {
        heading: "You seem to be offline",
        body: "We will pick up where you left off as soon as the connection is back.",
        primary: "Try again",
        secondary: "Work offline",
      },
      formal: {
        heading: "Connection unavailable",
        body: "{app} could not be reached. Unsaved changes have been retained locally.",
        primary: "Retry",
        secondary: "Continue offline",
      },
      playful: {
        heading: "The network wandered off",
        body: "Nothing was lost. Give it a second and try again.",
        primary: "Try again",
        secondary: "Work offline",
      },
    },
  },
  {
    id: "error-server",
    group: "Error",
    name: "Server error (500)",
    guidance: "Own the fault, say the user did nothing wrong, and give one retry plus a way to report it.",
    tones: {
      plain: {
        heading: "Something broke on our side",
        body: "This is not your fault. Try again, and if it keeps happening let us know.",
        primary: "Try again",
        secondary: "Report a problem",
      },
      friendly: {
        heading: "That did not work on our end",
        body: "Nothing you did caused this. One more try usually fixes it.",
        primary: "Try again",
        secondary: "Report a problem",
      },
      formal: {
        heading: "The request could not be completed",
        body: "An error occurred on the server. The issue has been logged; please retry.",
        primary: "Retry",
        secondary: "Contact support",
      },
      playful: {
        heading: "Our server tripped over a cable",
        body: "Not your doing. Give it another go.",
        primary: "Try again",
        secondary: "Tell us about it",
      },
    },
  },
  {
    id: "error-permission",
    group: "Error",
    name: "No permission (403)",
    guidance: "Say who can grant access rather than only saying no, and never imply wrongdoing.",
    tones: {
      plain: {
        heading: "You do not have access to this {object}",
        body: "Ask a workspace admin to grant access, or switch to an account that has it.",
        primary: "Request access",
        secondary: "Switch account",
      },
      friendly: {
        heading: "This {object} is not shared with you",
        body: "An admin can add you in a couple of clicks.",
        primary: "Request access",
        secondary: "Switch account",
      },
      formal: {
        heading: "Access to this {object} is restricted",
        body: "Your account does not hold the required permission. Contact a workspace administrator.",
        primary: "Request access",
        secondary: "Switch account",
      },
      playful: {
        heading: "This door is locked",
        body: "An admin holds the key. Ask and they can let you in.",
        primary: "Request access",
        secondary: "Switch account",
      },
    },
  },
  {
    id: "error-notfound",
    group: "Error",
    name: "Not found (404)",
    guidance: "Say what is missing and give a route back. A 404 with only a number is a dead end.",
    tones: {
      plain: {
        heading: "That {object} no longer exists",
        body: "It may have been deleted or the link may be out of date.",
        primary: "Back to {objects}",
        secondary: "Search {objects}",
      },
      friendly: {
        heading: "We could not find that {object}",
        body: "It might have moved or been deleted. Here is the way back.",
        primary: "Back to {objects}",
        secondary: "Search {objects}",
      },
      formal: {
        heading: "The requested {object} was not found",
        body: "The record may have been removed or the address may be incorrect.",
        primary: "Return to {objects}",
        secondary: "Search {objects}",
      },
      playful: {
        heading: "This {object} has left the building",
        body: "Deleted, moved, or never here. Either way, back you go.",
        primary: "Back to {objects}",
        secondary: "Search {objects}",
      },
    },
  },
  {
    id: "error-validation",
    group: "Error",
    name: "Form field rejected",
    guidance: "Name the field, state the rule, show a valid example. Never say only 'invalid'.",
    tones: {
      plain: {
        heading: "Check this field",
        body: "Enter the {object} in the format shown in the example below the field.",
        primary: "Fix it",
        secondary: "See an example",
      },
      friendly: {
        heading: "That format will not work",
        body: "Use the format shown under the field and this will go through.",
        primary: "Fix it",
        secondary: "See an example",
      },
      formal: {
        heading: "The {object} field requires a different format",
        body: "Provide the value in the format described beneath the field, then resubmit.",
        primary: "Amend entry",
        secondary: "View format rules",
      },
      playful: {
        heading: "Almost - wrong shape",
        body: "The {object} needs the format shown just below. Then you are through.",
        primary: "Fix it",
        secondary: "See an example",
      },
    },
  },
  {
    id: "loading-initial",
    group: "Loading",
    name: "First load",
    guidance: "Name what is loading. Do not promise a duration you cannot guarantee.",
    tones: {
      plain: {
        heading: "Loading {objects}",
        body: "Fetching your {objects} from {app}.",
        primary: "Cancel",
        secondary: "",
      },
      friendly: {
        heading: "Getting your {objects}",
        body: "Pulling everything together now.",
        primary: "Cancel",
        secondary: "",
      },
      formal: {
        heading: "Retrieving {objects}",
        body: "{app} is loading the requested records.",
        primary: "Cancel",
        secondary: "",
      },
      playful: {
        heading: "Rounding up your {objects}",
        body: "They are on their way.",
        primary: "Cancel",
        secondary: "",
      },
    },
  },
  {
    id: "loading-more",
    group: "Loading",
    name: "Loading more items",
    guidance: "Keep it to a line. The list above is already usable, so do not block it.",
    tones: {
      plain: {
        heading: "Loading more {objects}",
        body: "More {objects} are on the way.",
        primary: "Stop loading",
        secondary: "",
      },
      friendly: {
        heading: "Getting more {objects}",
        body: "Keep scrolling, more are coming.",
        primary: "Stop loading",
        secondary: "",
      },
      formal: {
        heading: "Loading additional {objects}",
        body: "Further records are being retrieved.",
        primary: "Stop loading",
        secondary: "",
      },
      playful: {
        heading: "More {objects} incoming",
        body: "Keep scrolling.",
        primary: "Stop loading",
        secondary: "",
      },
    },
  },
]);

/**
 * English plural for a common noun. Handles the -s/-x/-z/-ch/-sh, consonant+y
 * and -f/-fe rules; irregular nouns are looked up.
 */
export const IRREGULAR_PLURALS = Object.freeze({
  person: "people",
  child: "children",
  man: "men",
  woman: "women",
  foot: "feet",
  tooth: "teeth",
  mouse: "mice",
  datum: "data",
  analysis: "analyses",
  status: "statuses",
});

export function pluralise(word) {
  if (typeof word !== "string") return "";
  const trimmed = word.trim();
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  if (IRREGULAR_PLURALS[lower]) return IRREGULAR_PLURALS[lower];
  if (/(s|x|z|ch|sh)$/i.test(trimmed)) return `${trimmed}es`;
  if (/[^aeiou]y$/i.test(trimmed)) return `${trimmed.slice(0, -1)}ies`;
  if (/(f)$/i.test(trimmed)) return `${trimmed.slice(0, -1)}ves`;
  if (/fe$/i.test(trimmed)) return `${trimmed.slice(0, -2)}ves`;
  return `${trimmed}s`;
}

const capitalise = (text) => (text ? text[0].toUpperCase() + text.slice(1) : text);

function fill(template, values) {
  if (typeof template !== "string") return "";
  return template
    .replace(/\{Objects\}/g, capitalise(values.objects))
    .replace(/\{Object\}/g, capitalise(values.object))
    .replace(/\{objects\}/g, values.objects)
    .replace(/\{object\}/g, values.object)
    .replace(/\{action\}/g, values.action)
    .replace(/\{app\}/g, values.app);
}

/**
 * Produce copy for one state in one tone.
 *
 * @param {object} input
 * @param {string} input.stateId
 * @param {string} input.toneId
 * @param {string} input.object  - the singular noun, e.g. "invoice".
 * @param {string} [input.action] - the verb phrase, e.g. "create".
 * @param {string} [input.appName]
 * @returns {object} copy, or { error }.
 */
export function generateStateCopy({
  stateId = "empty-first-run",
  toneId = "plain",
  object = "",
  action = "create",
  appName = "the app",
} = {}) {
  const state = STATE_TYPES.find((entry) => entry.id === stateId);
  if (!state) return { error: "Pick a state from the list." };
  const tone = TONES.find((entry) => entry.id === toneId);
  if (!tone) return { error: "Pick a tone from the list." };

  const noun = String(object).trim().toLowerCase();
  if (!noun) return { error: "Enter the thing this screen lists, for example invoice or project." };
  if (noun.length > 40) return { error: "Keep the noun under 40 characters - it has to fit in a heading." };
  if (/[<>{}]/.test(noun)) return { error: "The noun cannot contain angle brackets or braces." };

  const values = {
    object: noun,
    objects: pluralise(noun),
    action: String(action).trim().toLowerCase() || "create",
    app: String(appName).trim() || "the app",
  };

  const template = state.tones[tone.id];
  if (!template) return { error: "That tone is not available for this state." };

  if (state.group === "Error" && tone.id === "playful") {
    // Still generated, but the caller is told why this pairing is risky.
    values.warnPlayfulError = true;
  }

  return {
    stateId: state.id,
    stateName: state.name,
    group: state.group,
    guidance: state.guidance,
    toneId: tone.id,
    toneName: tone.name,
    heading: fill(template.heading, values),
    body: fill(template.body, values),
    primaryAction: fill(template.primary, values),
    secondaryAction: fill(template.secondary, values),
    object: values.object,
    objects: values.objects,
    playfulError: state.group === "Error" && tone.id === "playful",
  };
}

/** All four tones for a state, so the wording can be compared side by side. */
export function generateAllTones({ stateId, object, action, appName } = {}) {
  const out = [];
  for (const tone of TONES) {
    const copy = generateStateCopy({ stateId, toneId: tone.id, object, action, appName });
    if (copy.error) return { error: copy.error };
    out.push(copy);
  }
  return { variants: out };
}

const containsAny = (text, list) => list.filter((needle) => text.toLowerCase().includes(needle));

/**
 * Lint a piece of state copy against the microcopy rules.
 *
 * @returns {object} { issues, score, ... } or { error }.
 */
export function reviewCopy({ heading = "", body = "", primaryAction = "", group = "Empty" } = {}) {
  const h = String(heading).trim();
  const b = String(body).trim();
  const a = String(primaryAction).trim();
  if (!h && !b && !a) {
    return { error: "There is no copy to review yet." };
  }

  const issues = [];
  if (!h) {
    issues.push({ level: "error", message: "There is no heading. A state without a heading reads as a broken screen." });
  } else if (h.length > HEADING_MAX_CHARS) {
    issues.push({
      level: "warning",
      message: `The heading is ${h.length} characters. Past ${HEADING_MAX_CHARS} it wraps to two lines on a 375px screen.`,
    });
  }
  if (h.endsWith(".")) {
    issues.push({ level: "info", message: "Headings normally drop the full stop." });
  }
  if (b.length > BODY_MAX_CHARS) {
    issues.push({
      level: "warning",
      message: `The body is ${b.length} characters. Keep it under ${BODY_MAX_CHARS} so it stays two lines on a phone.`,
    });
  }
  if (!a) {
    issues.push({
      level: group === "Loading" ? "info" : "warning",
      message: "There is no action. An empty or error state without a next step leaves the reader stuck.",
    });
  } else {
    const words = a.split(/\s+/).filter(Boolean);
    if (words.length > ACTION_MAX_WORDS) {
      issues.push({
        level: "warning",
        message: `The button label is ${words.length} words. ${ACTION_MAX_WORDS} or fewer reads faster and fits a narrow button.`,
      });
    }
    if (WEAK_ACTIONS.includes(a.toLowerCase())) {
      issues.push({
        level: "warning",
        message: `"${a}" does not say what will happen. Name the outcome instead, such as "Create invoice".`,
      });
    }
  }

  const combined = `${h} ${b}`;
  const apologies = containsAny(combined, APOLOGY_WORDS);
  if (apologies.length > 0 && group === "Error") {
    issues.push({
      level: "warning",
      message: `"${apologies[0]}" spends the line that should carry the fix. Say what happened and what to do instead.`,
    });
  }
  const blame = containsAny(combined, BLAME_WORDS);
  if (blame.length > 0) {
    issues.push({
      level: "error",
      message: `"${blame[0]}" blames the reader. Describe the condition, not the person.`,
    });
  }
  if (group === "Loading") {
    const promises = containsAny(combined, TIME_PROMISE_WORDS);
    if (promises.length > 0) {
      issues.push({
        level: "info",
        message: `"${promises[0]}" promises a duration you cannot guarantee. Name what is loading instead.`,
      });
    }
  }
  const exclamations = (combined.match(/!/g) || []).length;
  if (exclamations > 1) {
    issues.push({ level: "info", message: "More than one exclamation mark in a short state reads as shouting." });
  }
  if (b && b.toLowerCase() === h.toLowerCase()) {
    issues.push({ level: "warning", message: "The body repeats the heading. Use it to add the next step instead." });
  }

  // Score: start at 100 and deduct by severity, floored at zero.
  const DEDUCTION = { error: 25, warning: 10, info: 5 };
  const score = Math.max(0, 100 - issues.reduce((sum, issue) => sum + DEDUCTION[issue.level], 0));

  return {
    issues,
    score,
    headingChars: h.length,
    bodyChars: b.length,
    actionWords: a ? a.split(/\s+/).filter(Boolean).length : 0,
    status: issues.some((issue) => issue.level === "error")
      ? "error"
      : issues.some((issue) => issue.level === "warning")
        ? "warning"
        : "ok",
  };
}
