/**
 * EPF Claim Rejection Reason Decoder — pure logic and reference data.
 *
 * Everything here is plain JavaScript: no React, no DOM, no clock reads.
 * Dates are always supplied by the caller as "YYYY-MM-DD" strings so that the
 * same inputs always produce the same output.
 *
 * Rule sources cited in this file, all read on the date in RULES_READ_ON:
 *   - Employees' Provident Funds Scheme, 1952 (Paras 68B, 68HH, 68J, 68K,
 *     68NN, 69, 32A)
 *   - Employees' Pension Scheme, 1995 (Paras 10, 12, 14 and Table D)
 *   - Employees' Provident Funds and Miscellaneous Provisions Act, 1952
 *     (Sections 7A, 7Q, 14B, 17)
 *   - Income-tax Act, 1961 (Section 192A)
 *   - Code on Social Security, 2020 (Section 142)
 *   - EPFO Joint Declaration Standard Operating Procedure, circular dated
 *     16 January 2025
 *   - G.S.R. 609(E) dated 22 August 2014 (EPS wage ceiling, w.e.f. 01-09-2014)
 *   - G.S.R. 573(E) dated 19 June 2018 (Para 68HH, unemployment advance)
 */

/** Date on which the rule text quoted in this file was read. */
export const RULES_READ_ON = "2026-07-28";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Format a rupee amount the Indian way, e.g. 15000 -> "₹15,000". */
export function formatInr(amount) {
  if (!Number.isFinite(amount)) return "—";
  return INR.format(amount);
}

/** EPFO's public grievance portal for claim disputes. */
export const GRIEVANCE_PORTAL = "EPFiGMS (epfigms.gov.in)";

/* ------------------------------------------------------------------ *
 * Named rule constants. Every threshold used in the maths below is
 * declared once, with the provision it comes from.
 * ------------------------------------------------------------------ */

/** Para 69(2), EPF Scheme 1952 — full settlement only after two months of unemployment. */
export const FORM19_WAITING_MONTHS = 2;

/** Para 69(1)(a), EPF Scheme 1952 — retirement from service after attaining 55 years. */
export const EPF_SUPERANNUATION_AGE = 55;

/** Table D under Para 14, EPS 1995 — the withdrawal benefit table begins at 6 months. */
export const EPS_MIN_CONTRIBUTORY_MONTHS = 6;

/** Para 12, EPS 1995 — 10 years of eligible service earns a pension instead of a withdrawal benefit. */
export const EPS_PENSIONABLE_SERVICE_YEARS = 10;

/** Para 10(2), EPS 1995 — a part-year of 6 months or more counts as one full year. */
export const EPS_YEAR_ROUNDING_MONTHS = 6;

/** Para 12(1), EPS 1995 — superannuation pension age. */
export const EPS_PENSION_AGE = 58;

/** Para 12(7), EPS 1995 — earliest age for a reduced early pension. */
export const EPS_EARLY_PENSION_AGE = 50;

/** G.S.R. 609(E) dated 22-08-2014 — monthly pay ceiling for joining EPS. */
export const EPS_WAGE_CEILING = 15000;

/** G.S.R. 609(E) — new members joining on or after this date above the ceiling cannot join EPS. */
export const EPS_CUTOFF_DATE = "2014-09-01";

/** Section 7Q, EPF & MP Act 1952 — simple interest on belated remittance, per annum. */
export const SECTION_7Q_INTEREST_PERCENT = 12;

/** Section 192A, Income-tax Act 1961 — TDS threshold on pre-5-year taxable withdrawal. */
export const TDS_192A_THRESHOLD = 50000;

/** Section 192A — TDS rate where PAN is on record. */
export const TDS_192A_RATE_WITH_PAN = 10;

/** Section 192A — TDS rate where PAN is not on record. */
export const TDS_192A_RATE_WITHOUT_PAN = 20;

/** Section 192A — continuous service below which the accumulated balance is taxable. */
export const TDS_192A_SERVICE_YEARS = 5;

/** EPFO Joint Declaration SOP — permitted variance for a date-of-birth correction. */
export const JD_DOB_VARIANCE_YEARS = 3;

/** EPFO JD SOP — UANs allotted on or after this date and Aadhaar-validated get the simplified route. */
export const JD_SELF_SERVICE_UAN_DATE = "2017-10-01";

/** Para 32A, EPF Scheme 1952 — rates of damages for belated remittance, per annum. */
export const PARA_32A_DAMAGE_SLABS = [
  ["Less than 2 months", 5],
  ["2 months and above, below 4 months", 10],
  ["4 months and above, below 6 months", 15],
  ["6 months and above", 25],
];

/* ------------------------------------------------------------------ *
 * Who has to act
 * ------------------------------------------------------------------ */

export const OWNERS = {
  MEMBER: "member",
  EMPLOYER: "employer",
  JOINT: "joint",
  EPFO: "epfo",
};

export const OWNER_META = {
  member: {
    key: "member",
    label: "You, the member",
    short: "Member",
    line: "You can start and finish this yourself on the EPFO Member portal. No employer or field office is in the loop.",
  },
  employer: {
    key: "employer",
    label: "Your employer (or ex-employer)",
    short: "Employer",
    line: "Only the establishment that holds the member ID can push this change. Nothing you do on the member portal will clear it.",
  },
  joint: {
    key: "joint",
    label: "You and the employer together",
    short: "Member + employer",
    line: "You raise the request online; the employer has to approve it before it reaches EPFO. It stalls if either side stops.",
  },
  epfo: {
    key: "epfo",
    label: "The EPFO field office",
    short: "EPFO office",
    line: "Neither you nor the employer can edit this from a portal. It is decided by the office holding the account, so the route is a written grievance or a physical file.",
  },
};

export const OWNER_ORDER = ["member", "joint", "employer", "epfo"];

/* ------------------------------------------------------------------ *
 * Forms
 * ------------------------------------------------------------------ */

export const FORM_GUIDE = [
  {
    code: "19",
    name: "Form 19",
    pays: "The EPF (provident fund) balance — your share, the employer's PF share and the interest on both.",
    whenUsed:
      "Final settlement after you have left the job and are no longer an EPF member.",
    gate: `Two months of unemployment after the date of exit (Para 69(2), EPF Scheme 1952), or immediately on retirement after age ${EPF_SUPERANNUATION_AGE} under Para 69(1)(a).`,
    scheme: "Employees' Provident Funds Scheme, 1952",
  },
  {
    code: "10C",
    name: "Form 10C",
    pays:
      "The EPS withdrawal benefit — a lump sum from the pension fund calculated on Table D, not the balance shown in your PF passbook.",
    whenUsed:
      "When you leave before earning a pension, or when you want a Scheme Certificate instead of cash.",
    gate: `At least ${EPS_MIN_CONTRIBUTORY_MONTHS} months of contributory service and less than ${EPS_PENSIONABLE_SERVICE_YEARS} years of eligible service (Para 14, EPS 1995).`,
    scheme: "Employees' Pension Scheme, 1995",
  },
  {
    code: "31",
    name: "Form 31",
    pays:
      "A part-withdrawal (advance) out of your own EPF balance while you are still a member and still employed.",
    whenUsed:
      "For a listed purpose only — housing, illness, marriage or education, unemployment, or the year before retirement.",
    gate:
      "The membership period and evidence fixed by the specific paragraph of the EPF Scheme 1952 you claim under (68B, 68J, 68K, 68HH, 68NN).",
    scheme: "Employees' Provident Funds Scheme, 1952",
  },
  {
    code: "13",
    name: "Form 13",
    pays:
      "Nothing. It moves an old PF balance and its service period into your current member ID.",
    whenUsed:
      "When you change jobs and want the previous account merged rather than withdrawn.",
    gate:
      "Both member IDs must sit under the same UAN with matching, non-overlapping dates of joining and exit.",
    scheme: "Employees' Provident Funds Scheme, 1952",
  },
  {
    code: "10D",
    name: "Form 10D",
    pays: "A monthly pension, not a lump sum.",
    whenUsed:
      "Once eligible service reaches 10 years and you reach the pension age.",
    gate: `Age ${EPS_PENSION_AGE} for full pension, or from age ${EPS_EARLY_PENSION_AGE} at a reduced rate (Para 12, EPS 1995).`,
    scheme: "Employees' Pension Scheme, 1995",
  },
];

/* ------------------------------------------------------------------ *
 * The rejection catalogue
 * ------------------------------------------------------------------ */

/**
 * Each entry is one rejection remark family.
 *  id          stable anchor, used for deep links
 *  portal      the strings EPFO's portal / SMS actually shows
 *  meaning     plain language explanation
 *  owner       who alone can clear it
 *  ownerWhy    why it is that party and not another
 *  forms       which claim forms this rejection lands on
 *  fix         the correction route, step by step
 *  prepare     what to have in hand before starting
 *  rule        the provision, circular or standard behind it
 *  keywords    matcher phrases for the decoder
 */
export const REJECTION_REASONS = [
  {
    id: "name-mismatch-aadhaar",
    title: "Name does not match the Aadhaar record",
    portal: [
      "Name against UAN is not matching with Aadhaar",
      "Member name not as per Aadhaar / ITDB",
      "Name differs in EPFO record and UIDAI record, joint declaration required",
    ],
    meaning:
      "The name held against your UAN in EPFO's member database is not character-for-character the same as the name in the Aadhaar now linked to that UAN. EPFO validates every online claim against the Aadhaar demographic record, so an expanded surname, a dropped initial or a single spelling difference stops the claim before it is examined.",
    owner: OWNERS.MEMBER,
    ownerWhy:
      "Profile fields belong to the member record, not to the claim. Re-filing the same claim with the same name will fail again in exactly the same way.",
    forms: ["19", "10C", "31", "13"],
    fix: [
      "Log in at the Member portal and open Manage, then Joint Declaration.",
      "Pick the field Name and enter it exactly as Aadhaar reads it today, including the order of the words.",
      "For a UAN allotted on or after 1 October 2017 that is already Aadhaar-validated, the change is submitted straight to EPFO. For an older UAN the request queues with the employer for approval and then with the field office.",
      "Wait for the profile to show the corrected name, then file the claim again as a fresh claim.",
    ],
    prepare: [
      "Aadhaar as it reads today (correct the Aadhaar first if that is the wrong one)",
      "UAN and the registered mobile number for OTP",
      "The rejection remark itself and the old claim reference number",
    ],
    rule: "EPFO Joint Declaration Standard Operating Procedure, circular dated 16 January 2025",
    keywords: [
      "name not matching",
      "name against uan",
      "name mismatch",
      "not as per aadhaar",
      "name differs",
      "member name",
      "name",
      "aadhaar",
    ],
  },
  {
    id: "dob-mismatch-aadhaar",
    title: "Date of birth does not match Aadhaar",
    portal: [
      "Date of birth not matching with Aadhaar / UIDAI",
      "DOB in EPFO record differs from Aadhaar, JD required",
      "Member date of birth mismatch",
    ],
    meaning:
      "The date of birth in the EPFO member profile differs from the one in the linked Aadhaar. Date of birth also decides pension eligibility, so EPFO will not settle a pension-linked claim on a disputed date.",
    owner: OWNERS.MEMBER,
    ownerWhy:
      "Date of birth is a member profile field. The employer only enters the picture for UANs allotted before 1 October 2017.",
    forms: ["19", "10C", "10D", "31"],
    fix: [
      "Raise a Joint Declaration for the field Date of Birth from the Member portal.",
      `EPFO's SOP allows a correction with a variance of up to ${JD_DOB_VARIANCE_YEARS} years from the recorded date on the strength of the listed proof; a larger correction is examined by the field office.`,
      "Attach the proof the SOP lists for date of birth, which includes the Aadhaar itself, a school or education certificate, a birth certificate issued by the Registrar, or a passport.",
      "Re-file the claim only after the profile shows the corrected date.",
    ],
    prepare: [
      "Aadhaar showing the correct date of birth",
      "One of the proofs from the SOP list if the change is large",
      "A note of what the EPFO record currently shows, so you can see the change take effect",
    ],
    rule: `EPFO Joint Declaration SOP, circular dated 16 January 2025; date of birth variance limit of ${JD_DOB_VARIANCE_YEARS} years`,
    keywords: [
      "date of birth",
      "dob not matching",
      "dob mismatch",
      "birth date",
      "dob",
      "aadhaar",
    ],
  },
  {
    id: "father-or-spouse-name-mismatch",
    title: "Father's or husband's name mismatch",
    portal: [
      "Father name / Husband name not matching with Aadhaar",
      "Relation and relative name mismatch in member profile",
      "Father's name blank in EPFO record",
    ],
    meaning:
      "The relative's name, or the relationship flag itself (father versus husband), does not agree with the Aadhaar record or with what the establishment filed at the time of joining. It is a common failure for members who married after joining and updated Aadhaar but never updated EPFO.",
    owner: OWNERS.MEMBER,
    ownerWhy:
      "Father's name, mother's name, spouse name and marital status are all member profile fields covered by the same Joint Declaration route.",
    forms: ["19", "10C", "10D"],
    fix: [
      "Open Manage, then Joint Declaration, and change the relative name field and, where it applies, the marital status and relationship flag together in the same request.",
      "If the relationship itself changed from father to husband, change marital status first so the correct field is offered.",
      "For a UAN allotted before 1 October 2017 the employer must approve the request before it moves on.",
    ],
    prepare: [
      "Aadhaar showing the relative's name",
      "Marriage certificate if the relationship flag is changing",
      "The exact spelling used in the Aadhaar, not the spelling used at home",
    ],
    rule: "EPFO Joint Declaration SOP, circular dated 16 January 2025",
    keywords: [
      "father name",
      "fathers name",
      "husband name",
      "spouse name",
      "relative name",
      "relationship mismatch",
      "marital status",
    ],
  },
  {
    id: "uan-not-aadhaar-seeded",
    title: "UAN not seeded or verified with Aadhaar",
    portal: [
      "UAN is not seeded with Aadhaar",
      "Aadhaar not verified against UIDAI, claim rejected",
      "KYC not available / Aadhaar KYC pending",
    ],
    meaning:
      "There is no Aadhaar successfully verified against UIDAI sitting on your UAN. Without it EPFO cannot establish that the claimant and the member are the same person, and an online claim cannot even be examined.",
    owner: OWNERS.MEMBER,
    ownerWhy:
      "Aadhaar seeding is done by the member with a UIDAI OTP. The employer approves other KYC documents, but Aadhaar verification is machine-checked against UIDAI.",
    forms: ["19", "10C", "31", "13"],
    fix: [
      "Log in at the Member portal, open Manage, then KYC, and add Aadhaar.",
      "Verify with the OTP sent to the mobile number registered with Aadhaar, not the one registered with EPFO.",
      "If verification fails, the mismatch is in name, date of birth or gender — clear that mismatch first through a Joint Declaration.",
      "The UAN shows Aadhaar as Verified before an online claim will be accepted.",
    ],
    prepare: [
      "Aadhaar number and the mobile linked to it for OTP",
      "UAN activated with a working password",
      "Name, date of birth and gender in EPFO matching Aadhaar",
    ],
    rule: "Aadhaar-linked UAN mandated for filing the ECR from 1 June 2021 under Section 142 of the Code on Social Security, 2020 (EPFO circular)",
    keywords: [
      "not seeded",
      "aadhaar not seeded",
      "uan not seeded",
      "kyc not available",
      "aadhaar not verified",
      "uidai",
      "kyc pending",
    ],
  },
  {
    id: "date-of-exit-not-updated",
    title: "Date of exit not updated",
    portal: [
      "Date of exit not updated by the employer",
      "DOE not available in EPFO record",
      "Member is shown as in service, claim not admissible",
    ],
    meaning:
      "EPFO still shows you as a serving member of that establishment. A final settlement can only be paid to someone who has left, so Form 19 and Form 10C are rejected outright while the exit date is blank.",
    owner: OWNERS.EMPLOYER,
    ownerWhy:
      "The employer marks the exit through the Employer Interface or the ECR. There is one member-side escape: EPFO's Mark Exit facility on the Member portal, which only opens two months after the month of the last contribution received.",
    forms: ["19", "10C", "13"],
    fix: [
      "Ask the ex-employer to update the date of exit and the reason for leaving in the Employer Interface for that member ID.",
      "If two months have passed since the last contribution reached your account, use Manage, then Mark Exit, on the Member portal and set the date yourself with an Aadhaar OTP.",
      "The date must be the last day for which contribution was actually paid, not your resignation date or your notice-period end.",
      `If the establishment is closed or refuses, the remaining route is a grievance on ${GRIEVANCE_PORTAL} against the office holding the account.`,
    ],
    prepare: [
      "Your last working day and the month of the last contribution shown in the passbook",
      "Relieving letter or full-and-final statement",
      "Aadhaar-linked mobile for the OTP if you mark the exit yourself",
    ],
    rule: "EPFO member self-service Mark Exit facility, live since January 2020; exit date must equal the last month of contribution",
    keywords: [
      "date of exit",
      "doe not updated",
      "exit not updated",
      "exit date",
      "still in service",
      "not left",
      "date of leaving",
    ],
  },
  {
    id: "date-of-joining-mismatch",
    title: "Date of joining wrong or missing",
    portal: [
      "Date of joining not matching with records",
      "DOJ not available for the member ID",
      "Joining date mismatch between ECR and claim",
    ],
    meaning:
      "The date of joining held against that member ID is blank or disagrees with the contribution history. Because service length decides Form 10C eligibility and pension service, EPFO will not compute a settlement on a doubtful joining date.",
    owner: OWNERS.JOINT,
    ownerWhy:
      "Date of joining is filed by the establishment. You raise the Joint Declaration; the employer that owns the member ID has to confirm it before EPFO acts.",
    forms: ["19", "10C", "10D", "13"],
    fix: [
      "Raise a Joint Declaration for Date of Joining against the specific member ID, not against the UAN as a whole.",
      "Give the date that matches the first month of contribution visible in the passbook for that establishment.",
      "The employer approves it in the Employer Interface, after which the field office posts the change.",
    ],
    prepare: [
      "Appointment letter or the first salary slip showing a PF deduction",
      "The passbook page showing the first contribution month for that member ID",
      "The member ID string itself, which is longer than the UAN",
    ],
    rule: "EPFO Joint Declaration SOP, circular dated 16 January 2025",
    keywords: [
      "date of joining",
      "doj",
      "joining date",
      "doj not matching",
      "joining not available",
    ],
  },
  {
    id: "bank-kyc-not-verified",
    title: "Bank account KYC not approved",
    portal: [
      "Bank account not seeded with UAN",
      "Bank KYC pending for approval by the employer",
      "Bank details not verified, claim rejected",
    ],
    meaning:
      "A bank account is showing in your KYC list but has not been digitally approved, so EPFO has no verified account to credit. A claim cannot be paid into an unapproved account even if the number is correct.",
    owner: OWNERS.EMPLOYER,
    ownerWhy:
      "Bank KYC is approved by the employer with a digital signature or e-sign, unless the account clears EPFO's automated Aadhaar-based bank validation on its own.",
    forms: ["19", "10C", "31"],
    fix: [
      "Add the account under Manage, then KYC, with the account number and IFSC keyed exactly as printed on the passbook.",
      "Ask the current or ex-employer to approve the pending bank KYC in the Employer Interface.",
      `If the establishment is defunct, raise a grievance on ${GRIEVANCE_PORTAL} asking the field office to approve the bank KYC.`,
    ],
    prepare: [
      "Cancelled cheque or bank passbook first page with your printed name",
      "Account number and IFSC, checked digit by digit",
      "The account has to be in your own name and single or first-holder",
    ],
    rule: "EPFO KYC approval workflow; payment is released only to a KYC-approved account",
    keywords: [
      "bank kyc",
      "bank not seeded",
      "bank details not verified",
      "kyc pending",
      "bank account not approved",
      "bank",
    ],
  },
  {
    id: "wrong-ifsc-or-bank-merger",
    title: "Wrong or dead IFSC after a bank merger",
    portal: [
      "IFSC code invalid",
      "Bank account details incorrect, NEFT returned",
      "Payment returned by bank, wrong IFSC",
    ],
    meaning:
      "The IFSC on the claim no longer exists or does not belong to that branch. Public sector bank amalgamations retired large blocks of IFSC codes, so a KYC record seeded years ago can hold an IFSC that the payment system now rejects.",
    owner: OWNERS.MEMBER,
    ownerWhy:
      "You replace the bank KYC. Only after the new account is approved can EPFO re-attempt the credit.",
    forms: ["19", "10C", "31"],
    fix: [
      "Get the current IFSC from the bank, from the new cheque book, or from the bank's own IFSC lookup — an old passbook is not proof of a live code.",
      "Delete or supersede the stale bank KYC and add the account again with the current IFSC.",
      "Have the employer approve the new bank KYC, then re-file the claim.",
    ],
    prepare: [
      "A cheque leaf issued after the merger, which carries the new IFSC",
      "Confirmation from the branch that the account number itself has not changed",
      "Old and new IFSC written down, so you can tell which one the claim carried",
    ],
    rule: "Bank IFSC changes following the public sector bank amalgamations of 2019 and 2020; EPFO pays by NEFT to a live IFSC",
    keywords: [
      "ifsc",
      "ifsc invalid",
      "wrong ifsc",
      "neft returned",
      "payment returned",
      "bank merger",
      "account details incorrect",
    ],
  },
  {
    id: "bank-name-mismatch",
    title: "Name in the bank account differs from EPFO",
    portal: [
      "Name in bank account not matching with member name",
      "Bank account holder name mismatch",
      "Credit failed, beneficiary name mismatch",
    ],
    meaning:
      "The bank holds a different version of your name from the one EPFO holds, so the credit either fails at the bank or the claim is stopped before release. Married names and expanded initials are the usual cause.",
    owner: OWNERS.MEMBER,
    ownerWhy:
      "Either the bank record or the EPFO record has to move. Both are yours to change, but through two different institutions.",
    forms: ["19", "10C", "31"],
    fix: [
      "Decide which record is wrong by comparing both against Aadhaar.",
      "If EPFO is wrong, run a Joint Declaration for Name; if the bank is wrong, get the bank to update its record and then re-seed the KYC.",
      "Re-file the claim only once the two names read the same.",
    ],
    prepare: [
      "Aadhaar as the tie-breaker between the two records",
      "Bank passbook page showing the printed account holder name",
      "Marriage certificate if the name changed on marriage",
    ],
    rule: "EPFO KYC validation of beneficiary name against the member record before NEFT release",
    keywords: [
      "bank account holder name",
      "beneficiary name",
      "name in bank",
      "account name mismatch",
    ],
  },
  {
    id: "service-period-overlap",
    title: "Overlapping service periods across member IDs",
    portal: [
      "Service period overlapping with another member ID",
      "Overlapping service, transfer not allowed",
      "Dual employment period found in the records",
    ],
    meaning:
      "Two member IDs under your UAN claim contributions for the same calendar dates. EPFO cannot build a continuous service history out of that, so a transfer stops and a settlement that depends on total service stops with it. Almost always one employer entered a wrong date of exit or a wrong date of joining, not actual dual employment.",
    owner: OWNERS.JOINT,
    ownerWhy:
      "The wrong date sits inside one establishment's record. That establishment has to correct it through a Joint Declaration; you can raise it but you cannot approve it.",
    forms: ["13", "19", "10C", "10D"],
    fix: [
      "Open the service history on the Member portal and write down the exact overlapping dates and which two member IDs they belong to.",
      "Identify which of the two dates is wrong by checking the passbook for the last month of contribution at the earlier establishment.",
      "Raise a Joint Declaration against the establishment holding the wrong date, for Date of Exit or Date of Joining as applicable.",
      `If both employers insist their date is right, the dispute goes to the field office through ${GRIEVANCE_PORTAL}.`,
    ],
    prepare: [
      "Both member IDs and the overlapping date range",
      "Passbooks for both accounts showing the actual contribution months",
      "Relieving letter from the earlier employer",
    ],
    rule: "EPFO transfer and settlement validation of continuous service across member IDs under one UAN",
    keywords: [
      "overlapping",
      "overlap",
      "service period",
      "dual employment",
      "service overlapping",
      "overlapping service",
    ],
  },
  {
    id: "contribution-not-received",
    title: "Contribution not received for the claimed month",
    portal: [
      "Contribution not received for the month claimed",
      "Amount not credited in the member account",
      "ECR not filed by the establishment for the period",
    ],
    meaning:
      "Money was deducted from your salary but the establishment never remitted it, or remitted it without a matching ECR line for your member ID. EPFO cannot pay out a balance that was never credited, so the claim fails on arithmetic, not on paperwork.",
    owner: OWNERS.EMPLOYER,
    ownerWhy:
      "Only the establishment can file or revise the ECR and remit the dues. Where it will not, the recovery machinery of the Act takes over — that is an EPFO enforcement action, not a member correction.",
    forms: ["19", "10C", "31", "13"],
    fix: [
      "Download the passbook and mark exactly which months are missing against which member ID.",
      "Put the missing months to the employer in writing and keep the acknowledgement.",
      `If nothing moves, file a grievance on ${GRIEVANCE_PORTAL} naming the establishment code and the missing months.`,
      `EPFO can then determine the dues under Section 7A, charge simple interest at ${SECTION_7Q_INTEREST_PERCENT} per cent per annum under Section 7Q, and levy damages under Section 14B at the Para 32A slabs.`,
    ],
    prepare: [
      "Salary slips for the missing months showing the PF deduction",
      "The EPF passbook download marking the gap",
      "Establishment code and the member ID for those months",
    ],
    rule: `Sections 7A, 7Q (${SECTION_7Q_INTEREST_PERCENT} per cent per annum) and 14B, EPF and Miscellaneous Provisions Act 1952, read with Para 32A of the EPF Scheme 1952`,
    keywords: [
      "contribution not received",
      "not credited",
      "amount not credited",
      "ecr not filed",
      "contribution missing",
      "no contribution",
      "dues",
    ],
  },
  {
    id: "signature-mismatch",
    title: "Signature mismatch or unattested claim form",
    portal: [
      "Signature not matching with the specimen signature",
      "Claim form not signed / not attested by the employer",
      "Signature differs from the record",
    ],
    meaning:
      "This only happens on a paper or composite claim form. The signature on the form does not match the specimen the office holds, or the employer's attestation block is blank. An Aadhaar-based online claim carries no signature at all and cannot fail this way.",
    owner: OWNERS.MEMBER,
    ownerWhy:
      "You sign the form. Where the employer's attestation is the missing piece, it becomes the employer's action — the remark usually names which one is missing.",
    forms: ["19", "10C", "31"],
    fix: [
      "If the UAN is Aadhaar-verified and KYC is complete, switch to the online composite claim, which needs no signature or attestation.",
      "If a paper form is unavoidable, sign in the same style as the specimen the office holds and get the employer to attest with the establishment seal.",
      "A signature that has genuinely changed over the years is corrected by filing a fresh specimen with the office, attested by the employer or a bank manager.",
    ],
    prepare: [
      "Your older signature style, from the original PF nomination form if you have a copy",
      "Employer seal and authorised signatory availability",
      "A fully Aadhaar-verified UAN, which removes the problem altogether",
    ],
    rule: "Attestation requirement for non-Aadhaar composite claim forms; Aadhaar-based online claims are exempt",
    keywords: [
      "signature",
      "signature not matching",
      "specimen signature",
      "not attested",
      "not signed",
      "attestation",
    ],
  },
  {
    id: "claim-already-settled",
    title: "Claim already settled",
    portal: [
      "Claim already settled for this member ID",
      "Duplicate claim, earlier claim settled on <date>",
      "No balance available, account already settled",
    ],
    meaning:
      "EPFO has already paid out against this member ID and there is nothing left to settle. Sometimes the earlier settlement was genuine and forgotten; sometimes the money was released to a stale bank account and returned, so the account reads settled while nothing reached you.",
    owner: OWNERS.MEMBER,
    ownerWhy:
      "The first move is yours: confirm from the passbook and the earlier claim status whether money actually landed. Only if it did not does this become an EPFO matter.",
    forms: ["19", "10C", "31"],
    fix: [
      "Open Track Claim Status and read the earlier claim's settlement date, amount and the last four digits of the account credited.",
      "Check that account's statement for the credit on or around that date.",
      `If the settlement was released but never credited, raise a grievance on ${GRIEVANCE_PORTAL} quoting the settled claim ID and ask for re-authorisation to the current account.`,
      "If it was credited, the account is closed and only a later member ID can hold a fresh balance.",
    ],
    prepare: [
      "The earlier claim ID and its settlement date",
      "Bank statement covering that date",
      "The passbook for that member ID showing a nil closing balance",
    ],
    rule: "One settlement per member ID; a re-authorisation is an EPFO office action, not a fresh claim",
    keywords: [
      "already settled",
      "claim already settled",
      "duplicate claim",
      "no balance",
      "account settled",
    ],
  },
  {
    id: "form10c-service-under-6-months",
    title: "Form 10C rejected — contributory service under 6 months",
    portal: [
      "Member is not eligible for withdrawal benefit, service less than 6 months",
      "EPS service less than six months, Form 10C not admissible",
      "Withdrawal benefit not payable",
    ],
    meaning:
      "The EPS withdrawal benefit is read off Table D, and Table D starts at six months of contributory service. Below six months there is no entry to read, so no withdrawal benefit is payable — even though EPS contributions were deducted and are visible.",
    owner: OWNERS.MEMBER,
    ownerWhy:
      "Nothing is broken in the record. This is the scheme applying its own threshold, so the correction is to file the right form, not to fix data.",
    forms: ["10C"],
    fix: [
      `File Form 19 alone for the provident fund balance; the EPS side is not payable below ${EPS_MIN_CONTRIBUTORY_MONTHS} months.`,
      "If the contributory service is actually longer than the record shows, the real problem is a wrong date of joining or a missing contribution month — fix that first and re-check.",
      "If total service across employers crosses six months, transfer the earlier account in with Form 13 so the service periods add up before claiming.",
    ],
    prepare: [
      "The service history page showing contributory months per member ID",
      "Passbook confirming which months actually carry an EPS contribution",
    ],
    rule: `Table D under Para 14, Employees' Pension Scheme 1995 — the table begins at ${EPS_MIN_CONTRIBUTORY_MONTHS} months of contributory service`,
    keywords: [
      "less than 6 months",
      "six months",
      "withdrawal benefit not",
      "not eligible for withdrawal benefit",
      "eps service",
      "10c",
    ],
  },
  {
    id: "form10c-eligible-service-10-years",
    title: "Form 10C rejected — eligible service has reached 10 years",
    portal: [
      "Member has completed 10 years of eligible service, withdrawal benefit not admissible",
      "Only Scheme Certificate can be issued",
      "Service more than 9 years 6 months, pension applies",
    ],
    meaning:
      "The withdrawal benefit exists only for members who leave before earning a pension. Once eligible service reaches ten years the pension right vests and the cash option closes. Because a part-year of six months or more counts as a full year, nine years and six months is already treated as ten, which is why the portal blocks claims at 9 years 6 months rather than at 10 years.",
    owner: OWNERS.MEMBER,
    ownerWhy:
      "The record is correct; the form is wrong. The choice is now between a Scheme Certificate now and a pension later.",
    forms: ["10C", "10D"],
    fix: [
      "File Form 10C selecting Scheme Certificate instead of withdrawal benefit — it preserves the service for a future pension and can be carried into the next job.",
      `File Form 10D for the monthly pension from age ${EPS_PENSION_AGE}, or from age ${EPS_EARLY_PENSION_AGE} at a reduced rate.`,
      "If the ten years were only reached because of a wrong date of joining, correct that date first through a Joint Declaration.",
    ],
    prepare: [
      "Total eligible service across all member IDs, added up including transferred periods",
      "Your date of birth as EPFO holds it, since it fixes the pension date",
    ],
    rule: `Para 14 read with Para 10(2), Employees' Pension Scheme 1995 — a part-year of ${EPS_YEAR_ROUNDING_MONTHS} months or more counts as one full year`,
    keywords: [
      "10 years",
      "ten years",
      "eligible service",
      "scheme certificate",
      "9 years 6 months",
      "pension applies",
      "withdrawal benefit not admissible",
    ],
  },
  {
    id: "not-eps-member-post-2014",
    title: "Not an EPS member — joined after 1 September 2014 above the wage ceiling",
    portal: [
      "Member is not eligible for pension fund, joined after 01/09/2014",
      "Not a member of EPS 1995, Form 10C not applicable",
      "No pension contribution in the account",
    ],
    meaning:
      `A person who became an EPF member for the first time on or after 1 September 2014 with monthly pay above the ceiling of ${formatInr(EPS_WAGE_CEILING)} cannot join the pension scheme at all. The whole employer share goes to provident fund, there is no pension fund balance, and Form 10C has nothing to pay out.`,
    owner: OWNERS.MEMBER,
    ownerWhy:
      "There is no data error to correct. The scheme simply never admitted you, so only the provident fund form applies.",
    forms: ["10C", "10D"],
    fix: [
      "File Form 19 alone — the entire accumulation sits on the provident fund side.",
      "Check the passbook: an EPS column that is empty from the first month confirms non-membership rather than a missing credit.",
      "If you were an EPF member before 1 September 2014 without a break, the exclusion does not apply and the real problem is a wrong date of joining or an untransferred earlier account.",
    ],
    prepare: [
      "Date of joining your first ever EPF-covered job, not just the current one",
      "Monthly EPF wage at that first joining",
      "Passbook showing whether an EPS column ever carried a figure",
    ],
    rule: `Employees' Pension Scheme 1995 as amended by G.S.R. 609(E) dated 22 August 2014, effective 1 September 2014 — new members with pay above ${formatInr(EPS_WAGE_CEILING)} per month are excluded`,
    keywords: [
      "not eligible for pension",
      "not a member of eps",
      "after 01/09/2014",
      "2014",
      "no pension contribution",
      "pension fund",
      "15000",
    ],
  },
  {
    id: "form19-two-month-waiting",
    title: "Form 19 filed before the two-month waiting period",
    portal: [
      "Claim submitted before completion of two months from date of exit",
      "Two months not completed since leaving service",
      "Final settlement not admissible at this stage",
    ],
    meaning:
      "A final settlement of the provident fund on ceasing employment is admissible only after two months of continuous unemployment from the date of exit. Filing on the day after leaving, or while already in a new EPF-covered job, fails this test.",
    owner: OWNERS.MEMBER,
    ownerWhy:
      "This is a timing rule, not a record error. Nothing needs correcting; the same claim succeeds once the date passes.",
    forms: ["19"],
    fix: [
      `Count ${FORM19_WAITING_MONTHS} calendar months from the date of exit and re-file on or after that date.`,
      "If you have already joined another EPF-covered employer, the two-month clock never starts — the route is Form 13 transfer, not settlement.",
      `Retirement from service after attaining age ${EPF_SUPERANNUATION_AGE} is settled without any waiting period under Para 69(1)(a).`,
      "A Form 31 advance for unemployment under Para 68HH is available after one month, if cash is the pressing need.",
    ],
    prepare: [
      "The date of exit exactly as EPFO shows it, which may not be your last working day",
      "Confirmation that no new EPF contribution has started",
    ],
    rule: `Para 69(2), Employees' Provident Funds Scheme 1952 — ${FORM19_WAITING_MONTHS} months of continuous unemployment; Para 69(1)(a) for retirement after age ${EPF_SUPERANNUATION_AGE}`,
    keywords: [
      "two months",
      "2 months",
      "before completion",
      "waiting period",
      "not completed two months",
      "final settlement not admissible",
    ],
  },
  {
    id: "form31-housing-membership-short",
    title: "Form 31 housing advance — five years' membership not completed",
    portal: [
      "Member has not completed 5 years of membership for housing advance",
      "Advance under Para 68B not admissible",
      "Service criteria not fulfilled for the purpose selected",
    ],
    meaning:
      "An advance for purchase or construction of a dwelling house or site is available only after five years of membership of the Fund. Membership is counted across transferred accounts, so an untransferred earlier account is a common reason the count looks short.",
    owner: OWNERS.MEMBER,
    ownerWhy:
      "Either the threshold genuinely is not met, or your earlier service has not been merged in. Both are yours to act on.",
    forms: ["31"],
    fix: [
      "Add up membership across every member ID that has been transferred into the current one.",
      "If an earlier account is still separate, file Form 13 to transfer it in — the merged service counts towards the five years.",
      "If the five years genuinely are not complete, a purpose with no membership threshold, such as illness under Para 68J, is the only other route.",
    ],
    prepare: [
      "Service history showing membership months in the current member ID",
      "Details of any earlier member ID not yet transferred",
      "Property or allotment papers for the purpose itself",
    ],
    rule: "Para 68B, Employees' Provident Funds Scheme 1952 — five years' membership of the Fund",
    keywords: [
      "5 years of membership",
      "five years",
      "68b",
      "housing advance",
      "house purchase",
      "service criteria not fulfilled",
    ],
  },
  {
    id: "form31-marriage-education-limit",
    title: "Form 31 marriage or education advance — seven years or three-time limit",
    portal: [
      "Member has not completed 7 years of membership",
      "Advance under Para 68K already availed three times",
      "Maximum number of advances for this purpose exhausted",
    ],
    meaning:
      "An advance for marriage of self, son, daughter, brother or sister, or for post-matriculation education of a son or daughter, needs seven years of membership and is granted at most three times in a member's whole working life, counting marriage and education together.",
    owner: OWNERS.MEMBER,
    ownerWhy:
      "Both the seven-year count and the three-occasion count are read from your own record. There is nothing for an employer to approve.",
    forms: ["31"],
    fix: [
      "Check how many Para 68K advances have already been settled across all member IDs, not just the current one.",
      "If the seven years are short only because an old account was never transferred, file Form 13 first.",
      "Where the three occasions are exhausted, no further advance under this paragraph is admissible whatever the documents show.",
    ],
    prepare: [
      "Claim history for every earlier member ID",
      "Membership months after transfers are merged",
      "The marriage or admission papers for the current request",
    ],
    rule: "Para 68K, Employees' Provident Funds Scheme 1952 — seven years' membership, not more than three occasions, up to 50 per cent of the member's own share of contributions with interest",
    keywords: [
      "7 years",
      "seven years",
      "68k",
      "marriage",
      "education",
      "three times",
      "advances exhausted",
      "maximum number of advances",
    ],
  },
  {
    id: "form31-purpose-code-mismatch",
    title: "Form 31 purpose code does not match the documents",
    portal: [
      "Purpose of advance not supported by the documents uploaded",
      "Wrong purpose code selected for the claim",
      "Documents not as per the purpose claimed",
    ],
    meaning:
      "Each paragraph of the EPF Scheme that allows an advance carries its own evidence list. Selecting housing under Para 68B and uploading a hospital bill, or selecting illness under Para 68J without the treating doctor's certificate, fails the paragraph rather than the amount.",
    owner: OWNERS.MEMBER,
    ownerWhy:
      "The purpose code and the upload are both chosen by you at the time of filing. A fresh claim with the matching pair goes straight through.",
    forms: ["31"],
    fix: [
      "Read the rejection remark for the paragraph number it names, then file again under the paragraph that actually fits the need.",
      "Match the upload to the paragraph: Para 68J needs the doctor's certificate and the certificate that ESI benefit is not available; Para 68B needs the property or agreement papers; Para 68K needs the marriage or admission papers.",
      "Upload a legible scan of the original — a photograph of a photocopy is a frequent second rejection.",
    ],
    prepare: [
      "The exact paragraph you are claiming under, written down before you start",
      "The evidence that paragraph lists, scanned as a single clear file",
      "Your own share of contributions with interest, since several paragraphs cap the advance on that",
    ],
    rule: "Para 68 series, Employees' Provident Funds Scheme 1952 — each purpose has its own evidence and ceiling",
    keywords: [
      "purpose",
      "purpose code",
      "wrong purpose",
      "documents not as per",
      "not supported by documents",
      "documents insufficient",
    ],
  },
  {
    id: "form31-unemployment-68hh",
    title: "Form 31 unemployment advance — one month not completed",
    portal: [
      "Advance under Para 68HH not admissible, unemployment less than one month",
      "Member still in service, unemployment advance rejected",
      "Continuous unemployment not established",
    ],
    meaning:
      "The unemployment advance releases up to 75 per cent of the balance after one month of continuous unemployment. If the date of exit is not on record, or is less than a month old, EPFO cannot establish the unemployment and the advance fails.",
    owner: OWNERS.MEMBER,
    ownerWhy:
      "The clock runs from the date of exit. Where the exit itself is missing, this becomes the employer's problem instead, under the date-of-exit entry.",
    forms: ["31"],
    fix: [
      "Confirm the date of exit is on record; if it is blank, that has to be fixed first.",
      "Count one calendar month from the date of exit before filing.",
      `After ${FORM19_WAITING_MONTHS} months of unemployment the full settlement under Form 19 opens as well, which pays the whole balance rather than 75 per cent.`,
    ],
    prepare: [
      "Date of exit as EPFO shows it",
      "Confirmation that no new EPF contribution has begun",
    ],
    rule: "Para 68HH, Employees' Provident Funds Scheme 1952, inserted by G.S.R. 573(E) dated 19 June 2018 — 75 per cent of the balance after one month of continuous unemployment",
    keywords: [
      "68hh",
      "unemployment",
      "one month",
      "continuous unemployment",
      "75 per cent",
      "still in service",
    ],
  },
  {
    id: "form31-pre-retirement-age",
    title: "Form 31 pre-retirement advance — age 54 not attained",
    portal: [
      "Advance under Para 68NN not admissible, member below 54 years",
      "Pre-retirement withdrawal not allowed at this age",
      "Age criteria not fulfilled",
    ],
    meaning:
      "The 90 per cent pre-retirement advance opens only on attaining age 54, or within one year before actual retirement, whichever is later. A wrong date of birth in the EPFO record produces this rejection even for a member who is genuinely past 54.",
    owner: OWNERS.MEMBER,
    ownerWhy:
      "If the age is genuinely short, nobody can waive it. If the recorded date of birth is wrong, the fix is your Joint Declaration.",
    forms: ["31"],
    fix: [
      "Check the date of birth EPFO holds against Aadhaar before assuming the rejection is about age.",
      "If the date of birth is wrong, correct it by Joint Declaration and re-file.",
      "If the age is genuinely short, only the other Para 68 purposes remain open.",
    ],
    prepare: [
      "Date of birth as shown in the EPFO member profile",
      "Aadhaar for comparison",
    ],
    rule: "Para 68NN, Employees' Provident Funds Scheme 1952 — up to 90 per cent of the total balance on attaining age 54, or within one year before actual retirement, whichever is later",
    keywords: [
      "68nn",
      "54 years",
      "pre-retirement",
      "age criteria",
      "90 per cent",
      "before retirement",
    ],
  },
  {
    id: "pan-not-seeded-tds",
    title: "PAN not seeded or Form 15G not submitted",
    portal: [
      "PAN not available against the UAN",
      "Form 15G / 15H not submitted, TDS applicable",
      "Claim returned for PAN and 15G",
    ],
    meaning:
      `Where the accumulated balance is paid before ${TDS_192A_SERVICE_YEARS} years of continuous service and the taxable amount is ${formatInr(TDS_192A_THRESHOLD)} or more, tax is deducted at source. With PAN on record the rate is ${TDS_192A_RATE_WITH_PAN} per cent; without PAN it is ${TDS_192A_RATE_WITHOUT_PAN} per cent. EPFO returns the claim rather than deduct at the higher rate on an unidentified payee.`,
    owner: OWNERS.MEMBER,
    ownerWhy:
      "PAN seeding and Form 15G are both member-side actions on the portal.",
    forms: ["19", "31"],
    fix: [
      "Add PAN under Manage, then KYC, and let it validate against the income tax database.",
      "Attach Form 15G, or Form 15H if you are a senior citizen, with the claim where your total income for the year is below the taxable limit.",
      `Continuous service of ${TDS_192A_SERVICE_YEARS} years or more, counted across transferred accounts, takes the payment outside Section 192A entirely.`,
    ],
    prepare: [
      "PAN card with the name matching the EPFO record",
      "Form 15G or 15H filled for the correct assessment year",
      "Total service across all member IDs, since transfers count towards the five years",
    ],
    rule: `Section 192A, Income-tax Act 1961 — TDS on the taxable accumulated balance paid before ${TDS_192A_SERVICE_YEARS} years of continuous service where the amount is ${formatInr(TDS_192A_THRESHOLD)} or more`,
    keywords: [
      "pan",
      "pan not available",
      "15g",
      "15h",
      "tds",
      "tax deducted",
      "192a",
    ],
  },
  {
    id: "exempted-trust-establishment",
    title: "Establishment is exempted — provident fund is with a private trust",
    portal: [
      "Establishment is exempted under Section 17, claim not maintainable at this office",
      "PF accumulations are with the establishment's trust",
      "Only pension claim is maintainable here",
    ],
    meaning:
      "Some establishments are exempted and run their own recognised provident fund trust. The provident fund money never reaches EPFO, so a Form 19 filed with EPFO has nothing to pay. The pension scheme is never exempted, so the EPS side does stay with EPFO.",
    owner: OWNERS.EMPLOYER,
    ownerWhy:
      "The provident fund half is held and settled by the employer's trust, on the trust's own form. Only the pension half is an EPFO claim.",
    forms: ["19", "10C"],
    fix: [
      "File the provident fund settlement with the establishment's PF trust on the trust's form, not on EPFO's.",
      "File Form 10C or Form 10D with EPFO for the pension side, which stays with EPFO even for exempted establishments.",
      "Check the passbook: an exempted establishment shows a pension column at EPFO with no provident fund column.",
    ],
    prepare: [
      "The trust's own claim form and the trust rules on notice period",
      "Your EPS member details for the EPFO half",
      "Confirmation from HR that the establishment is exempted and under which order",
    ],
    rule: "Section 17, Employees' Provident Funds and Miscellaneous Provisions Act 1952 — exemption from the Provident Fund Scheme; the Pension Scheme is not exempted",
    keywords: [
      "exempted",
      "trust",
      "section 17",
      "private trust",
      "not maintainable",
      "pf trust",
    ],
  },
  {
    id: "previous-service-not-transferred",
    title: "Earlier member ID not transferred",
    portal: [
      "Previous service not transferred to the present member ID",
      "File Form 13 for transfer before claiming",
      "Earlier PF account still active under the UAN",
    ],
    meaning:
      "An older account is still sitting separately under your UAN. Anything that depends on total service — five-year TDS relief, the seven-year Para 68K threshold, ten years of pension service — is computed on the current member ID alone until the transfer goes through.",
    owner: OWNERS.MEMBER,
    ownerWhy:
      "You raise the transfer online. Since EPFO simplified the transfer route, most transfers between accounts under one Aadhaar-verified UAN no longer wait on an employer's approval.",
    forms: ["13", "19", "10C", "31"],
    fix: [
      "Open Online Services, then One Member One EPF Account, and raise the transfer for every earlier member ID listed.",
      "Confirm the earlier account's date of exit is present — a transfer will not move a period with no exit date.",
      "Wait for the transfer to reflect in the passbook, then file the original claim again.",
    ],
    prepare: [
      "Every earlier member ID and its establishment code",
      "Dates of joining and exit for each, with no overlaps",
      "An Aadhaar-verified UAN, which is what allows the simplified route",
    ],
    rule: "Form 13 transfer under the Employees' Provident Funds Scheme 1952; EPFO simplified the online transfer route by circular in January 2025",
    keywords: [
      "not transferred",
      "form 13",
      "transfer",
      "previous service",
      "earlier account",
      "one member one epf",
    ],
  },
  {
    id: "wrong-office-jurisdiction",
    title: "Claim filed with the wrong EPFO office",
    portal: [
      "Claim does not pertain to this office",
      "Member ID not under the jurisdiction of this office",
      "Account transferred to another regional office",
    ],
    meaning:
      "Each member ID is held by one regional or sub-regional office. If the establishment shifted offices, or the claim was routed on an old establishment code, it lands with an office that has no such account and is returned without examination.",
    owner: OWNERS.EPFO,
    ownerWhy:
      "Jurisdiction is decided between offices. Neither you nor the employer can move an account between them from a portal.",
    forms: ["19", "10C", "31", "13"],
    fix: [
      "Read the member ID: the leading letters and numbers name the office holding the account.",
      "File the claim again against the correct member ID so the online route sends it to the right office.",
      `If the establishment itself moved and the account is stranded, raise a grievance on ${GRIEVANCE_PORTAL} against the office named in the member ID.`,
    ],
    prepare: [
      "The full member ID string, not just the UAN",
      "The establishment code and the office code inside it",
      "The rejection remark naming which office returned it",
    ],
    rule: "EPFO regional jurisdiction over establishment codes; claims are examined by the office holding the member ID",
    keywords: [
      "not pertain to this office",
      "jurisdiction",
      "wrong office",
      "regional office",
      "does not pertain",
    ],
  },
];

/** Map of id to reason, for deep-link lookups. */
const REASON_INDEX = REJECTION_REASONS.reduce((acc, reason) => {
  acc[reason.id] = reason;
  return acc;
}, {});

export function getReasonById(id) {
  if (typeof id !== "string") return null;
  return REASON_INDEX[id.trim().toLowerCase()] || null;
}

/** Every distinct form code that appears in the catalogue, in guide order. */
export const FORM_FILTERS = FORM_GUIDE.map((form) => form.code).filter((code) =>
  REJECTION_REASONS.some((reason) => reason.forms.includes(code)),
);

/* ------------------------------------------------------------------ *
 * Search and decode
 * ------------------------------------------------------------------ */

function normalise(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function haystackFor(reason) {
  return normalise(
    [
      reason.title,
      reason.meaning,
      reason.ownerWhy,
      reason.rule,
      OWNER_META[reason.owner].label,
      reason.portal.join(" "),
      reason.fix.join(" "),
      reason.prepare.join(" "),
      reason.keywords.join(" "),
      reason.forms.map((code) => `form ${code}`).join(" "),
    ].join(" "),
  );
}

const HAYSTACKS = REJECTION_REASONS.reduce((acc, reason) => {
  acc[reason.id] = haystackFor(reason);
  return acc;
}, {});

/**
 * Filter the catalogue by free text, by who has to fix it, and by form.
 * Pure: no ranking by anything outside the arguments.
 *
 * @returns {{ reasons: object[], query: string, total: number }}
 */
export function searchReasons(query = "", options = {}) {
  const { owner = "all", form = "all" } = options;
  const tokens = normalise(query).split(" ").filter(Boolean);

  const reasons = REJECTION_REASONS.filter((reason) => {
    if (owner !== "all" && reason.owner !== owner) return false;
    if (form !== "all" && !reason.forms.includes(form)) return false;
    if (tokens.length === 0) return true;
    const hay = HAYSTACKS[reason.id];
    return tokens.every((token) => hay.includes(token));
  });

  return { reasons, query: normalise(query), total: reasons.length };
}

/** Confidence bands for a decode, by matched keyword weight. */
const CONFIDENCE_HIGH = 6;
const CONFIDENCE_MEDIUM = 3;

/**
 * Decode a pasted EPFO rejection remark into the reason it belongs to.
 *
 * Scoring is deterministic: each keyword phrase found in the remark scores its
 * own word count, and an exact portal string match scores a flat bonus. No
 * randomness, no clock, no network.
 *
 * @param {string} remark raw text copied from the portal or the SMS
 * @returns {{ error?: string, matches: object[], confidence?: string, topScore?: number }}
 */
export function decodeRemark(remark) {
  const text = normalise(remark);
  if (!text) {
    return { error: "Paste the rejection remark as the portal shows it, then it can be decoded." };
  }
  if (text.length < 4) {
    return { error: "That is too short to decode. Paste the whole remark line from the portal." };
  }

  const EXACT_PORTAL_BONUS = 8;

  const scored = REJECTION_REASONS.map((reason) => {
    let score = 0;
    const hits = [];

    reason.keywords.forEach((phrase) => {
      const needle = normalise(phrase);
      if (needle && text.includes(needle)) {
        score += needle.split(" ").length;
        hits.push(phrase);
      }
    });

    reason.portal.forEach((line) => {
      const needle = normalise(line);
      if (needle && (text.includes(needle) || needle.includes(text))) {
        score += EXACT_PORTAL_BONUS;
      }
    });

    return { reason, score, hits };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => (b.score === a.score ? a.reason.id.localeCompare(b.reason.id) : b.score - a.score));

  if (scored.length === 0) {
    return {
      matches: [],
      topScore: 0,
      confidence: "none",
      note: "No catalogue entry matched that wording. Search the list below for a distinctive word from the remark, such as the form number or the field name.",
    };
  }

  const topScore = scored[0].score;
  let confidence = "low";
  if (topScore >= CONFIDENCE_HIGH) confidence = "high";
  else if (topScore >= CONFIDENCE_MEDIUM) confidence = "medium";

  return {
    matches: scored.slice(0, 4),
    topScore,
    confidence,
    note:
      confidence === "high"
        ? "The wording matches one catalogue entry closely."
        : "The wording is ambiguous. Read the alternates before acting on the first one.",
  };
}

/* ------------------------------------------------------------------ *
 * Date helpers — used by the eligibility checks below
 * ------------------------------------------------------------------ */

const MS_PER_DAY = 86400000;

function parseIsoDate(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function addMonthsClamped(date, months) {
  const day = date.getUTCDate();
  const shifted = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDayOfTarget = new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, 0),
  ).getUTCDate();
  return new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), Math.min(day, lastDayOfTarget)),
  );
}

function toIso(date) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/* ------------------------------------------------------------------ *
 * Eligibility checks
 * ------------------------------------------------------------------ */

/**
 * Para 69(2), EPF Scheme 1952 — is a Form 19 final settlement admissible yet?
 *
 * @param {{ exitDate: string, claimDate: string, ageYears?: number|null,
 *           reEmployed?: boolean }} input ISO dates
 */
export function assessForm19Timing(input = {}) {
  const { exitDate, claimDate, ageYears = null, reEmployed = false } = input;

  const exit = parseIsoDate(exitDate);
  if (!exit) return { error: "Enter the date of exit as a real calendar date." };
  const claim = parseIsoDate(claimDate);
  if (!claim) return { error: "Enter the claim date as a real calendar date." };
  if (claim.getTime() < exit.getTime()) {
    return { error: "The claim date cannot fall before the date of exit." };
  }
  if (ageYears !== null && (!Number.isFinite(ageYears) || ageYears < 0 || ageYears > 120)) {
    return { error: "Enter an age between 0 and 120 years." };
  }

  const earliest = addMonthsClamped(exit, FORM19_WAITING_MONTHS);
  const daysRemaining = daysBetween(claim, earliest);

  if (reEmployed) {
    return {
      exitDate: toIso(exit),
      claimDate: toIso(claim),
      earliestDate: toIso(earliest),
      daysRemaining: Math.max(daysRemaining, 0),
      verdict: "re-employed",
      headline: "Waiting period never starts",
      detail:
        "Para 69(2) needs continuous unemployment. A fresh EPF-covered job restarts membership, so the provident fund route is a Form 13 transfer rather than a Form 19 settlement.",
      reasonId: "form19-two-month-waiting",
    };
  }

  if (ageYears !== null && ageYears >= EPF_SUPERANNUATION_AGE) {
    return {
      exitDate: toIso(exit),
      claimDate: toIso(claim),
      earliestDate: toIso(exit),
      daysRemaining: 0,
      verdict: "no-waiting-period",
      headline: "No waiting period",
      detail: `Retirement from service after attaining age ${EPF_SUPERANNUATION_AGE} is settled under Para 69(1)(a), which carries no two-month wait.`,
      reasonId: null,
    };
  }

  if (daysRemaining > 0) {
    return {
      exitDate: toIso(exit),
      claimDate: toIso(claim),
      earliestDate: toIso(earliest),
      daysRemaining,
      verdict: "too-early",
      headline: `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} too early`,
      detail: `Para 69(2) admits a final settlement only after ${FORM19_WAITING_MONTHS} months of continuous unemployment from the date of exit. Para 68HH allows a 75 per cent advance after one month.`,
      reasonId: "form19-two-month-waiting",
    };
  }

  return {
    exitDate: toIso(exit),
    claimDate: toIso(claim),
    earliestDate: toIso(earliest),
    daysRemaining: 0,
    verdict: "admissible",
    headline: "Waiting period complete",
    detail: `${FORM19_WAITING_MONTHS} months from the date of exit fell on ${toIso(earliest)}, so the Para 69(2) timing test is met on the claim date.`,
    reasonId: null,
  };
}

/**
 * EPS 1995 — which pension-side form the record actually supports.
 *
 * @param {{ contributoryMonths: number, ageYears: number,
 *           firstEpfJoinDate?: string|null, wageAtJoining?: number|null }} input
 */
export function assessForm10cEligibility(input = {}) {
  const {
    contributoryMonths,
    ageYears,
    firstEpfJoinDate = null,
    wageAtJoining = null,
  } = input;

  if (!Number.isFinite(contributoryMonths) || contributoryMonths < 0) {
    return { error: "Enter contributory service in whole months, zero or more." };
  }
  if (contributoryMonths > 720) {
    return { error: "Contributory service above 720 months (60 years) is not a real service record." };
  }
  if (!Number.isFinite(ageYears) || ageYears < 14 || ageYears > 120) {
    return { error: "Enter an age between 14 and 120 years." };
  }

  const months = Math.floor(contributoryMonths);
  const wholeYears = Math.floor(months / 12);
  const remainderMonths = months % 12;
  const roundedYears = wholeYears + (remainderMonths >= EPS_YEAR_ROUNDING_MONTHS ? 1 : 0);

  const base = {
    contributoryMonths: months,
    serviceLabel: `${wholeYears} year${wholeYears === 1 ? "" : "s"} ${remainderMonths} month${remainderMonths === 1 ? "" : "s"}`,
    roundedYears,
    ageYears,
  };

  // EPS membership test first — an excluded member has no pension fund at all.
  const cutoff = parseIsoDate(EPS_CUTOFF_DATE);
  const joined = firstEpfJoinDate ? parseIsoDate(firstEpfJoinDate) : null;
  if (firstEpfJoinDate && !joined) {
    return { error: "Enter the first EPF joining date as a real calendar date." };
  }
  if (wageAtJoining !== null && (!Number.isFinite(wageAtJoining) || wageAtJoining < 0)) {
    return { error: "Enter the monthly EPF wage at joining as a positive amount." };
  }
  if (
    joined &&
    wageAtJoining !== null &&
    joined.getTime() >= cutoff.getTime() &&
    wageAtJoining > EPS_WAGE_CEILING
  ) {
    return {
      ...base,
      verdict: "not-eps-member",
      headline: "Never an EPS member",
      form: "19",
      detail: `First EPF membership on or after 1 September 2014 with a monthly wage above ${formatInr(EPS_WAGE_CEILING)} excludes the member from EPS under G.S.R. 609(E) dated 22 August 2014. There is no pension balance to claim.`,
      reasonId: "not-eps-member-post-2014",
    };
  }

  if (roundedYears >= EPS_PENSIONABLE_SERVICE_YEARS) {
    const pensionNow = ageYears >= EPS_PENSION_AGE;
    const earlyPension = ageYears >= EPS_EARLY_PENSION_AGE;
    return {
      ...base,
      verdict: pensionNow ? "pension-due" : earlyPension ? "early-pension-or-certificate" : "scheme-certificate-only",
      headline: pensionNow
        ? "Pension due, not a withdrawal benefit"
        : earlyPension
          ? "Early pension or Scheme Certificate"
          : "Scheme Certificate only",
      form: pensionNow ? "10D" : "10C",
      detail: `${months} months is ${base.serviceLabel}, which Para 10(2) rounds to ${roundedYears} years. At ${EPS_PENSIONABLE_SERVICE_YEARS} years or more the withdrawal benefit under Para 14 closes${pensionNow ? `; the pension is payable from age ${EPS_PENSION_AGE}` : earlyPension ? `; a reduced pension is available from age ${EPS_EARLY_PENSION_AGE}` : `; the pension opens at age ${EPS_EARLY_PENSION_AGE} at a reduced rate and at ${EPS_PENSION_AGE} in full`}.`,
      reasonId: "form10c-eligible-service-10-years",
    };
  }

  if (months < EPS_MIN_CONTRIBUTORY_MONTHS) {
    return {
      ...base,
      verdict: "service-too-short",
      headline: "No withdrawal benefit payable",
      form: "19",
      detail: `Table D under Para 14 begins at ${EPS_MIN_CONTRIBUTORY_MONTHS} months of contributory service. At ${months} month${months === 1 ? "" : "s"} there is no entry in the table to read.`,
      reasonId: "form10c-service-under-6-months",
    };
  }

  return {
    ...base,
    verdict: "withdrawal-benefit",
    headline: "Withdrawal benefit available",
    form: "10C",
    detail: `${base.serviceLabel} rounds to ${roundedYears} year${roundedYears === 1 ? "" : "s"} under Para 10(2) — at or above ${EPS_MIN_CONTRIBUTORY_MONTHS} months and below ${EPS_PENSIONABLE_SERVICE_YEARS} years, so Table D under Para 14 applies. The amount is a multiple of wages from Table D, not the figure in the passbook.`,
    reasonId: null,
  };
}

/** Para 68 purposes this page can test, with their own gates. */
export const FORM31_PURPOSES = [
  {
    code: "68B",
    label: "House or site — purchase or construction",
    minMembershipMonths: 60,
    maxOccasions: null,
    minAgeYears: null,
    rule: "Para 68B, EPF Scheme 1952 — five years' membership of the Fund",
  },
  {
    code: "68K",
    label: "Marriage, or post-matriculation education of a child",
    minMembershipMonths: 84,
    maxOccasions: 3,
    minAgeYears: null,
    rule: "Para 68K, EPF Scheme 1952 — seven years' membership, at most three occasions",
  },
  {
    code: "68J",
    label: "Illness or hospitalisation of self or family",
    minMembershipMonths: 0,
    maxOccasions: null,
    minAgeYears: null,
    rule: "Para 68J, EPF Scheme 1952 — no membership threshold; certificate of the treating doctor required",
  },
  {
    code: "68HH",
    label: "Continuous unemployment of one month or more",
    minMembershipMonths: 0,
    maxOccasions: null,
    minAgeYears: null,
    rule: "Para 68HH, EPF Scheme 1952 (G.S.R. 573(E) dated 19 June 2018) — up to 75 per cent of the balance",
  },
  {
    code: "68NN",
    label: "Within one year before retirement",
    minMembershipMonths: 0,
    maxOccasions: null,
    minAgeYears: 54,
    rule: "Para 68NN, EPF Scheme 1952 — up to 90 per cent of the balance on attaining age 54",
  },
];

const FORM31_INDEX = FORM31_PURPOSES.reduce((acc, purpose) => {
  acc[purpose.code] = purpose;
  return acc;
}, {});

/**
 * Test a Form 31 advance against the gate of the paragraph it is claimed under.
 *
 * @param {{ purposeCode: string, membershipMonths: number,
 *           priorOccasions?: number, ageYears?: number|null }} input
 */
export function assessForm31Advance(input = {}) {
  const { purposeCode, membershipMonths, priorOccasions = 0, ageYears = null } = input;

  const purpose = FORM31_INDEX[purposeCode];
  if (!purpose) {
    return { error: "Pick one of the listed Para 68 purposes." };
  }
  if (!Number.isFinite(membershipMonths) || membershipMonths < 0) {
    return { error: "Enter membership of the Fund in whole months, zero or more." };
  }
  if (membershipMonths > 720) {
    return { error: "Membership above 720 months (60 years) is not a real service record." };
  }
  if (!Number.isFinite(priorOccasions) || priorOccasions < 0 || priorOccasions > 20) {
    return { error: "Enter how many advances have already been taken, between 0 and 20." };
  }
  if (ageYears !== null && (!Number.isFinite(ageYears) || ageYears < 14 || ageYears > 120)) {
    return { error: "Enter an age between 14 and 120 years." };
  }

  const months = Math.floor(membershipMonths);
  const occasions = Math.floor(priorOccasions);
  const blockers = [];
  let shortfallMonths = 0;
  let reasonId = null;

  if (months < purpose.minMembershipMonths) {
    shortfallMonths = purpose.minMembershipMonths - months;
    blockers.push(
      `Membership is ${months} months against the ${purpose.minMembershipMonths} months this paragraph requires — ${shortfallMonths} month${shortfallMonths === 1 ? "" : "s"} short.`,
    );
    reasonId =
      purpose.code === "68B"
        ? "form31-housing-membership-short"
        : purpose.code === "68K"
          ? "form31-marriage-education-limit"
          : reasonId;
  }

  if (purpose.maxOccasions !== null && occasions >= purpose.maxOccasions) {
    blockers.push(
      `This paragraph is limited to ${purpose.maxOccasions} occasions in a working life and ${occasions} have already been taken.`,
    );
    reasonId = reasonId || "form31-marriage-education-limit";
  }

  if (purpose.minAgeYears !== null) {
    if (ageYears === null) {
      blockers.push(`This paragraph is age-gated at ${purpose.minAgeYears} years, so an age is needed to test it.`);
      reasonId = reasonId || "form31-pre-retirement-age";
    } else if (ageYears < purpose.minAgeYears) {
      blockers.push(
        `Age is ${ageYears} against the ${purpose.minAgeYears} years this paragraph requires.`,
      );
      reasonId = reasonId || "form31-pre-retirement-age";
    }
  }

  const membershipYears = Math.floor(months / 12);
  const membershipRemainder = months % 12;

  return {
    purpose,
    membershipMonths: months,
    membershipLabel: `${membershipYears} year${membershipYears === 1 ? "" : "s"} ${membershipRemainder} month${membershipRemainder === 1 ? "" : "s"}`,
    priorOccasions: occasions,
    shortfallMonths,
    eligible: blockers.length === 0,
    blockers,
    headline: blockers.length === 0 ? "Gate met" : "Gate not met",
    reasonId,
    rule: purpose.rule,
  };
}

/* ------------------------------------------------------------------ *
 * Copy helpers
 * ------------------------------------------------------------------ */

/** Build the plain-text block the copy button puts on the clipboard. */
export function buildReasonSummary(reason) {
  if (!reason) return "";
  const owner = OWNER_META[reason.owner];
  return [
    `EPF rejection: ${reason.title}`,
    "",
    `What it means: ${reason.meaning}`,
    "",
    `Who has to fix it: ${owner.label}. ${reason.ownerWhy}`,
    "",
    `Forms affected: Form ${reason.forms.join(", Form ")}`,
    "",
    "Correction route:",
    ...reason.fix.map((step, index) => `  ${index + 1}. ${step}`),
    "",
    "Have ready:",
    ...reason.prepare.map((item) => `  - ${item}`),
    "",
    `Rule: ${reason.rule}`,
    `Rule text read on: ${RULES_READ_ON}`,
  ].join("\n");
}
