const seo = {
  intro:
    "The Hook Retention Timing Planner converts a short video's runtime and frame rate into a beat sheet anchored to each platform's own measurement thresholds — the point a view is credited, the point a skip button appears, and the point a completion or ThruPlay is counted. Meta counts a video view at 3 seconds and a ThruPlay at 15 seconds or completion; TikTok reports 2-second and 6-second views; YouTube skippable in-stream shows the skip button at 5 seconds and credits a paid view at 30 seconds. Editors and paid-social creatives use it to place the hook, the pattern interrupts and the CTA on exact frames rather than by feel.",
  useCases: [
    "Cutting a 30-second Reel and needing the hook captioned before the 3-second view mark, with the CTA fenced off in the last 4.5 seconds",
    "Building a YouTube skippable in-stream ad where the strongest visual turn has to land on the 5-second skip button",
    "Checking a published TikTok against its reporting — 2-second views over impressions for hook rate, 6-second views over 2-second views for hold rate",
  ],
  benefits: [
    [
      "Frame-accurate, not vibes",
      "Every beat comes back in seconds, frame index and non-drop-frame MM:SS:FF timecode at your chosen rate, from 23.976 to 60 fps.",
    ],
    [
      "Built on published thresholds",
      "Beats are pinned to each platform's own view and ThruPlay definitions, so the payoff lands before the metric fires rather than after it.",
    ],
    [
      "Warns when the maths breaks",
      "A 6-second cut on a 30-second credit threshold, or a hook eating half the runtime, is flagged instead of silently producing a useless sheet.",
    ],
  ],
  faqs: [
    [
      "How long do I have to hook a viewer on Reels or TikTok?",
      "Under 3 seconds, and on TikTok closer to 2. Meta credits a video view after 3 seconds of playback and TikTok reports a 2-second view as its first metric, so the promise has to be stated and captioned inside that window. On YouTube Shorts a play counts immediately, which moves the real test to roughly the 10-second mark instead.",
    ],
    [
      "What is a ThruPlay and when does it count?",
      "A ThruPlay is credited when a Meta video is played to completion or for at least 15 seconds, whichever comes first. That means a 12-second video can only earn a ThruPlay by being watched all the way through, while a 60-second video earns one at the 15-second mark — which is why cuts shorter than the threshold need a different creative plan.",
    ],
    [
      "When does the skip button appear on a YouTube ad?",
      "At 5 seconds on skippable in-stream ads, and the paid view is credited at 30 seconds or at completion for ads shorter than 30 seconds. Those two numbers set the whole structure: brand and payoff before 5 seconds, and a reason to stay through to 30.",
    ],
    [
      "How do I calculate hook rate and hold rate?",
      "Hook rate is views at the platform's view mark divided by impressions; hold rate is views at the completion threshold divided by views at that view mark. For example, 4,200 three-second views on 10,000 impressions is a 42% hook rate, and 900 ThruPlays from those 4,200 is a 21.4% hold rate — a 9% view-through rate overall. A weak hook rate is a first-frame problem; a weak hold rate is a middle-of-the-video problem.",
    ],
  ],
};

export default seo;
