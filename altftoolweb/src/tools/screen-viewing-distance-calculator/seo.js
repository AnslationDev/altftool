const seo = {
  intro:
    "The Screen Viewing Distance Calculator works out how far your eyes should sit from a display by combining three independent rules: the distance at which one pixel subtends one arcminute (the 20/20 resolution limit, distance = pixel pitch x 3437.75), the SMPTE 30 degree and THX 40 degree horizontal viewing angles, and the 50 to 100 cm eye-to-screen window that OSHA and the American Optometric Association use for desk work. Enter a diagonal, an aspect ratio and a resolution and it returns the panel dimensions, pixel density and a recommended distance with the reason behind it.",
  useCases: [
    "Find the desk distance for a 27-inch 1440p monitor where the pixels stop being resolvable — about 80 cm.",
    "Work out the seating distance for a 55-inch 4K TV at the SMPTE 30 degree field before buying a sofa.",
    "Compare the field of view an ultrawide gives at 80 cm against a 16:9 panel of the same diagonal.",
    "Check whether leaning in to 50 cm on a 4K monitor is a resolution problem or a text-scaling problem.",
  ],
  benefits: [
    ["Three standards, one answer", "Pixel density, SMPTE, THX and desk ergonomics are all shown so you can see which one is binding."],
    ["Real panel geometry", "Width and height are derived from the diagonal and aspect ratio, not guessed from the diagonal alone."],
    ["Height and tilt too", "Reports how far the screen centre sits below the top edge so you can set a correct downgaze."],
  ],
  faqs: [
    [
      "How far should I sit from my computer monitor?",
      "Between 50 and 100 cm (roughly 20 to 40 inches) for desk work, with the top of the screen at or just below eye level. Within that window, sit at least as far back as the pixel-free distance for your panel — about 80 cm for a 27-inch 1440p monitor and about 50 cm for a 27-inch 4K one.",
    ],
    [
      "What is the ideal TV viewing distance?",
      "SMPTE EG-18 puts the screen at a 30 degree horizontal field, which for a 55-inch 16:9 TV is about 227 cm. THX allows up to 40 degrees, roughly 167 cm for the same set, which is the closest generally recommended seat.",
    ],
    [
      "How is the pixel-free viewing distance calculated?",
      "A 20/20 (6/6) eye resolves detail down to about one arcminute. Beyond distance = pixel pitch / tan(1 arcminute), which equals pixel pitch x 3437.75, individual pixels blend together. For a 0.233 mm pitch — a 27-inch 1440p panel — that works out at about 80 cm.",
    ],
    [
      "Does sitting further from the screen prevent eye strain?",
      "Distance helps, but it is not the whole story. Digital eye strain is driven mainly by sustained near focus and a blink rate that drops during concentrated work, so distance breaks (the 20-20-20 rule), screen height, glare control and an up-to-date prescription matter as much. Persistent strain deserves an eye examination.",
    ],
  ],
};

export default seo;
