const seo = {
  title: "TV Viewing Distance: 4K, 1080p and FOV Calculator",
  metaDescription:
    "Get the ideal sofa distance from screen size and resolution — 1.25x diagonal for 4K, 2.0x for 1080p — blended with a 30-42° field-of-view target.",
  steps: [
    "Tap a screen preset from 32\" to 98\" or type Screen size (inches), then set Aspect ratio, Resolution (720p HD, 1080p Full HD, 4K UHD or 8K UHD) and Viewing style — Cinema / Movies, Mixed Streaming, Sports / TV Channels, Gaming or Bedroom Casual.",
    "Under Room & Seating pick Feet or Meters as the Distance unit, then enter Current sofa distance, Room depth, Eye level (inches) and TV center height (inches).",
    "Read the Ideal Distance, Comfort Range and Current FOV cards plus the Too close / Near edge / Ideal zone verdict, then press Copy Guide, or CSV to download tv-viewing-distance-guide.csv.",
  ],
  intro:
    "The TV Viewing Distance Guide works out how far to sit from a screen by blending two calculations: the resolution rule, which multiplies the diagonal by 1.25 for 4K, 2.0 for 1080p, 2.8 for 720p and 1.0 for 8K, and a field-of-view target set by what you watch — 42° for gaming, 40° for movies, 36° for mixed streaming, 32° for sports and 30° for casual bedroom viewing. Enter the screen size, aspect ratio, resolution, room depth and where the sofa actually is, and you get an ideal distance, a comfort range, your current field of view in degrees and the screen size that would suit your seat. It is for anyone deciding between a 55-inch and a 65-inch, or wondering why the sofa feels wrong.",
  useCases: [
    "Your sofa is fixed at 9 feet from the wall and you want to know the largest 4K screen that will not feel overwhelming from that seat.",
    "You are upgrading from 1080p to 4K and want to check whether you can now sit closer without seeing pixel structure.",
    "The living-room TV doubles as a console gaming screen, and you want to compare the 42° gaming target against the 36° everyday streaming target for the same seat.",
  ],
  benefits: [
    [
      "Two methods reconciled, not one",
      "The recommendation is a weighted blend of the resolution multiplier and the field-of-view target, so a sharpness rule and an immersion rule produce a single distance instead of two conflicting answers.",
    ],
    [
      "Your current seat scored",
      "Enter where you sit today and it returns the actual viewing angle in degrees plus a too-close, near-edge, ideal or too-far verdict against the range for your resolution.",
    ],
    [
      "Works the calculation backwards too",
      "From your seating distance it reports the screen size that fits, rounded to the nearest 5 inches, which is the number you need when comparing models.",
    ],
  ],
  faqs: [
    [
      "How far should I sit from a 65-inch 4K TV?",
      "About 6 to 7 feet for mixed viewing. The 4K rule puts the comfort range at 1.0 to 1.6 times the diagonal — roughly 5.4 to 8.7 feet for a 65-inch — with the ideal near 1.25 times, and the field-of-view target then nudges that within the range depending on whether you are gaming, watching films or watching sport.",
    ],
    [
      "Is the viewing distance different for 1080p and 4K?",
      "Yes, substantially. 1080p wants 1.6 to 2.5 times the diagonal because the pixel structure becomes visible closer up, while 4K allows 1.0 to 1.6 times and 8K as little as 0.75 times. That is why the same sofa can suit a much larger screen after a resolution upgrade.",
    ],
    [
      "What field of view should a TV fill?",
      "Around 30° to 40° horizontally for most rooms. This guide targets 40° for cinema-style movie watching, 42° for gaming where responsiveness and immersion matter, 36° for everyday streaming, 32° for sports where you scan the whole frame, and 30° for relaxed bedroom viewing.",
    ],
    [
      "How high should the TV be mounted?",
      "Centre the screen close to seated eye level — commonly around 42 inches from the floor for a standard sofa. The tool reports the gap between your entered eye level and the TV centre height so you can see how far off the mount is; larger gaps mean more neck angle over a long session.",
    ],
  ],
};

export default seo;
