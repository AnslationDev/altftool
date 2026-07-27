const seo = {
  intro:
    "This comparer puts the photo and signature upload rules of major Indian exam portals — UPSC OTR, SSC, IBPS, NTA NEET and JEE Main — side by side and computes the interval intersection: the single size window and format that satisfies every selected portal at once. For example, a photograph of 20-50 KB in JPG passes UPSC (20-300 KB), SSC (20-50 KB), IBPS (20-50 KB) and NTA (10-200 KB) simultaneously. It is built for aspirants filling several forms a season who want one photo file and one signature file that work everywhere.",
  useCases: [
    "An aspirant applying to SSC CGL, IBPS PO and UPSC in the same season prepares one photo that clears all three portals",
    "A candidate checks whether their existing 45 KB signature scan will pass each portal before starting any form",
    "A cyber-cafe operator preparing documents for many applicants standardises on sizes that never bounce",
  ],
  benefits: [
    ["One file, many forms", "Interval intersection finds the exact KB window accepted by every selected portal."],
    ["Instant file check", "Type your file's size and see a pass/fail verdict against each portal's rule."],
    ["Conflicts surfaced", "Non-overlapping limits and fixed pixel-dimension demands are flagged instead of silently failing."],
  ],
  faqs: [
    [
      "What photo size do government exam portals accept?",
      "The common windows are: UPSC OTR 20-300 KB, SSC 20-50 KB, IBPS 20-50 KB (200x230 px), and NTA exams like NEET and JEE Main 10-200 KB, all in JPG/JPEG. A 20-50 KB JPG therefore sits inside all of these windows at once — though portals revise limits between cycles, so confirm the live notification.",
    ],
    [
      "What signature file size works for SSC, IBPS and UPSC together?",
      "The intersection is extremely narrow: SSC and IBPS cap signatures at 10-20 KB while UPSC requires at least 20 KB, so only a file of almost exactly 20 KB satisfies all three. In practice most applicants keep two signature files — one around 15 KB for SSC/IBPS and one 20 KB or larger for UPSC.",
    ],
    [
      "Why does my upload fail even though the file size is right?",
      "Portals validate more than size: the extension spelling (jpg vs jpeg), fixed pixel dimensions (IBPS wants 200x230 px photos and 140x60 px signatures), aspect ratio, and sometimes recency text printed on the photo. Check the portal's full instruction block — the size rule is only the first gate.",
    ],
    [
      "Are these portal specifications always up to date?",
      "The tool encodes the rules as published in each portal's application instructions up to 2025, and portals do revise them between recruitment cycles. Treat the comparison as planning information and verify against the current year's notification before uploading.",
    ],
  ],
};

export default seo;
