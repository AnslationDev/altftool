// Learning-platform catalogue for /academy.
//
// READ THIS BEFORE EDITING A `rating`.
//
// Every record here makes claims about a company that is not us, on a page
// that is indexed. Until 2026-08-08 each one carried a bare `rating: 4.6`
// with no source, no date and no statement of what the number measured. Those
// numbers were not researched — nobody could say where they came from — so
// they are gone. What replaced them is a single, checkable figure.
//
// A `rating` may only exist if ALL of this is true:
//
//   1. The figure was read off a FIRST-PARTY page: the platform's own site, or
//      the platform's own listing in an app store. Aggregators, review farms,
//      "top 10 courses" blogs and AI summaries are not sources. If the only
//      place a number appears is somebody else's page, there is no rating.
//   2. `measures` says, in plain words, what the number is a rating OF. None
//      of these is a rating of a platform, a course, or a syllabus. Every one
//      is a rating of that company's mobile app, left by people who installed
//      it. That is a narrower claim than "Udemy is 4.6", and it is the only
//      claim the source actually supports.
//   3. `url` points at the exact page the figure was read on, and `checkedOn`
//      is the day it was read. A record that goes stale therefore degrades
//      into a dated fact ("this is what the listing said on 8 Aug 2026")
//      rather than into a wrong fact.
//
// `value` and `count` are transcribed, never derived. `value` is the star
// figure Google Play prints on the listing ("Rated 4.5 stars out of five
// stars"); `count` is the ratingCount in that same listing's own structured
// data. Do not average two storefronts, do not convert, do not round a 4.4 up
// because it looks better next to a 4.5.
//
// If a platform cannot be sourced, `rating` is null and a comment above the
// record says why. Do NOT replace it with "highly rated" or "4.5+" — that is
// the same unsourced claim with deniability. One of the seventeen platforms
// below is in that state today.
//
// All sixteen sourced figures were read on the same day from the Google Play
// India storefront (gl=IN, hl=en). Play ratings are region-scoped, so a US
// visitor's listing can show a different number; that is why the storefront is
// named in `measures` rather than left implicit.

/** The day every listing below was opened. */
export const RATINGS_CHECKED_ON = "2026-08-08";

const PLAY_IN = "Google Play (India storefront)";

/** Play listing URL for a package id — the exact page each figure was read on. */
function playUrl(pkg) {
  return `https://play.google.com/store/apps/details?id=${pkg}`;
}

/**
 * One sourced rating. `note` carries anything about the listing that a reader
 * would want to know before trusting the number — a renamed publisher, a
 * companion app that is not the platform itself.
 */
function playRating({ value, count, app, pkg, note = "" }) {
  return {
    value,
    scale: 5,
    count,
    sourceLabel: PLAY_IN,
    measures: `${PLAY_IN} user rating for the "${app}" Android app`,
    url: playUrl(pkg),
    checkedOn: RATINGS_CHECKED_ON,
    confidence: "primary",
    note,
  };
}

export const academies = [
  {
    name: "Udemy",
    category: "Skills & Career Growth",
    badge: "ONLINE SKILL LEARNING",
    rating: playRating({
      value: 4.5,
      count: 510705,
      app: "Udemy - Online Courses",
      pkg: "com.udemy.android",
    }),
    price: "₹499",
    image: "/academy/udemy.png",
    url: "https://www.udemy.com",
    specs: ["Certificates", "Self-paced", "Project-based"],
    description:
      "Best for practical skill-based learning. Learn real-world skills with hands-on projects and lifetime access.",
  },

  {
    name: "Coursera",
    category: "Skills & Career Growth",
    badge: "UNIVERSITY BACKED",
    rating: playRating({
      value: 4.5,
      count: 307729,
      app: "Coursera: Grow your career",
      pkg: "org.coursera.android",
    }),
    price: "₹1999",
    image: "/academy/coursera.png",
    url: "https://www.coursera.org",
    specs: ["Certificates", "Self-paced", "University courses"],
    description:
      "University-backed learning platform offering globally recognized certifications and degrees.",
  },

  {
    name: "Unacademy",
    category: "Govt & Competitive Exams",
    badge: "EXAM PREPARATION",
    rating: playRating({
      value: 4.1,
      count: 1253330,
      app: "Unacademy: Learn & Crack Exams",
      pkg: "com.unacademyapp",
    }),
    price: "₹2,499",
    image: "/academy/unacademy.png",
    url: "https://unacademy.com",
    specs: ["Live classes", "Mock tests", "Structured courses"],
    description:
      "Best platform for UPSC, JEE, NEET, SSC and other competitive exam preparation.",
  },

  {
    name: "Physics Wallah",
    category: "Govt & Competitive Exams",
    badge: "AFFORDABLE EXAM PREP",
    rating: playRating({
      value: 4.7,
      count: 1370857,
      app: "PW - India's Learning Platform",
      pkg: "xyz.penpencil.physicswala",
      note: "Listed under the publisher name 'Physicswallah'. PW ships several separate apps (PW MedEd, CuriousJr, PW Books); this figure is the main learning app only.",
    }),
    price: "3,500",
    image: "/academy/pw.png",
    url: "https://www.pw.live",
    specs: ["Live + Recorded", "Doubt support", "Test series"],
    description:
      "Best for NEET and JEE preparation with affordable quality education.",
  },

  {
    name: "Byju's",
    category: "School & Foundation",
    badge: "K-12 LEARNING",
    rating: playRating({
      value: 4.1,
      count: 1811552,
      app: "BYJU'S – The Learning App",
      pkg: "com.byjus.thelearningapp",
      note: "The listing's own structured data names the publisher as 'Toppr' (the company BYJU'S acquired) with byjus.com as the publisher URL, so the developer name on the store no longer matches the brand on this card.",
    }),
    price: "3,000",
    image: "/academy/byjus.png",
    url: "https://byjus.com",
    specs: ["Interactive videos", "Adaptive tests", "Personalized learning"],
    description:
      "School learning platform focused on concept clarity with visual learning.",
  },

  {
    name: "Khan Academy",
    category: "School & Foundation",
    badge: "FREE LEARNING",
    rating: playRating({
      value: 4.4,
      count: 172789,
      app: "Khan Academy",
      pkg: "org.khanacademy.android",
    }),
    price: "Free",
    image: "/academy/khan.png",
    url: "https://www.khanacademy.org",
    specs: ["Free", "Self-paced", "Practice exercises"],
    description:
      "Free platform for strong academic fundamentals in math, science, and more.",
  },

  {
    name: "edX",
    category: "Higher Education",
    badge: "HARVARD & MIT",
    rating: playRating({
      value: 4.6,
      count: 112397,
      app: "edX online learning",
      pkg: "org.edx.mobile",
    }),
    price: "₹50,000 ",
    image: "/academy/edx.png",
    url: "https://www.edx.org",
    specs: ["Certificates", "University courses", "Degree programs"],
    description:
      "Access university-level courses from top global institutions.",
  },

  {
    name: "upGrad",
    category: "Skills & Career Growth",
    badge: "ONLINE DEGREES",
    rating: playRating({
      value: 4.1,
      count: 31704,
      app: "upGrad",
      pkg: "com.upgrad.student",
    }),
    price: "₹10,000",
    image: "/academy/upgrad.png",
    url: "https://www.upgrad.com",
    specs: ["Degrees", "Mentorship", "Career support"],
    description:
      "Online higher education platform for career transformation.",
  },

  {
    name: "Skillshare",
    category: "Skills & Career Growth",
    badge: "CREATIVE SKILLS",
    rating: playRating({
      value: 4.2,
      count: 58599,
      app: "Skillshare: Online Classes App",
      pkg: "com.skillshare.Skillshare",
    }),
    price: "₹1,000",
    image: "/academy/skill.png",
    url: "https://www.skillshare.com",
    specs: ["Creative courses", "Self-paced", "Projects"],
    description:
      "Learn creative skills like design, animation, writing, and freelancing.",
  },

  {
    name: "LinkedIn Learning",
    category: "Skills & Career Growth",
    badge: "CAREER GROWTH",
    rating: playRating({
      value: 4.7,
      count: 182306,
      app: "LinkedIn Learning",
      pkg: "com.linkedin.android.learning",
    }),
    price: "₹1,500",
    image: "/academy/inlearning.png",
    url: "https://www.linkedin.com/learning",
    specs: ["Certificates", "Professional courses", "Self-paced"],
    description:
      "Boost career skills in business, tech, and leadership.",
  },

  {
    name: "Pluralsight",
    category: "Tech & Coding",
    badge: "DEV PLATFORM",
    rating: playRating({
      value: 4.4,
      count: 22653,
      app: "Pluralsight",
      pkg: "com.pluralsight",
      note: "This is the Android listing only. Pluralsight's iOS app is a separate listing with its own, materially different score, so this figure must not be described as 'Pluralsight's app rating' without the platform qualifier.",
    }),
    price: "₹2,000",
    image: "/academy/plural.png",
    url: "https://www.pluralsight.com",
    specs: ["Skill paths", "Coding labs", "Cert prep"],
    description:
      "Advanced tech learning platform for developers and IT professionals.",
  },

  {
    name: "Codecademy",
    category: "Tech & Coding",
    badge: "INTERACTIVE CODING",
    rating: playRating({
      value: 4.5,
      count: 40024,
      app: "Codecademy Go",
      pkg: "com.ryzac.codecademygo",
      note: "Codecademy Go is the mobile companion app for practice and review, not the full browser learning platform this card links to. The listing's publisher is 'Skillsoft.', which owns Codecademy.",
    }),
    price: "₹200",
    image: "/academy/codeacademy.png",
    url: "https://www.codecademy.com",
    specs: ["Hands-on coding", "Projects", "Self-paced"],
    description:
      "Learn coding through interactive real-world exercises.",
  },

  {
    name: "Simplilearn",
    category: "Skills & Career Growth",
    badge: "CERTIFICATION HUB",
    rating: playRating({
      value: 4.5,
      count: 140452,
      app: "Simplilearn: Online Learning",
      pkg: "com.mobile.simplilearn",
    }),
    price: "₹30,000",
    image: "/academy/simpli.png",
    url: "https://www.simplilearn.com",
    specs: ["Certifications", "Bootcamps", "Live classes"],
    description:
      "Professional certification platform for career advancement.",
  },

  {
    name: "Great Learning",
    category: "Skills & Career Growth",
    badge: "AI & DATA",
    rating: playRating({
      value: 4.4,
      count: 38376,
      app: "Great Learning: Online Courses",
      pkg: "com.lms.greatlakes",
    }),
    price: "₹2000",
    image: "/academy/great.png",
    url: "https://www.mygreatlearning.com",
    specs: ["Mentorship", "Projects", "Certificates"],
    description:
      "Upskill in AI, data science, and business analytics.",
  },

  {
    // NO RATING, and this is a finding rather than an omission.
    //
    // apnacollege.in publishes no rating of itself anywhere on the page — no
    // score, no review count, no store badge, no app link. Google Play returns
    // no app published by Apna College; the closest search hit, "Apna College
    // By Bipin Sir", is an unrelated coaching business. The Apple App Store
    // (India) returns nothing under this name either. There is no first-party
    // number to publish, so the card renders without a rating.
    name: "Apna College",
    category: "Tech & Coding",
    badge: "DSA & PLACEMENTS",
    rating: null,
    price: "₹3,000",
    image: "/academy/apnacollege.svg",
    url: "https://www.apnacollege.in",
    specs: ["DSA", "Projects", "Placement prep"],
    description:
      "Learn DSA and coding for top tech company placements.",
  },

  {
    name: "Testbook",
    category: "Govt & Competitive Exams",
    badge: "EXAM PREP",
    rating: playRating({
      value: 4.3,
      count: 873865,
      app: "Testbook: Exam Preparation App",
      pkg: "com.testbook.tbapp",
    }),
    price: "₹1,000",
    image: "/academy/testbook.png",
    url: "https://testbook.com",
    specs: ["Mock tests", "Live classes", "Practice"],
    description:
      "Prepare for government exams with mock tests and live classes.",
  },

  {
    name: "Adda247",
    category: "Govt & Competitive Exams",
    badge: "BANKING & GOVT EXAMS",
    rating: playRating({
      value: 4.4,
      count: 915549,
      app: "Adda247 Govt Job Exam Prep",
      pkg: "com.adda247.app",
    }),
    price: "₹1,500",
    image: "/academy/adda247.png",
    url: "https://www.adda247.com",
    specs: ["Live classes", "Test series", "Study material"],
    description:
      "Top platform for banking and government exam preparation.",
  },
];

/**
 * The only way a rating reaches the page.
 *
 * A record qualifies only if it carries the whole provenance set: a numeric
 * value, the source it was read from, the page it was read on and the day it
 * was read. A bare number — the shape the Firestore catalogue still stores,
 * and the shape this file used to store — returns null and renders nothing.
 * That is deliberate: an unsourced rating of somebody else's business should
 * not be publishable just because it arrived from a CMS instead of a commit.
 */
export function getAcademyRating(academy) {
  const rating = academy?.rating;
  if (!rating || typeof rating !== "object") return null;

  const value = Number(rating.value);
  if (!Number.isFinite(value) || value <= 0) return null;
  if (!rating.url || !rating.checkedOn || !rating.measures) return null;

  return rating;
}
