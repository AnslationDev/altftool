const seo = {
  title: "Snapchat Ad Sizes: 1080x1920 Export with Safe Zone",
  metaDescription:
    "Resize artwork to 1080x1920, 360x600, 160x160 or a 1080x2340 geofilter, with the 150px safe zone drawn on and the 300 KB PNG ceiling checked.",
  steps: [
    "Under \"1. Choose the creative\", press one of the chips: \"Single image ad\", \"Story / organic snap\", \"Story ad brand tile\", \"Collection ad product tile\" or \"On-demand geofilter\".",
    "In \"2. Add your artwork\" pick an \"Image file (PNG, JPEG, WebP)\" or type Source width and height, then set Fit mode to \"Fill — crop the overflow\", \"Fit — add background bars\" or \"Stretch — distort to fit\", plus Bar background, Export format and Encoder quality.",
    "\"Creative size\" reports the target pixels and ratio with the 150 px safe zone drawn on the crop preview; press Export to save the canvas render as yourfile-1080x1920.png, or use \"Copy spec\" and Reset.",
  ],
  intro:
    "This generator exports Snapchat creative at the exact sizes the platform expects — 1080x1920 for single image ads and story snaps, 360x600 for a Story Ad brand tile, 160x160 for collection product tiles and 1080x2340 for an on-demand geofilter. It draws Snapchat's recommended 150 pixel top and bottom clear zone over the preview and checks the finished file against the format's weight limit, including the 300 KB PNG ceiling on geofilters. The resize runs on canvas in your browser, so nothing is uploaded.",
  useCases: [
    "Turn a 4:5 product photograph into a full-bleed 1080x1920 Snap Ad and see how much of the sides get cropped.",
    "Design an on-demand geofilter and confirm the exported PNG stays under the 300 KB limit before submitting it.",
    "Cut a 360x600 brand tile from an existing key visual so the Story Ad entry point matches the campaign.",
    "Check whether a 720p screenshot can be enlarged to 1080x1920 without falling past the point where upscaling shows.",
  ],
  benefits: [
    ["Safe zone drawn on the frame", "The 150 px top and bottom margins Snapchat asks you to keep clear are shown, not just described."],
    ["Per-format weight limit", "Geofilters are checked against 300 KB and ad images against 5 MB, using the real exported file size."],
    ["Nothing leaves the device", "Canvas does the scaling and encoding locally, so unreleased creative stays private."],
  ],
  faqs: [
    [
      "What size is a Snapchat ad?",
      "1080 x 1920 pixels at 9:16 for single image and video ads, which is the same full-screen canvas as an organic snap. Story Ads additionally need a 360 x 600 brand tile, and collection ads need four 160 x 160 product tiles.",
    ],
    [
      "What is the Snapchat safe zone?",
      "Snapchat's creative guidance asks you to keep roughly 150 pixels clear at the top and bottom of a 1080 x 1920 creative. The profile row sits over the top strip and the swipe-up call to action sits over the bottom, so headlines placed there get covered.",
    ],
    [
      "What are the requirements for a Snapchat geofilter?",
      "An on-demand geofilter is a 1080 x 2340 pixel PNG with a transparent background, under 300 KB. Leave the centre of the frame empty so the user's own photo shows through, and keep artwork to the top and bottom edges.",
    ],
    [
      "How big can a Snapchat ad image file be?",
      "Still-image creative is accepted up to 5 MB in Ads Manager. If a PNG export goes over, re-encode as JPEG at 80-90% quality — a photographic 1080 x 1920 frame usually drops to a few hundred kilobytes with no visible change.",
    ],
  ],
};

export default seo;
