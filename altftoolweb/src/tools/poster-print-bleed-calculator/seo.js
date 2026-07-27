const seo = {
  intro:
    "A poster bleed calculator converts a finished (trim) poster size into the document you actually set up in Illustrator, InDesign or Photoshop: trim plus bleed on all four edges, a safe margin inside the trim, and the pixel dimensions needed at the export resolution. It applies the standard 3 mm ISO or 1/8 in US bleed allowance, picks an export PPI from the viewing distance, and sizes headline, sub-head and body text using the sign-industry rule of one inch of capital-letter height per ten feet of viewing distance. Designers, print buyers and event teams use it to avoid white slivers at the trim edge and text that is unreadable from where the audience stands.",
  useCases: [
    "Setting up an A1 event poster at 594 x 841 mm and needing the 600 x 847 mm artboard with 3 mm bleed before placing artwork.",
    "Checking whether a 4 x 2 m stage backdrop really needs a 300 PPI file or whether 100 PPI at final size is enough for a 5 m viewing distance.",
    "Sizing the headline on a mall standee so it still reads from across a 6 m atrium.",
    "Estimating the flattened CMYK file size before uploading artwork to a printer's portal with an upload limit.",
  ],
  benefits: [
    [
      "Bleed and safe area together",
      "Shows the outer document size and the inner live area in one pass, so nothing important sits near the trim.",
    ],
    [
      "Resolution matched to distance",
      "Uses trade PPI bands plus the 20/20-vision acuity floor instead of defaulting every job to 300 PPI.",
    ],
    [
      "Readable type sizes",
      "Converts viewing distance into cap heights in millimetres and point sizes you can type into your layout.",
    ],
  ],
  faqs: [
    [
      "How much bleed does a poster need?",
      "3 mm per edge is the standard commercial bleed in metric markets and 1/8 in (3.175 mm) in the US, so an A1 poster of 594 x 841 mm becomes a 600 x 847 mm document. Large-format, mounted or stretched work often needs 5-10 mm, and pull-up banners need extra at the bottom for the cassette, so check the printer's spec sheet.",
    ],
    [
      "What resolution should a large poster be?",
      "Resolution is set by viewing distance, not by poster size. Around 300 PPI at final size for work inspected within half a metre, 150 PPI for a wall poster viewed at 1.5-3 m, and 100 PPI or less for banners and backdrops viewed beyond 3 m. A 20/20 eye stops resolving detail below about one arcminute per pixel, which is roughly 286 PPI at 12 inches and only about 44 PPI at 2 metres.",
    ],
    [
      "How big should text be on a poster?",
      "The long-standing sign-industry rule is one inch (25.4 mm) of capital-letter height for every ten feet (about 3 m) of viewing distance for headline text read at a glance. At a 2 m viewing distance that is roughly a 17 mm cap height, or about 67 pt in a typical text face whose caps are 70% of the point size.",
    ],
    [
      "What is the difference between bleed and safe margin?",
      "Bleed is artwork that extends past the trim line and gets cut away, covering the small drift in guillotine cutting. The safe margin is the opposite: a band inside the trim, usually 5 mm on small work and 10 mm or more on posters, where you keep text and logos so they are never clipped. Set both before you start laying out the design.",
    ],
  ],
};

export default seo;
