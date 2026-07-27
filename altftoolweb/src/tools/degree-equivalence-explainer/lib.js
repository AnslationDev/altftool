/**
 * Indian qualification → foreign-system equivalence lookup.
 *
 * Pure data + lookup, no arithmetic. Sources reflected in the notes:
 * - UK: ECCTIS (formerly UK NARIC) comparability practice and typical
 *   university admission statements for Indian qualifications.
 * - USA: NACES-member evaluation practice (WES, ECE); WES's 2023 policy of
 *   evaluating accredited 3-year Indian bachelor's degrees as US
 *   bachelor-equivalent; ECFMG/USMLE for medicine.
 * - Canada: Educational Credential Assessment (ECA) practice for study and
 *   for IRCC immigration; MCC for medicine.
 * - Australia: AQF comparison by universities; Washington Accord (India is a
 *   signatory) for accredited engineering degrees; AMC for medicine.
 * - Germany: Anabin database / uni-assist rules, including the Studienkolleg
 *   requirement after Class 12 alone.
 */

export const DESTINATIONS = [
  { id: "us", label: "United States" },
  { id: "uk", label: "United Kingdom" },
  { id: "canada", label: "Canada" },
  { id: "australia", label: "Australia" },
  { id: "germany", label: "Germany" },
];

export const QUALIFICATIONS = [
  {
    id: "class-10",
    label: "Class 10 (Secondary School Certificate)",
    equivalence: {
      us: {
        verdict: "Completion of Grade 10 (junior high)",
        note: "Not a school-leaving credential for US purposes; university admission requires Class 12.",
      },
      uk: {
        verdict: "Comparable to GCSE level",
        note: "ECCTIS treats Indian Class 10 board certificates as comparable to UK GCSEs; A-level-stage study still follows.",
      },
      canada: {
        verdict: "Grade 10 standing",
        note: "Counted as partial secondary schooling; a Canadian study path continues into Grade 11-12 or Class 12 in India.",
      },
      australia: {
        verdict: "Year 10 equivalent",
        note: "Recognised as completion of junior secondary; senior secondary (Year 11-12) is still required for university entry.",
      },
      germany: {
        verdict: "Mittlere Reife-level schooling",
        note: "Roughly comparable to the German intermediate school certificate; it confers no university entrance qualification.",
      },
    },
  },
  {
    id: "class-12",
    label: "Class 12 (Senior Secondary — CBSE / CISCE / State board)",
    equivalence: {
      us: {
        verdict: "US high school diploma equivalent",
        note: "Accepted for direct entry to US bachelor's programmes; competitive universities look at board percentages and standardised tests.",
      },
      uk: {
        verdict: "Comparable to GCE A levels (CBSE/CISCE with strong grades)",
        note: "ECCTIS considers CBSE and CISCE Class 12 with good marks comparable to A levels; many universities admit directly, while some state-board results are routed via a foundation year.",
      },
      canada: {
        verdict: "High school diploma equivalent",
        note: "Direct entry to Canadian bachelor's programmes; universities set their own subject and percentage cut-offs.",
      },
      australia: {
        verdict: "Senior Secondary Certificate equivalent",
        note: "Accepted for direct undergraduate entry; universities convert board percentages to ATAR-like selection ranks.",
      },
      germany: {
        verdict: "Not a direct HZB (university entrance qualification) by itself",
        note: "Under Anabin rules, Class 12 alone usually requires a one-year Studienkolleg plus assessment test (Feststellungsprüfung), or one year of university study in India, or a qualifying JEE-Advanced score, before degree admission.",
      },
    },
  },
  {
    id: "bachelor-3yr",
    label: "3-year Bachelor's (BA / BSc / BCom)",
    equivalence: {
      us: {
        verdict: "Increasingly evaluated as US bachelor-equivalent",
        note: "Historically judged short of the 4-year US bachelor's, but since 2023 WES evaluates accredited (NAAC-graded) 3-year Indian degrees as bachelor-equivalent, and many US graduate schools now accept them. Some programmes still ask for a master's or a 4th year.",
      },
      uk: {
        verdict: "Comparable to a UK bachelor's degree",
        note: "ECCTIS treats a good 3-year Indian bachelor's as comparable to a UK bachelor's; 60%+ typically meets 2:1-equivalent entry to master's programmes.",
      },
      canada: {
        verdict: "Bachelor's degree (3-year) on ECA",
        note: "ECA agencies recognise the degree; some competitive master's programmes prefer a 4-year credential (or 3-year degree plus PG diploma).",
      },
      australia: {
        verdict: "Comparable to an AQF bachelor's degree",
        note: "Generally accepted for postgraduate entry; individual universities may ask for strong results or an honours-equivalent year for research degrees.",
      },
      germany: {
        verdict: "Recognised if the university is Anabin H+",
        note: "A 3-year degree from an H+ institution qualifies for master's admission via uni-assist; subject fit and grade conversion (Bavarian formula) drive individual decisions.",
      },
    },
  },
  {
    id: "bachelor-4yr-eng",
    label: "4-year BE / BTech (Engineering)",
    equivalence: {
      us: {
        verdict: "US bachelor's degree equivalent",
        note: "The 4-year professional degree maps cleanly to a US bachelor's; standard credential evaluations confirm it for graduate admission and employment.",
      },
      uk: {
        verdict: "Comparable to a UK bachelor's (honours) degree",
        note: "Accepted directly for master's entry; 60%+ (55% from premier institutes) generally meets 2:1-equivalent requirements.",
      },
      canada: {
        verdict: "Bachelor's degree equivalent",
        note: "Recognised by ECA agencies; engineering licensure is separate and runs through the provincial regulator with Engineers Canada guidelines.",
      },
      australia: {
        verdict: "AQF bachelor (honours-level) equivalent",
        note: "India signed the Washington Accord, so NBA-accredited engineering degrees are recognised by Engineers Australia for skilled-migration skills assessment.",
      },
      germany: {
        verdict: "Bachelor equivalent (H+ institutions)",
        note: "Recognised for master's admission; TU9 and other technical universities assess subject-specific credit fit through uni-assist or their own portals.",
      },
    },
  },
  {
    id: "master-2yr",
    label: "2-year Master's (MA / MSc / MCom / MTech)",
    equivalence: {
      us: {
        verdict: "US master's degree equivalent",
        note: "Recognised as a master's; for PhD admission it can also compensate where a 3-year bachelor's was previously an obstacle.",
      },
      uk: {
        verdict: "Comparable to a UK master's degree",
        note: "Accepted for PhD entry and for employment purposes; UK taught master's are often 1 year, so the 2-year Indian degree is not undervalued.",
      },
      canada: {
        verdict: "Master's degree equivalent",
        note: "ECA agencies recognise it as a master's; it earns maximum education points tiers in Express Entry when combined with the bachelor's.",
      },
      australia: {
        verdict: "AQF master's degree equivalent",
        note: "Accepted for PhD entry and skilled-migration education claims.",
      },
      germany: {
        verdict: "Master equivalent — doctoral admission possible",
        note: "A recognised Indian master's from an H+ university generally qualifies for German doctoral study; individual professors/faculties confirm subject fit.",
      },
    },
  },
  {
    id: "mbbs",
    label: "MBBS (Medicine)",
    equivalence: {
      us: {
        verdict: "Medical degree recognised only via ECFMG certification",
        note: "To practise, graduates must be ECFMG-certified and pass USMLE Steps, then match into US residency — the degree alone confers no practice rights.",
      },
      uk: {
        verdict: "Recognised for GMC registration after PLAB/UKMLA",
        note: "Indian MBBS holders register with the GMC after passing the PLAB (transitioning to the UKMLA) and meeting English requirements.",
      },
      canada: {
        verdict: "Eligible for MCC exams, then residency",
        note: "Graduates take the MCCQE and compete for residency through CaRMS; provincial licensure follows postgraduate training.",
      },
      australia: {
        verdict: "AMC assessment pathway",
        note: "Practice requires the Australian Medical Council pathway (AMC exams or competent-authority routes) plus supervised practice.",
      },
      germany: {
        verdict: "Approbation required",
        note: "A German medical licence (Approbation) requires credential review, a knowledge test (Kenntnisprüfung) where equivalence is partial, and C1-level German (Fachsprachprüfung).",
      },
    },
  },
  {
    id: "phd",
    label: "PhD (Doctorate)",
    equivalence: {
      us: {
        verdict: "Doctoral degree equivalent",
        note: "Recognised as a research doctorate for academic employment and postdoctoral positions.",
      },
      uk: {
        verdict: "Comparable to a UK PhD",
        note: "Recognised for academic posts and by ECCTIS as doctoral level.",
      },
      canada: {
        verdict: "Doctoral degree equivalent",
        note: "Earns the highest education tier in immigration points systems and is recognised for academic hiring.",
      },
      australia: {
        verdict: "AQF Level 10 (doctoral) equivalent",
        note: "Recognised for academic employment and skilled-migration education claims.",
      },
      germany: {
        verdict: "Doctorate — title use is regulated",
        note: "Recognised as a doctorate; carrying the 'Dr.' title in Germany may require the degree to come from a recognised institution, checked against Anabin.",
      },
    },
  },
];

/**
 * Look up the equivalence entry for a qualification/destination pair.
 * Pure lookup — returns { error } for unknown ids.
 */
export function getEquivalence({ qualificationId, destinationId }) {
  const qualification = QUALIFICATIONS.find((q) => q.id === qualificationId);
  if (!qualification) return { error: "Choose an Indian qualification." };
  const destination = DESTINATIONS.find((d) => d.id === destinationId);
  if (!destination) return { error: "Choose a destination country." };

  const entry = qualification.equivalence[destinationId];
  if (!entry) return { error: "No equivalence information for that combination." };

  return {
    qualification: qualification.label,
    destination: destination.label,
    verdict: entry.verdict,
    note: entry.note,
    allDestinations: DESTINATIONS.map((d) => ({
      id: d.id,
      label: d.label,
      verdict: qualification.equivalence[d.id]?.verdict ?? "—",
    })),
  };
}
