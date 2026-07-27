const seo = {
  intro:
    "The printable area on a t-shirt is the smaller of two limits: the garment, whose usable width is the flat chest measurement minus a seam clearance on each side and whose usable height is body length minus the collar drop and hem clearance, and the press platen, which caps everything at sizes like 14 x 16 or 16 x 20 inches. This calculator works out both for every size in a run, fits your artwork ratio inside without distortion, and converts the result to the pixel dimensions you need at 300 DPI. Written for print-on-demand sellers and anyone preparing artwork for a decorator.",
  useCases: [
    "Check that a 4:5 design still fits on a Youth S before committing to one artwork file for the whole size run.",
    "Work out the exact pixel dimensions to export so the print lands at a true 300 DPI rather than being upscaled.",
    "Set the top of a full-front print 3 inches below the collar seam so it is not hidden under a jacket collar.",
    "Confirm a 3000 px file is sharp enough at 12.8 inches wide before paying for a sample.",
  ],
  benefits: [
    ["Both limits, not just the platen", "Small sizes are usually limited by the garment, not the press, which is where size runs go wrong."],
    ["Aspect ratio preserved", "Artwork is fitted inside the area rather than stretched, so nothing distorts."],
    ["Pixel sizes included", "Inches multiplied by DPI, plus an effective-DPI check on the file you already have."],
  ],
  faqs: [
    [
      "What is the maximum print area on a t-shirt?",
      "On a standard adult platen it is 14 x 16 inches, with oversize platens reaching 16 x 20. On smaller garments the shirt itself is the limit: a Youth S with 16 inches of flat chest width leaves only about 14 inches of printable width once you keep an inch clear of each side seam.",
    ],
    [
      "How far below the collar should a front print start?",
      "Around 3 inches below the collar seam for adult sizes and about 2 inches for youth is the common decorator convention. Going lower gives a more modern, dropped look; going higher risks the design disappearing under a collar or jacket.",
    ],
    [
      "What resolution should t-shirt artwork be?",
      "Export at 300 DPI at the final printed size. A design printed 12.8 inches wide therefore needs 3,840 pixels of width. Below roughly 150 DPI the print visibly softens, so treat that as the floor rather than the target.",
    ],
    [
      "Should I use one artwork file for every shirt size?",
      "You can, but the smallest size sets the ceiling. Many sellers export two or three files — a full-size version for adult M and above and a scaled version for youth and small sizes — so large shirts do not end up with a print that looks lost on the chest.",
    ],
  ],
};

export default seo;
