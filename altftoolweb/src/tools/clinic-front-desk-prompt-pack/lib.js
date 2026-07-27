/**
 * Clinic Front Desk Prompt Pack — administrative prompt library, a pure template
 * engine, an SMS segment counter and a screen for language a front desk should not
 * put in a patient message.
 *
 * Administrative only. Nothing here is clinical guidance and no export decides
 * anything about a patient's care.
 *
 * No React, no JSX, no DOM. Every export is deterministic: same input -> same output.
 */

/** Placeholder syntax, kept as a source string so callers build their own RegExp. */
export const PLACEHOLDER_SOURCE = "\\{\\{\\s*([a-zA-Z0-9_]+)\\s*\\}\\}";

/** ~4 characters per token of English prose — the vendor rule of thumb for sizing a prompt. */
export const CHARS_PER_TOKEN = 4;

/** Past this estimate a prompt starts to crowd an 8K-token context window. */
export const LONG_PROMPT_TOKENS = 700;

/**
 * GSM 03.38 basic character set. A message using only these characters is sent
 * with 7-bit encoding: 160 characters in a single SMS, 153 per part once the
 * message is concatenated (7 of the 160 septets go to the UDH header).
 */
const GSM_BASIC_CHARS =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";

/**
 * GSM 03.38 extension table. These are legal in a 7-bit message but each one is
 * transmitted as an escape plus the character, so it costs two septets.
 */
const GSM_EXTENDED_CHARS = "^{}\\[~]|€";

const GSM_BASIC_SET = new Set(Array.from(GSM_BASIC_CHARS));
const GSM_EXTENDED_SET = new Set(Array.from(GSM_EXTENDED_CHARS));

/** 3GPP TS 23.038 / 23.040 segment sizes. */
export const SMS_LIMITS = {
  gsm: { single: 160, concatenated: 153 },
  ucs2: { single: 70, concatenated: 67 },
};

/**
 * FCC Declaratory Ruling of 10 July 2015 on the Telephone Consumer Protection Act:
 * certain healthcare messages (appointment reminders, pre-operative instructions,
 * prescription notifications) may be sent to a wireless number without prior
 * express consent only within strict limits — free to the end user, one message
 * per day, no more than three per week per recipient, and each one must offer an
 * easy way to opt out. Marketing, billing and debt-collection messages get no such
 * exemption and need consent.
 */
export const HEALTHCARE_SMS_MAX_PER_DAY = 1;
export const HEALTHCARE_SMS_MAX_PER_WEEK = 3;

/**
 * HHS guidance on the HIPAA Privacy Rule treats appointment reminders as part of
 * treatment, so they may be sent without a separate authorisation — but the
 * minimum necessary standard at 45 CFR 164.502(b) still applies, which is why the
 * reason for the visit, the department and any test result belong in the record
 * rather than in an SMS or a voicemail.
 */
export const VOICEMAIL_SAFE_FIELDS = [
  "The practice name and a call-back number",
  "That there is an appointment, with its date and time",
  "A request to call back",
];

/**
 * Language a non-clinical front desk should not send. Two kinds:
 *  - "Clinical advice": only a clinician may give it, whatever the intention.
 *  - "Sensitive detail": identifiable clinical information that does not belong in
 *    an unsecured SMS or a voicemail that anyone in the household may hear.
 * Whole-phrase, case-insensitive matching. A drafting screen, not compliance sign-off.
 */
export const RISKY_FRONT_DESK_PHRASES = [
  {
    phrase: "you should take",
    kind: "Clinical advice",
    why: "Directing a medication or a dose is a clinical decision, not a front-desk one.",
    instead: "\"I will pass this to the nurse and someone will call you back today.\"",
  },
  {
    phrase: "stop taking",
    kind: "Clinical advice",
    why: "Telling a patient to stop a medicine can cause direct harm.",
    instead: "Escalate to the prescribing clinician and tell the patient when to expect the call.",
  },
  {
    phrase: "increase your dose",
    kind: "Clinical advice",
    why: "Dose changes belong to the prescriber.",
    instead: "Book a medication review and say when it is.",
  },
  {
    phrase: "double the dose",
    kind: "Clinical advice",
    why: "Same reason, and a common source of accidental overdose.",
    instead: "Escalate; do not repeat a dose instruction from memory.",
  },
  {
    phrase: "take ibuprofen",
    kind: "Clinical advice",
    why: "Naming a specific drug is prescribing, even when it is sold over the counter.",
    instead: "Offer the earliest appointment and the practice's out-of-hours number.",
  },
  {
    phrase: "take paracetamol",
    kind: "Clinical advice",
    why: "Same problem — the front desk does not know the patient's other medicines.",
    instead: "Escalate to a clinician.",
  },
  {
    phrase: "you probably have",
    kind: "Clinical advice",
    why: "That is a diagnosis, however hedged.",
    instead: "\"I cannot say what it is, but I can get you seen — the next slot is …\"",
  },
  {
    phrase: "sounds like you have",
    kind: "Clinical advice",
    why: "Also a diagnosis, and patients act on it.",
    instead: "Record the symptoms verbatim and pass them to triage.",
  },
  {
    phrase: "nothing to worry about",
    kind: "Clinical advice",
    why: "Reassurance about symptoms is a clinical judgement and can delay care.",
    instead: "\"I am not able to judge that — let me get you a clinician.\"",
  },
  {
    phrase: "no need to come in",
    kind: "Clinical advice",
    why: "Deciding a patient does not need to be seen is triage.",
    instead: "Offer the appointment and let the clinician stand it down.",
  },
  {
    phrase: "you don't need to be seen",
    kind: "Clinical advice",
    why: "Same decision, phrased as reassurance.",
    instead: "Book it, then let triage decide.",
  },
  {
    phrase: "test results",
    kind: "Sensitive detail",
    why: "Results content in an SMS or voicemail exceeds the minimum necessary for a reminder.",
    instead: "\"Please call the practice about a recent appointment.\"",
  },
  {
    phrase: "biopsy",
    kind: "Sensitive detail",
    why: "Names the procedure to anyone who sees the notification.",
    instead: "Give the date and time and leave the reason out.",
  },
  {
    phrase: "hiv",
    kind: "Sensitive detail",
    why: "Highly sensitive and, in several jurisdictions, subject to extra confidentiality rules.",
    instead: "Ask the patient to call; say nothing about the subject.",
  },
  {
    phrase: "pregnancy test",
    kind: "Sensitive detail",
    why: "A household member may read the message before the patient does.",
    instead: "Neutral wording: \"an appointment on Tuesday at 10:15\".",
  },
  {
    phrase: "psychiatry",
    kind: "Sensitive detail",
    why: "Naming a mental health service in a reminder discloses more than the reminder needs.",
    instead: "\"Your appointment with Dr Rao\" without the department.",
  },
  {
    phrase: "oncology",
    kind: "Sensitive detail",
    why: "The department name alone can disclose a diagnosis.",
    instead: "Use the clinician's name and the location only.",
  },
  {
    phrase: "termination",
    kind: "Sensitive detail",
    why: "Discloses the reason for the visit to anyone with the handset.",
    instead: "Keep the reason in the record, not in the message.",
  },
  {
    phrase: "detox",
    kind: "Sensitive detail",
    why: "Discloses substance-use treatment, which many jurisdictions protect more strictly.",
    instead: "Give date, time and place only.",
  },
  {
    phrase: "overdue balance",
    kind: "Sensitive detail",
    why: "Billing and collection messages do not get the healthcare exemption from consent rules and should not ride along with a clinical reminder.",
    instead: "Send billing separately, to a number the patient consented to for billing.",
  },
];

/** Words that count as an opt-out instruction in a bulk reminder. */
const OPT_OUT_MARKERS = ["reply stop", "text stop", "send stop", "reply quit", "opt out", "opt-out", "unsubscribe"];

/** The prompt library. Administrative work only. */
export const PROMPTS = [
  {
    id: "appointment-reminder-sms",
    title: "Appointment reminder SMS",
    category: "Reminders",
    goal: "Fit the date, time, place and opt-out into one SMS segment without naming the reason for the visit.",
    tags: ["reminder", "sms", "appointment", "confirm"],
    tip: "Date, time, place, what to bring, opt-out. Nothing about why.",
    variables: [
      { key: "practice", label: "Practice name (short)", placeholder: "Riverside Clinic" },
      { key: "slot", label: "Date and time", placeholder: "Tue 5 Aug, 10:15" },
      { key: "bring", label: "What to bring or do", placeholder: "arrive 10 min early, bring your ID card" },
      { key: "reply", label: "How to confirm or cancel", placeholder: "reply Y to confirm, call 080-4455 6677 to change" },
    ],
    template: `Write appointment reminder text messages for a clinic front desk.

Practice name: {{practice}}
Date and time: {{slot}}
What to bring or do: {{bring}}
How to confirm or cancel: {{reply}}

Constraints:
- Never name the reason for the visit, the department, the condition or any test. Date, time, place and instructions only.
- Keep each message under 160 characters including the opt-out, using plain GSM characters — no emoji, no smart quotes, no en dashes.
- Include an opt-out instruction in every message that goes out in bulk.
- Do not give any clinical instruction beyond {{bring}}, and do not answer medical questions in the reminder.

Give me: a 7-day-before version, a 24-hour version and a 2-hour version, each with its character count. Then a version for a patient who has already cancelled once, and a version in simple English at roughly a 6th-grade reading level.

Finally, list anything in my inputs that should not go in an SMS at all, and where it belongs instead.`,
  },
  {
    id: "no-show-followup",
    title: "Missed appointment follow-up",
    category: "Reminders",
    goal: "Rebook a patient who did not turn up without a lecture about it.",
    tags: ["no show", "missed", "rebook", "follow up"],
    tip: "The message that rebooks is shorter than the message that explains the cost of a no-show.",
    variables: [
      { key: "context", label: "What happened", placeholder: "missed a 9:30 slot on Monday, no call, first miss in 14 months" },
      { key: "policy", label: "Your actual policy", placeholder: "no charge for a first miss; third miss in 12 months means we call before booking again" },
      { key: "options", label: "Slots you can offer", placeholder: "Thu 4:15 pm, Fri 8:45 am, or the online booking link" },
      { key: "channel", label: "Channel", placeholder: "SMS first, phone call if no reply in 48 hours" },
    ],
    template: `Write a follow-up for a patient who missed an appointment.

What happened: {{context}}
Our actual policy: {{policy}}
Slots I can offer: {{options}}
Channel: {{channel}}

Lead with the offer to rebook, not with the miss. State {{policy}} once, factually, without implying anything about the patient. Never speculate about why they did not come and never mention the reason for the appointment.

Give me: an SMS under 160 characters, a slightly longer email, and a 30-second phone script including the opening line and one question that surfaces a transport, cost or childcare barrier without prying.

Then tell me which parts of my policy would sound punitive to a patient reading it cold, and how to phrase them so they read as information.`,
  },
  {
    id: "waitlist-offer",
    title: "Cancellation waitlist offer",
    category: "Scheduling",
    goal: "Fill a slot that just opened up before it is wasted.",
    tags: ["waitlist", "cancellation", "slot", "fill"],
    tip: "Whoever replies first gets it — say that up front so nobody feels overlooked.",
    variables: [
      { key: "slot", label: "The slot", placeholder: "tomorrow 11:00 with Dr Menon, 30 minutes" },
      { key: "waitlist", label: "Who is on the list", placeholder: "9 patients flagged as wanting an earlier date" },
      { key: "rule", label: "How you allocate it", placeholder: "first reply wins; we call the two longest-waiting first" },
      { key: "deadline", label: "Reply deadline", placeholder: "reply by 6 pm today or the slot goes back to open booking" },
    ],
    template: `Write a cancellation waitlist offer from a clinic front desk.

The slot: {{slot}}
Who is on the list: {{waitlist}}
How we allocate it: {{rule}}
Reply deadline: {{deadline}}

Write the broadcast message under 160 characters: the date, time, clinician, {{rule}} in four words, and {{deadline}}. Do not mention any patient's condition or why they are waiting.

Then give me the message that goes to whoever replies first, the message that goes to everyone else, and a short internal note for the day sheet.

Also give me the wording for the case where the fastest reply comes from someone whose need is clearly less urgent than a slower replier, so the front desk can be honest about how the slot was allocated without discussing another patient.`,
  },
  {
    id: "triage-escalation-script",
    title: "Escalate a clinical question to a clinician",
    category: "Escalation",
    goal: "Hand a medical question upward quickly, without answering any of it at the desk.",
    tags: ["triage", "escalation", "clinical", "script"],
    tip: "Capture symptoms in the patient's own words; do not summarise them into a diagnosis.",
    variables: [
      { key: "situation", label: "What the patient is asking", placeholder: "caller wants to know if she should keep taking her blood pressure tablet after feeling dizzy" },
      { key: "route", label: "Your escalation route", placeholder: "duty nurse extension 12; if unanswered, practice manager, then the on-call GP line" },
      { key: "timing", label: "What you can promise", placeholder: "call back within 2 hours during clinic hours" },
      { key: "emergency", label: "Emergency instruction", placeholder: "chest pain, breathlessness, fainting or confusion: call emergency services now" },
    ],
    template: `Write a front-desk script for escalating a clinical question.

What the patient is asking: {{situation}}
Our escalation route: {{route}}
What I can promise: {{timing}}
Emergency instruction: {{emergency}}

The script must never answer the clinical question, agree with the patient's own theory, reassure them about symptoms, or comment on any medication.

Give me:
1. The exact words to say in the first fifteen seconds, ending in the honest sentence "I am not able to advise on that".
2. Three questions that capture what a clinician will need, recorded in the patient's own words.
3. The red-flag check based on {{emergency}}, phrased as a question rather than as advice, and what to say if the answer is yes.
4. The escalation note for the clinician: structured, factual, quoting the patient rather than interpreting.
5. The closing lines that set the expectation from {{timing}} and say what to do if nobody has called by then.

Do not include any triage decision, any symptom interpretation, or any suggestion that the problem is or is not serious.`,
  },
  {
    id: "prep-instructions",
    title: "Appointment preparation instructions",
    category: "Appointments",
    goal: "Pass on the clinician's own prep instructions accurately, without adding to them.",
    tags: ["preparation", "instructions", "fasting", "appointment"],
    tip: "Copy the clinician's instruction; never paraphrase a medical one.",
    variables: [
      { key: "instructions", label: "The clinician's instructions, verbatim", placeholder: "nil by mouth from midnight; take usual morning medicines with a sip of water" },
      { key: "logistics", label: "Logistics", placeholder: "report to reception on floor 2 at 7:45 am, bring photo ID and the referral letter" },
      { key: "after", label: "After the appointment", placeholder: "you must not drive; arrange someone to take you home" },
      { key: "contact", label: "Who to ask", placeholder: "day-unit nurse on 080-4455 6690, 8 am to 6 pm" },
    ],
    template: `Turn a clinician's preparation instructions into a clear patient message.

The clinician's instructions, verbatim: {{instructions}}
Logistics: {{logistics}}
After the appointment: {{after}}
Who to ask: {{contact}}

Reproduce {{instructions}} exactly in meaning. Do not add a rule, soften one, or explain the medical reason behind one. If any instruction is ambiguous, do not resolve it — list it as a question for the clinician instead.

Write: a numbered patient handout at roughly a 6th-grade reading level, an SMS pointer under 160 characters that does not name the procedure, and the read-back script the front desk uses on the phone to confirm the patient has understood the timing.

End with a list of every instruction that could be misread, and the exact question I should put back to the clinician about each.`,
  },
  {
    id: "insurance-eligibility",
    title: "Insurance and payment explanation",
    category: "Billing",
    goal: "Explain cover and cost in numbers the patient can plan around.",
    tags: ["insurance", "billing", "cost", "estimate"],
    tip: "An estimate with the assumptions written down beats a number with none.",
    variables: [
      { key: "situation", label: "The patient's situation", placeholder: "policy covers day-care procedures after a 30-day waiting period; admission is on day 26" },
      { key: "numbers", label: "The actual numbers", placeholder: "estimated Rs 42,000 package, Rs 5,000 co-pay, pre-authorisation takes 3 working days" },
      { key: "unknowns", label: "What you genuinely do not know yet", placeholder: "whether the insurer counts the consultation date or the admission date" },
      { key: "next", label: "Next step and owner", placeholder: "we file the pre-auth today; the insurer replies to us, and we call the patient either way" },
    ],
    template: `Write an explanation of insurance cover and cost for a patient.

The situation: {{situation}}
The actual numbers: {{numbers}}
What I genuinely do not know yet: {{unknowns}}
Next step and owner: {{next}}

Put {{numbers}} in a short table with each figure labelled as confirmed or estimated. State {{unknowns}} plainly rather than glossing over it, and say what the answer would change.

Do not guarantee that a claim will be approved, do not advise the patient to change or delay treatment for a financial reason, and do not interpret the policy wording as though it were a decision.

Give me a written version for email, a spoken version for the counter, and the two sentences to use if the patient asks "so will it definitely be covered?".

End with what the patient should ask their insurer directly, and what we will confirm for them.`,
  },
  {
    id: "recall-campaign",
    title: "Routine recall message",
    category: "Reminders",
    goal: "Bring patients back for a due check without naming the condition in the message.",
    tags: ["recall", "review", "due", "campaign"],
    tip: "The reason for the recall belongs in the record, not in the SMS.",
    variables: [
      { key: "recall", label: "What is due", placeholder: "annual review, 340 patients whose last review was over 12 months ago" },
      { key: "how", label: "How to book", placeholder: "online link, or call between 8 am and 11 am when the line is quietest" },
      { key: "window", label: "Booking window", placeholder: "slots released for the next 6 weeks, Tuesday and Thursday mornings" },
      { key: "optout", label: "Opt-out wording", placeholder: "reply STOP to stop reminders from us" },
    ],
    template: `Write a routine recall message for a clinic.

What is due: {{recall}}
How to book: {{how}}
Booking window: {{window}}
Opt-out wording: {{optout}}

Write it so a stranger reading the patient's lock screen learns nothing about their health. Say that something is due and how to book; do not name the condition, the medicine, the department or the test.

Include {{optout}} in every version. Keep the SMS under 160 characters with plain GSM characters only.

Give me: the SMS, an email version with a subject line under 45 characters, and a short voicemail script that says only the practice name, that there is something to book, and the call-back number.

Then list the three reasons a patient might ignore this message and one change to each version that addresses the most likely one.`,
  },
  {
    id: "complaint-acknowledgement",
    title: "Acknowledging a complaint",
    category: "Difficult conversations",
    goal: "Acknowledge quickly, promise only what the process actually allows, and set a real date.",
    tags: ["complaint", "acknowledge", "response", "patient"],
    tip: "An acknowledgement is not an investigation. Send it the same day anyway.",
    variables: [
      { key: "complaint", label: "What the complaint is", placeholder: "waited 70 minutes past the appointment time and was not told why" },
      { key: "known", label: "What you already know", placeholder: "clinic ran late after two emergencies; the waiting-room display was not updated" },
      { key: "process", label: "Your complaints process", placeholder: "practice manager reviews within 5 working days, written response within 20" },
      { key: "immediate", label: "What you can fix now", placeholder: "restarted the waiting-time announcements every 20 minutes" },
    ],
    template: `Write an acknowledgement of a patient complaint.

The complaint: {{complaint}}
What we already know: {{known}}
Our complaints process: {{process}}
What we can fix now: {{immediate}}

Acknowledge the specific experience in the first two sentences, without a general apology for "any inconvenience". State {{process}} with the actual dates it produces from today. Include {{immediate}} as something already done, not something planned.

Do not admit or deny fault about any clinical matter, do not discuss another patient's care as an explanation, and do not include anything from the record that the complainant did not already raise.

Give me: the same-day acknowledgement email, the counter script if they are standing in front of me, and a note of what must be recorded internally today so the later written response is accurate.

Then flag any part of my draft that promises something {{process}} does not actually deliver.`,
  },
  {
    id: "new-patient-intake",
    title: "New patient intake request",
    category: "Records",
    goal: "Collect what registration genuinely needs and nothing beyond it.",
    tags: ["intake", "registration", "forms", "new patient"],
    tip: "Every extra field is another thing to store, secure and eventually delete.",
    variables: [
      { key: "needed", label: "Fields you actually need", placeholder: "name, date of birth, address, phone, email, ID number, insurer and policy number, emergency contact" },
      { key: "why", label: "Why each is needed", placeholder: "identity match, billing, and one contactable person in an emergency" },
      { key: "how", label: "How it is sent and stored", placeholder: "secure portal link, stored in the practice management system, not by email or WhatsApp" },
      { key: "deadline", label: "When you need it", placeholder: "before the first visit; otherwise 15 minutes early to complete it at the desk" },
    ],
    template: `Write a new patient intake request from a clinic front desk.

Fields we actually need: {{needed}}
Why each is needed: {{why}}
How it is sent and stored: {{how}}
When we need it: {{deadline}}

For each field in {{needed}}, give the plain-language reason from {{why}} beside it, and mark any field the patient may leave blank. Challenge any field that is not clearly justified and tell me to drop it.

Say explicitly which channels must not be used to send documents, based on {{how}}, and give the patient one safe route.

Write: the email with the portal link, the SMS pointer under 160 characters that contains no clinical detail, and the desk script for a patient who is not comfortable filling in a form online.

End with the fields I am asking for that a first visit does not require, so I can remove them.`,
  },
  {
    id: "closure-notice",
    title: "Clinic closure or delay notice",
    category: "Announcements",
    goal: "Tell everyone affected what happens to their appointment, in one message.",
    tags: ["closure", "delay", "notice", "announcement"],
    tip: "Patients need one thing: is my appointment still happening.",
    variables: [
      { key: "event", label: "What is happening", placeholder: "clinic closed Friday 8 August, power upgrade in the building" },
      { key: "affected", label: "Who is affected", placeholder: "all 46 appointments booked for Friday" },
      { key: "plan", label: "What happens to their appointment", placeholder: "we rebook everyone to the following week and call each patient by Wednesday" },
      { key: "urgent", label: "What to do if it cannot wait", placeholder: "call the duty line 080-4455 6699; emergencies as always to emergency services" },
    ],
    template: `Write a clinic closure notice.

What is happening: {{event}}
Who is affected: {{affected}}
What happens to their appointment: {{plan}}
What to do if it cannot wait: {{urgent}}

First line answers the only question that matters: is my appointment still happening. Then {{plan}} with dates, then {{urgent}}.

Do not apologise more than once. Do not include the reason before the answer. Do not advise anyone on whether their own need can wait — give {{urgent}} and let them decide.

Give me: an SMS under 160 characters, a notice for the door and the website, and a 20-second voicemail greeting for the closure period.

Then list which patients need an individual phone call rather than a broadcast, using only scheduling facts such as procedure length or the need for a companion — not any clinical judgement.`,
  },
];

export const CATEGORIES = Array.from(new Set(PROMPTS.map((prompt) => prompt.category)));

/** Every distinct {{placeholder}} in a template, in first-appearance order. */
export function extractVariables(template) {
  if (typeof template !== "string" || template === "") return [];
  const pattern = new RegExp(PLACEHOLDER_SOURCE, "g");
  const found = [];
  const seen = new Set();
  let match = pattern.exec(template);
  while (match !== null) {
    const key = match[1];
    if (!seen.has(key)) {
      seen.add(key);
      found.push(key);
    }
    match = pattern.exec(template);
  }
  return found;
}

/** Rough size estimate only — see CHARS_PER_TOKEN. Never negative, never NaN. */
export function estimateTokens(text) {
  if (typeof text !== "string" || text.length === 0) return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}

export function getPrompt(id) {
  return PROMPTS.find((prompt) => prompt.id === id) || null;
}

/** Case-insensitive AND search across title, goal, category and tags. */
export function searchPrompts({ query = "", category = "All" } = {}) {
  const terms = String(query ?? "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return PROMPTS.filter((prompt) => {
    if (category && category !== "All" && prompt.category !== category) return false;
    if (terms.length === 0) return true;
    const haystack = `${prompt.title} ${prompt.goal} ${prompt.category} ${prompt.tags.join(" ")}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

/**
 * Count SMS parts under 3GPP TS 23.038. A message made only of GSM 03.38
 * characters is 7-bit: 160 septets alone, 153 per part when concatenated.
 * Anything outside that alphabet forces UCS-2: 70 characters alone, 67 per part.
 * Extension-table characters (^ { } \ [ ~ ] | €) cost two septets each.
 *
 * @param {string} text The message body.
 * @returns {object} { encoding, units, perSingle, perPart, segments, remaining } or { error }.
 */
export function countSmsSegments(text) {
  if (typeof text !== "string") {
    return { error: "Give the message as text." };
  }

  const characters = Array.from(text);
  let isGsm = true;
  let units = 0;

  for (const character of characters) {
    if (GSM_BASIC_SET.has(character)) {
      units += 1;
    } else if (GSM_EXTENDED_SET.has(character)) {
      units += 2;
    } else {
      isGsm = false;
      break;
    }
  }

  if (!isGsm) {
    // UCS-2 counts UTF-16 code units, so an astral character such as an emoji costs two.
    units = text.length;
  }

  const limits = isGsm ? SMS_LIMITS.gsm : SMS_LIMITS.ucs2;
  const segments = units === 0 ? 0 : units <= limits.single ? 1 : Math.ceil(units / limits.concatenated);
  const capacity = segments <= 1 ? limits.single : segments * limits.concatenated;

  return {
    encoding: isGsm ? "GSM-7" : "UCS-2",
    units,
    perSingle: limits.single,
    perPart: limits.concatenated,
    segments,
    remaining: Math.max(0, capacity - units),
  };
}

const REGEX_SPECIALS = /[.*+?^${}()|[\]\\]/g;

function escapeForRegExp(value) {
  return String(value).replace(REGEX_SPECIALS, "\\$&");
}

/**
 * Screen a patient-facing message for clinical advice a front desk must not give
 * and for identifiable clinical detail that does not belong in an unsecured
 * message. Also reports whether an opt-out instruction is present, which bulk
 * reminder messages need. A drafting aid, not compliance sign-off.
 *
 * @param {string} text The message to screen.
 * @returns {object} { flags, adviceFlags, detailFlags, clean, hasOptOut, checkedPhrases, sms } or { error }.
 */
export function screenFrontDeskMessage(text) {
  if (typeof text !== "string") {
    return { error: "Give the message to screen as text." };
  }

  const haystack = text.toLowerCase();
  const flags = [];

  for (const entry of RISKY_FRONT_DESK_PHRASES) {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeForRegExp(entry.phrase)}([^a-z0-9]|$)`, "i");
    if (pattern.test(haystack)) {
      flags.push(entry);
    }
  }

  return {
    flags,
    adviceFlags: flags.filter((flag) => flag.kind === "Clinical advice"),
    detailFlags: flags.filter((flag) => flag.kind === "Sensitive detail"),
    flagCount: flags.length,
    clean: flags.length === 0,
    hasOptOut: OPT_OUT_MARKERS.some((marker) => haystack.includes(marker)),
    checkedPhrases: RISKY_FRONT_DESK_PHRASES.length,
    sms: countSmsSegments(text),
  };
}

/**
 * Substitute values into a template. A blank or missing value keeps its
 * {{placeholder}} visible and is reported in `missing`.
 */
export function fillPrompt({ template, values } = {}) {
  if (typeof template !== "string" || template.trim() === "") {
    return { error: "Choose a prompt first — there is no template to fill in." };
  }
  if (values !== undefined && (values === null || typeof values !== "object")) {
    return { error: "Variable values must be given as an object of key/value pairs." };
  }

  const supplied = values || {};
  const variables = extractVariables(template);
  const missing = [];
  const pattern = new RegExp(PLACEHOLDER_SOURCE, "g");

  const text = template.replace(pattern, (_whole, key) => {
    const raw = supplied[key];
    const value = raw === undefined || raw === null ? "" : String(raw).trim();
    if (value === "") {
      if (!missing.includes(key)) missing.push(key);
      return `{{${key}}}`;
    }
    return value;
  });

  const estimatedTokens = estimateTokens(text);

  // Screen only what the user typed: the templates quote risky phrases in order
  // to forbid them, so screening the assembled prompt would flag its own rules.
  const suppliedText = variables
    .map((key) => (supplied[key] === undefined || supplied[key] === null ? "" : String(supplied[key])))
    .join(" \n ");
  const screen = screenFrontDeskMessage(suppliedText);

  return {
    text,
    variables,
    missing,
    totalCount: variables.length,
    filledCount: variables.length - missing.length,
    characters: text.length,
    words: countWords(text),
    estimatedTokens,
    isLong: estimatedTokens > LONG_PROMPT_TOKENS,
    screenFlags: screen.flags,
    screenClean: screen.clean,
  };
}
