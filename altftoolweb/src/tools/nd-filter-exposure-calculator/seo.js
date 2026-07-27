const seo = {
  intro:
    "ND Filter Exposure Calculator converts a shutter speed metered without a filter into the exposure needed behind neutral density, using the rule that each stop halves the light so the shutter must double: filtered time = metered time × 2^stops. It also reports the filter factor, the optical density (stops × log10 2, so 10 stops is density 3.0) and the transmittance, and adds the stops when you stack filters. Aimed at long-exposure landscape, architecture and daytime video work.",
  useCases: [
    "Turning a metered 1/125 s into the 8.2 s needed behind a 10-stop ND1000 for smooth water.",
    "Stacking a 6-stop and a 3-stop filter and confirming the combined nine stops before setting the shutter.",
    "Working backwards from a wanted 30-second exposure to the amount of ND that would get you there.",
    "Checking when an exposure crosses 30 seconds and needs bulb mode with a remote or intervalometer.",
  ],
  benefits: [
    ["Stacking handled", "Filter factors multiply, so stops add — the tool sums them instead of you guessing."],
    ["All three notations", "Stops, filter factor and optical density shown together, since manufacturers use all of them."],
    ["Bulb and film warnings", "Flags exposures past 30 s and past 1 s, where bulb mode and reciprocity failure start to matter."],
  ],
  faqs: [
    [
      "How do I calculate exposure time with a 10-stop ND filter?",
      "Multiply the metered time by 2^10, which is 1024. A meter reading of 1/125 s becomes about 8.2 seconds; 1/60 s becomes about 17 seconds; 1/15 s becomes about 68 seconds, which needs bulb mode.",
    ],
    [
      "What does ND1000 mean?",
      "It is a filter with roughly a 1000× light-reduction factor, which is 10 stops and an optical density of 3.0. The true factor of 10 stops is 1024, so the printed 1000 is a rounded marketing figure — the density number on the ring is the precise specification.",
    ],
    [
      "Can I stack ND filters?",
      "Yes, and their stops simply add because the factors multiply: a 6-stop plus a 3-stop gives 9 stops, a factor of 512. Stacking thick filters on a wide lens risks vignetting, and each extra glass surface adds a little flare and colour cast.",
    ],
    [
      "Why is my long exposure still too dark on film?",
      "Because of reciprocity failure — beyond about one second, film loses effective sensitivity and needs extra time on top of the calculated figure. The correction is stock-specific, so use the manufacturer's chart. Digital sensors are linear and need no such correction.",
    ],
  ],
};

export default seo;
