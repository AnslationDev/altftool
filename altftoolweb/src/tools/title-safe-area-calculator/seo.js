const seo = {
  intro:
    "This calculator converts safe area percentages into pixel margins for any frame size: a safe rectangle of P percent leaves a margin of (100 - P) / 2 percent on each edge. It defaults to the EBU R 95 and SMPTE ST 2046-1 practice of a 93% action safe and 90% graphics safe area for 16:9 HD, and also offers the older SMPTE RP 218 90/80 margins used in standard definition. Editors, designers and broadcast QC operators use it to keep captions, lower thirds and logos clear of the frame edge.",
  useCases: [
    "Setting guides in After Effects or Premiere for a 1920x1080 sequence at 96 px side and 54 px top title safe margins",
    "Checking that a lower third in a UHD 3840x2160 master sits inside the 192 px and 108 px graphics margins",
    "Conforming archive standard-definition graphics that were laid out to the older 90/80 RP 218 rule",
  ],
  benefits: [
    ["Standards-based defaults", "EBU R 95 93/90 for HD and SMPTE RP 218 90/80 for legacy SD"],
    ["Any raster", "Works for vertical, square and UHD frames, not just 16:9 HD"],
    ["Ready-to-use coordinates", "Gives the safe box corners so guides can be typed straight in"],
  ],
  faqs: [
    [
      "What are the title safe margins for 1920x1080?",
      "Under EBU R 95 the graphics safe area is 90% of the raster: 1728 x 972 pixels, leaving 96 pixels at the left and right and 54 pixels at the top and bottom. Action safe is 93%, or 1785.6 x 1004.4 pixels, with margins of 67.2 and 37.8 pixels.",
    ],
    [
      "What is the difference between action safe and title safe?",
      "Action safe is the larger box that important movement should stay inside; title safe is the smaller box for text and graphics, because text at the very edge is the first thing lost to overscan or a platform overlay. The gap between them is 3% of the frame under EBU R 95.",
    ],
    [
      "Do safe areas still matter on modern flat screens?",
      "Yes, though for a different reason: modern panels rarely overscan, but broadcasters, streaming players and social apps place captions, progress bars and account handles over the frame edges. Keeping text in the 90% box also survives a later crop to a different aspect ratio.",
    ],
    [
      "Which standard should I use, EBU R 95 or SMPTE RP 218?",
      "Use EBU R 95 (93% action, 90% graphics) for HD and UHD work, and reserve the RP 218 90/80 margins for standard-definition or archive material laid out to that rule. Always defer to the delivery specification you were given, since some broadcasters tighten these figures.",
    ],
  ],
};

export default seo;
