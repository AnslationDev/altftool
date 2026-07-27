/**
 * Coffee shop work spot rater.
 *
 * Nine measurable properties are scored 0-1 and combined into a weighted total
 * out of 100. The thresholds are taken from published standards rather than
 * invented, because "good Wi-Fi" and "not too loud" are useless without a
 * number attached:
 *
 *  - Video call bandwidth: Zoom's published requirements are about 1.2 Mbps up
 *    and down for a 720p one-to-one call, and about 3.8 Mbps up / 3.0 Mbps down
 *    for 1080p. Those two figures anchor the upload curve.
 *  - Latency: ITU-T Recommendation G.114 puts acceptable one-way mouth-to-ear
 *    delay at up to 150 ms, and 150-400 ms as tolerable but degraded. Beyond
 *    400 ms a conversation stops working.
 *  - Noise: normal conversation at one metre is around 60 dB(A); a busy café
 *    runs 70-80 dB(A). Room criteria for offices sit near 40-45 dB(A), which is
 *    where sustained concentration is comfortable. The NIOSH recommended
 *    exposure limit of 85 dB(A) averaged over eight hours is used as the point
 *    where a café stops being a workplace question and becomes a hearing one.
 *  - Table depth: a 13-15 inch laptop needs roughly 40 cm of depth with room
 *    for hands, so 45 cm is the point where a table stops being cramped.
 *
 * The verdicts are gates, not scores. A café with a 92/100 total and a 70 dB
 * room still fails "video calls", because the person on the other end can hear
 * the grinder. Gates are reported with the specific figure that failed.
 *
 * Pure functions only. No clock, no network, no DOM.
 */

/** Zoom's published one-to-one 720p requirement, Mbps. */
export const CALL_720P_MBPS = 1.2;

/** Zoom's published 1080p requirement, upload Mbps. */
export const CALL_1080P_UP_MBPS = 3.8;

/** ITU-T G.114: one-way delay up to this is acceptable for conversation. */
export const G114_ACCEPTABLE_MS = 150;

/** ITU-T G.114: beyond this, conversation is not usable. */
export const G114_LIMIT_MS = 400;

/** NIOSH recommended exposure limit, dB(A) as an 8-hour average. */
export const NIOSH_REL_DBA = 85;

/** Ambient level at which sustained concentration stops being comfortable. */
export const FOCUS_NOISE_CEILING_DBA = 62;

/** Above this a microphone picks up the room more than it picks up you. */
export const CALL_NOISE_CEILING_DBA = 65;

/** Depth in centimetres below which a laptop table is cramped. */
export const MIN_TABLE_DEPTH_CM = 45;

/** Minutes you can sit before the staff start hovering. */
export const FOCUS_DWELL_MIN = 90;
export const FULL_DAY_DWELL_MIN = 240;

export const PLUG_OPTIONS = [
  { id: "none", label: "No sockets at all", score: 0 },
  { id: "one", label: "One or two sockets in the whole room", score: 0.35 },
  { id: "some", label: "Sockets at some tables", score: 0.7 },
  { id: "most", label: "Sockets at most or all seats", score: 1 },
];

export const SEAT_OPTIONS = [
  { id: 1, label: "Backless stool" },
  { id: 2, label: "Hard chair, no back support" },
  { id: 3, label: "Ordinary café chair" },
  { id: 4, label: "Padded chair or good bench" },
  { id: 5, label: "Proper supportive chair at desk height" },
];

/** Sub-score curves as anchor tables: [measurement, score]. Linear between anchors. */
export const CURVES = {
  download: [
    [0, 0],
    [1.5, 0.15],
    [3, 0.35],
    [10, 0.7],
    [25, 1],
  ],
  upload: [
    [0, 0],
    [CALL_720P_MBPS, 0.35],
    [CALL_1080P_UP_MBPS, 0.8],
    [10, 1],
  ],
  latency: [
    [0, 1],
    [50, 1],
    [G114_ACCEPTABLE_MS, 0.6],
    [250, 0.3],
    [G114_LIMIT_MS, 0],
  ],
  noise: [
    [45, 1],
    [55, 0.85],
    [CALL_NOISE_CEILING_DBA, 0.5],
    [75, 0.15],
    [NIOSH_REL_DBA, 0],
  ],
  table: [
    [0, 0],
    [30, 0.3],
    [MIN_TABLE_DEPTH_CM, 0.7],
    [60, 1],
  ],
  dwell: [
    [0, 0],
    [30, 0.25],
    [60, 0.5],
    [120, 0.85],
    [FULL_DAY_DWELL_MIN, 1],
  ],
};

/** Weights sum to 100. */
export const WEIGHTS = [
  { id: "download", label: "Download speed", weight: 15 },
  { id: "upload", label: "Upload speed", weight: 15 },
  { id: "latency", label: "Latency", weight: 8 },
  { id: "noise", label: "Noise level", weight: 18 },
  { id: "plugs", label: "Power sockets", weight: 14 },
  { id: "table", label: "Table depth", weight: 10 },
  { id: "seat", label: "Seat comfort", weight: 8 },
  { id: "dwell", label: "How long you can stay", weight: 7 },
  { id: "amenities", label: "Toilet and drinking water", weight: 5 },
];

export const TOTAL_WEIGHT = WEIGHTS.reduce((sum, item) => sum + item.weight, 0);

export const RATING_BANDS = [
  { min: 80, label: "Excellent work spot", note: "You could run a whole working day from here." },
  { min: 65, label: "Good work spot", note: "Solid for a few hours of ordinary work." },
  { min: 50, label: "Workable", note: "Fine for an hour, with compromises." },
  { min: 30, label: "Marginal", note: "Email and messages only." },
  { min: 0, label: "Not a work spot", note: "Drink the coffee, work elsewhere." },
];

/** Interpolate a value against an anchor table, clamped at both ends. */
export function interpolate(anchors, value) {
  if (!Number.isFinite(value)) return 0;
  const first = anchors[0];
  const last = anchors[anchors.length - 1];
  if (value <= first[0]) return first[1];
  if (value >= last[0]) return last[1];
  for (let i = 1; i < anchors.length; i += 1) {
    const [x0, y0] = anchors[i - 1];
    const [x1, y1] = anchors[i];
    if (value <= x1) {
      const t = (value - x0) / (x1 - x0);
      return y0 + (y1 - y0) * t;
    }
  }
  return last[1];
}

export function bandForRating(score) {
  return RATING_BANDS.find((band) => score >= band.min) || RATING_BANDS[RATING_BANDS.length - 1];
}

/**
 * @param {object} input
 * @param {number} input.downloadMbps
 * @param {number} input.uploadMbps
 * @param {number} input.latencyMs      round-trip ping to a nearby server
 * @param {number} input.noiseDba       typical level at the table
 * @param {string} input.plugs          a PLUG_OPTIONS id
 * @param {number} input.tableDepthCm
 * @param {number} input.seatComfort    1-5, see SEAT_OPTIONS
 * @param {number} input.dwellMinutes   how long before you feel moved on
 * @param {boolean} input.toilet
 * @param {boolean} input.water
 * @param {boolean} input.quietCorner   a corner, booth or back room to call from
 */
export function rateWorkSpot(input) {
  const {
    downloadMbps,
    uploadMbps,
    latencyMs,
    noiseDba,
    plugs = "some",
    tableDepthCm,
    seatComfort,
    dwellMinutes,
    toilet = false,
    water = false,
    quietCorner = false,
  } = input || {};

  const down = Number(downloadMbps);
  const up = Number(uploadMbps);
  const latency = Number(latencyMs);
  const noise = Number(noiseDba);
  const table = Number(tableDepthCm);
  const seat = Number(seatComfort);
  const dwell = Number(dwellMinutes);

  if (![down, up, latency, noise, table, seat, dwell].every(Number.isFinite)) {
    return { error: "Enter a number in every measurement field." };
  }
  if (down < 0 || down > 10000) return { error: "Download speed should be between 0 and 10000 Mbps." };
  if (up < 0 || up > 10000) return { error: "Upload speed should be between 0 and 10000 Mbps." };
  if (latency < 0 || latency > 5000) return { error: "Latency should be between 0 and 5000 ms." };
  if (noise < 20 || noise > 120) return { error: "Noise should be between 20 and 120 dB(A) — a silent library is about 30." };
  if (table < 0 || table > 200) return { error: "Table depth should be between 0 and 200 cm." };
  if (!SEAT_OPTIONS.some((option) => option.id === seat)) return { error: "Pick a seat type from 1 to 5." };
  if (dwell < 0 || dwell > 1440) return { error: "Sitting time should be between 0 and 1440 minutes." };

  const plugOption = PLUG_OPTIONS.find((option) => option.id === plugs);
  if (!plugOption) return { error: "Pick how many power sockets the room has." };

  const amenityScore = (toilet ? 0.6 : 0) + (water ? 0.4 : 0);

  const subScores = {
    download: interpolate(CURVES.download, down),
    upload: interpolate(CURVES.upload, up),
    latency: interpolate(CURVES.latency, latency),
    noise: interpolate(CURVES.noise, noise),
    plugs: plugOption.score,
    table: interpolate(CURVES.table, table),
    seat: (seat - 1) / 4,
    dwell: interpolate(CURVES.dwell, dwell),
    amenities: amenityScore,
  };

  const rows = WEIGHTS.map((item) => ({
    id: item.id,
    label: item.label,
    weight: item.weight,
    subScore: subScores[item.id],
    points: item.weight * subScores[item.id],
  }));

  const total = rows.reduce((sum, row) => sum + row.points, 0);
  const score = Math.round(total);
  const band = bandForRating(score);

  const gate = (label, passed, reason, advice) => ({ label, passed, reason, advice });

  const verdicts = [
    gate(
      "Quick email and messages",
      down >= 1.5 && dwell >= 20,
      down < 1.5
        ? `Download is ${down} Mbps — below the 1.5 Mbps that makes a web app usable.`
        : `You get about ${dwell} minutes before feeling moved on.`,
      "Almost anywhere clears this bar.",
    ),
    gate(
      "Deep focus work",
      noise <= FOCUS_NOISE_CEILING_DBA &&
        plugOption.score >= 0.7 &&
        dwell >= FOCUS_DWELL_MIN &&
        table >= MIN_TABLE_DEPTH_CM,
      [
        noise > FOCUS_NOISE_CEILING_DBA ? `${noise} dB(A) is above the ${FOCUS_NOISE_CEILING_DBA} dB(A) concentration ceiling` : null,
        plugOption.score < 0.7 ? "not enough sockets to survive a battery" : null,
        dwell < FOCUS_DWELL_MIN ? `only ${dwell} minutes of sitting time against the ${FOCUS_DWELL_MIN} needed` : null,
        table < MIN_TABLE_DEPTH_CM ? `table depth ${table} cm is under the ${MIN_TABLE_DEPTH_CM} cm a laptop wants` : null,
      ]
        .filter(Boolean)
        .join("; ") || "Quiet enough, powered, and you can stay long enough to get into it.",
      "Take the corner table away from the grinder and the door.",
    ),
    gate(
      "Video calls",
      up >= CALL_720P_MBPS && latency <= G114_ACCEPTABLE_MS && noise <= CALL_NOISE_CEILING_DBA && quietCorner,
      [
        up < CALL_720P_MBPS ? `upload ${up} Mbps is under the ${CALL_720P_MBPS} Mbps a 720p call needs` : null,
        latency > G114_ACCEPTABLE_MS ? `${latency} ms latency exceeds the ${G114_ACCEPTABLE_MS} ms G.114 comfort limit` : null,
        noise > CALL_NOISE_CEILING_DBA ? `${noise} dB(A) means your microphone hears the room` : null,
        !quietCorner ? "no corner or booth to take a call from" : null,
      ]
        .filter(Boolean)
        .join("; ") || `Upload ${up} Mbps and ${latency} ms latency clear the call thresholds.`,
      up >= CALL_1080P_UP_MBPS ? "Enough headroom for 1080p." : "Fine at 720p; drop to audio if it stutters.",
    ),
    gate(
      "A full working day",
      noise <= FOCUS_NOISE_CEILING_DBA &&
        plugOption.id === "most" &&
        dwell >= FULL_DAY_DWELL_MIN &&
        toilet &&
        seat >= 3,
      [
        noise > FOCUS_NOISE_CEILING_DBA ? "too loud to sustain for hours" : null,
        plugOption.id !== "most" ? "sockets are not reliable enough for a whole day" : null,
        dwell < FULL_DAY_DWELL_MIN ? `${dwell} minutes of sitting time, against the ${FULL_DAY_DWELL_MIN} a day needs` : null,
        !toilet ? "no toilet" : null,
        seat < 3 ? "the seat will hurt before lunch" : null,
      ]
        .filter(Boolean)
        .join("; ") || "Power, seating, sanitation and quiet all hold up for a full day.",
      "Buy something every couple of hours — that is what keeps the seat yours.",
    ),
  ];

  const warnings = [];
  if (noise >= NIOSH_REL_DBA) {
    warnings.push(`At ${noise} dB(A) you are at the NIOSH 8-hour recommended exposure limit. This is a hearing question, not a productivity one.`);
  }
  if (up < CALL_720P_MBPS && down >= 10) {
    warnings.push("Fast down, slow up — a shared café connection. Fine for reading, poor for calls and uploads.");
  }
  if (latency > G114_LIMIT_MS) {
    warnings.push(`${latency} ms latency is past the 400 ms point where G.114 says conversation breaks down. Expect people to talk over each other.`);
  }
  if (seat <= 2 && dwell >= 120) {
    warnings.push("You can stay for hours, but not on that seat. Back pain will move you before the staff do.");
  }

  const weakest = [...rows].sort((a, b) => a.subScore - b.subScore).slice(0, 3).filter((row) => row.subScore < 0.7);

  return { score, band, rows, subScores, verdicts, warnings, weakest, total };
}

/** Clipboard summary. */
export function formatRatingText(result, name) {
  if (!result || result.error) return "";
  const lines = [
    `Work spot rating${name ? ` — ${name}` : ""}`,
    `${result.score}/100 — ${result.band.label}`,
    result.band.note,
    "",
    "Verdicts:",
  ];
  result.verdicts.forEach((verdict) => {
    lines.push(`  ${verdict.passed ? "YES" : "NO "} ${verdict.label} — ${verdict.reason}`);
  });
  lines.push("", "Scores:");
  result.rows.forEach((row) => {
    lines.push(`  ${row.label}: ${Math.round(row.points * 10) / 10} / ${row.weight}`);
  });
  return lines.join("\n");
}
