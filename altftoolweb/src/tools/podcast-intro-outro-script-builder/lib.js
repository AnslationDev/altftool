/**
 * Podcast intro/outro script builder — pure text assembly plus read-time maths.
 *
 * Read time is the standard narration formula:
 *   seconds = (word count / words-per-minute) * 60
 * A pause allowance is added per section because scripted reads include beats
 * that raw word counts never capture.
 */

/**
 * Speaking rates in words per minute.
 * Reference points: conversational English speech is commonly measured at
 * 140-160 wpm, audiobook narration is usually directed to 150-160 wpm, and
 * deliberate announcer reads sit nearer 120-130 wpm.
 */
export const SPEAKING_RATES = {
  deliberate: { id: "deliberate", label: "Deliberate announcer read", wpm: 125 },
  conversational: { id: "conversational", label: "Conversational host", wpm: 145 },
  brisk: { id: "brisk", label: "Brisk and energetic", wpm: 165 },
};

export const MIN_WPM = 80;
export const MAX_WPM = 220;

/** Seconds of silence allowed per scripted section for breaths and beats. */
export const PAUSE_SECONDS_PER_SECTION = 1.2;

export const TONES = {
  warm: { id: "warm", label: "Warm and welcoming" },
  punchy: { id: "punchy", label: "Punchy and direct" },
  professional: { id: "professional", label: "Professional and neutral" },
};

/** Count words the way a script is read: whitespace-separated runs that contain
 *  at least one letter or digit. */
export function countWords(text) {
  if (typeof text !== "string") return 0;
  const matches = text.trim().match(/[^\s]*[\p{L}\p{N}][^\s]*/gu);
  return matches ? matches.length : 0;
}

/** Read time in seconds for a word count at a given words-per-minute rate. */
export function readSeconds(words, wpm) {
  const w = Number(words);
  const rate = Number(wpm);
  if (!Number.isFinite(w) || w <= 0) return 0;
  if (!Number.isFinite(rate) || rate <= 0) return 0;
  return (w / rate) * 60;
}

/** Seconds to m:ss. */
export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const fallback = (value, alt) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed || alt;
};

const INTRO_TEMPLATES = {
  warm: {
    hook: (v) => `Have you ever wondered ${v.hookQuestion}? That is exactly where we are starting today.`,
    showId: (v) => `You are listening to ${v.show}, the show about ${v.showSubject}.`,
    hostId: (v) => `I am ${v.host}, and I am really glad you are here.`,
    guestId: (v) => `My guest today is ${v.guest}, ${v.guestRole}.`,
    promise: (v) => `By the end of this episode you will know ${v.takeaway}.`,
    sponsor: (v) => `Before we start, a quick word about ${v.sponsor}. ${v.sponsorLine}`,
    transition: () => "Right — let's get into it.",
  },
  punchy: {
    hook: (v) => `${v.hookQuestion.charAt(0).toUpperCase()}${v.hookQuestion.slice(1)}. Most people get this wrong.`,
    showId: (v) => `This is ${v.show}. ${v.showSubject}, no filler.`,
    hostId: (v) => `I am ${v.host}.`,
    guestId: (v) => `Today: ${v.guest}, ${v.guestRole}.`,
    promise: (v) => `In the next few minutes: ${v.takeaway}.`,
    sponsor: (v) => `Thirty seconds on ${v.sponsor} first. ${v.sponsorLine}`,
    transition: () => "Here we go.",
  },
  professional: {
    hook: (v) => `Today we are looking at ${v.topic}, and specifically ${v.hookQuestion}.`,
    showId: (v) => `Welcome to ${v.show}, covering ${v.showSubject}.`,
    hostId: (v) => `My name is ${v.host}.`,
    guestId: (v) => `Joining me is ${v.guest}, ${v.guestRole}.`,
    promise: (v) => `This episode covers ${v.takeaway}.`,
    sponsor: (v) => `This episode is supported by ${v.sponsor}. ${v.sponsorLine}`,
    transition: () => "Let's begin.",
  },
};

const OUTRO_TEMPLATES = {
  warm: {
    recap: (v) => `That was ${v.guest}. If you take one thing away, make it this: ${v.takeaway}.`,
    guestLinks: (v) => `You can find ${v.guest} at ${v.guestLink} — the link is in the show notes.`,
    cta: (v) => `If this was useful, ${v.cta} It genuinely helps people find the show.`,
    sponsorThanks: (v) => `Thanks again to ${v.sponsor} for supporting this episode.`,
    signOff: (v) => `I am ${v.host}, this has been ${v.show}, and I will see you next time.`,
  },
  punchy: {
    recap: (v) => `${v.guest}, everyone. One takeaway: ${v.takeaway}.`,
    guestLinks: (v) => `Find ${v.guest} at ${v.guestLink}. It is in the notes.`,
    cta: (v) => `${v.cta}`,
    sponsorThanks: (v) => `Thanks to ${v.sponsor}.`,
    signOff: (v) => `That is ${v.show}. I am ${v.host}. Next episode soon.`,
  },
  professional: {
    recap: (v) => `My thanks to ${v.guest}. The key point from this episode: ${v.takeaway}.`,
    guestLinks: (v) => `Links to ${v.guest}'s work, including ${v.guestLink}, are in the show notes.`,
    cta: (v) => `If you found this valuable, ${v.cta}`,
    sponsorThanks: (v) => `This episode was supported by ${v.sponsor}.`,
    signOff: (v) => `This has been ${v.show} with ${v.host}. Thank you for listening.`,
  },
};

/**
 * Build the intro and outro scripts with per-section word counts and read times.
 * Pure: no clock, no randomness.
 */
export function buildScriptPack({
  show = "",
  showSubject = "",
  host = "",
  guest = "",
  guestRole = "",
  guestLink = "",
  topic = "",
  hookQuestion = "",
  takeaway = "",
  cta = "",
  sponsor = "",
  sponsorLine = "",
  includeSponsor = false,
  includeGuest = true,
  tone = "warm",
  wpm = SPEAKING_RATES.conversational.wpm,
} = {}) {
  const rate = Number(wpm);
  if (!Number.isFinite(rate)) {
    return { error: "Enter a speaking rate in words per minute." };
  }
  if (rate < MIN_WPM || rate > MAX_WPM) {
    return { error: `Speaking rate should be between ${MIN_WPM} and ${MAX_WPM} words per minute.` };
  }

  const intro = INTRO_TEMPLATES[tone] || INTRO_TEMPLATES.warm;
  const outro = OUTRO_TEMPLATES[tone] || OUTRO_TEMPLATES.warm;

  const v = {
    show: fallback(show, "the show"),
    showSubject: fallback(showSubject, "the work behind the work"),
    host: fallback(host, "your host"),
    guest: fallback(guest, "our guest"),
    guestRole: fallback(guestRole, "someone who has done this the hard way"),
    guestLink: fallback(guestLink, "the link in the show notes"),
    topic: fallback(topic, "today's topic"),
    hookQuestion: fallback(hookQuestion, "why this is harder than it looks"),
    takeaway: fallback(takeaway, "what to do differently on Monday morning"),
    cta: fallback(cta, "follow the show and leave a rating."),
    sponsor: fallback(sponsor, "our sponsor"),
    sponsorLine: fallback(sponsorLine, "Details and the offer are in the show notes."),
  };

  const introSections = [
    { id: "hook", label: "Cold open hook", text: intro.hook(v) },
    { id: "show", label: "Show ID", text: intro.showId(v) },
    { id: "host", label: "Host ID", text: intro.hostId(v) },
  ];
  if (includeGuest) {
    introSections.push({ id: "guest", label: "Guest ID", text: intro.guestId(v) });
  }
  introSections.push({ id: "promise", label: "Episode promise", text: intro.promise(v) });
  if (includeSponsor) {
    introSections.push({ id: "sponsor", label: "Sponsor read", text: intro.sponsor(v) });
  }
  introSections.push({ id: "transition", label: "Transition", text: intro.transition(v) });

  const outroSections = [{ id: "recap", label: "Recap", text: outro.recap(v) }];
  if (includeGuest) {
    outroSections.push({ id: "links", label: "Guest links", text: outro.guestLinks(v) });
  }
  outroSections.push({ id: "cta", label: "Call to action", text: outro.cta(v) });
  if (includeSponsor) {
    outroSections.push({ id: "sponsorThanks", label: "Sponsor thanks", text: outro.sponsorThanks(v) });
  }
  outroSections.push({ id: "signoff", label: "Sign-off", text: outro.signOff(v) });

  const measure = (sections) => {
    const rows = sections.map((section) => {
      const words = countWords(section.text);
      const speech = readSeconds(words, rate);
      return { ...section, words, seconds: speech + PAUSE_SECONDS_PER_SECTION };
    });
    const words = rows.reduce((sum, row) => sum + row.words, 0);
    const seconds = rows.reduce((sum, row) => sum + row.seconds, 0);
    return { rows, words, seconds };
  };

  const introBlock = measure(introSections);
  const outroBlock = measure(outroSections);

  return {
    intro: introBlock,
    outro: outroBlock,
    totalWords: introBlock.words + outroBlock.words,
    totalSeconds: introBlock.seconds + outroBlock.seconds,
    wpm: rate,
    toneLabel: (TONES[tone] || TONES.warm).label,
  };
}

/** Plain-text version of both scripts for pasting into a prompter or doc. */
export function formatScriptText(pack) {
  if (!pack || pack.error) return "";
  const block = (title, data) => [
    `${title.toUpperCase()} — ${data.words} words · ${formatDuration(data.seconds)}`,
    ...data.rows.map((row) => `[${row.label} · ${formatDuration(row.seconds)}]\n${row.text}`),
    "",
  ];
  return [
    ...block("Intro", pack.intro),
    ...block("Outro", pack.outro),
    `Total: ${pack.totalWords} words · ${formatDuration(pack.totalSeconds)} at ${pack.wpm} wpm`,
  ].join("\n");
}
