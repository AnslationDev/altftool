/**
 * Watch Time Goal Calculator — pure watch-hour planning maths.
 * No React, no DOM. Dates and rates are passed in; nothing here reads the clock.
 */

/**
 * YouTube Partner Programme monetisation thresholds.
 * The long-form route needs 1,000 subscribers plus 4,000 valid public watch
 * hours in the previous 12 months. The Shorts route needs 1,000 subscribers
 * plus 10 million valid public Shorts views in the previous 90 days.
 */
export const YPP = {
  subscribers: 1000,
  watchHours: 4000,
  watchHourWindowDays: 365,
  shortsViews: 10000000,
  shortsWindowDays: 90,
};

export const MINUTES_PER_HOUR = 60;
export const DAYS_PER_WEEK = 7;

/** Weeks in the 12-month rolling window the 4,000 hours must fall inside. */
export const WEEKS_IN_WINDOW = YPP.watchHourWindowDays / DAYS_PER_WEEK;

const isNum = (value) => Number.isFinite(Number(value));

/** Watch hours a single video produces: views x average view duration / 60. */
export function watchHoursPerVideo({ viewsPerVideo, avgViewDurationMinutes }) {
  const views = Number(viewsPerVideo);
  const minutes = Number(avgViewDurationMinutes);
  if (!(views >= 0)) return { error: "Views per video cannot be negative." };
  if (!(minutes >= 0)) return { error: "Average view duration cannot be negative." };
  return { hours: (views * minutes) / MINUTES_PER_HOUR };
}

/**
 * Average percentage viewed: how much of the video a typical viewer watches.
 * This is the lever that moves watch hours without needing more views.
 */
export function averagePercentageViewed({ avgViewDurationMinutes, videoLengthMinutes }) {
  const watched = Number(avgViewDurationMinutes);
  const length = Number(videoLengthMinutes);
  if (!(watched >= 0)) return { error: "Average view duration cannot be negative." };
  if (!(length > 0)) return { error: "Video length must be greater than zero." };
  return { percent: (watched / length) * 100, overWatched: watched > length };
}

/** Full plan: how many uploads and how long to reach a watch-hour target. */
export function computeWatchTimePlan({
  targetHours = YPP.watchHours,
  currentHours = 0,
  viewsPerVideo,
  avgViewDurationMinutes,
  videoLengthMinutes = 0,
  uploadsPerWeek = 1,
} = {}) {
  if (!isNum(viewsPerVideo) || !isNum(avgViewDurationMinutes)) {
    return { error: "Enter numbers for views per video and average view duration." };
  }
  const target = Number(targetHours);
  const current = Number(currentHours);
  const perWeek = Number(uploadsPerWeek);

  if (!isNum(targetHours) || target <= 0) return { error: "The watch-hour target must be greater than zero." };
  if (!isNum(currentHours) || current < 0) return { error: "Current watch hours cannot be negative." };
  if (!(perWeek > 0)) return { error: "Uploads per week must be greater than zero." };
  if (Number(viewsPerVideo) < 0) return { error: "Views per video cannot be negative." };
  if (Number(avgViewDurationMinutes) < 0) return { error: "Average view duration cannot be negative." };

  const per = watchHoursPerVideo({ viewsPerVideo, avgViewDurationMinutes });
  if (per.error) return { error: per.error };

  const remainingHours = Math.max(0, target - current);
  const progressPct = target > 0 ? Math.min(100, (current / target) * 100) : 0;

  if (remainingHours === 0) {
    return {
      targetHours: target,
      currentHours: current,
      remainingHours: 0,
      hoursPerVideo: per.hours,
      hoursPerWeek: per.hours * perWeek,
      videosNeeded: 0,
      weeksNeeded: 0,
      daysNeeded: 0,
      progressPct: 100,
      withinWindow: true,
      percentViewed: null,
      notes: ["Target already reached — the remaining requirement is holding it inside the rolling window."],
    };
  }

  if (per.hours <= 0) {
    return {
      error:
        "At zero views or zero average view duration this never reaches the target. Enter the views and watch duration a video actually gets.",
    };
  }

  const videosNeeded = Math.ceil(remainingHours / per.hours);
  const weeksNeeded = videosNeeded / perWeek;
  const daysNeeded = Math.ceil(weeksNeeded * DAYS_PER_WEEK);
  const hoursPerWeek = per.hours * perWeek;

  let percentViewed = null;
  if (isNum(videoLengthMinutes) && Number(videoLengthMinutes) > 0) {
    const pct = averagePercentageViewed({ avgViewDurationMinutes, videoLengthMinutes });
    if (!pct.error) percentViewed = pct;
  }

  const withinWindow = weeksNeeded <= WEEKS_IN_WINDOW;
  const notes = [];
  if (!withinWindow && target === YPP.watchHours) {
    notes.push(
      `At this rate the target takes ${weeksNeeded.toFixed(1)} weeks, longer than the ${YPP.watchHourWindowDays}-day rolling window, so early hours expire before the later ones arrive. Raise views, duration or upload frequency.`,
    );
  }
  if (percentViewed && percentViewed.overWatched) {
    notes.push("Average view duration is longer than the video, which happens when viewers rewatch — check the figures.");
  }
  if (percentViewed && !percentViewed.overWatched && percentViewed.percent < 30) {
    notes.push(
      `Only ${percentViewed.percent.toFixed(1)}% of each video is watched. Lifting retention raises watch hours without needing more views.`,
    );
  }

  return {
    targetHours: target,
    currentHours: current,
    remainingHours,
    hoursPerVideo: per.hours,
    hoursPerWeek,
    videosNeeded,
    weeksNeeded,
    daysNeeded,
    progressPct,
    withinWindow,
    percentViewed,
    notes,
  };
}

/**
 * Average view duration needed to hit the target within a fixed number of weeks,
 * holding views per video and upload frequency constant.
 */
export function requiredViewDuration({ remainingHours, viewsPerVideo, uploadsPerWeek, weeksAvailable }) {
  const hours = Number(remainingHours);
  const views = Number(viewsPerVideo);
  const perWeek = Number(uploadsPerWeek);
  const weeks = Number(weeksAvailable);
  if (!(hours >= 0)) return { error: "Remaining hours cannot be negative." };
  if (!(views > 0)) return { error: "Views per video must be greater than zero." };
  if (!(perWeek > 0)) return { error: "Uploads per week must be greater than zero." };
  if (!(weeks > 0)) return { error: "Weeks available must be greater than zero." };
  const videos = perWeek * weeks;
  return { minutes: (hours * MINUTES_PER_HOUR) / (videos * views), videos };
}
