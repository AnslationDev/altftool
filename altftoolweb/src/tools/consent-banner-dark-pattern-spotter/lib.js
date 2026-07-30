/**
 * Consent Banner Dark Pattern Spotter — pattern catalogue and scoring.
 *
 * Pure module: no React, no DOM, no clock reads, no network.
 *
 * The catalogue is drawn from published regulatory positions rather than opinion:
 *
 *  - GDPR Article 4(11): consent must be freely given, specific, informed and
 *    unambiguous, given by a statement or a clear affirmative action.
 *  - GDPR Recital 32: silence, pre-ticked boxes and inactivity do not constitute consent.
 *  - GDPR Article 7(3): withdrawing consent must be as easy as giving it.
 *  - CJEU, Planet49 (C-673/17, 1 October 2019): a pre-ticked checkbox is not valid consent,
 *    and consent is required for storing or reading cookies regardless of whether the data
 *    is personal data.
 *  - ePrivacy Directive Article 5(3): storing information on, or reading it from, a user's
 *    device needs consent unless it is strictly necessary to provide the service the user
 *    asked for.
 *  - EDPB Cookie Banner Taskforce report, adopted 17 January 2023: the common positions of
 *    EU authorities on banners without a refuse option on the first layer, pre-ticked boxes,
 *    deceptive button colours and contrast, deceptive link design, legitimate interest
 *    claimed for advertising, and cookies wrongly classed as essential.
 *
 * Severity is an ordinal 1-5 rank reflecting how directly the pattern undermines the
 * validity of consent. It is a prioritisation device, not a legal finding.
 */

/** Weight given to the accept-versus-refuse click asymmetry, which is treated as one more pattern. */
export const ASYMMETRY_SEVERITY = 5;
/** Sanity ceiling on the click counts you can enter. */
export const MAX_CLICKS = 20;

export const PATTERN_GROUPS = [
  { id: "choice", label: "Removing the choice" },
  { id: "visual", label: "Steering the eye" },
  { id: "labels", label: "Misleading labels" },
  { id: "persistence", label: "Wearing you down" },
];

export const PATTERNS = [
  {
    id: "no-reject-first-layer",
    group: "choice",
    severity: 5,
    label: "No refuse button on the first screen",
    spot: "There is an 'Accept all' button but refusing means opening 'Manage settings' first.",
    why: "Adding steps to refusal makes acceptance the path of least resistance, which is exactly what it is designed to do.",
    rule: "EDPB Cookie Banner Taskforce (Jan 2023): a refuse option should be available on the first layer.",
    fix: "Put 'Reject all' beside 'Accept all', identical in size and prominence.",
  },
  {
    id: "pre-ticked",
    group: "choice",
    severity: 5,
    label: "Non-essential toggles switched on by default",
    spot: "Open the settings panel and analytics or advertising is already enabled.",
    why: "Consent is only valid if you actively give it, so a default-on switch collects consent you never gave.",
    rule: "GDPR Recital 32 and CJEU Planet49 (C-673/17): pre-ticked boxes are not valid consent.",
    fix: "Ship every non-essential category switched off and require a deliberate action to enable it.",
  },
  {
    id: "cookie-wall",
    group: "choice",
    severity: 4,
    label: "Content blocked entirely unless you accept",
    spot: "There is no way past the banner other than 'Accept all'.",
    why: "If refusing costs you the service, the consent is not freely given.",
    rule: "GDPR Article 4(11) and Article 7(4): consent must be freely given and not conditional on unnecessary processing.",
    fix: "Offer a genuine alternative — refuse and continue, or a paid ad-free option that is honestly priced.",
  },
  {
    id: "scroll-as-consent",
    group: "choice",
    severity: 4,
    label: "'By continuing to browse you agree'",
    spot: "The banner says scrolling, clicking or continuing counts as consent.",
    why: "Scrolling is something you do to read a page, not a statement about data processing.",
    rule: "GDPR Article 4(11): consent needs a clear affirmative action; continued browsing is not one.",
    fix: "Require an explicit click and treat everything else as no consent.",
  },
  {
    id: "colour-contrast",
    group: "visual",
    severity: 4,
    label: "Accept is a bright button, refuse is grey",
    spot: "Both options exist, but only one looks clickable.",
    why: "Visual weight decides where most people click before they have read anything.",
    rule: "EDPB Cookie Banner Taskforce: deceptive button colours and contrast undermine valid consent.",
    fix: "Give both buttons the same size, shape and contrast against the background.",
  },
  {
    id: "reject-as-link",
    group: "visual",
    severity: 4,
    label: "Refuse is a small text link, accept is a button",
    spot: "'Continue without accepting' sits in the corner in small grey text.",
    why: "A link reads as secondary information rather than an equal choice.",
    rule: "EDPB Cookie Banner Taskforce: deceptive link design is flagged as a problem.",
    fix: "Use the same control type for both answers.",
  },
  {
    id: "tiny-close-x",
    group: "visual",
    severity: 4,
    label: "The close X means accept",
    spot: "Dismissing the banner with the corner X quietly enables everything.",
    why: "People close a box to make it go away, not to agree to tracking.",
    rule: "GDPR Recital 32: inactivity or dismissal does not constitute consent.",
    fix: "Make the X mean 'no consent', or remove it and force an explicit answer.",
  },
  {
    id: "essential-mislabelled",
    group: "labels",
    severity: 4,
    label: "Analytics or ads listed as 'strictly necessary'",
    spot: "A category you cannot switch off contains measurement or advertising vendors.",
    why: "Marking something necessary removes your choice over it entirely.",
    rule: "ePrivacy Directive Article 5(3): the exemption covers only what is strictly necessary for the service you requested.",
    fix: "Reserve the exempt category for session, security and load-balancing purposes.",
  },
  {
    id: "legitimate-interest",
    group: "labels",
    severity: 5,
    label: "Advertising hidden under 'legitimate interest'",
    spot: "A second tab of toggles, already on, sits behind the consent toggles you just turned off.",
    why: "It reinstates the processing you thought you had refused, in a place most people never open.",
    rule: "EDPB Cookie Banner Taskforce: legitimate interest is not an appropriate basis for these purposes when consent is required.",
    fix: "Remove the legitimate-interest tab for storage and advertising purposes.",
  },
  {
    id: "confirmshaming",
    group: "labels",
    severity: 2,
    label: "Refusing is worded to make you feel bad",
    spot: "'No thanks, I prefer irrelevant adverts.'",
    why: "Loaded wording pressures the decision rather than informing it.",
    rule: "GDPR Article 4(11): consent must be freely given, without pressure or detriment.",
    fix: "Label the buttons plainly: 'Accept all' and 'Reject all'.",
  },
  {
    id: "vendor-flood",
    group: "labels",
    severity: 3,
    label: "Hundreds of partners, one toggle each",
    spot: "'We and our 847 partners' with no reject-all inside the vendor list.",
    why: "Refusal is technically possible and practically impossible, which is the point.",
    rule: "GDPR Article 7(3): withdrawing must be as easy as giving consent.",
    fix: "Provide a single 'object to all' control at the top of the vendor list.",
  },
  {
    id: "nagging",
    group: "persistence",
    severity: 3,
    label: "The banner returns on every page after you refuse",
    spot: "Accepting is remembered for a year; refusing is forgotten immediately.",
    why: "Repetition converts refusals into acceptances through fatigue alone.",
    rule: "GDPR Article 4(11): repeatedly re-asking after a refusal undermines a freely given choice.",
    fix: "Store the refusal for the same period as the acceptance.",
  },
  {
    id: "hidden-withdraw",
    group: "persistence",
    severity: 4,
    label: "No way to change your mind later",
    spot: "There is no cookie-settings link in the footer once the banner is gone.",
    why: "A choice you cannot revisit is not really a choice.",
    rule: "GDPR Article 7(3): it must be as easy to withdraw consent as to give it.",
    fix: "Add a persistent settings link in the footer that reopens the panel.",
  },
  {
    id: "false-urgency",
    group: "persistence",
    severity: 2,
    label: "A countdown or delay before you can read anything",
    spot: "A timer runs while the banner blocks the page.",
    why: "Time pressure pushes people to click whatever ends the interruption fastest.",
    rule: "GDPR Article 4(11): pressure of this kind works against a freely given choice.",
    fix: "Remove the timer; let the banner wait as long as the reader needs.",
  },
];

export const BANDS = [
  { id: "clean", label: "Nothing flagged", max: 0, advice: "As presented, this banner offers a real choice." },
  { id: "minor", label: "Minor nudging", max: 20, advice: "Mostly fair, with some steering in the design." },
  { id: "questionable", label: "Questionable", max: 45, advice: "Several patterns here are the ones regulators name directly." },
  { id: "manipulative", label: "Manipulative", max: 70, advice: "The design is working against your ability to refuse." },
  { id: "severe", label: "Severely manipulative", max: 100, advice: "Refusal has been made impractical rather than merely awkward." },
];

const MAX_SCORE =
  PATTERNS.reduce((sum, pattern) => sum + pattern.severity, 0) + ASYMMETRY_SEVERITY;

/** Total severity available, including the click-asymmetry check. */
export function maxPatternScore() {
  return MAX_SCORE;
}

function bandFor(percent) {
  return BANDS.find((band) => percent <= band.max) || BANDS[BANDS.length - 1];
}

/**
 * Score a consent banner.
 *
 * @param {object} input
 * @param {string[]} input.presentIds  ids from PATTERNS you can see on the banner
 * @param {number}   input.acceptClicks clicks needed to accept everything
 * @param {number}   input.rejectClicks clicks needed to refuse everything
 * @returns {object} score and findings, or { error }
 */
export function analyzeBanner({ presentIds, acceptClicks, rejectClicks } = {}) {
  if (!Array.isArray(presentIds)) {
    return { error: "Tick the patterns you can see on the banner." };
  }
  const accept = Number(acceptClicks);
  const reject = Number(rejectClicks);
  if (!Number.isFinite(accept) || !Number.isFinite(reject)) {
    return { error: "Both click counts must be numbers." };
  }
  if (accept < 1 || reject < 1) {
    return { error: "Every banner takes at least one click — enter 1 or more." };
  }
  if (accept > MAX_CLICKS || reject > MAX_CLICKS) {
    return { error: `Click counts must be ${MAX_CLICKS} or fewer.` };
  }

  const wanted = new Set(presentIds);
  const found = PATTERNS.filter((pattern) => wanted.has(pattern.id));

  const acceptClicksInt = Math.round(accept);
  const rejectClicksInt = Math.round(reject);
  const extraClicks = rejectClicksInt - acceptClicksInt;
  const asymmetric = extraClicks > 0;

  const score = found.reduce((sum, pattern) => sum + pattern.severity, 0) + (asymmetric ? ASYMMETRY_SEVERITY : 0);
  const percent = Math.round((score / MAX_SCORE) * 100);
  const band = bandFor(percent);

  const findings = [...found].sort((a, b) => b.severity - a.severity);
  const criticalCount = found.filter((pattern) => pattern.severity >= 4).length;

  const byGroup = PATTERN_GROUPS.map((group) => {
    const all = PATTERNS.filter((pattern) => pattern.group === group.id);
    const hit = all.filter((pattern) => wanted.has(pattern.id));
    return { id: group.id, label: group.label, found: hit.length, total: all.length };
  });

  const readerSteps = [];
  if (asymmetric) {
    readerSteps.push(
      `Refusing costs you ${extraClicks} extra ${extraClicks === 1 ? "click" : "clicks"} here. Take them — the asymmetry is the whole design.`,
    );
  }
  if (wanted.has("pre-ticked") || wanted.has("legitimate-interest")) {
    readerSteps.push(
      "Open the settings panel and check every tab, including any 'legitimate interest' list, and switch each one off.",
    );
  }
  if (wanted.has("tiny-close-x") || wanted.has("scroll-as-consent")) {
    readerSteps.push(
      "Do not dismiss this banner with the X or by scrolling — use the explicit refuse control instead.",
    );
  }
  if (wanted.has("cookie-wall")) {
    readerSteps.push(
      "If there is genuinely no way past without accepting, consider whether you need this site, or read it in a container or private window you close afterwards.",
    );
  }
  if (wanted.has("hidden-withdraw") || wanted.has("nagging")) {
    readerSteps.push(
      "Clear this site's cookies when you leave; a refusal that is not stored cannot protect you on the next visit.",
    );
  }
  if (readerSteps.length === 0) {
    readerSteps.push("Use the refuse control on the first screen; nothing here is working against you.");
  }

  return {
    foundCount: found.length,
    totalPatterns: PATTERNS.length,
    criticalCount,
    score,
    maxScore: MAX_SCORE,
    percent,
    bandId: band.id,
    bandLabel: band.label,
    bandAdvice: band.advice,
    acceptClicks: acceptClicksInt,
    rejectClicks: rejectClicksInt,
    extraClicks: Math.max(0, extraClicks),
    asymmetric,
    findings,
    byGroup,
    readerSteps,
  };
}
