const seo = {
  title: "Google Meet Background Maker: Blur Past the Mask Limit",
  metaDescription:
    "Makes a 16:9 Meet background at 1920x1080 and blurs it past the 256x144 segmentation mask, so the cut-out edge round your shoulders stops shimmering.",
  steps: [
    "Choose an Export size — 1920 x 1080 (Meet recommended), 1280 x 720 (Meet minimum) or 2560 x 1440 (high-DPI displays) — then a Colour theme and a Pattern such as Soft gradient or Diagonal stripes.",
    "Leave Blur radius empty to take the mask-resolution target, or press Use 15 px target blur at the 1920-wide preset; add a Caption, set it to Bottom right or Bottom left, and use Show silhouette band to see where the cut-out edge lands.",
    "Edge-keying index scores the design out of 100 with its band, and the rows report Blur applied, Mask-resolution blur target, the segmentation cell size against the 256x144 mask and Silhouette-band contrast; Download PNG saves google-meet-background-1920x1080.png, then checks it against Meet's minimum size, 16:9 ratio and 16 MB upload limit.",
  ],
  intro:
    "Google Meet Background Maker generates a 16:9 background at Meet's specs — 1920x1080 recommended, 1280x720 minimum, JPG or PNG under 16 MB — and blurs it to the radius where browser selfie segmentation can no longer resolve the detail. Because that segmentation mask runs at roughly 256x144, one mask cell is about 7.5 export pixels on a 1920-wide image, and Nyquist says a feature has to be smeared across two cells to stop aliasing on the cut-out edge. The result is a background that keys cleanly instead of shimmering around your shoulders.",
  useCases: [
    "Replace a busy patterned background that makes your outline flicker during long calls.",
    "Produce a company-branded meeting background with a small URL caption that stays clear of your silhouette.",
    "Work out how much blur a 2560-wide background needs so it keys as cleanly as a 1920-wide one.",
    "Compare a striped design against a soft gradient before rolling one out to a whole team.",
  ],
  benefits: [
    ["Blur target from first principles", "The recommended radius comes from the segmentation mask resolution and the Nyquist limit, not a fixed guess."],
    ["Edge-keying index with visible weights", "Blur adequacy, silhouette-band contrast and pattern busyness are each scored and shown separately."],
    ["Meet limits checked on export", "Minimum size, 16:9 aspect and the 16 MB upload cap are verified against the file you actually produced."],
  ],
  faqs: [
    [
      "What size should a Google Meet background image be?",
      "1920x1080 pixels at 16:9 works best; the minimum Meet accepts is 1280x720. Upload as JPG or PNG and keep the file under 16 MB.",
    ],
    [
      "Why does my Google Meet background have a halo around my shoulders?",
      "The segmentation mask that separates you from your room runs at about 256x144, so fine detail in the background cannot be represented cleanly at the edge. Blurring the background past roughly two mask cells — about 15 px on a 1920-wide image — removes most of the halo.",
    ],
    [
      "Does a blurred background use less bandwidth?",
      "No. The background is composited on your own device before encoding, so bandwidth depends on your camera resolution and the codec, not on how detailed the background looks. Heavy segmentation does use more CPU or GPU.",
    ],
    [
      "Why is the text on my background mirrored?",
      "Meet mirrors your self view so that moving left feels natural, but other participants see the unmirrored image with the text the right way round. Ask a colleague to confirm, or judge it from the unmirrored preview here.",
    ],
  ],
};

export default seo;
