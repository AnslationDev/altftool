const seo = {
  title: "Sprite Animation Timing Calculator with CSS steps()",
  metaDescription:
    "Turns frame count and fps into frame duration, sheet dimensions and CSS steps() keyframes, and flags rates that don't divide your refresh evenly.",
  steps: [
    "Enter 'Frame count', 'Frame rate (fps)', 'Frame width (px)', 'Frame height (px)' and 'Frames per row on the sheet'.",
    "Pick your 'Display refresh rate (Hz)' and set the 'CSS selector' the generated rule should target.",
    "Read 'Duration of one frame', 'Display refreshes per frame' and 'GIF frame delay', then press 'Copy CSS'.",
  ],
  intro:
    "Sprite Animation Timing Calculator converts a frame count and a target frame rate into the numbers a sprite sheet animation actually needs: frame duration in milliseconds (1000 ÷ fps), full cycle length, sheet dimensions from the frame size and column count, and the CSS steps() keyframes that drive it. It also checks the rate against your display refresh — 24 fps on a 60 Hz screen gives 2.5 refreshes per frame, so frame lengths alternate and the motion judders — and flags GIF delays below the 2-centisecond floor browsers enforce.",
  useCases: [
    "Pick a frame rate that divides 60 Hz evenly so a walk cycle plays without stutter.",
    "Work out the sheet dimensions before exporting frames from an animation tool.",
    "Generate the steps() keyframes for a 4 × 3 grid sheet without deriving the background positions by hand.",
    "Check whether an animation can ship as a GIF or has to be video because the frame delay is too short.",
  ],
  benefits: [
    ["Refresh-aware", "Tells you when a rate does not divide the display refresh evenly, and which nearby rate does."],
    ["Grid and strip", "Generates single-axis CSS for a strip and paired horizontal/vertical animations for a grid sheet."],
    ["Reduced motion included", "The generated CSS ships with a prefers-reduced-motion block that stops the animation."],
  ],
  faqs: [
    [
      "How do I calculate sprite animation frame duration?",
      "Divide 1000 by the frame rate: at 12 fps each frame lasts 83.33 ms, at 24 fps 41.67 ms, and at 30 fps 33.33 ms. The full cycle is the frame count divided by the rate — 12 frames at 12 fps runs for exactly one second.",
    ],
    [
      "What frame rate should a sprite animation use?",
      "Pick a rate that divides your display refresh into a whole number. On a 60 Hz screen that means 60, 30, 20, 15, 12 or 10 fps, where each frame is held for 1, 2, 3, 4, 5 or 6 refreshes. 24 fps is the classic film rate but needs 2.5 refreshes per frame on a 60 Hz panel, so frames alternate between two and three refreshes and the motion visibly judders.",
    ],
    [
      "How does CSS steps() work with a sprite sheet?",
      "Animate background-position from 0 to minus the full sheet width with steps(N), where N is the number of frames in the row. steps() defaults to jump-end, meaning the last keyframe value is never displayed, so the animation lands on each of the N frames exactly once before looping.",
    ],
    [
      "Why is my GIF animation slower than I set it to?",
      "GIF stores frame delay in hundredths of a second, and browsers clamp anything below 2 centiseconds — historically substituting 10 cs instead. That caps a GIF at roughly 50 fps and often much less. If the calculated delay comes out under 2 cs, export the animation as video or CSS rather than GIF.",
    ],
  ],
};

export default seo;
