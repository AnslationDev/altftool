/**
 * Coaching Institute Prompt Pack — a prompt library, a pure template engine and a
 * screen for advertising claims that India's coaching-sector advertising rules restrict.
 *
 * No React, no JSX, no DOM. Every export is deterministic: same input -> same output.
 * Placeholders inside a template are written as {{snake_case}}.
 */

/**
 * Placeholder syntax kept as a source string so each caller can build its own
 * stateful RegExp instead of sharing `lastIndex` with a module-level one.
 */
export const PLACEHOLDER_SOURCE = "\\{\\{\\s*([a-zA-Z0-9_]+)\\s*\\}\\}";

/**
 * ~4 characters per token of English prose is the vendor-published rule of thumb
 * (OpenAI tokenizer documentation). It sizes a prompt against a context window;
 * it is never an exact billing figure.
 */
export const CHARS_PER_TOKEN = 4;

/**
 * Past this estimated size a prompt starts to crowd small context windows —
 * an 8K-token model leaves roughly this much room once a long answer is reserved.
 */
export const LONG_PROMPT_TOKENS = 700;

/**
 * Central Consumer Protection Authority, "Guidelines for Prevention of Misleading
 * Advertisement in Coaching Sector, 2024" (issued 13 November 2024 under the
 * Consumer Protection Act, 2019). Where an advertisement uses a successful
 * candidate's name, photograph or testimonial, these particulars must be disclosed
 * in the same advertisement, in a font size and prominence that is clearly legible —
 * not buried in a footnote or a disclaimer strip.
 */
export const REQUIRED_SUCCESS_DISCLOSURES = [
  "Name and rank of the successful candidate",
  "The course the candidate actually took at your centre",
  "Duration of that course",
  "Whether the course was paid or free",
  "Written consent of the candidate for using their name, photo or testimonial",
];

/**
 * Ministry of Education, "Guidelines for Regulation of Coaching Centre, 2024"
 * (16 January 2024): coaching centres are not to enrol students below 16 years of
 * age or before the secondary school examination, and are not to make claims of
 * guaranteed rank or assured marks.
 */
export const MOE_ENROLMENT_MIN_AGE = 16;

/**
 * Consumer Protection Act, 2019, section 21: the CCPA may impose a penalty of up
 * to Rs 10,00,000 on a manufacturer or endorser for a misleading advertisement,
 * and up to Rs 50,00,000 for every subsequent contravention.
 */
export const MISLEADING_AD_PENALTY_FIRST_INR = 1000000;
export const MISLEADING_AD_PENALTY_REPEAT_INR = 5000000;

/**
 * Claims the CCPA coaching guidelines and ASCI's education-sector guidance
 * repeatedly flag. Matching is whole-phrase and case-insensitive. This is a
 * drafting screen, not legal clearance: context can make a listed phrase harmless
 * and an unlisted phrase misleading.
 */
export const RISKY_CLAIM_PHRASES = [
  {
    phrase: "100% selection",
    basis: "Unverifiable success claim",
    why: "A success rate stated without the underlying enrolment and selection numbers is treated as misleading.",
    instead: "State the verifiable figure: '38 of 412 enrolled students selected in 2025'.",
  },
  {
    phrase: "100% result",
    basis: "Unverifiable success claim",
    why: "Same problem — a percentage with no denominator cannot be checked by a parent.",
    instead: "Publish selections over total students enrolled in that batch.",
  },
  {
    phrase: "guaranteed selection",
    basis: "Guarantee of outcome",
    why: "An outcome that depends on a public examination cannot be guaranteed by a coaching centre.",
    instead: "Describe what you actually control: hours of teaching, test count, doubt-session ratio.",
  },
  {
    phrase: "guaranteed rank",
    basis: "Guarantee of outcome",
    why: "The 2024 Ministry of Education guidelines specifically bar promises of rank or good marks.",
    instead: "Show past results with full context and let them speak.",
  },
  {
    phrase: "rank guarantee",
    basis: "Guarantee of outcome",
    why: "Same restriction, phrased as a product name.",
    instead: "Name the batch after what it contains, not after a promise.",
  },
  {
    phrase: "guaranteed admission",
    basis: "Guarantee of outcome",
    why: "Admission is decided by the university or counselling authority, not by the coaching centre.",
    instead: "'Counselling support until seat allotment' — the service, not the seat.",
  },
  {
    phrase: "assured marks",
    basis: "Guarantee of outcome",
    why: "Assurance of marks is a promise about an examiner's decision.",
    instead: "Report the batch's average improvement across your own mock tests, with the number of students.",
  },
  {
    phrase: "sure shot",
    basis: "Guarantee of outcome",
    why: "Colloquial guarantee language carries the same implication as a written one.",
    instead: "Delete; describe the syllabus coverage instead.",
  },
  {
    phrase: "no. 1 institute",
    basis: "Unsubstantiated superlative",
    why: "A ranking claim needs a named, independent source and the period it refers to.",
    instead: "Cite a specific verifiable fact, or drop the superlative.",
  },
  {
    phrase: "number 1 institute",
    basis: "Unsubstantiated superlative",
    why: "Same claim spelled out — still needs a source.",
    instead: "Quote a checkable achievement with its year.",
  },
  {
    phrase: "best institute",
    basis: "Unsubstantiated superlative",
    why: "'Best' with no comparison basis is the classic misleading-advertisement example.",
    instead: "Say what you do differently and let the reader judge.",
  },
  {
    phrase: "india's best",
    basis: "Unsubstantiated superlative",
    why: "A national superlative needs national evidence.",
    instead: "Be specific about your city, batch and outcome.",
  },
  {
    phrase: "topper factory",
    basis: "Unsubstantiated superlative",
    why: "Implies a manufacturing certainty about examination results.",
    instead: "Delete.",
  },
  {
    phrase: "money back guarantee",
    basis: "Conditional offer stated without conditions",
    why: "A refund promise must carry its eligibility conditions in the same advertisement.",
    instead: "State the refund policy in full, including attendance and test conditions.",
  },
  {
    phrase: "limited seats",
    basis: "Artificial scarcity",
    why: "Urgency claims must be true and capable of proof if questioned.",
    instead: "Give the real cap and the real closing date: '60 seats, admissions close 12 August'.",
  },
  {
    phrase: "last chance",
    basis: "Artificial scarcity",
    why: "Repeated 'last chance' messaging is a recognised misleading pressure tactic.",
    instead: "Name the actual deadline and stick to it.",
  },
  {
    phrase: "our topper",
    basis: "Success-story disclosure",
    why: "Naming a successful candidate triggers the disclosure duties — course, duration, paid or free, and consent.",
    instead: "Publish the candidate's course, its duration and whether it was paid, alongside the photo.",
  },
  {
    phrase: "air 1",
    basis: "Success-story disclosure",
    why: "An all-India rank used in marketing needs the same disclosures and the candidate's written consent.",
    instead: "Add course, duration and paid/free status next to the rank, in the same font size.",
  },
];

/** The prompt library. Every template is written to be filled in and pasted into any chat assistant. */
export const PROMPTS = [
  {
    id: "new-batch-announcement",
    title: "New batch announcement",
    category: "Announcements",
    goal: "Announce a batch with facts a parent can check, and no claim you cannot prove.",
    tags: ["batch", "announcement", "admission", "whatsapp"],
    tip: "Anything a parent cannot verify in one phone call should not be in the message.",
    variables: [
      { key: "batch", label: "Batch and target exam", placeholder: "Class 11 JEE two-year foundation batch, starting 1 June" },
      { key: "facts", label: "Checkable facts", placeholder: "60 seats, 18 hours a week, 2 full mocks a month, faculty named on the website" },
      { key: "fees", label: "Fee and payment terms", placeholder: "Rs 78,000 for the year, 3 instalments, refund policy on the website" },
      { key: "channel", label: "Where it will be posted", placeholder: "WhatsApp broadcast to existing parents, plus an Instagram post" },
    ],
    template: `Write a new batch announcement for a coaching institute.

Batch and target exam: {{batch}}
Checkable facts: {{facts}}
Fee and payment terms: {{fees}}
Where it will be posted: {{channel}}

Rules for the copy:
- Every claim must be one of the facts I gave you. Do not add success rates, rankings, selection counts or superlatives of any kind.
- Do not write "guaranteed", "assured", "100%", "best", "No. 1" or "limited seats" unless I supplied the actual number and date, in which case state that number and date plainly.
- Fees, instalment dates and the refund condition must appear in the message body, not as a footnote.

Give me three versions for {{channel}}: one under 60 words, one under 120 words, and one long-form version for a website admissions page. For each, list separately every factual claim it makes so I can tick them off against my records before publishing.

End with the three questions a careful parent would ask after reading it, and what I should have ready to answer them.`,
  },
  {
    id: "batch-schedule-change",
    title: "Schedule or timing change notice",
    category: "Announcements",
    goal: "Tell parents about a change without burying the new time.",
    tags: ["schedule", "timing", "change", "notice"],
    tip: "New date and time in the first line; the reason after it, never before.",
    variables: [
      { key: "change", label: "What is changing", placeholder: "Sunday physics doubt class moves from 9 am to 11 am, from 6 July" },
      { key: "reason", label: "Honest reason", placeholder: "the lab session before it regularly overruns" },
      { key: "affected", label: "Who is affected", placeholder: "Class 12 NEET batch B only, 44 students" },
      { key: "action", label: "What parents must do", placeholder: "nothing; reply only if the new time clashes with school" },
    ],
    template: `Write a schedule change notice for parents and students.

What is changing: {{change}}
Honest reason: {{reason}}
Who is affected: {{affected}}
What parents must do: {{action}}

Put the new day, date and time in the first sentence, in bold. Then who it applies to, then the reason in one sentence, then what the parent has to do.

Do not apologise more than once and do not use "due to unavoidable circumstances" — give the actual reason I supplied. Do not add anything about results, admissions or fees; this message does one job.

Give me a WhatsApp version under 50 words, an SMS version under 160 characters, and a notice-board version. Then write the two-line follow-up I send the evening before the first changed session.`,
  },
  {
    id: "doubt-reply-concept",
    title: "Doubt reply that teaches the method",
    category: "Doubt replies",
    goal: "Answer a student's doubt so the next similar question is solvable without you.",
    tags: ["doubt", "reply", "concept", "student"],
    tip: "A reply that only gives the answer guarantees the same doubt next week.",
    variables: [
      { key: "question", label: "The student's question", placeholder: "why does the normal force change on a body inside an accelerating lift" },
      { key: "level", label: "Class and syllabus", placeholder: "Class 11 CBSE, JEE Main level, has done Newton's laws but not pseudo forces" },
      { key: "misconception", label: "What you think the real confusion is", placeholder: "thinks normal force always equals mg" },
      { key: "format", label: "Reply format", placeholder: "WhatsApp text, under 200 words, no images" },
    ],
    template: `Help me reply to a student's doubt.

The question: {{question}}
Class and syllabus level: {{level}}
What I think the real confusion is: {{misconception}}
Reply format: {{format}}

Structure the reply as: one sentence naming the misconception directly; the correct idea in two sentences using only vocabulary from {{level}}; one worked line of reasoning; then one short question back to the student that they can only answer if they have understood.

Do not solve a numerical problem for them end to end unless the question is numerical. Do not say "very good question". Do not introduce a concept that is outside {{level}} — if the honest answer needs one, say so in one line and give the version that works within the syllabus.

Then give me: two follow-up practice questions of increasing difficulty on the same idea, and the one line I add if the student replies "still not getting it".`,
  },
  {
    id: "doubt-reply-backlog",
    title: "Clearing a doubt backlog",
    category: "Doubt replies",
    goal: "Turn a pile of unanswered doubts into grouped answers instead of forty separate replies.",
    tags: ["doubt", "backlog", "batch", "faq"],
    tip: "Most backlogs are four questions asked forty ways.",
    variables: [
      { key: "doubts", label: "The doubts, one per line", placeholder: "paste the raw list from the doubt register or WhatsApp group" },
      { key: "batch", label: "Batch and chapter", placeholder: "Class 12 NEET, Human Physiology, weeks 3-4" },
      { key: "time", label: "Time you actually have", placeholder: "40 minutes tonight, plus 20 minutes in tomorrow's class" },
      { key: "channel", label: "How answers go out", placeholder: "one pinned WhatsApp message plus a 10-minute recap in class" },
    ],
    template: `Help me clear a doubt backlog efficiently.

The doubts: {{doubts}}
Batch and chapter: {{batch}}
Time I actually have: {{time}}
How answers go out: {{channel}}

First, group the doubts by the underlying concept, not by the wording. Show the grouping with the count in each group and name the single misconception behind each group.

Second, rank the groups by how many students are blocked and how much of the coming syllabus depends on the idea.

Third, for the top three groups write a pinned answer under 120 words each, pitched at {{batch}}, in the order I should send them.

Fourth, list the doubts that need a one-to-one conversation rather than a broadcast, and say why for each.

Fit the whole plan inside {{time}} and tell me what I am choosing not to answer, so I can tell those students honestly rather than leaving them waiting.`,
  },
  {
    id: "result-post-compliant",
    title: "Result post that meets disclosure rules",
    category: "Result posts",
    goal: "Celebrate a result while carrying every disclosure the coaching-advertising guidelines require.",
    tags: ["result", "selection", "post", "compliance", "ccpa"],
    tip: "Photo plus name means the course, its duration and whether it was paid must appear in the same post.",
    variables: [
      { key: "achievement", label: "The achievement, exactly", placeholder: "Ananya S, AIR 412 in JEE Advanced 2026" },
      { key: "course_detail", label: "Course, duration, paid or free", placeholder: "Two-year classroom programme, June 2024 to April 2026, paid at full fee" },
      { key: "context", label: "Batch context", placeholder: "of 118 students in the 2024 two-year batch, 31 qualified JEE Advanced" },
      { key: "consent", label: "Consent status", placeholder: "written consent taken on 8 June for name, photo and rank" },
    ],
    template: `Write a result announcement post for a coaching institute in India.

The achievement: {{achievement}}
Course, duration, paid or free: {{course_detail}}
Batch context: {{context}}
Consent status: {{consent}}

India's coaching-sector advertising guidelines require that when a successful candidate's name or photograph is used, the post also carries the course the candidate took, its duration, and whether it was paid or free — in the same prominence as the name and photo, not as small print. Build the post so those particulars sit in the visible body text.

Write:
1. An Instagram or WhatsApp caption under 80 words carrying all the required particulars in the main text.
2. The exact line of on-image text, so the disclosures are legible on the creative itself.
3. A longer website version that also states {{context}} so the achievement is shown against the batch size.

Do not write a success percentage, "our topper", a superlative, or any claim about future batches. Do not imply the result was caused solely by the institute. If {{consent}} indicates consent has not been taken, say clearly at the top that the post must not be published yet.

Finally, list every factual particular in the post and where I verify each one before publishing.`,
  },
  {
    id: "result-summary-parents",
    title: "Honest batch result summary for parents",
    category: "Result posts",
    goal: "Report a whole batch's results with denominators, not just the highlights.",
    tags: ["result", "parents", "summary", "transparency"],
    tip: "Publishing the denominator is the fastest way to be believed.",
    variables: [
      { key: "numbers", label: "The real numbers", placeholder: "118 appeared, 31 qualified Advanced, 74 above JEE Main cutoff, best AIR 412" },
      { key: "compare", label: "Comparison you can defend", placeholder: "last year: 96 appeared, 22 qualified Advanced" },
      { key: "weak_spot", label: "The part that went badly", placeholder: "chemistry scores were the weakest of the three subjects, again" },
      { key: "next", label: "What changes next year", placeholder: "adding a weekly chemistry problem clinic and a second full-time chemistry faculty" },
    ],
    template: `Write an honest result summary for parents of a coaching batch.

The real numbers: {{numbers}}
Comparison I can defend: {{compare}}
The part that went badly: {{weak_spot}}
What changes next year: {{next}}

Report every figure with its denominator. Never state a percentage without the count it came from. Present the year-on-year comparison only where the two years are comparable, and say in one line where they are not.

Include {{weak_spot}} in the main body, not at the end, and state {{next}} as a specific commitment with a date rather than an intention.

Give me: a 150-word message for the parent WhatsApp group, a one-page version for the notice board with a small table of the figures, and the three questions I should expect at the next parent meeting with an honest answer to each.

Do not use superlatives, do not name any student without saying that consent is required first, and do not imply that these numbers predict the next batch's outcome.`,
  },
  {
    id: "fee-reminder",
    title: "Fee instalment reminder",
    category: "Parent communication",
    goal: "Ask for an overdue payment without shaming a student in front of a class.",
    tags: ["fee", "reminder", "payment", "parent"],
    tip: "Money messages go to the parent privately, never to the batch group.",
    variables: [
      { key: "detail", label: "Amount and due date", placeholder: "second instalment Rs 26,000, due 10 July, 9 days overdue" },
      { key: "history", label: "Payment history", placeholder: "first instalment paid on time; this is the first delay" },
      { key: "options", label: "What you can genuinely offer", placeholder: "can split into two payments over 30 days, or defer to the 1st of next month" },
      { key: "consequence", label: "What actually happens if unpaid", placeholder: "test series access pauses after 30 days; class attendance is not affected" },
    ],
    template: `Write a fee instalment reminder to a parent.

Amount and due date: {{detail}}
Payment history: {{history}}
What I can genuinely offer: {{options}}
What actually happens if unpaid: {{consequence}}

Write it as a private message to the parent. State the amount, the original due date and the payment link or method in the first three lines. Acknowledge {{history}} in one clause if it is good. Offer {{options}} before mentioning {{consequence}}.

Do not use guilt, do not mention the student's performance, do not compare with other parents, and do not threaten anything beyond {{consequence}}.

Give me a first reminder, a second reminder for seven days later, and a short script for the phone call if the second gets no reply. For the call, include the two sentences that open the conversation and one question that finds out whether this is a cash-flow problem or a dissatisfaction problem.`,
  },
  {
    id: "parent-progress-update",
    title: "Individual student progress update",
    category: "Parent communication",
    goal: "Give a parent a picture of their child that is specific enough to act on.",
    tags: ["progress", "parent", "report", "feedback"],
    tip: "'Needs to work harder' tells a parent nothing they can do on Tuesday evening.",
    variables: [
      { key: "student", label: "Student and batch", placeholder: "Rohan, Class 12 NEET batch A" },
      { key: "data", label: "Actual data", placeholder: "mock scores 412, 388, 441 of 720; biology steady at 300+, physics stuck near 90" },
      { key: "behaviour", label: "What you observe in class", placeholder: "attends everything, never asks a question, copies solutions without attempting" },
      { key: "ask", label: "What you want the parent to do", placeholder: "stop asking about rank at home, ask what he attempted instead" },
    ],
    template: `Write a progress update to a parent about one student.

Student and batch: {{student}}
Actual data: {{data}}
What I observe in class: {{behaviour}}
What I want the parent to do: {{ask}}

Open with the data, including the trend across the three most recent scores and the subject that is holding the total back. Then one paragraph on {{behaviour}}, described as behaviour and not as character — say what happens, not what the student "is".

Then the one change I am making at the centre, and {{ask}} written as one concrete thing to do at home this week.

Do not predict a rank or a selection. Do not compare with other students by name or position. Do not use "average", "weak" or "slow" as labels for the student.

Give me a 180-word written version and a 90-second version to say on the phone, plus the sentence I use if the parent replies asking whether their child will qualify.`,
  },
  {
    id: "demo-class-invite",
    title: "Demo class invitation",
    category: "Admissions",
    goal: "Fill a demo class without promising anything about the exam result.",
    tags: ["demo", "trial", "admission", "invite"],
    tip: "Say what happens in the 90 minutes; that is the only thing you can actually promise.",
    variables: [
      { key: "demo", label: "Demo details", placeholder: "free 90-minute demo, Sunday 3 pm, Class 11 chemistry, mole concept" },
      { key: "who", label: "Who it suits", placeholder: "students who finished Class 10 boards this year and are choosing a stream" },
      { key: "takeaway", label: "What they leave with", placeholder: "a solved worksheet, the year's chapter plan and a 20-question diagnostic with their score" },
      { key: "next_step", label: "What happens after", placeholder: "no obligation; admissions counsellor calls only if the parent asks on the day" },
    ],
    template: `Write a demo class invitation.

Demo details: {{demo}}
Who it suits: {{who}}
What they leave with: {{takeaway}}
What happens after: {{next_step}}

Describe the 90 minutes concretely — the topic, what the student will do, and {{takeaway}}. Say plainly who this demo is not for, so the wrong families do not turn up.

Do not promise any exam outcome, do not use "limited seats" or "last chance" unless I gave a real cap and date, and do not describe the institute as best, top or number one. Make {{next_step}} explicit so nobody fears a sales call.

Give me: a WhatsApp forward under 70 words, an Instagram caption, a poster headline of six words or fewer with a supporting line, and the confirmation message sent to whoever registers. Then list what I must have physically ready on the day for {{takeaway}} to be true.`,
  },
  {
    id: "faculty-feedback",
    title: "Feedback to a faculty member",
    category: "Operations",
    goal: "Say the difficult thing to a teacher clearly enough that the class changes next week.",
    tags: ["faculty", "feedback", "teacher", "internal"],
    tip: "Observation, effect, request — in that order, with a date attached.",
    variables: [
      { key: "observation", label: "What you observed", placeholder: "last three classes ran 20 minutes over and the doubt slot was dropped each time" },
      { key: "effect", label: "The effect", placeholder: "the 6 pm batch starts late and 11 students have complained about unanswered doubts" },
      { key: "context", label: "Context about the person", placeholder: "strong teacher, best feedback scores in the centre, took on an extra batch in April" },
      { key: "request", label: "What you are asking for", placeholder: "hard stop at 90 minutes, doubt slot protected, from Monday" },
    ],
    template: `Help me give direct feedback to a faculty member.

What I observed: {{observation}}
The effect: {{effect}}
Context about the person: {{context}}
What I am asking for: {{request}}

Write the conversation opener in two sentences that state {{observation}} without a compliment sandwich. Then the effect in numbers. Then {{request}} with a start date.

Include a question that checks whether the cause is workload rather than habit, given {{context}}, and what I offer if the answer is workload.

Handle three likely responses: disagreement with the facts, agreement with no change, and defensiveness about the extra batch. One honest reply each.

Do not soften {{request}} into a suggestion, do not raise it in front of other faculty, and do not attach it to their appraisal unless I say so. End with what I will check in two weeks and how the faculty member will know whether it went well.`,
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

const REGEX_SPECIALS = /[.*+?^${}()|[\]\\]/g;

function escapeForRegExp(value) {
  return String(value).replace(REGEX_SPECIALS, "\\$&");
}

/**
 * Screen free text for advertising claims restricted by the CCPA coaching-sector
 * guidelines and ASCI education guidance. Whole-phrase, case-insensitive matching.
 * A drafting aid, not legal clearance.
 *
 * @param {string} text Marketing or announcement copy to screen.
 * @returns {object} { flags, flagCount, clean, checkedPhrases } or { error }.
 */
export function checkCoachingClaims(text) {
  if (typeof text !== "string") {
    return { error: "Give the copy to screen as text." };
  }
  const haystack = text.toLowerCase();
  const flags = [];

  for (const entry of RISKY_CLAIM_PHRASES) {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeForRegExp(entry.phrase)}([^a-z0-9]|$)`, "i");
    if (pattern.test(haystack)) {
      flags.push(entry);
    }
  }

  return {
    flags,
    flagCount: flags.length,
    clean: flags.length === 0,
    checkedPhrases: RISKY_CLAIM_PHRASES.length,
  };
}

/**
 * Substitute values into a template. A blank or missing value keeps its
 * {{placeholder}} visible and is reported in `missing`, so nothing silently
 * disappears from the copied prompt.
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

  // Screen only what the user typed. The templates deliberately quote restricted
  // phrases in order to forbid them, so screening the assembled prompt would flag
  // its own instructions.
  const suppliedText = variables
    .map((key) => (supplied[key] === undefined || supplied[key] === null ? "" : String(supplied[key])))
    .join(" \n ");
  const claims = checkCoachingClaims(suppliedText);

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
    claimFlags: claims.flags,
    claimsClean: claims.clean,
  };
}
