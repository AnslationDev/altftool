/**
 * Podcast episode cost model.
 *
 * Per-episode cost is the sum of three kinds of spend:
 *   1. Direct per-episode spend (editing labour, transcription, artwork, music, guest fees).
 *   2. Recurring subscriptions (hosting, editing software) divided by episodes released per month.
 *   3. Capital equipment amortised over the number of episodes the gear is expected to serve.
 *
 * Sponsorship revenue in podcasting is quoted as CPM — a price per 1,000 downloads of an
 * episode (IAB Podcast Measurement Technical Guidelines use the download as the counted unit),
 * so revenue = downloads / 1000 * CPM.
 */

/** Sponsor rates are quoted per this many downloads (the "M" in CPM = mille = 1,000). */
export const DOWNLOADS_PER_CPM_UNIT = 1000;

/** Months are treated as calendar months; a release cadence is expressed as episodes per month. */
export const MIN_EPISODES_PER_MONTH = 0.25; // one episode per quarter is the slowest cadence allowed

/** Sanity ceiling so a typo like 100000 hours cannot produce a meaningless answer. */
export const MAX_EDITING_HOURS = 200;

const isNum = (value) => typeof value === "number" && Number.isFinite(value);

function readAll(values) {
  for (const [key, value] of Object.entries(values)) {
    if (!isNum(value)) return `Enter a valid number for ${key}.`;
    if (value < 0) return "Costs, durations and counts cannot be negative.";
  }
  return null;
}

/**
 * @returns {{error:string}|{
 *   costPerEpisode:number, lines:Array<{label:string, amount:number}>,
 *   directCost:number, recurringCost:number, gearCost:number,
 *   costPerFinishedMinute:number, costPerThousandDownloads:number|null,
 *   sponsorRevenue:number, netPerEpisode:number,
 *   breakEvenCpm:number|null, breakEvenDownloads:number|null,
 *   annualCost:number, episodesPerYear:number
 * }}
 */
export function computeEpisodeCost({
  episodeMinutes = 0,
  episodesPerMonth = 0,
  editingHours = 0,
  editingHourlyRate = 0,
  transcriptionPerMinute = 0,
  artworkPerEpisode = 0,
  musicLicensing = 0,
  guestFees = 0,
  otherPerEpisode = 0,
  monthlyHosting = 0,
  monthlySoftware = 0,
  gearInvestment = 0,
  gearLifetimeEpisodes = 0,
  downloadsPerEpisode = 0,
  sponsorCpm = 0,
} = {}) {
  const invalid = readAll({
    "episode length": episodeMinutes,
    "episodes per month": episodesPerMonth,
    "editing hours": editingHours,
    "editing hourly rate": editingHourlyRate,
    "transcription rate": transcriptionPerMinute,
    artwork: artworkPerEpisode,
    "music licensing": musicLicensing,
    "guest fees": guestFees,
    "other costs": otherPerEpisode,
    hosting: monthlyHosting,
    software: monthlySoftware,
    "gear investment": gearInvestment,
    "gear lifetime": gearLifetimeEpisodes,
    downloads: downloadsPerEpisode,
    "sponsor CPM": sponsorCpm,
  });
  if (invalid) return { error: invalid };

  if (episodeMinutes <= 0) {
    return { error: "Finished episode length must be more than zero minutes." };
  }
  if (episodesPerMonth < MIN_EPISODES_PER_MONTH) {
    return {
      error: `Release cadence must be at least ${MIN_EPISODES_PER_MONTH} episodes per month, otherwise the monthly subscriptions cannot be split per episode.`,
    };
  }
  if (editingHours > MAX_EDITING_HOURS) {
    return { error: `Editing hours above ${MAX_EDITING_HOURS} per episode look like a typo.` };
  }
  if (gearInvestment > 0 && gearLifetimeEpisodes <= 0) {
    return {
      error: "Give the number of episodes the gear should last, so its cost can be spread over them.",
    };
  }

  const editing = editingHours * editingHourlyRate;
  const transcription = transcriptionPerMinute * episodeMinutes;
  const directCost =
    editing + transcription + artworkPerEpisode + musicLicensing + guestFees + otherPerEpisode;

  const recurringCost = (monthlyHosting + monthlySoftware) / episodesPerMonth;
  const gearCost = gearInvestment > 0 ? gearInvestment / gearLifetimeEpisodes : 0;

  const costPerEpisode = directCost + recurringCost + gearCost;

  const lines = [
    { label: "Editing labour", amount: editing },
    { label: "Transcription / captions", amount: transcription },
    { label: "Artwork & design", amount: artworkPerEpisode },
    { label: "Music licensing", amount: musicLicensing },
    { label: "Guest / talent fees", amount: guestFees },
    { label: "Other per-episode costs", amount: otherPerEpisode },
    { label: "Hosting & software (share)", amount: recurringCost },
    { label: "Gear amortisation", amount: gearCost },
  ];

  const costPerFinishedMinute = costPerEpisode / episodeMinutes;

  const downloadUnits = downloadsPerEpisode / DOWNLOADS_PER_CPM_UNIT;
  const sponsorRevenue = downloadUnits * sponsorCpm;
  const netPerEpisode = sponsorRevenue - costPerEpisode;

  const costPerThousandDownloads = downloadUnits > 0 ? costPerEpisode / downloadUnits : null;
  const breakEvenCpm = downloadUnits > 0 ? costPerEpisode / downloadUnits : null;
  const breakEvenDownloads =
    sponsorCpm > 0 ? (costPerEpisode / sponsorCpm) * DOWNLOADS_PER_CPM_UNIT : null;

  const episodesPerYear = episodesPerMonth * 12;

  return {
    costPerEpisode,
    lines,
    directCost,
    recurringCost,
    gearCost,
    costPerFinishedMinute,
    costPerThousandDownloads,
    sponsorRevenue,
    netPerEpisode,
    breakEvenCpm,
    breakEvenDownloads,
    annualCost: costPerEpisode * episodesPerYear,
    episodesPerYear,
  };
}
