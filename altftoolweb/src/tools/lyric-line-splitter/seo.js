const seo = {
  title: "Lyric Line Splitter for Karaoke and Subtitle",
  metaDescription:
    "Re-wrap pasted lyrics at 10-42 characters a line, break at breath punctuation, merge orphans, and get minimum screen time at 17 chars per second.",
  steps: [
    "Paste the song into the \"Paste lyrics\" box, leaving a blank line between verses and the chorus to mark a stanza break.",
    "Set \"Characters per line (10-42)\", 32 by default, and \"Lines per screen (1-4)\", then tick merging orphan fragments into their neighbour and keeping verse/chorus stanza breaks.",
    "Read the split line count, the longest line, lines over the limit and the total minimum display time, then press \"Copy split lyrics\".",
  ],
  intro:
    "Lyric Line Splitter re-wraps pasted song lyrics into karaoke-ready lines using a character-per-line cap, defaulting to 32 characters and allowing anything from 10 up to the Netflix Timed Text ceiling of 42. It wraps on whole words, prefers to break after breath punctuation once a line has reached half the limit, merges orphan fragments back into their neighbours, and reports the minimum on-screen time for each line at the Netflix adult reading speed of 17 characters per second. It is built for karaoke producers, subtitlers and lyric-video editors who need consistent line lengths before timing a track.",
  useCases: [
    "Preparing a karaoke video in After Effects and needing every lyric line short enough to read in one glance, so you cap the whole song at 32 characters instead of hand-splitting 60 lines.",
    "Checking that a lyric subtitle file will not breach a delivery spec that caps lines at 42 characters, by setting the limit to 42 and seeing whether any line still comes back flagged as over.",
    "Estimating how long a lyric video will need to run before you time it, by reading the total minimum display seconds and the screen count for a two-lines-at-a-time layout.",
  ],
  benefits: [
    [
      "Breaks where a singer breathes",
      "Closes a line early at a comma, dash or question mark once it has reached half the character limit, instead of wrapping blindly at the cap.",
    ],
    [
      "No orphan fragments",
      "Two consecutive short lines are merged back together whenever the combined line still fits the limit, so you do not get a stray two-word row.",
    ],
    [
      "Timing figures, not just text",
      "Every line reports the characters it uses and the minimum seconds it must stay on screen, clamped between 5/6 second and 7 seconds.",
    ],
  ],
  faqs: [
    [
      "How many characters should a karaoke line be?",
      "Around 28 to 34 characters, which is why the default here is 32 — short enough for a singer to take in the whole phrase at a glance. Subtitle conventions run longer: the BBC Subtitle Guidelines suggest roughly 37 characters per line and the Netflix Timed Text Style Guide caps a line at 42.",
    ],
    [
      "How long does each lyric line need to stay on screen?",
      "Divide the line's character count by 17 characters per second, then clamp the result between 5/6 of a second and 7 seconds. That is the Netflix adult reading speed and its minimum and maximum subtitle durations, and it is exactly the calculation shown next to each split line.",
    ],
    [
      "Will it keep my verse and chorus breaks?",
      "Yes, when the stanza option is on: a blank line in your pasted lyrics is treated as a stanza boundary and preserved in the output. Turn it off and the whole song collapses into one continuous block of wrapped lines.",
    ],
    [
      "Can it show more than one line at a time?",
      "Yes, you can set 1 to 4 lines per screen, and the screen count is calculated by dividing each stanza's line count by that figure and rounding up. Two lines per screen is the default, matching the usual karaoke layout of a current line plus the one coming next.",
    ],
  ],
};

export default seo;
