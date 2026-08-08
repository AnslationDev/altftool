const seo = {
  title: "Myopia Progression Log: Dioptres Per Year Tracker",
  metaDescription:
    "Log dated sphere and cylinder powers to get a D/year rate, least-squares trend line, IMI severity band and an axial-length equivalent at 2.7 D per mm.",
  steps: [
    "Enter each spectacle prescription as Date, Sphere (D) and Cylinder (D), pressing Add a reading for every extra appointment.",
    "Set Project ahead (years) — the log combines sphere with half the cylinder and fits a least-squares trend line across all readings.",
    "Read the Progression rate in D/yr with its severity band, trend line slope and axial-length equivalent, then press Copy result.",
  ],
  intro:
    "The Myopia Progression Log turns a list of dated spectacle prescriptions into a progression rate in dioptres per year, calculated as the change in spherical equivalent divided by the elapsed time. It fits a least-squares trend line across every reading, places the current power on the International Myopia Institute severity bands (myopia at -0.50 D, high myopia at -6.00 D) and converts the dioptric change into an approximate axial-length equivalent at about 2.7 D per millimetre. Parents tracking a child's glasses and adults watching their own power drift get a record worth bringing to an appointment.",
  useCases: [
    "See whether a child moving from -0.75 D to -2.00 D over two years counts as progressing under the -0.50 D a year threshold.",
    "Compare year-on-year intervals to check whether a change of habits or a myopia management lens slowed the rate.",
    "Project a current trend forward three years to see when a power would cross into moderate or high myopia.",
    "Keep a single dated record of every prescription so a new optometrist has the full history at the first visit.",
  ],
  benefits: [
    ["Spherical equivalent, done properly", "Combines sphere and half the cylinder so astigmatism does not distort the trend."],
    ["Interval and overall rates", "Shows each gap between appointments as well as the least-squares slope across all readings."],
    ["Standard thresholds", "Uses the published -0.50 D myopia definition, the -6.00 D high myopia definition and the -0.50 D/year progression marker."],
  ],
  faqs: [
    [
      "What counts as fast myopia progression in a child?",
      "A change of about -0.50 dioptres a year or more is the figure eye care professionals generally use to describe a progressing myope, and -0.75 D a year or faster is often called rapid. Younger children typically progress faster, so age matters as much as the number.",
    ],
    [
      "How do I calculate spherical equivalent from a prescription?",
      "Add half the cylinder to the sphere. A prescription of -2.00 sphere with -1.00 cylinder has a spherical equivalent of -2.50 D. This is the single figure used to compare prescriptions over time and to define myopia severity.",
    ],
    [
      "How much axial length does one dioptre of myopia represent?",
      "Roughly 1 mm of axial elongation corresponds to about 2.5 to 3.0 dioptres in an adult-sized eye, so this log uses 2.7 D per mm. It is an approximation for context only — actual axial length is measured with optical biometry in a clinic and is the more reliable measure in children.",
    ],
    [
      "Can myopia progression be slowed down?",
      "Several approaches are used in clinical practice, including specific spectacle and contact lens designs, orthokeratology and low-concentration atropine drops, alongside more time outdoors. Which of these is appropriate depends on age, progression rate and eye health, so it is a conversation for an optometrist or ophthalmologist rather than something to start on your own.",
    ],
  ],
};

export default seo;
