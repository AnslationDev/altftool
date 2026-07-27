/**
 * AI Media Literacy Quiz — pure question bank, deterministic selection and grading.
 * No React, no DOM, no clock access.
 */

export const TOPICS = {
  provenance: "Provenance & content credentials",
  detectors: "Detection tools and their limits",
  verification: "Verification workflow",
  claims: "Evaluating AI claims",
  fraud: "Synthetic-media fraud",
};

/**
 * Question bank. Each item states a real, checkable point about how synthetic
 * media is (and is not) identified. correct is the 0-based index into options.
 */
export const QUESTIONS = [
  {
    id: "detector-score",
    topic: "detectors",
    prompt:
      "An online detector says a photo is \"92% likely AI-generated\". What does that number justify on its own?",
    options: [
      "Publishing it as confirmed AI-generated",
      "Treating it as one weak signal that needs corroboration",
      "Nothing at all — detector scores are random",
      "Concluding the photo is authentic if the score drops after cropping",
    ],
    correct: 1,
    explanation:
      "Detector outputs are probability estimates from a classifier, not proof. They are sensitive to compression, resizing and screenshotting, and they produce both false positives on real photos and false negatives on generated ones. Use the score as one input alongside provenance and cross-checking.",
  },
  {
    id: "c2pa",
    topic: "provenance",
    prompt: "What do C2PA Content Credentials actually tell you about an image?",
    options: [
      "That the image is definitely real",
      "That the image is definitely AI-generated",
      "A cryptographically signed record of how it was captured or edited, when present",
      "The GPS location of every person in the frame",
    ],
    correct: 2,
    explanation:
      "C2PA attaches a signed manifest describing capture device, generator and edit history. When it is present and validates, it is strong evidence. When it is absent that means nothing — the metadata is easily stripped, and most platforms remove it on upload.",
  },
  {
    id: "hands",
    topic: "detectors",
    prompt: "How reliable is \"count the fingers\" as a way to spot an AI-generated image today?",
    options: [
      "Very reliable — models still cannot draw hands",
      "Unreliable — current models render hands correctly most of the time",
      "Reliable only for video",
      "Reliable only for black-and-white images",
    ],
    correct: 1,
    explanation:
      "Malformed hands were an artefact of 2022-era image models and have largely been fixed. Artefact-spotting heuristics age out within months, which is why provenance and source-checking beat visual tells.",
  },
  {
    id: "reverse-search",
    topic: "verification",
    prompt: "You are sent a dramatic photo of a current news event. What is the first check to run?",
    options: [
      "Run it through an AI detector",
      "Zoom in on shadows and reflections",
      "Reverse image search to see whether it appeared earlier in a different context",
      "Ask a chatbot whether the photo is real",
    ],
    correct: 2,
    explanation:
      "Recycled real photos with false captions — \"cheapfakes\" — are far more common than deepfakes. A reverse image search that finds the same picture from three years ago settles the question in seconds and costs nothing.",
  },
  {
    id: "voice-clone",
    topic: "fraud",
    prompt:
      "A relative calls in distress asking for money and the voice sounds exactly right. What is the safe response?",
    options: [
      "Send the money — voices cannot be faked convincingly",
      "Hang up and call them back on the number you already have for them",
      "Ask them to repeat a sentence to test the audio quality",
      "Keep them talking to trace the call",
    ],
    correct: 1,
    explanation:
      "Voice cloning now needs only a few seconds of sample audio, which most people have posted publicly. Hanging up and dialling a number you already trust, or using a family code word agreed in advance, defeats the whole attack.",
  },
  {
    id: "watermark",
    topic: "provenance",
    prompt: "An image carries no invisible AI watermark. What follows?",
    options: [
      "It is human-made",
      "It came from a camera",
      "Nothing — watermarks only exist for content from generators that apply them",
      "It was edited after generation",
    ],
    correct: 2,
    explanation:
      "Invisible watermarking schemes only mark output from participating generators, and open-source models can be run without them. A watermark present is meaningful evidence; a watermark absent is not.",
  },
  {
    id: "exif",
    topic: "provenance",
    prompt: "How much weight should EXIF metadata (camera model, date, GPS) carry as proof of authenticity?",
    options: [
      "Conclusive — EXIF cannot be altered",
      "Weak — EXIF is trivially edited and most platforms strip it on upload",
      "Conclusive for JPEG, weak for PNG",
      "It proves the image was never opened in an editor",
    ],
    correct: 1,
    explanation:
      "EXIF fields are plain editable metadata with no signature, and social platforms remove them during processing. Signed provenance such as C2PA is the metadata that resists tampering; EXIF is a hint, not evidence.",
  },
  {
    id: "text-detector",
    topic: "detectors",
    prompt: "How should a school treat an \"AI text detector\" flag on a student essay?",
    options: [
      "As sufficient grounds for an academic-misconduct penalty",
      "As unreliable evidence that cannot by itself support a penalty",
      "As proof the student used AI if the score is above 50%",
      "As proof of plagiarism from another student",
    ],
    correct: 1,
    explanation:
      "AI text detectors have documented false-positive rates and disproportionately flag writing by non-native English speakers; several universities and OpenAI itself withdrew or disabled such classifiers for low accuracy. Process evidence — drafts, version history, a conversation with the student — is what holds up.",
  },
  {
    id: "citation",
    topic: "claims",
    prompt: "A chatbot gives you a study with authors, a journal and a DOI. What do you do before citing it?",
    options: [
      "Cite it — DOIs are auto-generated and always valid",
      "Resolve the DOI and confirm the paper, authors and finding exist",
      "Ask the same chatbot whether it is sure",
      "Search the exact sentence in quotes only",
    ],
    correct: 1,
    explanation:
      "Fabricated citations with plausible authors, journals and DOI-shaped strings are a well-documented failure mode that has produced sanctions in real court filings. Resolving the identifier takes one click and either confirms the source or exposes the invention.",
  },
  {
    id: "video-call",
    topic: "fraud",
    prompt:
      "Your finance team is asked to transfer funds during a video call with people who look and sound like company executives. What is the control that stops this?",
    options: [
      "Trusting the video, since real-time deepfakes are impossible",
      "Confirming the request through a separate, pre-agreed channel before any payment",
      "Recording the call for later review",
      "Checking the meeting invite came from an internal address",
    ],
    correct: 1,
    explanation:
      "In a widely reported 2024 case in Hong Kong, a finance employee paid out roughly US$25 million after a video call in which every other participant was synthetic. Out-of-band verification against a known contact, plus dual authorisation on payments, is the control that survives convincing video.",
  },
  {
    id: "stat-claim",
    topic: "claims",
    prompt:
      "A viral post says \"a new study found 90% of people cannot tell AI images from real ones\" with no link. What is the right move?",
    options: [
      "Share it — the number is specific, so it is probably sourced",
      "Look for the primary study and check what was actually measured",
      "Assume it is false because it has no link",
      "Ask an AI to estimate whether the number is plausible",
    ],
    correct: 1,
    explanation:
      "Specificity is not sourcing. Detection-rate figures swing enormously with image type, viewing time and whether participants were told AI images were present, so the number is meaningless until you see the method behind it.",
  },
  {
    id: "strongest-evidence",
    topic: "verification",
    prompt: "Which is the strongest single piece of evidence that a news photo is authentic?",
    options: [
      "It looks realistic at full zoom",
      "An AI detector rates it 3% synthetic",
      "The original file from the named photographer plus independent images of the same scene",
      "It was posted by an account with a verification badge",
    ],
    correct: 2,
    explanation:
      "Authenticity is established by chain of custody and corroboration: who took it, what the original file contains, and whether other people at the scene produced consistent material. Visual realism, detector scores and platform badges are all cheap to fake or simply unrelated.",
  },
];

export const PASS_MARK = 70; // percent — the level this quiz treats as competent
export const BANDS = [
  { min: 90, label: "Expert", note: "You verify by provenance and corroboration, not by eyeballing artefacts." },
  { min: 70, label: "Solid", note: "Good instincts; tighten up the topics you missed." },
  { min: 45, label: "Developing", note: "You spot obvious fakes but lean too much on visual tells and detectors." },
  { min: 0, label: "Needs work", note: "Start with reverse image search and primary-source checking before anything else." },
];

/**
 * Deterministic pseudo-random shuffle (mulberry32) so a given seed always
 * produces the same question order — no clock access inside the library.
 */
function seededOrder(length, seed) {
  let state = (Math.floor(Math.abs(seed)) || 1) >>> 0;
  const rand = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const order = Array.from({ length }, (_, index) => index);
  for (let i = length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/**
 * Returns `count` questions in a deterministic order for the given seed.
 * @param {number} seed  any finite number
 * @param {number} count how many questions to serve
 */
export function selectQuestions(seed = 1, count = QUESTIONS.length) {
  const total = QUESTIONS.length;
  const wanted = Math.max(1, Math.min(total, Math.floor(count) || total));
  return seededOrder(total, seed)
    .slice(0, wanted)
    .map((index) => QUESTIONS[index]);
}

/**
 * Grades a set of answers.
 * @param {Array<{id:string}>} questions questions that were served
 * @param {Record<string, number>} answers map of question id -> chosen option index
 * @returns {object} grade or { error }
 */
export function gradeQuiz(questions, answers = {}) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return { error: "No questions were served, so there is nothing to grade." };
  }
  const answered = questions.filter(
    (question) => Number.isInteger(answers[question.id]) && answers[question.id] >= 0,
  );
  if (answered.length === 0) {
    return { error: "Answer at least one question to see a score." };
  }

  const results = questions.map((question) => {
    const chosen = Number.isInteger(answers[question.id]) ? answers[question.id] : null;
    return {
      question,
      chosen,
      answered: chosen !== null,
      correct: chosen !== null && chosen === question.correct,
    };
  });

  const correctCount = results.filter((row) => row.correct).length;
  const scorePct = Math.round((correctCount / questions.length) * 100);
  const band = BANDS.find((item) => scorePct >= item.min) || BANDS[BANDS.length - 1];

  const topicIds = [...new Set(questions.map((question) => question.topic))];
  const byTopic = topicIds.map((topic) => {
    const rows = results.filter((row) => row.question.topic === topic);
    const hits = rows.filter((row) => row.correct).length;
    return {
      topic,
      label: TOPICS[topic] || topic,
      total: rows.length,
      correct: hits,
      pct: rows.length ? Math.round((hits / rows.length) * 100) : 0,
    };
  });

  return {
    total: questions.length,
    answeredCount: answered.length,
    correctCount,
    wrongCount: answered.length - correctCount,
    scorePct,
    passed: scorePct >= PASS_MARK,
    band: band.label,
    bandNote: band.note,
    results,
    byTopic,
    weakestTopic: byTopic.slice().sort((a, b) => a.pct - b.pct)[0] || null,
  };
}
