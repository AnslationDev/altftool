const seo = {
  title: "Twitch Offline Banner Layout: 1920x1080 Grid",
  metaDescription:
    "Plan a 1920x1080 offline screen: control-bar strip reserved, block grid sized, type checked at the player's 940px width, against Twitch's 10 MB cap.",
  steps: [
    "Click the \"Offline screen — 1920 × 1080\" preset chip, or type your own \"Canvas width (px)\" and \"Canvas height (px)\".",
    "Set Information blocks and Columns for the grid, the \"Gutter between blocks (px)\", the \"Control bar (× canvas height)\" allowance, and \"Heading size in the artwork (px)\" and \"Body size in the artwork (px)\" against \"Player width on screen (px)\", which defaults to 940.",
    "The SVG preview shades the control-bar strip and outlines every block, and the list gives each block's cell size, the usable area's coordinates, on-screen heading and body sizes and your \"Exported file size (MB)\" against the 10 MB limit; \"Copy guide\" takes the SVG guide layer.",
  ],
  intro:
    "Twitch Offline Banner Maker plans the 1920 × 1080 video player banner viewers see when a channel is offline. It reserves the strip the player's control bar covers along the bottom plus a letterbox margin, then divides the remaining area into an even grid of information blocks — schedule, socials, next stream — returning the exact cell size and position for each. It also converts your artwork type sizes into the pixel size a viewer actually sees once the player renders at roughly 940 pixels wide, which is where most offline screens fall apart.",
  useCases: [
    "Lay out a three-panel offline screen with schedule, socials and Discord in equal columns.",
    "Check whether 28 px body text in the artwork is still readable inside the Twitch player.",
    "Keep the streaming schedule clear of the control bar that appears across the bottom.",
    "Export a guide layer so the artwork and the block grid line up exactly in Photoshop or Figma.",
  ],
  benefits: [
    ["Control bar accounted for", "Reserves the lower strip the player draws over, so the bottom row of information is not hidden."],
    ["Real grid maths", "Cell width and height are computed from the usable area, the gutter and the column count, with coordinates for every block."],
    ["Readability check", "Shows heading and body sizes at player scale, flagging anything that falls under a 12 pixel practical floor."],
  ],
  faqs: [
    [
      "What size is a Twitch offline banner?",
      "1920 × 1080 pixels, matching the 16:9 video player, with a 10 MB file-size limit. JPG and PNG both work; a GIF is accepted but only a static frame is shown.",
    ],
    [
      "What should go on a Twitch offline screen?",
      "Three or four things at most: when you stream, where else to find you, and what is coming next. Viewers glance at an offline screen for a few seconds, so a dense list of sponsors and rules is wasted effort.",
    ],
    [
      "Why is text on my offline banner hard to read?",
      "Because the banner is designed at 1920 pixels but displayed at around 940 in the player with chat open — roughly half size. Type set at 24 px in the file arrives at about 12 px on screen, which is the point where it stops being comfortable.",
    ],
    [
      "What other artwork does a Twitch channel need?",
      "A 1200 × 480 profile banner, a 256 × 256 profile picture and 320 px wide channel panel images, alongside the 1920 × 1080 offline screen. Keeping one visual system across all four is what makes a channel look finished.",
    ],
  ],
};

export default seo;
