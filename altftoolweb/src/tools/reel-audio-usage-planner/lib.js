/**
 * Reel Audio Usage Planner — pure clearance and rotation logic.
 * No React, no JSX, no DOM.
 *
 * The rules below reflect how the platforms' own music libraries are split:
 * consumer (chart) music is licensed for personal, non-promotional posts only,
 * while business and brand accounts are given a separate commercial-use library.
 * Platform terms change — treat the output as a checklist, not legal advice.
 */

export const ACCOUNT_TYPES = [
  {
    id: "personal",
    label: "Personal / creator account",
    blurb: "Sees the full consumer music catalogue, for organic posts that do not promote a business.",
  },
  {
    id: "business",
    label: "Business / brand account",
    blurb: "Sees the commercial-use library. Consumer chart tracks are limited or unavailable.",
  },
];

export const ACCOUNT_TYPE_IDS = ACCOUNT_TYPES.map((item) => item.id);

/**
 * Maximum clip length each surface accepts.
 * Instagram Reels and YouTube Shorts both moved to 3 minutes in 2024;
 * TikTok's standard maximum is 10 minutes. Always confirm in the app before a big shoot.
 */
export const PLATFORMS = [
  { id: "reels", label: "Instagram Reels", maxSeconds: 180 },
  { id: "shorts", label: "YouTube Shorts", maxSeconds: 180 },
  { id: "tiktok", label: "TikTok", maxSeconds: 600 },
  { id: "facebook", label: "Facebook Reels", maxSeconds: 90 },
];

export const PLATFORM_IDS = PLATFORMS.map((item) => item.id);

export const AUDIO_SOURCES = [
  {
    id: "commercial",
    label: "Platform commercial library",
    blurb: "The cleared-for-business catalogue inside the app.",
  },
  {
    id: "trending",
    label: "Trending consumer track",
    blurb: "A chart or viral song from the personal music catalogue.",
  },
  {
    id: "licensed",
    label: "Licensed stock music",
    blurb: "A track from a subscription library such as a royalty-free service.",
  },
  {
    id: "original",
    label: "Original audio you recorded",
    blurb: "Your own voice, performance or composition.",
  },
  {
    id: "client",
    label: "Client or third-party supplied",
    blurb: "Audio handed to you without a licence you can see.",
  },
];

export const AUDIO_SOURCE_IDS = AUDIO_SOURCES.map((item) => item.id);

/** Reusing the same track too soon makes a feed repetitive; this is the default gap. */
export const DEFAULT_ROTATION_WINDOW = 4;

export const RISK_LEVELS = { clear: "clear", caution: "caution", high: "high" };

/**
 * Assess one planned post.
 *
 * @returns {{error:string}|{platform:string,risk:string,organicOk:boolean,paidOk:boolean,actions:string[]}}
 */
export function assessPost({
  platform = "reels",
  accountType = "business",
  audioSource = "commercial",
  durationSeconds = 30,
  willBoost = false,
  trackName = "",
  licenseId = "",
} = {}) {
  const platformInfo = PLATFORMS.find((item) => item.id === platform);
  if (!platformInfo) return { error: `Platform must be one of: ${PLATFORM_IDS.join(", ")}.` };
  if (!ACCOUNT_TYPE_IDS.includes(accountType)) {
    return { error: `Account type must be one of: ${ACCOUNT_TYPE_IDS.join(", ")}.` };
  }
  const sourceInfo = AUDIO_SOURCES.find((item) => item.id === audioSource);
  if (!sourceInfo) return { error: `Audio source must be one of: ${AUDIO_SOURCE_IDS.join(", ")}.` };

  const duration = Number(durationSeconds);
  if (!Number.isFinite(duration) || duration <= 0) {
    return { error: "Clip length must be a positive number of seconds." };
  }

  const actions = [];
  let organicOk = true;
  let paidOk = true;
  let risk = RISK_LEVELS.clear;

  if (duration > platformInfo.maxSeconds) {
    actions.push(
      `${Math.round(duration)}s is longer than the ${platformInfo.maxSeconds}s maximum for ${platformInfo.label} — trim it or the upload will be rejected.`,
    );
    risk = RISK_LEVELS.caution;
  }

  if (audioSource === "trending") {
    if (accountType === "business") {
      organicOk = false;
      paidOk = false;
      risk = RISK_LEVELS.high;
      actions.push(
        "Business accounts are limited to the commercial-use library; a consumer chart track may be unavailable, muted after posting or blocked in some countries.",
      );
      actions.push("Swap to the commercial library, or post it from a personal creator account that is not promoting a product.");
    } else {
      paidOk = false;
      if (risk === RISK_LEVELS.clear) risk = RISK_LEVELS.caution;
      actions.push("Fine for an organic personal post, but you cannot boost or run it as an ad with this track.");
    }
  }

  if (audioSource === "commercial") {
    actions.push("Note the track name in your records so you can prove where the audio came from.");
  }

  if (audioSource === "licensed") {
    if (!String(licenseId ?? "").trim()) {
      if (risk === RISK_LEVELS.clear) risk = RISK_LEVELS.caution;
      actions.push("Add the licence or invoice number — most stock libraries require you to keep proof of the licence.");
    }
    actions.push("Check the licence covers paid promotion if you plan to boost this post.");
  }

  if (audioSource === "original") {
    actions.push("Name the audio clearly so other accounts can reuse it and credit you.");
  }

  if (audioSource === "client") {
    organicOk = false;
    paidOk = false;
    risk = RISK_LEVELS.high;
    actions.push("Get written confirmation of the licence before publishing — unverified third-party audio is the most common takedown cause.");
  }

  if (willBoost && !paidOk) {
    actions.push("This post is marked for boosting, but the audio does not clear paid use. Replace the track or drop the boost.");
    risk = RISK_LEVELS.high;
  }

  return {
    platform: platformInfo.label,
    platformId: platformInfo.id,
    maxSeconds: platformInfo.maxSeconds,
    source: sourceInfo.label,
    sourceId: sourceInfo.id,
    trackName: String(trackName ?? "").trim(),
    licenseId: String(licenseId ?? "").trim(),
    durationSeconds: duration,
    willBoost: Boolean(willBoost),
    organicOk,
    paidOk,
    risk,
    actions,
  };
}

/** Normalised key used to spot the same track reused too soon. */
function trackKey(post) {
  return String(post.trackName ?? "").trim().toLowerCase();
}

/**
 * Assess a whole run of posts and check track rotation.
 *
 * @returns {{error:string}|{rows:Array,clearCount:number,cautionCount:number,highCount:number,repeats:Array,uniqueTracks:number}}
 */
export function planAudioUsage({
  posts = [],
  accountType = "business",
  rotationWindow = DEFAULT_ROTATION_WINDOW,
} = {}) {
  if (!Array.isArray(posts) || posts.length === 0) {
    return { error: "Add at least one planned post." };
  }
  if (posts.length > 200) {
    return { error: "Plan up to 200 posts at a time." };
  }
  const window = Math.round(Number(rotationWindow));
  if (!Number.isFinite(window) || window < 0 || window > 50) {
    return { error: "The rotation gap must be between 0 and 50 posts." };
  }

  const rows = [];
  const lastSeen = new Map();
  const repeats = [];

  posts.forEach((post, index) => {
    const assessment = assessPost({ ...post, accountType });
    if (assessment.error) {
      rows.push({ index: index + 1, error: assessment.error, actions: [], risk: RISK_LEVELS.high });
      return;
    }

    const key = trackKey(post);
    const rotationNotes = [];
    if (key && window > 0) {
      const previous = lastSeen.get(key);
      if (previous !== undefined && index - previous <= window) {
        const gap = index - previous;
        rotationNotes.push(
          `Same track as post ${previous + 1}, only ${gap} post${gap === 1 ? "" : "s"} earlier. Aim for a gap of more than ${window}.`,
        );
        repeats.push({ track: post.trackName, first: previous + 1, again: index + 1, gap });
      }
      lastSeen.set(key, index);
    }

    rows.push({
      index: index + 1,
      ...assessment,
      actions: [...assessment.actions, ...rotationNotes],
      risk:
        rotationNotes.length > 0 && assessment.risk === RISK_LEVELS.clear
          ? RISK_LEVELS.caution
          : assessment.risk,
    });
  });

  const clearCount = rows.filter((row) => row.risk === RISK_LEVELS.clear).length;
  const cautionCount = rows.filter((row) => row.risk === RISK_LEVELS.caution).length;
  const highCount = rows.filter((row) => row.risk === RISK_LEVELS.high).length;

  return {
    rows,
    total: rows.length,
    clearCount,
    cautionCount,
    highCount,
    repeats,
    uniqueTracks: new Set(posts.map(trackKey).filter(Boolean)).size,
    boostBlocked: rows.filter((row) => row.willBoost && row.paidOk === false).length,
  };
}

/** Plain-text export of the plan. */
export function toPlanText(result) {
  if (!result || result.error) return "";
  const lines = ["Reel audio plan", ""];
  result.rows.forEach((row) => {
    if (row.error) {
      lines.push(`${row.index}. ERROR — ${row.error}`);
      return;
    }
    lines.push(
      `${row.index}. ${row.platform} · ${row.trackName || "(no track named)"} · ${row.source} · ${Math.round(row.durationSeconds)}s`,
    );
    lines.push(
      `   organic: ${row.organicOk ? "ok" : "blocked"} | paid: ${row.paidOk ? "ok" : "blocked"} | risk: ${row.risk}`,
    );
    row.actions.forEach((action) => lines.push(`   - ${action}`));
  });
  return lines.join("\n");
}
