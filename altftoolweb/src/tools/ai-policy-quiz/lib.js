/**
 * AI Policy Quiz — 10 scenario questions on acceptable workplace AI use.
 *
 * The question bank reflects the recurring rules found in published corporate
 * and institutional AI-use policies (e.g. NIST AI Risk Management Framework
 * themes, ISO/IEC 42001 controls, typical enterprise acceptable-use policies):
 * confidentiality of prompts, human verification of output, disclosure,
 * intellectual-property caution, bias review, credential safety, and not
 * treating AI output as professional advice.
 *
 * Scoring: 1 point per correct answer. Bands follow the common training
 * pass-mark convention: 80% is the usual compliance-training pass threshold,
 * 50% marks serious gaps.
 */

export const QUESTIONS = [
  {
    id: "q-confidential",
    question:
      "A colleague pastes a customer's full contract into a free public chatbot to summarise it. Is that acceptable?",
    options: [
      "Yes, chatbots are private by default",
      "No — confidential or client data must not go into unapproved public tools",
      "Yes, if the summary is only used internally",
      "Only a problem if the customer finds out",
    ],
    correct: 1,
    explanation:
      "Most AI policies prohibit putting confidential, client or personal data into unapproved public tools: prompts may be retained, used for training, or exposed, and doing so can breach contracts and privacy law (e.g. GDPR). Use an approved enterprise deployment or redact the data first.",
  },
  {
    id: "q-verify",
    question: "An AI assistant produces a statistics-filled market summary. What must happen before it goes to a client?",
    options: [
      "Nothing — modern models are reliable",
      "A quick spelling check",
      "A human verifies every factual claim and figure against real sources",
      "Run it through a second AI to confirm",
    ],
    correct: 2,
    explanation:
      "Language models hallucinate: they can produce fluent, confident, wrong figures and citations. Every policy framework, from NIST AI RMF to newsroom rules, requires human verification of factual output before external use — a second AI is not verification.",
  },
  {
    id: "q-credentials",
    question: "To save time, a developer pastes a config file containing an API key into a chatbot for debugging. What is the right call?",
    options: [
      "Fine — the chat is ephemeral",
      "Never paste secrets; redact keys first, and rotate any key already exposed",
      "Fine if the key is for a test environment",
      "Only wrong if the provider has had a breach",
    ],
    correct: 1,
    explanation:
      "Credentials pasted into third-party tools must be treated as exposed. Security policies require redacting secrets before sharing code and rotating any credential that leaked — regardless of environment or provider.",
  },
  {
    id: "q-disclosure",
    question: "Your team publishes a largely AI-drafted report under an analyst's name with no mention of AI. Acceptable?",
    options: [
      "Yes — the analyst approved it",
      "It depends on your organisation's and the publication's disclosure rules — many require declaring substantive AI drafting",
      "Yes, disclosure is only for images",
      "No, AI can never be used in reports",
    ],
    correct: 1,
    explanation:
      "Disclosure duties vary, which is exactly why the policy must be checked: many organisations, journals and regulators (for example EU AI Act transparency rules for public-interest text) require declaring substantive AI generation, while light editing usually needs none. The failure here is not checking.",
  },
  {
    id: "q-ip",
    question: "Marketing wants to trademark a logo generated entirely by an image model. What is the main risk to flag?",
    options: [
      "None — generated images are automatically owned by the prompter",
      "Purely AI-generated works may lack copyright protection, and the output could resemble existing marks",
      "AI images cannot be used commercially at all",
      "The only risk is low image resolution",
    ],
    correct: 1,
    explanation:
      "The US Copyright Office has repeatedly held that works generated wholly by AI without human authorship are not copyrightable, and generated designs can echo existing protected material. Legal review is the right step before building a brand on one.",
  },
  {
    id: "q-bias",
    question: "HR proposes using a chatbot to screen and rank job applications unsupervised. Why do policies treat this as high risk?",
    options: [
      "It is too slow",
      "Automated hiring decisions can encode bias and are heavily regulated, requiring human oversight and impact assessment",
      "Chatbots cannot read PDFs",
      "It is fine as long as the vendor is reputable",
    ],
    correct: 1,
    explanation:
      "Employment screening is a classic high-risk use: models can reproduce historical bias, and laws such as the EU AI Act (which classes employment AI as high-risk) and NYC Local Law 144 (bias audits for automated hiring tools) demand oversight, auditing and human decision-making.",
  },
  {
    id: "q-advice",
    question: "A teammate asks a chatbot whether your company's severance plan complies with employment law and acts on the answer. What is wrong?",
    options: [
      "Nothing, if the model cites sources",
      "AI output is not professional legal advice — decisions with legal consequences need a qualified professional",
      "Only that they used a free tier",
      "The prompt was too short",
    ],
    correct: 1,
    explanation:
      "Acceptable-use policies distinguish research assistance from reliance: AI can summarise and orient, but legal, tax and medical decisions require a qualified professional who is accountable and can assess the specific facts.",
  },
  {
    id: "q-shadow",
    question: "You find a great new AI tool not on the company's approved list. What does a typical policy require?",
    options: [
      "Use it quietly if it boosts productivity",
      "Request review/approval through the defined process before using it with work data",
      "Use it only outside office hours",
      "Approved lists apply only to managers",
    ],
    correct: 1,
    explanation:
      "Unapproved 'shadow AI' bypasses the security, privacy and contract review that approval processes exist for. Policies require submitting new tools for review before any work data touches them.",
  },
  {
    id: "q-meeting",
    question: "You want to run an AI notetaker in a client call. What does good practice require first?",
    options: [
      "Nothing — recording indicators are enough",
      "Informing participants and getting consent, per recording laws and client confidentiality",
      "Only your own manager's approval",
      "Muting the bot's summary emails",
    ],
    correct: 1,
    explanation:
      "AI notetakers record and process the conversation. Consent/notification is required by many recording laws (some jurisdictions require all-party consent) and by client confidentiality expectations; several policies also ban notetakers in privileged or sensitive meetings.",
  },
  {
    id: "q-accountability",
    question: "AI-generated code you shipped causes a production incident. Who is accountable?",
    options: [
      "The AI vendor",
      "No one — it was a model error",
      "You and your team — humans remain accountable for what they ship, however it was produced",
      "The person who wrote the prompt template",
    ],
    correct: 2,
    explanation:
      "Every serious AI policy keeps accountability with the human who reviews and ships the work. Using AI changes how work is produced, not who answers for it — which is why review gates for AI-generated code exist.",
  },
];

/** Pass band thresholds — 80% mirrors the common compliance-training pass mark. */
export const BAND_EXCELLENT_MIN = 90; // percent
export const BAND_PASS_MIN = 80; // percent
export const BAND_GAPS_MIN = 50; // percent

export const BANDS = [
  { min: BAND_EXCELLENT_MIN, label: "Excellent", verdict: "Strong grasp of acceptable AI use." },
  { min: BAND_PASS_MIN, label: "Pass", verdict: "Solid understanding — review the questions you missed." },
  { min: BAND_GAPS_MIN, label: "Needs work", verdict: "Below the usual 80% training pass mark — revisit your AI policy before relying on AI at work." },
  { min: 0, label: "High risk", verdict: "Serious gaps — treat this as a flag to re-read the policy and retrain before using AI with work data." },
];

/**
 * Score the quiz.
 * @param {Array<number|null>} answers Selected option index per question (null = unanswered).
 * @returns {{score:number,total:number,percent:number,band:string,verdict:string,answered:number,perQuestion:Array}|{error:string}}
 */
export function scoreQuiz(answers) {
  if (!Array.isArray(answers) || answers.length !== QUESTIONS.length) {
    return { error: `Provide an answer array with ${QUESTIONS.length} entries.` };
  }
  const perQuestion = QUESTIONS.map((q, i) => {
    const picked = answers[i];
    const valid = Number.isInteger(picked) && picked >= 0 && picked < q.options.length;
    return {
      id: q.id,
      answered: valid,
      correct: valid && picked === q.correct,
      correctIndex: q.correct,
      explanation: q.explanation,
    };
  });
  const answered = perQuestion.filter((p) => p.answered).length;
  if (answered < QUESTIONS.length) {
    return { error: `Answer all ${QUESTIONS.length} questions — ${QUESTIONS.length - answered} still unanswered.` };
  }
  const score = perQuestion.filter((p) => p.correct).length;
  const percent = Math.round((score / QUESTIONS.length) * 100);
  const band = BANDS.find((b) => percent >= b.min);
  return {
    score,
    total: QUESTIONS.length,
    percent,
    band: band.label,
    verdict: band.verdict,
    answered,
    perQuestion,
  };
}
