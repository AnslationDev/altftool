/**
 * Exam → job mapping data and pure search/filter logic.
 *
 * Pay levels and entry basic pay follow the 7th Central Pay Commission pay
 * matrix (effective 1 Jan 2016, still the operative matrix): Level 1 —
 * Rs 18,000; L2 — 19,900; L3 — 21,700; L4 — 25,500; L5 — 29,200; L6 —
 * 35,400; L7 — 44,900; L8 — 47,600; L10 — 56,100. Gross salary adds DA,
 * HRA and other allowances on top of the basic pay shown. Bank and RBI
 * posts follow their own scales (bipartite settlements / RBI scale), so
 * their rows carry no CPC level. Recruitment details change by
 * notification year — always verify against the latest official notice.
 */

/** 7th CPC pay matrix — entry (cell 1) basic pay per level, in rupees/month. */
export const PAY_MATRIX_ENTRY_BASIC = {
  1: 18000,
  2: 19900,
  3: 21700,
  4: 25500,
  5: 29200,
  6: 35400,
  7: 44900,
  8: 47600,
  10: 56100,
};

export const EXAMS = [
  {
    id: "upsc-cse",
    exam: "UPSC Civil Services Examination",
    conductedBy: "Union Public Service Commission",
    sector: "Central government — Group A",
    eligibility: "Any graduate; age 21-32 (general category), with relaxations by category",
    posts: [
      {
        title: "Indian Administrative Service (IAS)",
        payLevel: 10,
        profile: "District administration, policy implementation, secretariat postings",
      },
      {
        title: "Indian Police Service (IPS)",
        payLevel: 10,
        profile: "District police leadership, law and order, central police organisations",
      },
      {
        title: "Indian Foreign Service (IFS)",
        payLevel: 10,
        profile: "Diplomacy, embassies and missions abroad, MEA headquarters",
      },
      {
        title: "Indian Revenue Service (IRS — IT / C&IC)",
        payLevel: 10,
        profile: "Direct and indirect tax administration, investigation, assessments",
      },
    ],
  },
  {
    id: "ssc-cgl",
    exam: "SSC Combined Graduate Level (CGL)",
    conductedBy: "Staff Selection Commission",
    sector: "Central government — Group B/C",
    eligibility: "Any graduate; age generally 18-32 depending on post",
    posts: [
      {
        title: "Assistant Section Officer (CSS)",
        payLevel: 7,
        profile: "Ministry desk work — files, drafting, parliamentary questions",
      },
      {
        title: "Inspector, Income Tax (CBDT)",
        payLevel: 7,
        profile: "Assessment support, surveys, TDS verification, field enquiries",
      },
      {
        title: "Inspector, Central GST & Excise (CBIC)",
        payLevel: 7,
        profile: "GST range work, anti-evasion, audit and preventive duties",
      },
      {
        title: "Sub-Inspector, CBI",
        payLevel: 7,
        profile: "Investigation of central cases, trap and disproportionate-assets work",
      },
      {
        title: "Auditor (C&AG / CGDA)",
        payLevel: 5,
        profile: "Audit of government accounts and defence expenditure",
      },
      {
        title: "Tax Assistant (CBDT / CBIC)",
        payLevel: 4,
        profile: "Data entry, assessment records and clerical tax work",
      },
    ],
  },
  {
    id: "ssc-chsl",
    exam: "SSC Combined Higher Secondary Level (CHSL)",
    conductedBy: "Staff Selection Commission",
    sector: "Central government — Group C",
    eligibility: "Class 12 pass; age generally 18-27",
    posts: [
      {
        title: "Lower Division Clerk / Junior Secretariat Assistant",
        payLevel: 2,
        profile: "Registers, diarising, file movement in central offices",
      },
      {
        title: "Data Entry Operator",
        payLevel: 4,
        profile: "Typing-speed based data work in central departments",
      },
      {
        title: "Postal Assistant / Sorting Assistant",
        payLevel: 4,
        profile: "Counter and back-office work in India Post",
      },
    ],
  },
  {
    id: "rrb-ntpc",
    exam: "RRB NTPC",
    conductedBy: "Railway Recruitment Boards",
    sector: "Indian Railways",
    eligibility: "Graduate (higher posts) or class 12 (lower posts); age generally 18-33",
    posts: [
      {
        title: "Station Master",
        payLevel: 6,
        profile: "Train operations, station safety, panel working in shifts",
      },
      {
        title: "Goods Train Manager (Goods Guard)",
        payLevel: 5,
        profile: "Freight train working, brake-van duties, shift-based running work",
      },
      {
        title: "Senior Commercial cum Ticket Clerk",
        payLevel: 5,
        profile: "Booking, reservation and commercial counters",
      },
      {
        title: "Commercial cum Ticket Clerk",
        payLevel: 3,
        profile: "Ticketing counters and commercial duties",
      },
    ],
  },
  {
    id: "rrb-group-d",
    exam: "RRB Group D (Level 1)",
    conductedBy: "Railway Recruitment Boards",
    sector: "Indian Railways",
    eligibility: "Class 10 pass / ITI; age generally 18-33",
    posts: [
      {
        title: "Track Maintainer / Assistant (various departments)",
        payLevel: 1,
        profile: "Track, workshop, depot and safety-related ground duties",
      },
    ],
  },
  {
    id: "ibps-po",
    exam: "IBPS PO (CRP-PO/MT)",
    conductedBy: "Institute of Banking Personnel Selection",
    sector: "Public sector banks",
    eligibility: "Any graduate; age generally 20-30",
    posts: [
      {
        title: "Probationary Officer / Management Trainee",
        payLevel: null,
        profile:
          "Branch operations, credit appraisal, customer service; pay per bank officers' scale (bipartite settlement), not the CPC matrix",
      },
    ],
  },
  {
    id: "ibps-clerk",
    exam: "IBPS Clerk (CRP-Clerical)",
    conductedBy: "Institute of Banking Personnel Selection",
    sector: "Public sector banks",
    eligibility: "Any graduate; age generally 20-28",
    posts: [
      {
        title: "Customer Service Associate (Clerk)",
        payLevel: null,
        profile:
          "Counter work, cash handling, account servicing; clerical scale per bipartite settlement",
      },
    ],
  },
  {
    id: "rbi-grade-b",
    exam: "RBI Grade B",
    conductedBy: "Reserve Bank of India",
    sector: "Central bank / regulator",
    eligibility: "Graduate with minimum marks; age generally 21-30",
    posts: [
      {
        title: "Manager (Grade B General)",
        payLevel: null,
        profile:
          "Regulation, supervision, currency and banking departments; RBI's own pay scale, not the CPC matrix",
      },
    ],
  },
  {
    id: "upsc-capf",
    exam: "UPSC CAPF (AC)",
    conductedBy: "Union Public Service Commission",
    sector: "Central armed police forces",
    eligibility: "Any graduate; age 20-25 (general category)",
    posts: [
      {
        title: "Assistant Commandant (BSF / CRPF / CISF / ITBP / SSB)",
        payLevel: 10,
        profile: "Company-level command in border guarding and internal security forces",
      },
    ],
  },
  {
    id: "upsc-nda",
    exam: "UPSC NDA & NA",
    conductedBy: "Union Public Service Commission",
    sector: "Armed forces",
    eligibility: "Class 12 pass; unmarried candidates roughly 16.5-19.5 years",
    posts: [
      {
        title: "Officer cadet — Army / Navy / Air Force",
        payLevel: 10,
        profile:
          "Commissioned as Lieutenant or equivalent after training; Level 10 of the defence pay matrix on commissioning",
      },
    ],
  },
];

/** Sorted unique sector names for the filter dropdown. */
export function listSectors(exams = EXAMS) {
  return [...new Set(exams.map((e) => e.sector))].sort((a, b) => a.localeCompare(b));
}

/**
 * Filter exams by free-text query (exam, conductor, sector, post titles,
 * profiles) and/or exact sector. Pure; returns a new array.
 */
export function searchExams({ query = "", sector = "" } = {}, exams = EXAMS) {
  const q = String(query).trim().toLowerCase();
  return exams.filter((exam) => {
    if (sector && exam.sector !== sector) return false;
    if (q === "") return true;
    const haystack = [
      exam.exam,
      exam.conductedBy,
      exam.sector,
      exam.eligibility,
      ...exam.posts.map((p) => `${p.title} ${p.profile}`),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

/** Entry basic pay for a post, from the 7th CPC matrix; null for non-CPC scales. */
export function entryBasicPay(payLevel) {
  if (payLevel == null) return null;
  return PAY_MATRIX_ENTRY_BASIC[payLevel] ?? null;
}

/** Totals for a filtered result set. */
export function countPosts(exams) {
  return exams.reduce((sum, exam) => sum + exam.posts.length, 0);
}
