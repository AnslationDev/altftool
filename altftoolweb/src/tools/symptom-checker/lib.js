/**
 * Symptom Checker — a deterministic red-flag triage engine.
 *
 * WHAT THIS IS
 * ------------
 * This is a *triage* tool, not a diagnosis tool. It answers one question:
 * "given what you have described, how quickly should someone be seen?"
 * It does that by running a fixed, inspectable list of red-flag rules taken
 * from the kind of warning-sign guidance published by emergency medicine and
 * primary-care services (FAST for stroke, the meningitis fever + neck
 * stiffness pair, the sepsis screening signs, the anticoagulant head-injury
 * rule, the three-week cough and unexplained weight-loss referral triggers,
 * and so on).
 *
 * WHAT THIS IS NOT
 * ----------------
 * There is no probability model here and no condition ranking. Nothing is
 * scored, nothing is guessed and no number is invented: every rule either
 * matches the input or it does not, and the ones that matched are reported
 * verbatim so the reasoning is visible. The same input always produces the
 * same output. No network calls, no clock reads.
 */

/* -------------------------------------------------------------------------- */
/* Triage bands                                                               */
/* -------------------------------------------------------------------------- */

export const TRIAGE_LEVELS = [
  {
    key: "emergency",
    rank: 5,
    label: "Emergency",
    action: "Call emergency services now",
    timeframe: "Immediately — do not drive yourself",
    tone: "danger",
  },
  {
    key: "urgent",
    rank: 4,
    label: "Urgent",
    action: "Go to an emergency department or urgent care centre",
    timeframe: "Within the next few hours",
    tone: "danger",
  },
  {
    key: "sameDay",
    rank: 3,
    label: "Same day",
    action: "Contact your doctor or a nurse advice line today",
    timeframe: "Today, or tonight's out-of-hours service",
    tone: "warning",
  },
  {
    key: "routine",
    rank: 2,
    label: "Routine appointment",
    action: "Book an ordinary appointment with your doctor",
    timeframe: "Within about a week",
    tone: "info",
  },
  {
    key: "selfCare",
    rank: 1,
    label: "Self-care and monitor",
    action: "Manage at home and re-check against the warning signs below",
    timeframe: "Reassess at least once a day",
    tone: "success",
  },
];

const LEVEL_BY_KEY = new Map(TRIAGE_LEVELS.map((level) => [level.key, level]));

/** Highest-severity band wins when several rules match. */
function higherLevel(a, b) {
  if (!a) return b;
  if (!b) return a;
  return a.rank >= b.rank ? a : b;
}

/** Move one band more urgent, capped at `ceilingKey`. */
function escalate(level, ceilingKey) {
  const ceiling = LEVEL_BY_KEY.get(ceilingKey);
  const next = TRIAGE_LEVELS.find((item) => item.rank === level.rank + 1);
  if (!next) return level;
  if (ceiling && next.rank > ceiling.rank) return level;
  return next;
}

/* -------------------------------------------------------------------------- */
/* Severity and duration                                                      */
/* -------------------------------------------------------------------------- */

export const SEVERITY_LEVELS = [
  { key: "mild", rank: 1, label: "Mild", hint: "Noticeable but you can carry on as normal." },
  { key: "moderate", rank: 2, label: "Moderate", hint: "It is interfering with normal activity." },
  { key: "severe", rank: 3, label: "Severe", hint: "You cannot do your usual activities at all." },
];

const SEVERITY_BY_KEY = new Map(SEVERITY_LEVELS.map((item) => [item.key, item]));

export const MAX_AGE_YEARS = 130;
export const MAX_DURATION_DAYS = 3650;

/* -------------------------------------------------------------------------- */
/* Risk factors                                                               */
/* -------------------------------------------------------------------------- */

export const RISK_FACTORS = [
  { id: "pregnant", label: "Pregnant, or within 6 weeks of giving birth" },
  { id: "immunosuppressed", label: "Immunosuppressed (chemotherapy, transplant, high-dose steroids)" },
  { id: "diabetes", label: "Diabetes" },
  { id: "blood_thinner", label: "Taking an anticoagulant or blood thinner" },
  { id: "recent_head_injury", label: "Head injury in the last 7 days" },
  { id: "recent_surgery", label: "Surgery or a hospital stay in the last 30 days" },
  { id: "heart_lung_disease", label: "Known heart or lung disease" },
  { id: "long_travel", label: "Long flight, long drive or immobility in the last 4 weeks" },
];

const RISK_BY_ID = new Map(RISK_FACTORS.map((item) => [item.id, item]));

/* -------------------------------------------------------------------------- */
/* Symptom catalogue                                                          */
/* -------------------------------------------------------------------------- */

export const SYMPTOM_GROUPS = [
  { id: "general", label: "General" },
  { id: "neuro", label: "Head and nervous system" },
  { id: "cardioresp", label: "Chest and breathing" },
  { id: "gi", label: "Stomach and bowel" },
  { id: "urinary", label: "Urinary" },
  { id: "skin", label: "Skin and allergy" },
  { id: "ent", label: "Ear, nose and throat" },
  { id: "msk", label: "Muscles and joints" },
  { id: "mental", label: "Mood" },
  { id: "other", label: "Other" },
];

/**
 * `watch` is what should make the person escalate later even if the current
 * band is low. It is fixed text per symptom, never generated.
 */
export const SYMPTOMS = [
  // General
  { id: "fever", label: "Fever or feeling feverish", group: "general", watch: ["A fever that lasts more than 5 days, or returns after settling"] },
  { id: "chills", label: "Shivering or chills", group: "general", watch: [] },
  { id: "fatigue", label: "Unusual tiredness", group: "general", watch: [] },
  { id: "night_sweats", label: "Drenching night sweats", group: "general", watch: [] },
  { id: "unintended_weight_loss", label: "Weight loss you did not intend", group: "general", watch: ["Continued weight loss without dieting"] },

  // Neurological
  { id: "headache", label: "Headache", group: "neuro", watch: ["A headache that wakes you from sleep or is worse when lying flat"] },
  { id: "sudden_severe_headache", label: "Sudden, worst-ever headache (peaked within seconds)", group: "neuro", watch: [], redFlag: true },
  { id: "dizziness", label: "Dizziness or light-headedness", group: "neuro", watch: [] },
  { id: "fainting", label: "Fainted or blacked out", group: "neuro", watch: [], redFlag: true },
  { id: "confusion", label: "New confusion or hard to rouse", group: "neuro", watch: [], redFlag: true },
  { id: "seizure", label: "Seizure or fit", group: "neuro", watch: [], redFlag: true },
  { id: "neck_stiffness", label: "Stiff neck — cannot put chin to chest", group: "neuro", watch: [], redFlag: true },
  { id: "light_sensitivity", label: "Light hurts the eyes", group: "neuro", watch: [] },
  { id: "face_droop", label: "One side of the face has dropped", group: "neuro", watch: [], redFlag: true },
  { id: "one_sided_weakness", label: "Sudden weakness in one arm or leg", group: "neuro", watch: [], redFlag: true },
  { id: "speech_difficulty", label: "Sudden slurred or muddled speech", group: "neuro", watch: [], redFlag: true },
  { id: "sudden_vision_loss", label: "Sudden loss or blurring of vision", group: "neuro", watch: [], redFlag: true },
  { id: "numbness", label: "Numbness or pins and needles", group: "neuro", watch: [] },

  // Chest and breathing
  { id: "chest_pain", label: "Chest pain, pressure or tightness", group: "cardioresp", watch: [], redFlag: true },
  { id: "pain_radiating", label: "Pain spreading to the arm, jaw, neck or back", group: "cardioresp", watch: [], redFlag: true },
  { id: "shortness_of_breath", label: "Short of breath", group: "cardioresp", watch: ["Breathlessness while sitting still, or unable to finish a sentence"], redFlag: true },
  { id: "rapid_breathing", label: "Breathing much faster than usual", group: "cardioresp", watch: [], redFlag: true },
  { id: "wheeze", label: "Wheezing", group: "cardioresp", watch: [] },
  { id: "cough", label: "Cough", group: "cardioresp", watch: ["A cough that is still there after 3 weeks"] },
  { id: "coughing_blood", label: "Coughing up blood", group: "cardioresp", watch: [], redFlag: true },
  { id: "palpitations", label: "Racing, pounding or irregular heartbeat", group: "cardioresp", watch: [] },
  { id: "leg_swelling", label: "Swelling in one leg", group: "cardioresp", watch: [] },
  { id: "calf_pain", label: "Pain or tenderness in one calf", group: "cardioresp", watch: ["Calf pain joined by breathlessness or chest pain"] },

  // Stomach and bowel
  { id: "nausea", label: "Nausea", group: "gi", watch: [] },
  { id: "vomiting", label: "Vomiting", group: "gi", watch: ["Unable to keep any fluid down for 12 hours"] },
  { id: "vomiting_blood", label: "Vomiting blood or coffee-ground material", group: "gi", watch: [], redFlag: true },
  { id: "diarrhoea", label: "Diarrhoea", group: "gi", watch: ["Diarrhoea lasting more than 7 days, or signs of dehydration"] },
  { id: "abdominal_pain", label: "Stomach or abdominal pain", group: "gi", watch: ["Pain that becomes constant, or a rigid, board-hard abdomen"] },
  { id: "black_stools", label: "Black, tar-like stools", group: "gi", watch: [], redFlag: true },
  { id: "blood_in_stool", label: "Blood in the stool", group: "gi", watch: [] },
  { id: "jaundice", label: "Yellow skin or eyes", group: "gi", watch: [], redFlag: true },

  // Urinary
  { id: "painful_urination", label: "Pain or burning when passing urine", group: "urinary", watch: [] },
  { id: "flank_pain", label: "Pain in the side or lower back, below the ribs", group: "urinary", watch: [] },
  { id: "reduced_urine", label: "Passing much less urine than usual", group: "urinary", watch: [], redFlag: true },
  { id: "blood_in_urine", label: "Blood in the urine", group: "urinary", watch: [] },

  // Skin and allergy
  { id: "rash", label: "Rash", group: "skin", watch: ["A rash that spreads quickly or does not fade when pressed"] },
  { id: "non_blanching_rash", label: "Rash that does NOT fade when pressed with a glass", group: "skin", watch: [], redFlag: true },
  { id: "hives", label: "Raised itchy welts (hives)", group: "skin", watch: [] },
  { id: "facial_swelling", label: "Swelling of the lips, tongue or face", group: "skin", watch: [], redFlag: true },
  { id: "throat_tightness", label: "Tight throat or difficulty swallowing", group: "skin", watch: [], redFlag: true },
  { id: "mottled_skin", label: "Skin pale, blue-ish or blotchy", group: "skin", watch: [], redFlag: true },
  { id: "sweating_clammy", label: "Sweaty and clammy", group: "skin", watch: [] },

  // ENT
  { id: "sore_throat", label: "Sore throat", group: "ent", watch: [] },
  { id: "runny_nose", label: "Runny or blocked nose", group: "ent", watch: [] },
  { id: "earache", label: "Earache", group: "ent", watch: [] },
  { id: "loss_of_smell", label: "Lost sense of smell or taste", group: "ent", watch: [] },

  // Musculoskeletal
  { id: "joint_pain", label: "Joint pain or swelling", group: "msk", watch: [] },
  { id: "back_pain", label: "Back pain", group: "msk", watch: ["Back pain with numbness around the groin, or loss of bladder or bowel control"] },
  { id: "muscle_aches", label: "Aching muscles", group: "msk", watch: [] },

  // Mood
  { id: "low_mood", label: "Low mood most of the day", group: "mental", watch: [] },
  { id: "anxiety", label: "Anxiety that is hard to control", group: "mental", watch: [] },
  { id: "self_harm_thoughts", label: "Thoughts of harming yourself", group: "mental", watch: [], redFlag: true },

  // Other
  { id: "vaginal_bleeding", label: "Unexpected vaginal bleeding", group: "other", watch: [] },
  { id: "new_lump", label: "A new lump anywhere", group: "other", watch: [] },
];

const SYMPTOM_BY_ID = new Map(SYMPTOMS.map((item) => [item.id, item]));

export function getSymptom(id) {
  return SYMPTOM_BY_ID.get(id) || null;
}

export function symptomsInGroup(groupId) {
  return SYMPTOMS.filter((item) => item.group === groupId);
}

/* -------------------------------------------------------------------------- */
/* Red-flag rules                                                             */
/* -------------------------------------------------------------------------- */

/**
 * A rule matches when every clause it declares is satisfied:
 *   all             every listed symptom is selected
 *   any / anyCount  at least `anyCount` (default 1) of the listed symptoms
 *   risk            every listed risk factor is ticked
 *   minSeverity     overall severity is at least this band
 *   minDurationDays / maxDurationDays   inclusive bounds on how long it has run
 *   minAgeYears / maxAgeYears           inclusive bounds on age
 */
export const RED_FLAG_RULES = [
  {
    id: "anaphylaxis",
    level: "emergency",
    title: "Possible anaphylaxis — the airway may be closing",
    any: ["throat_tightness", "facial_swelling"],
    why: "Swelling of the lips, tongue or throat can shut the airway within minutes. This is treated as an emergency regardless of how mild it feels at the start.",
  },
  {
    id: "stroke_fast",
    level: "emergency",
    title: "FAST stroke signs",
    any: ["face_droop", "one_sided_weakness", "speech_difficulty", "sudden_vision_loss"],
    why: "Face droop, arm weakness, speech trouble and sudden visual loss are the FAST signs. Stroke treatment is time-limited, so the call is made on the signs alone without waiting to see if they settle.",
  },
  {
    id: "acs_chest_pain",
    level: "emergency",
    title: "Chest pain with features of a heart attack",
    all: ["chest_pain"],
    any: ["pain_radiating", "sweating_clammy", "shortness_of_breath", "nausea"],
    why: "Chest pain combined with radiation to the arm or jaw, sweating, breathlessness or nausea is the classic acute coronary syndrome pattern.",
  },
  {
    id: "chest_pain_any",
    level: "emergency",
    title: "New chest pain",
    all: ["chest_pain"],
    why: "New chest pain, pressure or tightness that lasts more than about 15 minutes is treated as cardiac until proven otherwise. It cannot be ruled out from a description.",
  },
  {
    id: "severe_breathlessness",
    level: "emergency",
    title: "Severe breathlessness",
    all: ["shortness_of_breath"],
    minSeverity: "severe",
    why: "Breathlessness severe enough to stop normal activity, or that leaves you unable to finish a sentence, needs assessment immediately.",
  },
  {
    id: "meningitis_pair",
    level: "emergency",
    title: "Fever with neck stiffness",
    all: ["fever", "neck_stiffness"],
    why: "Fever plus a neck too stiff to put chin to chest is the classic meningitis pairing, particularly alongside light sensitivity.",
  },
  {
    id: "non_blanching_rash",
    level: "emergency",
    title: "Rash that does not fade under pressure",
    all: ["non_blanching_rash"],
    why: "A rash that stays visible when a glass is pressed against it can mean bleeding under the skin, which is a sign of meningococcal disease.",
  },
  {
    id: "thunderclap",
    level: "emergency",
    title: "Thunderclap headache",
    all: ["sudden_severe_headache"],
    why: "A headache that reaches maximum intensity within about a minute is treated as a possible bleed around the brain until a scan says otherwise.",
  },
  {
    id: "seizure",
    level: "emergency",
    title: "Seizure",
    all: ["seizure"],
    why: "A first seizure, or one lasting more than 5 minutes, needs emergency assessment.",
  },
  {
    id: "new_confusion",
    level: "emergency",
    title: "New confusion or reduced consciousness",
    all: ["confusion"],
    why: "A sudden change in alertness or orientation is a warning sign across infection, stroke, low blood sugar and drug effects.",
  },
  {
    id: "haematemesis",
    level: "emergency",
    title: "Vomiting blood",
    all: ["vomiting_blood"],
    why: "Blood or coffee-ground material in vomit indicates bleeding in the upper gut and can deteriorate quickly.",
  },
  {
    id: "sepsis_screen",
    level: "emergency",
    title: "Fever with sepsis warning signs",
    all: ["fever"],
    any: ["confusion", "rapid_breathing", "reduced_urine", "mottled_skin"],
    anyCount: 2,
    why: "Confusion, fast breathing, passing little urine and mottled skin are the sepsis screening signs. Two or more alongside fever is the trigger to be seen immediately.",
  },
  {
    id: "infant_fever",
    level: "emergency",
    title: "Fever in a baby under 3 months",
    all: ["fever"],
    maxAgeYears: 0.25,
    why: "Any fever in a baby under three months old is assessed in hospital — infants show very few other signs before deteriorating.",
  },
  {
    id: "anticoagulant_head_injury",
    level: "emergency",
    title: "Head injury while on a blood thinner",
    risk: ["blood_thinner", "recent_head_injury"],
    why: "Anticoagulants make a slow bleed inside the skull far more likely, and it can appear hours or days after the knock.",
  },
  {
    id: "self_harm",
    level: "emergency",
    title: "Thoughts of self-harm",
    all: ["self_harm_thoughts"],
    why: "Contact a crisis line or emergency services now, and try not to be alone. This is treated as an emergency whatever else is on the list.",
  },
  {
    id: "pe_pattern",
    level: "emergency",
    title: "Calf pain with breathlessness",
    all: ["calf_pain"],
    any: ["shortness_of_breath", "chest_pain"],
    why: "A painful calf together with breathlessness or chest pain is the pattern of a clot that has moved to the lungs.",
  },

  {
    id: "breathless_any",
    level: "urgent",
    title: "Breathlessness",
    all: ["shortness_of_breath"],
    why: "New or worsening breathlessness needs to be assessed the same day even when it feels manageable.",
  },
  {
    id: "tachypnoea",
    level: "urgent",
    title: "Breathing much faster than usual",
    all: ["rapid_breathing"],
    why: "A raised breathing rate is the single earliest sign that someone is deteriorating, and it appears before blood pressure or alertness change.",
  },
  {
    id: "mottled_skin",
    level: "urgent",
    title: "Pale, blue-ish or blotchy skin",
    all: ["mottled_skin"],
    why: "Mottled or blue-tinged skin means the circulation is not delivering enough oxygen to the surface.",
  },
  {
    id: "haemoptysis",
    level: "urgent",
    title: "Coughing up blood",
    all: ["coughing_blood"],
    why: "Blood in what you cough up always needs examining, whatever the amount.",
  },
  {
    id: "melaena",
    level: "urgent",
    title: "Black, tar-like stools",
    all: ["black_stools"],
    why: "Black tarry stool is digested blood from the upper gut.",
  },
  {
    id: "neutropenic_sepsis",
    level: "urgent",
    title: "Fever while immunosuppressed",
    all: ["fever"],
    risk: ["immunosuppressed"],
    why: "If chemotherapy, a transplant or high-dose steroids have suppressed the immune system, any fever is treated as a possible neutropenic sepsis and assessed straight away.",
  },
  {
    id: "post_op_fever",
    level: "urgent",
    title: "Fever after recent surgery",
    all: ["fever"],
    risk: ["recent_surgery"],
    why: "A fever within 30 days of surgery or a hospital stay raises the question of a wound, chest or line infection.",
  },
  {
    id: "pregnancy_bleeding",
    level: "urgent",
    title: "Bleeding in pregnancy",
    all: ["vaginal_bleeding"],
    risk: ["pregnant"],
    why: "Any bleeding during pregnancy or shortly after birth is assessed by a maternity unit rather than waited out.",
  },
  {
    id: "pregnancy_abdo",
    level: "urgent",
    title: "Abdominal pain in pregnancy",
    all: ["abdominal_pain"],
    risk: ["pregnant"],
    minSeverity: "moderate",
    why: "Abdominal pain during pregnancy or just after birth is assessed by a maternity unit.",
  },
  {
    id: "dvt_pattern",
    level: "urgent",
    title: "Swollen, painful calf",
    all: ["calf_pain", "leg_swelling"],
    why: "Pain and swelling in one calf is the pattern of a deep vein clot, especially after a long flight, a long drive or a period of immobility.",
  },
  {
    id: "syncope",
    level: "urgent",
    title: "Blackout or faint",
    all: ["fainting"],
    why: "Losing consciousness needs a heart rhythm and blood pressure check, particularly if it happened without warning or during exertion.",
  },
  {
    id: "severe_abdo",
    level: "urgent",
    title: "Severe abdominal pain",
    all: ["abdominal_pain"],
    minSeverity: "severe",
    why: "Severe stomach pain covers appendicitis, obstruction, gallbladder and pancreatic causes that need examining rather than describing.",
  },
  {
    id: "jaundice",
    level: "urgent",
    title: "Yellow skin or eyes",
    all: ["jaundice"],
    why: "New jaundice points at the liver, gallbladder or blood and is investigated promptly.",
  },
  {
    id: "pyelonephritis",
    level: "urgent",
    title: "Fever with flank pain",
    all: ["fever", "flank_pain"],
    why: "Fever together with pain in the side under the ribs suggests the infection has reached a kidney.",
  },
  {
    id: "child_dehydration",
    level: "urgent",
    title: "Vomiting or diarrhoea in a young child",
    any: ["vomiting", "diarrhoea"],
    maxAgeYears: 5,
    minDurationDays: 2,
    why: "Small children lose fluid far faster than adults, so two days of vomiting or diarrhoea under the age of five is assessed rather than waited out.",
  },
  {
    id: "cauda_equina_watch",
    level: "urgent",
    title: "Severe back pain",
    all: ["back_pain"],
    minSeverity: "severe",
    why: "Severe back pain is examined for nerve compression, especially with numbness around the groin or any change in bladder or bowel control.",
  },

  {
    id: "persistent_fever",
    level: "sameDay",
    title: "Fever lasting 5 days or more",
    all: ["fever"],
    minDurationDays: 5,
    why: "Most viral fevers settle within about five days, so a longer one is looked at.",
  },
  {
    id: "older_adult_fever",
    level: "sameDay",
    title: "Fever at 65 or over",
    all: ["fever"],
    minAgeYears: 65,
    why: "Older adults often run infections without the usual signs, so fever is followed up sooner.",
  },
  {
    id: "dehydration_risk",
    level: "sameDay",
    title: "Three or more days of vomiting or diarrhoea",
    any: ["vomiting", "diarrhoea"],
    minDurationDays: 3,
    why: "By day three the main risk is dehydration and salt loss rather than the bug itself.",
  },
  {
    id: "blood_in_stool",
    level: "sameDay",
    title: "Blood in the stool",
    all: ["blood_in_stool"],
    why: "Visible rectal bleeding is checked rather than assumed to be piles.",
  },
  {
    id: "blood_in_urine",
    level: "sameDay",
    title: "Blood in the urine",
    all: ["blood_in_urine"],
    why: "Visible blood in urine is always investigated, even when it happens once and then stops.",
  },
  {
    id: "uti_with_fever",
    level: "sameDay",
    title: "Fever with painful urination",
    all: ["fever", "painful_urination"],
    why: "A urine infection that has produced a fever usually needs treatment rather than fluids alone.",
  },
  {
    id: "reduced_urine",
    level: "sameDay",
    title: "Passing much less urine",
    all: ["reduced_urine"],
    why: "A big drop in urine output is a sign of dehydration or of the kidneys struggling.",
  },
  {
    id: "three_week_cough",
    level: "sameDay",
    title: "Cough lasting 3 weeks or more",
    all: ["cough"],
    minDurationDays: 21,
    why: "Three weeks is the standard threshold for a chest X-ray referral.",
  },
  {
    id: "weight_loss",
    level: "sameDay",
    title: "Unexplained weight loss for 3 weeks or more",
    all: ["unintended_weight_loss"],
    minDurationDays: 21,
    why: "Losing weight without trying, kept up over weeks, is on the urgent referral criteria.",
  },
  {
    id: "night_sweats",
    level: "sameDay",
    title: "Drenching night sweats for 3 weeks or more",
    all: ["night_sweats"],
    minDurationDays: 21,
    why: "Persistent soaking night sweats are investigated alongside weight loss and fever.",
  },
  {
    id: "new_lump",
    level: "sameDay",
    title: "A new lump",
    all: ["new_lump"],
    why: "Any new lump is examined so it can either be dismissed or referred, rather than watched at home.",
  },
  {
    id: "diabetes_unwell",
    level: "sameDay",
    title: "Diabetes with an acute illness",
    risk: ["diabetes"],
    any: ["vomiting", "fever", "confusion"],
    why: "Illness pushes blood glucose and ketones around, so sick-day rules and a same-day check apply.",
  },
  {
    id: "palpitations",
    level: "sameDay",
    title: "Noticeable palpitations",
    all: ["palpitations"],
    minSeverity: "moderate",
    why: "A racing or irregular heartbeat that interferes with normal activity needs a rhythm trace.",
  },
  {
    id: "low_mood_two_weeks",
    level: "sameDay",
    title: "Low mood for 2 weeks or more",
    all: ["low_mood"],
    minDurationDays: 14,
    why: "Two weeks of persistent low mood is the point at which depression is assessed and treated rather than waited out.",
  },
  {
    id: "cardiopulmonary_history",
    level: "sameDay",
    title: "Chest or breathing symptom with known heart or lung disease",
    risk: ["heart_lung_disease"],
    any: ["cough", "wheeze", "palpitations", "leg_swelling"],
    why: "In someone with existing heart or lung disease these are the usual first signs of an exacerbation.",
  },
  {
    id: "travel_leg",
    level: "sameDay",
    title: "Leg symptom after immobility",
    risk: ["long_travel"],
    any: ["leg_swelling", "calf_pain"],
    why: "A long flight, a long drive or bed rest raises the chance that a swollen or painful leg is a clot.",
  },

  {
    id: "chronic_headache",
    level: "routine",
    title: "Headache lasting 2 weeks or more",
    all: ["headache"],
    minDurationDays: 14,
    why: "A headache that has run for a fortnight is worth a proper look rather than more painkillers.",
  },
  {
    id: "chronic_joint_pain",
    level: "routine",
    title: "Joint pain lasting 6 weeks or more",
    all: ["joint_pain"],
    minDurationDays: 42,
    why: "Six weeks of joint pain and swelling is the referral threshold for inflammatory arthritis.",
  },
];

/* -------------------------------------------------------------------------- */
/* Matching                                                                   */
/* -------------------------------------------------------------------------- */

function ruleMatches(rule, ctx) {
  if (rule.all && !rule.all.every((id) => ctx.symptoms.has(id))) return false;
  if (rule.any) {
    const need = rule.anyCount || 1;
    const hits = rule.any.filter((id) => ctx.symptoms.has(id)).length;
    if (hits < need) return false;
  }
  if (rule.risk && !rule.risk.every((id) => ctx.risks.has(id))) return false;
  if (rule.minSeverity) {
    const need = SEVERITY_BY_KEY.get(rule.minSeverity);
    if (!need || ctx.severity.rank < need.rank) return false;
  }
  if (typeof rule.minDurationDays === "number" && ctx.durationDays < rule.minDurationDays) return false;
  if (typeof rule.maxDurationDays === "number" && ctx.durationDays > rule.maxDurationDays) return false;
  if (typeof rule.minAgeYears === "number" && ctx.ageYears < rule.minAgeYears) return false;
  if (typeof rule.maxAgeYears === "number" && ctx.ageYears >= rule.maxAgeYears) return false;
  return true;
}

/** Band used when no red-flag rule matches: severity crossed with duration. */
export function baselineBand(severityKey, durationDays) {
  const severity = SEVERITY_BY_KEY.get(severityKey);
  if (!severity) return null;
  if (severity.rank === 3) {
    return { key: "sameDay", why: "Severe symptoms that stop normal activity are checked the same day even without a specific red flag." };
  }
  if (severity.rank === 2) {
    if (durationDays >= 14) {
      return { key: "sameDay", why: "Moderate symptoms that have not settled in two weeks are followed up rather than waited out." };
    }
    if (durationDays >= 4) {
      return { key: "routine", why: "Moderate symptoms running past the fourth day are worth an ordinary appointment." };
    }
    return { key: "selfCare", why: "Moderate symptoms in the first few days are usually managed at home while you watch for the warning signs." };
  }
  if (durationDays >= 21) {
    return { key: "routine", why: "Even mild symptoms deserve a look once they have run for three weeks." };
  }
  return { key: "selfCare", why: "Mild, short-lived symptoms are usually managed at home while you watch for the warning signs." };
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * @param {object} input
 * @param {string[]} input.symptomIds   ids from SYMPTOMS
 * @param {number}   input.ageYears     0 .. 130
 * @param {number}   input.durationDays 0 .. 3650
 * @param {string}   input.severity     'mild' | 'moderate' | 'severe'
 * @param {string[]} [input.riskFactorIds] ids from RISK_FACTORS
 * @returns {{error:string}|object}
 */
export function assessSymptoms(input) {
  const source = input && typeof input === "object" ? input : {};

  const rawSymptoms = Array.isArray(source.symptomIds) ? source.symptomIds : [];
  if (rawSymptoms.length === 0) {
    return { error: "Select at least one symptom before running the check." };
  }
  const unknown = rawSymptoms.filter((id) => !SYMPTOM_BY_ID.has(id));
  if (unknown.length > 0) {
    return { error: `Unknown symptom: ${unknown.join(", ")}.` };
  }

  const rawRisks = Array.isArray(source.riskFactorIds) ? source.riskFactorIds : [];
  const unknownRisk = rawRisks.filter((id) => !RISK_BY_ID.has(id));
  if (unknownRisk.length > 0) {
    return { error: `Unknown risk factor: ${unknownRisk.join(", ")}.` };
  }

  const ageYears = Number(source.ageYears);
  if (!Number.isFinite(ageYears) || ageYears < 0 || ageYears > MAX_AGE_YEARS) {
    return { error: `Age must be a number between 0 and ${MAX_AGE_YEARS} years.` };
  }

  const durationDays = Number(source.durationDays);
  if (!Number.isFinite(durationDays) || durationDays < 0 || durationDays > MAX_DURATION_DAYS) {
    return { error: `Duration must be a number of days between 0 and ${MAX_DURATION_DAYS}.` };
  }

  const severity = SEVERITY_BY_KEY.get(source.severity);
  if (!severity) {
    return { error: "Severity must be one of: mild, moderate, severe." };
  }

  const ctx = {
    symptoms: new Set(rawSymptoms),
    risks: new Set(rawRisks),
    severity,
    durationDays,
    ageYears,
  };

  const firedRules = RED_FLAG_RULES.filter((rule) => ruleMatches(rule, ctx)).map((rule) => ({
    id: rule.id,
    title: rule.title,
    why: rule.why,
    level: rule.level,
    levelLabel: LEVEL_BY_KEY.get(rule.level).label,
    rank: LEVEL_BY_KEY.get(rule.level).rank,
  }));
  firedRules.sort((a, b) => (b.rank - a.rank) || a.id.localeCompare(b.id));

  const baseline = baselineBand(severity.key, durationDays);
  let level = LEVEL_BY_KEY.get(baseline.key);
  for (const rule of firedRules) {
    level = higherLevel(level, LEVEL_BY_KEY.get(rule.level));
  }

  const escalations = [];
  if (ageYears < 1) {
    const next = escalate(level, "sameDay");
    if (next.key !== level.key) {
      escalations.push("Under 1 year old: babies are assessed sooner because they show fewer warning signs before deteriorating.");
      level = next;
    }
  } else if (ageYears >= 75) {
    const next = escalate(level, "sameDay");
    if (next.key !== level.key) {
      escalations.push("Aged 75 or over: illness is followed up sooner because the usual signs are often blunted.");
      level = next;
    }
  }
  if (ctx.risks.has("immunosuppressed")) {
    const next = escalate(level, "sameDay");
    if (next.key !== level.key) {
      escalations.push("Immunosuppressed: a suppressed immune system removes the usual margin for waiting.");
      level = next;
    }
  }

  const selected = rawSymptoms
    .map((id) => SYMPTOM_BY_ID.get(id))
    .slice()
    .sort((a, b) => a.label.localeCompare(b.label));

  const watchSet = [];
  for (const symptom of selected) {
    for (const item of symptom.watch) {
      if (!watchSet.includes(item)) watchSet.push(item);
    }
  }
  for (const item of GENERAL_WATCH) {
    if (!watchSet.includes(item)) watchSet.push(item);
  }

  const redFlagsSelected = selected.filter((item) => item.redFlag === true).map((item) => item.label);

  const risks = rawRisks.map((id) => RISK_BY_ID.get(id).label);

  return {
    level: {
      key: level.key,
      label: level.label,
      action: level.action,
      timeframe: level.timeframe,
      tone: level.tone,
      rank: level.rank,
    },
    baseline: {
      key: baseline.key,
      label: LEVEL_BY_KEY.get(baseline.key).label,
      why: baseline.why,
    },
    firedRules,
    escalations,
    selected: selected.map((item) => ({ id: item.id, label: item.label, group: item.group })),
    redFlagsSelected,
    riskFactors: risks,
    ageYears,
    durationDays,
    severity: { key: severity.key, label: severity.label },
    watchFor: watchSet,
    questions: CLINICIAN_QUESTIONS,
    disclaimer: DISCLAIMER,
  };
}

const GENERAL_WATCH = [
  "Any of the emergency signs on this page appearing later — chest pain, breathlessness, confusion, a stiff neck, a rash that does not fade, or a face or limb that stops working",
  "Symptoms that were improving and then start getting worse again",
  "Being unable to keep fluids down, or passing much less urine than usual",
];

const CLINICIAN_QUESTIONS = [
  "What is the most likely explanation, and what else is still on the list?",
  "What would need to happen for me to come back sooner?",
  "Are any of my regular medicines making this worse or masking it?",
  "If this is a wait-and-see plan, how long should I wait before it counts as too long?",
];

export const DISCLAIMER =
  "This is a triage aid, not a diagnosis. It maps what you describe onto published warning-sign rules to suggest how quickly to be seen. It cannot examine you, cannot see your history and does not know your test results. If you feel something is seriously wrong, act on that regardless of what this page says.";

/**
 * Plain-text handover you can read out to a clinician or paste into a message.
 * Deterministic: built entirely from the assessment, no clock, no randomness.
 */
export function buildHandover(assessment) {
  if (!assessment || assessment.error) return "";
  const lines = [];
  lines.push("SYMPTOM SUMMARY");
  lines.push("");
  lines.push(`Age: ${formatAge(assessment.ageYears)}`);
  lines.push(`Running for: ${formatDuration(assessment.durationDays)}`);
  lines.push(`Overall severity: ${assessment.severity.label}`);
  lines.push("");
  lines.push("Symptoms:");
  for (const item of assessment.selected) lines.push(`  - ${item.label}`);
  if (assessment.riskFactors.length > 0) {
    lines.push("");
    lines.push("Relevant background:");
    for (const item of assessment.riskFactors) lines.push(`  - ${item}`);
  }
  lines.push("");
  lines.push(`Suggested urgency: ${assessment.level.label} — ${assessment.level.action} (${assessment.level.timeframe})`);
  if (assessment.firedRules.length > 0) {
    lines.push("");
    lines.push("Warning-sign rules that matched:");
    for (const rule of assessment.firedRules) {
      lines.push(`  - [${rule.levelLabel}] ${rule.title}`);
    }
  } else {
    lines.push("");
    lines.push(`No warning-sign rule matched. Band comes from severity and duration: ${assessment.baseline.why}`);
  }
  if (assessment.escalations.length > 0) {
    lines.push("");
    lines.push("Adjustments applied:");
    for (const item of assessment.escalations) lines.push(`  - ${item}`);
  }
  lines.push("");
  lines.push("Generated by a rule-based triage aid. Not a diagnosis.");
  return lines.join("\n");
}

export function formatAge(ageYears) {
  if (!Number.isFinite(ageYears) || ageYears < 0) return "unknown";
  if (ageYears < 1) {
    const months = Math.round(ageYears * 12);
    return months <= 1 ? "under 1 month" : `about ${months} months`;
  }
  const whole = Math.floor(ageYears);
  return `${whole} year${whole === 1 ? "" : "s"}`;
}

export function formatDuration(days) {
  if (!Number.isFinite(days) || days < 0) return "unknown";
  if (days === 0) return "started today";
  if (days === 1) return "1 day";
  if (days < 14) return `${days} days`;
  if (days < 60) {
    const weeks = Math.floor(days / 7);
    return `${days} days (about ${weeks} weeks)`;
  }
  const months = Math.floor(days / 30);
  return `${days} days (about ${months} months)`;
}
