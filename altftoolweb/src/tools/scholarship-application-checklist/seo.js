const seo = {
  intro:
    "This checklist tests annual family income against the ceiling written into each scholarship scheme's guidelines, then lists the documents that particular scheme asks for on the National Scholarships Portal or a state portal. Ceilings differ sharply — ₹2.5 lakh for the SC and OBC post-matric schemes and PM-YASASVI, ₹3.5 lakh for the National Means-cum-Merit Scholarship, ₹4.5 lakh for the Central Sector Scheme, ₹8 lakh for AICTE Pragati and Saksham — so a student rejected under one scheme is often comfortably inside another.",
  useCases: [
    "Finding out that a family earning ₹3 lakh a year is over the ceiling for the SC post-matric scholarship but well inside the ₹4.5 lakh limit for the Central Sector Scheme.",
    "Checking the bank account before submitting, since DBT payments look up the Aadhaar-to-account mapping at NPCI rather than the seeding recorded at the branch.",
    "Assembling a renewal file, which needs the previous year's result showing promotion in addition to everything a fresh application needs.",
  ],
  benefits: [
    ["Income test before paperwork", "The ceiling is checked first, because no document overcomes an income that is over the limit."],
    ["Scheme-specific documents", "Percentile proof for the Central Sector Scheme, hosteller status for post-matric, government-school proof for NMMSS."],
    ["DBT failure explained", "Flags the account mapping problem that stops sanctioned scholarships from ever arriving."],
  ],
  faqs: [
    [
      "What is the family income limit for a post-matric scholarship?",
      "₹2,50,000 a year for the SC and OBC post-matric schemes and for PM-YASASVI. The National Means-cum-Merit Scholarship allows up to ₹3,50,000, the Central Sector Scheme up to ₹4,50,000, and AICTE Pragati and Saksham up to ₹8,00,000. Income means the combined income of both parents from all sources, certified by a revenue authority such as a Tehsildar.",
    ],
    [
      "Can I apply for two scholarships at the same time?",
      "No. A student may hold only one scholarship at a time even where they qualify for several, and the National Scholarships Portal checks for duplicates. Drawing two turns into a recovery proceeding against the student, so surrender one before applying for the other.",
    ],
    [
      "Why has my sanctioned scholarship not reached my bank account?",
      "Almost always because the account is not DBT-enabled. Direct Benefit Transfer looks up the Aadhaar-to-account mapping held at NPCI, which is a separate step from the bank recording your Aadhaar in its own records. Ask the branch to seed the account for DBT, and make sure the account is in the student's name rather than a parent's.",
    ],
    [
      "Is my application complete once I submit it on the portal?",
      "No. It then goes to the Institute Nodal Officer for verification and afterwards to the state or ministry level, each with its own later last date. An application left unverified at the institute lapses even though the student did everything on time, so follow it up with the institute's scholarship desk after submitting.",
    ],
  ],
};

export default seo;
