const seo = {
  title: "Facebook Cover Safe Zone: 820x312 vs 640x360 Crops",
  metaDescription:
    "One cover, two crops. Get the region that survives both the 820x312 desktop and 640x360 mobile crop, plus the pixels lost on each side.",
  steps: [
    "Set Canvas width (px) and Canvas height (px), or tap a preset such as 'Recommended 1640 × 624' or 'Tall, mobile-first 1640 × 923'.",
    "Tick 'Account for the profile photo', then set 'Padding around text (px)', 'Headline size in the artwork (px)' and 'Rendered width on screen (px)'.",
    "Read the 'Visible on desktop and mobile' rectangle with the pixels lost on mobile each side, then press 'Copy guide' for the SVG guide layer.",
  ],
  intro:
    "Facebook Page Cover Maker solves the two-crop problem: one uploaded cover is displayed at 820 × 312 pixels on desktop and 640 × 360 on a phone, and Facebook centre-crops to whichever ratio the surface needs. The tool computes the intersection of those two centred crops — the region guaranteed to be visible everywhere — reports exactly how many pixels are lost on each device, and maps the circular page profile photo that overlaps the lower left on desktop. You get the safe rectangle in pixel coordinates plus an SVG guide layer.",
  useCases: [
    "Position a logo so it is not cropped off the side of the cover on phones.",
    "Decide between a 1640 × 624 and a taller mobile-first canvas by comparing what each loses.",
    "Check that a strapline set at 60 px is still readable when the cover displays at 820 px wide.",
    "Send a designer an overlay showing the desktop crop, mobile crop and profile-photo circle.",
  ],
  benefits: [
    ["Both crops measured", "Shows the desktop and mobile crops and the exact overlap, instead of a single generic safe zone."],
    ["Loss reported in pixels", "Tells you how many pixels vanish from each side on mobile and from top and bottom on desktop."],
    ["Profile photo mapped", "Models the 170 px desktop photo scaled to your canvas so text never lands under it."],
  ],
  faqs: [
    [
      "What size should a Facebook page cover photo be?",
      "Upload at 1640 × 624 pixels — twice the 820 × 312 desktop display size — so the cover stays sharp on high-density screens. Facebook's stated minimum is 400 × 150 pixels, but anything below the desktop display size gets upscaled.",
    ],
    [
      "Why is my Facebook cover cropped differently on mobile?",
      "Because the same file is shown at two aspect ratios: 2.628:1 on desktop and 1.778:1 on a phone. On a 1640 × 624 canvas the phone crops about 265 pixels off each side, so anything near the left or right edge disappears there.",
    ],
    [
      "Where does the profile picture sit on a Facebook page cover?",
      "On desktop the circular page photo overlaps the lower left of the cover at about 170 pixels across; on mobile it sits below the cover instead. Keep logos and text clear of that corner so the desktop layout still reads.",
    ],
    [
      "What is the safe zone for a Facebook cover photo?",
      "The centre band that both crops include. On the recommended 1640 × 624 canvas that is roughly the middle 1109 × 624 pixels, about 68% of the file — keep every important element inside it.",
    ],
  ],
};

export default seo;
