const seo = {
  title: "Runtime Sum Calculator: Add Clip Durations & Timecode",
  metaDescription:
    "Paste durations in any mix — 1:30, 00:02:15, 90, 1m 20s or hh:mm:ss:ff timecode — for total runtime, per-clip start times and the gap to a target slot.",
  steps: [
    "Paste one duration per line under 'Clip durations, one per line' — 1:30, 00:02:15, 90, 1m 20s and hh:mm:ss:ff timecode can mix freely.",
    "Set the Frame rate for timecode entries, a Gap between clips in seconds, and a 'Target slot length (seconds, 0 for none)'.",
    "Read the Total runtime in clock time, seconds, minutes and frames plus each clip's start time, then click Copy result.",
  ],
  intro:
    "Total runtime is simply the sum of every clip length plus any padding between them, but only once each duration has been converted to the same unit. This calculator normalises mixed notation — 1:30, 00:02:15, plain seconds, 1m 20s and SMPTE hh:mm:ss:ff — into seconds, adds them, and reports the total in clock time, seconds, minutes and frames alongside the average and median clip length and the gap to a target slot.",
  useCases: [
    "Checking whether a rough cut of eleven segments still fits a 22-minute half-hour slot before you start trimming",
    "Adding up the durations a client listed in three different formats in a spreadsheet without retyping them",
    "Working out where each item starts on the timeline when three seconds of transition sit between every clip",
  ],
  benefits: [
    ["Mixed formats in one list", "Stopwatch readings, clock times, bare seconds and timecode can all sit in the same paste."],
    ["Gaps counted correctly", "Padding is applied between clips only, so ten clips get nine gaps, not ten."],
    ["Target comparison", "The result states how far over or under the slot you are, in both time and percentage."],
  ],
  faqs: [
    [
      "How do I add up video clip lengths?",
      "Convert each length to seconds, add them, then convert the total back to hh:mm:ss. Two clips of 1:30 and 2:15 are 90 + 135 = 225 seconds, which is 00:03:45. Mixing minutes and seconds without converting first is the usual source of error.",
    ],
    [
      "How many minutes of programme fit a half-hour TV slot?",
      "In commercial broadcast a 30-minute slot typically carries about 21 to 22 minutes of programme, and a 60-minute slot about 42 to 44 minutes, with the rest given to advertising and station idents. The exact figure is set by the broadcaster's delivery specification, so confirm it before locking the edit.",
    ],
    [
      "What does the frame field in 00:00:10:12 mean?",
      "It is the frame count within that second, so its value depends on the frame rate. At 25 fps, 12 frames is 12 ÷ 25 = 0.48 seconds, making the clip 10.48 seconds; the same label at 30 fps would be 10.4 seconds.",
    ],
    [
      "Should I include transitions in the runtime?",
      "Only if they add time. A cross-dissolve that overlaps two clips shortens the total, while a black gap or a stinger between items lengthens it — use the gap field for the latter and shorten the individual clip lengths for the former.",
    ],
  ],
};

export default seo;
