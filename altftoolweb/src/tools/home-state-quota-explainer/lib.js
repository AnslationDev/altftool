/**
 * Home State (HS) vs Other State (OS) / All India quota rules across the big
 * Indian counselling systems.
 *
 * Sources for the encoded rules:
 *  - JoSAA/CSAB business rules: NITs split seats 50% Home State : 50% Other
 *    State. "Home State" for NIT admission is the state where the candidate
 *    PASSED CLASS 12 (the eligibility state), not domicile as such. IITs have
 *    no home-state quota — a single All India merit list. IIITs and most
 *    GFTIs also admit on All India seats (a few GFTIs keep HS seats).
 *  - NEET UG (MCC + state authorities): 15% of government-college MBBS/BDS
 *    seats go to the All India Quota open to everyone; the remaining 85% are
 *    the State Quota, filled by state counselling and requiring that state's
 *    domicile/eligibility.
 *  - State engineering CETs (MHT-CET, KCET, WBJEE, etc.): home-state
 *    candidature (domicile / study in state) gets the state seats; many
 *    states also keep a small Other-State or All-India share.
 */

/** Seat-split constants, per the rules cited above. */
export const NIT_HOME_STATE_SHARE_PERCENT = 50; // JoSAA business rules: 50% HS at NITs
export const NIT_OTHER_STATE_SHARE_PERCENT = 50; // remaining 50% OS
export const NEET_ALL_INDIA_QUOTA_PERCENT = 15; // 15% AIQ in state govt medical colleges
export const NEET_STATE_QUOTA_PERCENT = 85; // 85% state quota

export const SYSTEMS = [
  {
    id: "josaa-nit",
    label: "JoSAA / CSAB — NITs",
    basis: "class12State",
    basisLabel: "state where you passed Class 12",
    homeShare: NIT_HOME_STATE_SHARE_PERCENT,
    otherShare: NIT_OTHER_STATE_SHARE_PERCENT,
    otherLabel: "Other State (OS) quota",
    note: "NIT seats are split 50:50 between Home State and Other State pools. Your HS quota applies only at the NIT(s) mapped to the state where you passed Class 12 — everywhere else you compete in the OS pool.",
  },
  {
    id: "josaa-iit",
    label: "JoSAA — IITs",
    basis: "none",
    basisLabel: "not applicable",
    homeShare: 0,
    otherShare: 100,
    otherLabel: "All India merit",
    note: "IITs have no home-state quota at all. Every seat is filled from the single All India JEE Advanced rank list, so your state never matters.",
  },
  {
    id: "neet-ug",
    label: "NEET UG — MBBS/BDS (government colleges)",
    basis: "domicileState",
    basisLabel: "your domicile state",
    homeShare: NEET_STATE_QUOTA_PERCENT,
    otherShare: NEET_ALL_INDIA_QUOTA_PERCENT,
    otherLabel: "All India Quota (AIQ)",
    note: "15% of government-college seats form the All India Quota, open to candidates from every state via MCC counselling. The remaining 85% are State Quota seats filled by the state's own counselling and normally need that state's domicile.",
  },
  {
    id: "state-cet",
    label: "State engineering CET (MHT-CET, KCET, WBJEE ...)",
    basis: "domicileState",
    basisLabel: "your domicile / study state",
    homeShare: 85,
    otherShare: 15,
    otherLabel: "Other State / institute-level share",
    note: "State CET seats are overwhelmingly reserved for home-state candidature (domicile or schooling in the state). Many states keep a minority share — often around 15% in private colleges or an institute-level round — open to outside candidates. Exact shares vary by state.",
  },
];

/**
 * Explain which quota a candidate competes under.
 *
 * @param {object} input
 * @param {string} input.systemId       One of SYSTEMS ids.
 * @param {string} input.candidateState State that defines the candidate for this
 *                                      system (Class 12 state for NITs, domicile
 *                                      for NEET/state CETs). Empty allowed for IITs.
 * @param {string} input.instituteState State where the target institute sits.
 * @returns {object} result, or { error }.
 */
export function explainQuota({ systemId, candidateState, instituteState }) {
  const system = SYSTEMS.find((s) => s.id === systemId);
  if (!system) return { error: "Choose a counselling system." };

  const inst = typeof instituteState === "string" ? instituteState.trim() : "";
  if (!inst) return { error: "Choose the state where the institute is located." };

  if (system.basis === "none") {
    return {
      systemLabel: system.label,
      basisLabel: system.basisLabel,
      quota: "All India merit",
      isHomeState: false,
      homeShare: system.homeShare,
      otherShare: system.otherShare,
      note: system.note,
      detail:
        "You are ranked with every other candidate on the common All India list; the institute's state gives no advantage or disadvantage.",
    };
  }

  const cand = typeof candidateState === "string" ? candidateState.trim() : "";
  if (!cand) {
    return { error: `Choose the state that applies to you (${system.basisLabel}).` };
  }

  const isHomeState = cand.toLowerCase() === inst.toLowerCase();

  return {
    systemLabel: system.label,
    basisLabel: system.basisLabel,
    isHomeState,
    quota: isHomeState
      ? system.id === "neet-ug"
        ? "State Quota (85%) + All India Quota (15%)"
        : "Home State quota"
      : system.otherLabel,
    homeShare: system.homeShare,
    otherShare: system.otherShare,
    note: system.note,
    detail: isHomeState
      ? `Because your ${system.basisLabel} matches the institute's state, you compete in the home pool (${system.homeShare}% of seats)${system.id === "neet-ug" ? " and also in the 15% All India Quota" : ` and can also contest the ${system.otherLabel} where rules allow`}.`
      : `Because your ${system.basisLabel} differs from the institute's state, you compete only in the ${system.otherLabel} (${system.otherShare}% of seats).`,
  };
}
