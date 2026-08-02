/**
 * हिंदी पत्र लेखन — format engine.
 *
 * Encodes the two letter families taught in the CBSE / state-board Hindi syllabus:
 *   औपचारिक पत्र (formal)   — सेवा में block, विषय line, महोदय/महोदया, भवदीय close.
 *   अनौपचारिक पत्र (informal) — sender address, संबोधन + अभिवादन pair chosen by
 *                              the writer's relationship to the reader, स्वनिर्देश close.
 *
 * Pure module: no React, no DOM, no clock reads (dates come in as arguments).
 */

/** Board answer books expect a letter body in this band; going far outside costs content marks. */
export const MIN_BODY_WORDS = 60;
export const MAX_BODY_WORDS = 150;

/** विषय (subject line) is meant to be one line — a phrase, not a sentence. */
export const MAX_VISHAY_WORDS = 12;

export const KINDS = [
  { id: "aupcharik", label: "औपचारिक पत्र", english: "Formal letter" },
  { id: "anaupcharik", label: "अनौपचारिक पत्र", english: "Informal / personal letter" },
];

/** Ordered parts of each format — this order is what the format marks are given for. */
export const FORMAT_PARTS = {
  aupcharik: [
    ["सेवा में", "Recipient block: designation, office/school name, city"],
    ["दिनांक", "Date, written below the address block"],
    ["विषय", "One-line subject, usually ending in हेतु or के संबंध में"],
    ["संबोधन", "महोदय / महोदया — never a personal name"],
    ["विषय-वस्तु", "Two short paragraphs: the request, then the justification"],
    ["समापन", "सधन्यवाद, followed by भवदीय / भवदीया"],
    ["प्रेषक", "Your name, class or designation, and address"],
  ],
  anaupcharik: [
    ["प्रेषक का पता", "Your own address, top-left"],
    ["दिनांक", "Date, directly under your address"],
    ["संबोधन", "पूज्य / आदरणीय / प्रिय, chosen by relationship"],
    ["अभिवादन", "सादर प्रणाम / नमस्ते / शुभाशीर्वाद, matched to संबोधन"],
    ["विषय-वस्तु", "Two or three paragraphs in a personal voice"],
    ["स्वनिर्देश", "आपका आज्ञाकारी पुत्र / तुम्हारा मित्र — matched to संबोधन"],
    ["नाम", "Your name only; no designation"],
  ],
};

/**
 * संबोधन–अभिवादन–स्वनिर्देश triples. In Hindi letter writing these three must agree:
 * an elder addressed as पूज्य cannot be signed off with तुम्हारा मित्र.
 */
export const RELATIONS = [
  {
    id: "elder-family",
    label: "बड़े (माता-पिता, चाचा-चाची)",
    sambodhan: "पूज्य",
    abhivadan: "सादर चरण-स्पर्श।",
    svanirdesh: "आपका आज्ञाकारी पुत्र / पुत्री",
    note: "परिवार के बड़ों के लिए — आदर सूचक 'आप' का ही प्रयोग करें।",
  },
  {
    id: "elder-respected",
    label: "आदरणीय (गुरुजन, बड़े संबंधी)",
    sambodhan: "आदरणीय",
    abhivadan: "सादर प्रणाम।",
    svanirdesh: "आपका आज्ञाकारी शिष्य / शिष्या",
    note: "गुरुजन और परिवार से बाहर के बड़ों के लिए।",
  },
  {
    id: "friend",
    label: "मित्र / समवयस्क",
    sambodhan: "प्रिय",
    abhivadan: "सप्रेम नमस्ते।",
    svanirdesh: "तुम्हारा मित्र / सखी",
    note: "मित्रों के लिए 'तुम' का प्रयोग होता है, 'आप' का नहीं।",
  },
  {
    id: "younger",
    label: "छोटे (अनुज, भतीजा, विद्यार्थी)",
    sambodhan: "चिरंजीव",
    abhivadan: "प्रसन्न रहो।",
    svanirdesh: "तुम्हारा शुभचिंतक",
    note: "छोटों को आशीर्वाद दिया जाता है, प्रणाम नहीं किया जाता।",
  },
];

export const LETTER_TYPES = [
  {
    id: "avkash",
    kind: "aupcharik",
    label: "अवकाश हेतु प्रार्थना पत्र",
    english: "Leave application to the principal",
    defaultRecipient: "श्रीमान प्रधानाचार्य महोदय",
    defaultOffice: "राजकीय उच्चतर माध्यमिक विद्यालय",
    vishay: "दो दिन के अवकाश हेतु प्रार्थना पत्र",
    guidance:
      "पहले अनुच्छेद में अवकाश की तिथियाँ और कारण लिखें, दूसरे में कक्षा-कार्य पूरा करने का आश्वासन दें।",
  },
  {
    id: "shikayat",
    kind: "aupcharik",
    label: "शिकायती पत्र (नगर निगम / अधिकारी को)",
    english: "Complaint letter to a civic authority",
    defaultRecipient: "श्रीमान स्वास्थ्य अधिकारी",
    defaultOffice: "नगर निगम",
    vishay: "मोहल्ले में सफाई व्यवस्था के संबंध में",
    guidance:
      "समस्या को तथ्यों के साथ लिखें — स्थान, कब से, किन लोगों पर असर — फिर स्पष्ट माँग रखें।",
  },
  {
    id: "sampadak",
    kind: "aupcharik",
    label: "संपादक के नाम पत्र",
    english: "Letter to the editor",
    defaultRecipient: "संपादक महोदय",
    defaultOffice: "दैनिक जागरण",
    vishay: "बढ़ते वायु प्रदूषण की ओर ध्यान आकर्षित करने हेतु",
    guidance:
      "अंत में समाचार-पत्र से अनुरोध करें कि पत्र को प्रकाशित कर जनता व प्रशासन का ध्यान आकर्षित करें।",
  },
  {
    id: "aavedan",
    kind: "aupcharik",
    label: "नौकरी हेतु आवेदन पत्र",
    english: "Job application letter",
    defaultRecipient: "श्रीमान प्रबंधक महोदय",
    defaultOffice: "भारती उद्योग लिमिटेड",
    vishay: "लिपिक पद हेतु आवेदन",
    guidance:
      "विज्ञापन की तिथि और समाचार-पत्र का नाम दें, फिर योग्यता व अनुभव संक्षेप में लिखें।",
  },
  {
    id: "badhai",
    kind: "anaupcharik",
    label: "बधाई पत्र",
    english: "Congratulation letter",
    vishay: "",
    guidance: "बधाई का कारण पहले वाक्य में लिखें, फिर उपलब्धि की सराहना और शुभकामनाएँ।",
  },
  {
    id: "nimantran",
    kind: "anaupcharik",
    label: "निमंत्रण पत्र",
    english: "Invitation letter",
    vishay: "",
    guidance: "अवसर, तिथि, समय और स्थान — चारों बातें स्पष्ट रूप से लिखें।",
  },
  {
    id: "dhanyavad",
    kind: "anaupcharik",
    label: "धन्यवाद पत्र",
    english: "Thank-you letter",
    vishay: "",
    guidance: "किस बात के लिए धन्यवाद दे रहे हैं, यह विशेष रूप से लिखें — सामान्य वाक्य न लिखें।",
  },
  {
    id: "salah",
    kind: "anaupcharik",
    label: "सलाह / परामर्श पत्र",
    english: "Letter of advice",
    vishay: "",
    guidance: "उपदेश की भाषा से बचें; अपने अनुभव के आधार पर सुझाव दें।",
  },
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const HINDI_MONTHS = [
  "जनवरी",
  "फरवरी",
  "मार्च",
  "अप्रैल",
  "मई",
  "जून",
  "जुलाई",
  "अगस्त",
  "सितंबर",
  "अक्टूबर",
  "नवंबर",
  "दिसंबर",
];

/** Format YYYY-MM-DD as "12 अगस्त 2026". Returns "" for anything invalid. */
export function formatHindiDate(iso) {
  if (typeof iso !== "string" || !DATE_PATTERN.test(iso)) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return "";
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (probe.getUTCMonth() !== m - 1 || probe.getUTCDate() !== d) return "";
  return `${d} ${HINDI_MONTHS[m - 1]} ${y}`;
}

export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function paragraphs(text) {
  return clean(text)
    .split(/\n{2,}/)
    .map((block) => block.replace(/\n+/g, " ").trim())
    .filter(Boolean);
}

/**
 * Build a complete Hindi letter in the correct format.
 * Returns { letter, kind, parts, wordCount, checklist, ... } or { error }.
 */
export function buildPatra(input = {}) {
  const type = LETTER_TYPES.find((item) => item.id === clean(input.typeId));
  if (!type) return { error: "पत्र का प्रकार चुनें — कोई मान्य प्रकार नहीं मिला।" };

  const senderName = clean(input.senderName);
  if (!senderName) return { error: "अपना नाम लिखें — पत्र नाम के बिना पूरा नहीं होता।" };

  const dateLabel = formatHindiDate(clean(input.dateIso));
  if (!dateLabel) return { error: "मान्य दिनांक चुनें (उदाहरण: 2026-08-12)।" };

  const bodyBlocks = paragraphs(input.body);
  if (bodyBlocks.length === 0) {
    return { error: "विषय-वस्तु लिखें — कम से कम एक अनुच्छेद आवश्यक है।" };
  }

  const bodyWords = countWords(bodyBlocks.join(" "));
  const lines = [];
  const isFormal = type.kind === "aupcharik";

  let vishay = "";
  let relation = null;

  if (isFormal) {
    const recipient = clean(input.recipient) || type.defaultRecipient || "श्रीमान महोदय";
    const office = clean(input.office) || type.defaultOffice || "";
    const place = clean(input.place);
    vishay = clean(input.vishay) || type.vishay;
    if (!vishay) return { error: "औपचारिक पत्र में विषय पंक्ति अनिवार्य है।" };

    lines.push("सेवा में,");
    lines.push(`    ${recipient},`);
    if (office) lines.push(`    ${office},`);
    if (place) lines.push(`    ${place}`);
    lines.push("");
    lines.push(`दिनांक: ${dateLabel}`);
    lines.push("");
    lines.push(`विषय: ${vishay}।`);
    lines.push("");
    lines.push("महोदय,");
    lines.push("");
    bodyBlocks.forEach((block) => {
      lines.push(`    ${block}`);
      lines.push("");
    });
    lines.push("सधन्यवाद।");
    lines.push("");
    lines.push("भवदीय,");
    lines.push(senderName);
    const designation = clean(input.designation);
    if (designation) lines.push(designation);
    const senderAddress = clean(input.senderAddress);
    if (senderAddress) {
      senderAddress.split(/\n+/).forEach((line) => lines.push(line.trim()));
    }
  } else {
    relation =
      RELATIONS.find((item) => item.id === clean(input.relationId)) || RELATIONS[2];
    const readerName = clean(input.readerName) || "मित्र";
    const senderAddress = clean(input.senderAddress);
    if (senderAddress) {
      senderAddress.split(/\n+/).forEach((line) => lines.push(line.trim()));
    }
    lines.push(`दिनांक: ${dateLabel}`);
    lines.push("");
    lines.push(`${relation.sambodhan} ${readerName},`);
    lines.push("");
    lines.push(`    ${relation.abhivadan}`);
    lines.push("");
    bodyBlocks.forEach((block) => {
      lines.push(`    ${block}`);
      lines.push("");
    });
    lines.push(`${relation.svanirdesh},`);
    lines.push(senderName);
  }

  const letter = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  const checklist = [
    {
      label: isFormal ? "'सेवा में' ब्लॉक सही क्रम में है" : "प्रेषक का पता ऊपर लिखा है",
      ok: isFormal ? true : Boolean(clean(input.senderAddress)),
    },
    { label: "दिनांक लिखा है", ok: true },
    {
      label: isFormal ? "विषय एक पंक्ति में है" : "संबोधन और अभिवादन मेल खाते हैं",
      ok: isFormal ? countWords(vishay) <= MAX_VISHAY_WORDS : true,
    },
    {
      label: "विषय-वस्तु दो या अधिक अनुच्छेदों में है",
      ok: bodyBlocks.length >= 2,
    },
    {
      label: `विषय-वस्तु ${MIN_BODY_WORDS}–${MAX_BODY_WORDS} शब्दों के बीच है`,
      ok: bodyWords >= MIN_BODY_WORDS && bodyWords <= MAX_BODY_WORDS,
    },
    {
      label: isFormal ? "समापन 'भवदीय' से हुआ है" : "स्वनिर्देश संबोधन से मेल खाता है",
      ok: true,
    },
    { label: "अंत में नाम लिखा है", ok: true },
  ];

  return {
    letter,
    kind: type.kind,
    kindLabel: KINDS.find((item) => item.id === type.kind)?.label || "",
    typeLabel: type.label,
    guidance: type.guidance,
    parts: FORMAT_PARTS[type.kind],
    vishay,
    relation,
    dateLabel,
    paragraphCount: bodyBlocks.length,
    wordCount: bodyWords,
    totalWords: countWords(letter),
    checklist,
    score: checklist.filter((item) => item.ok).length,
    scoreMax: checklist.length,
  };
}
