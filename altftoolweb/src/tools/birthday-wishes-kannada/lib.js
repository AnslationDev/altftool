/**
 * Kannada birthday wishes composer.
 *
 * Pure data + pure functions. No React, no DOM, no network, no clock, no Math.random.
 *
 * Three real rules drive the output:
 *
 * 1. T-V distinction. Kannada separates ನೀನು (nīnu, familiar) from ನೀವು (nīvu, respectful).
 *    The choice changes the pronoun, the possessive (ನಿನ್ನ ninna / ನಿಮ್ಮ nimma), the dative
 *    (ನಿನಗೆ ninage / ನಿಮಗೆ nimage) and the imperative ending (ಬಾಳು bāḷu / ಬಾಳಿ bāḷi). That is
 *    not a word swap, so every wording is written out twice, once per register.
 * 2. The honorific ಅವರೇ (avarē). Kannada attaches it to the name when addressing someone
 *    senior or outside the family, so the salutations carry it rather than the body.
 * 3. SMS length. Kannada sits outside the GSM 03.38 7-bit alphabet, so a message containing
 *    it is sent as UCS-2: 70 characters in a single SMS and 67 per part once concatenated
 *    (3GPP TS 23.038 / 23.040).
 */

export const LANGUAGE = {
  name: "Kannada",
  nativeName: "ಕನ್ನಡ",
  script: "Kannada",
  iso: "kn",
};

/** Politeness registers. */
export const REGISTERS = [
  {
    id: "respectful",
    label: "ನೀವು — respectful",
    pronoun: "ನೀವು",
    pronounRoman: "nīvu",
    possessive: "ನಿಮ್ಮ",
    possessiveRoman: "nimma",
    dative: "ನಿಮಗೆ",
    dativeRoman: "nimage",
  },
  {
    id: "casual",
    label: "ನೀನು — familiar",
    pronoun: "ನೀನು",
    pronounRoman: "nīnu",
    possessive: "ನಿನ್ನ",
    possessiveRoman: "ninna",
    dative: "ನಿನಗೆ",
    dativeRoman: "ninage",
  },
];

export const TONES = [
  { id: "any", label: "Any tone" },
  { id: "warm", label: "Warm and personal" },
  { id: "formal", label: "Formal and respectful" },
  { id: "blessing", label: "Blessing" },
  { id: "funny", label: "Light-hearted" },
];

/**
 * Who the message is for.
 * `register` is the pronoun a Kannada speaker would normally default to for that person.
 */
export const RELATIONSHIPS = [
  {
    id: "friend",
    label: "Friend",
    register: "casual",
    salutation: {
      native: "ಆತ್ಮೀಯ {name},",
      roman: "Ātmīya {name},",
      english: "Dear {name},",
    },
  },
  {
    id: "elder-brother",
    label: "Elder brother",
    register: "casual",
    salutation: {
      native: "{name} ಅಣ್ಣಾ,",
      roman: "{name} aṇṇā,",
      english: "{name} — big brother,",
    },
  },
  {
    id: "elder-sister",
    label: "Elder sister",
    register: "casual",
    salutation: {
      native: "{name} ಅಕ್ಕಾ,",
      roman: "{name} akkā,",
      english: "{name} — big sister,",
    },
  },
  {
    id: "younger-sibling",
    label: "Younger brother or sister",
    register: "casual",
    salutation: {
      native: "ಮುದ್ದಿನ {name},",
      roman: "Muddina {name},",
      english: "Darling {name},",
    },
  },
  {
    id: "mother",
    label: "Mother",
    register: "respectful",
    salutation: {
      native: "ಪ್ರೀತಿಯ ಅಮ್ಮಾ,",
      roman: "Prītiya ammā,",
      english: "Dear Amma,",
    },
  },
  {
    id: "father",
    label: "Father",
    register: "respectful",
    salutation: {
      native: "ಪ್ರೀತಿಯ ಅಪ್ಪಾ,",
      roman: "Prītiya appā,",
      english: "Dear Appa,",
    },
  },
  {
    id: "grandmother",
    label: "Grandmother",
    register: "respectful",
    salutation: {
      native: "ಪ್ರೀತಿಯ ಅಜ್ಜೀ,",
      roman: "Prītiya ajjī,",
      english: "Dear Ajji (grandmother),",
    },
  },
  {
    id: "grandfather",
    label: "Grandfather",
    register: "respectful",
    salutation: {
      native: "ಪ್ರೀತಿಯ ಅಜ್ಜಾ,",
      roman: "Prītiya ajjā,",
      english: "Dear Ajja (grandfather),",
    },
  },
  {
    id: "partner",
    label: "Partner or spouse",
    register: "casual",
    salutation: {
      native: "ನನ್ನ ಪ್ರೀತಿಯ {name},",
      roman: "Nanna prītiya {name},",
      english: "My beloved {name},",
    },
  },
  {
    id: "child",
    label: "Son or daughter",
    register: "casual",
    salutation: {
      native: "ಪ್ರೀತಿಯ ಕಂದ {name},",
      roman: "Prītiya kanda {name},",
      english: "Dear child {name},",
    },
  },
  {
    id: "colleague",
    label: "Colleague",
    register: "respectful",
    salutation: {
      native: "ಆತ್ಮೀಯ {name} ಅವರೇ,",
      roman: "Ātmīya {name} avarē,",
      english: "Dear {name} (with the honorific avarē),",
    },
    // ಅವರೇ (avarē) is the ನೀವು-register respectful vocative (see the tool's own FAQ),
    // so it is dropped here when the caller overrides the register to ನೀನು — pairing
    // ಅವರೇ with the casual pronoun would contradict itself.
    salutationCasual: {
      native: "ಆತ್ಮೀಯ {name},",
      roman: "Ātmīya {name},",
      english: "Dear {name},",
    },
  },
  {
    id: "boss",
    label: "Manager or senior",
    register: "respectful",
    salutation: {
      native: "ಮಾನ್ಯ {name} ಅವರೇ,",
      roman: "Mānya {name} avarē,",
      english: "Respected {name},",
    },
    salutationCasual: {
      native: "ಮಾನ್ಯ {name},",
      roman: "Mānya {name},",
      english: "Respected {name},",
    },
  },
  {
    id: "teacher",
    label: "Teacher",
    register: "respectful",
    salutation: {
      native: "ಪೂಜ್ಯ {name} ಗುರುಗಳೇ,",
      roman: "Pūjya {name} gurugaḷē,",
      english: "Respected teacher {name},",
    },
    salutationCasual: {
      native: "ಪೂಜ್ಯ {name},",
      roman: "Pūjya {name},",
      english: "Respected {name},",
    },
  },
];

/**
 * Message bodies, each written out once per register.
 *
 * `audience` restricts a wording to the relationships it actually suits — the wish for a
 * grandparent is not the wish for a manager — so the body changes with the relationship,
 * not only the greeting line. A wording with no `audience` fits everyone.
 */
export const TEMPLATES = [
  {
    id: "warm-basic",
    tone: "warm",
    respectful: {
      native: "ಹುಟ್ಟುಹಬ್ಬದ ಹಾರ್ದಿಕ ಶುಭಾಶಯಗಳು! ನಿಮ್ಮ ಈ ವರ್ಷ ಸಂತೋಷ ಮತ್ತು ಉತ್ತಮ ಆರೋಗ್ಯದಿಂದ ತುಂಬಿರಲಿ.",
      roman:
        "Huṭṭuhabbada hārdika shubhāshayagaḷu! Nimma ī varṣa santōṣa mattu uttama ārōgyadinda tumbirali.",
    },
    casual: {
      native: "ಹುಟ್ಟುಹಬ್ಬದ ಹಾರ್ದಿಕ ಶುಭಾಶಯಗಳು! ನಿನ್ನ ಈ ವರ್ಷ ಸಂತೋಷ ಮತ್ತು ಉತ್ತಮ ಆರೋಗ್ಯದಿಂದ ತುಂಬಿರಲಿ.",
      roman:
        "Huṭṭuhabbada hārdika shubhāshayagaḷu! Ninna ī varṣa santōṣa mattu uttama ārōgyadinda tumbirali.",
    },
    english: "Heartfelt birthday wishes! May this year of yours be full of joy and good health.",
  },
  {
    id: "warm-wishes-fulfilled",
    tone: "warm",
    respectful: {
      native: "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು! ನಿಮ್ಮ ಎಲ್ಲ ಆಸೆಗಳು ಈಡೇರಲಿ.",
      roman: "Huṭṭuhabbada shubhāshayagaḷu! Nimma ella āsegaḷu īḍērali.",
    },
    casual: {
      native: "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು! ನಿನ್ನ ಎಲ್ಲ ಆಸೆಗಳು ಈಡೇರಲಿ.",
      roman: "Huṭṭuhabbada shubhāshayagaḷu! Ninna ella āsegaḷu īḍērali.",
    },
    english: "Happy birthday! May every one of your wishes be fulfilled.",
  },
  {
    id: "warm-smile",
    tone: "warm",
    respectful: {
      native: "ನಿಮ್ಮ ಮುಖದ ನಗು ಎಂದಿಗೂ ಮಾಸದಿರಲಿ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು!",
      roman: "Nimma mukhada nagu endigū māsadirali. Huṭṭuhabbada shubhāshayagaḷu!",
    },
    casual: {
      native: "ನಿನ್ನ ಮುಖದ ನಗು ಎಂದಿಗೂ ಮಾಸದಿರಲಿ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು!",
      roman: "Ninna mukhada nagu endigū māsadirali. Huṭṭuhabbada shubhāshayagaḷu!",
    },
    english: "May the smile on your face never fade. Happy birthday!",
  },
  {
    id: "warm-good-news",
    tone: "warm",
    respectful: {
      native: "ಬರುವ ಪ್ರತಿ ದಿನವೂ ನಿಮಗೆ ಒಳ್ಳೆಯ ಸುದ್ದಿ ತರಲಿ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು!",
      roman: "Baruva prati dinavū nimage oḷḷeya suddi tarali. Huṭṭuhabbada shubhāshayagaḷu!",
    },
    casual: {
      native: "ಬರುವ ಪ್ರತಿ ದಿನವೂ ನಿನಗೆ ಒಳ್ಳೆಯ ಸುದ್ದಿ ತರಲಿ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು!",
      roman: "Baruva prati dinavū ninage oḷḷeya suddi tarali. Huṭṭuhabbada shubhāshayagaḷu!",
    },
    english: "May every day ahead bring you good news. Happy birthday!",
  },
  {
    id: "warm-best-part",
    tone: "warm",
    audience: ["partner", "friend", "younger-sibling", "child"],
    respectful: {
      native: "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು! ನೀವು ನನ್ನ ಬದುಕಿನ ಅತ್ಯಂತ ಸುಂದರ ಭಾಗ.",
      roman: "Huṭṭuhabbada shubhāshayagaḷu! Nīvu nanna badukina atyanta sundara bhāga.",
    },
    casual: {
      native: "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು! ನೀನು ನನ್ನ ಬದುಕಿನ ಅತ್ಯಂತ ಸುಂದರ ಭಾಗ.",
      roman: "Huṭṭuhabbada shubhāshayagaḷu! Nīnu nanna badukina atyanta sundara bhāga.",
    },
    english: "Happy birthday! You are the most beautiful part of my life.",
  },
  {
    id: "warm-friendship",
    tone: "warm",
    audience: ["friend"],
    respectful: {
      native: "ನಿಮ್ಮ ಗೆಳೆತನ ನನ್ನ ಪಾಲಿನ ದೊಡ್ಡ ಆಸ್ತಿ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು, ಹೀಗೇ ಜೊತೆಯಾಗಿರಿ!",
      roman:
        "Nimma geḷetana nanna pālina doḍḍa āsti. Huṭṭuhabbada shubhāshayagaḷu, hīgē joteyāgiri!",
    },
    casual: {
      native: "ನಿನ್ನ ಗೆಳೆತನ ನನ್ನ ಪಾಲಿನ ದೊಡ್ಡ ಆಸ್ತಿ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು, ಹೀಗೇ ಜೊತೆಯಾಗಿರು!",
      roman:
        "Ninna geḷetana nanna pālina doḍḍa āsti. Huṭṭuhabbada shubhāshayagaḷu, hīgē joteyāgiru!",
    },
    english: "Your friendship is the biggest thing I own. Happy birthday — stay beside me like this!",
  },
  {
    id: "warm-siblings",
    tone: "warm",
    audience: ["elder-brother", "elder-sister", "younger-sibling"],
    respectful: {
      native: "ಚಿಕ್ಕಂದಿನ ಜಗಳಗಳಿಂದ ಇಂದಿನವರೆಗೆ ನೀವು ಸದಾ ನನ್ನ ಜೊತೆ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು!",
      roman:
        "Cikkandina jagaḷagaḷinda indinavarege nīvu sadā nanna jote. Huṭṭuhabbada shubhāshayagaḷu!",
    },
    casual: {
      native: "ಚಿಕ್ಕಂದಿನ ಜಗಳಗಳಿಂದ ಇಂದಿನವರೆಗೆ ನೀನು ಸದಾ ನನ್ನ ಜೊತೆ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು!",
      roman:
        "Cikkandina jagaḷagaḷinda indinavarege nīnu sadā nanna jote. Huṭṭuhabbada shubhāshayagaḷu!",
    },
    english: "From childhood squabbles until today you have always been beside me. Happy birthday!",
  },
  {
    id: "warm-child-grows",
    tone: "warm",
    audience: ["child"],
    respectful: {
      native: "ನೀವು ಬೆಳೆಯುವುದನ್ನು ನೋಡುವುದೇ ನಮಗೆ ಸಂಭ್ರಮ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು — ಚೆನ್ನಾಗಿ ಓದಿ, ಚೆನ್ನಾಗಿ ಆಡಿ!",
      roman:
        "Nīvu beḷeyuvudannu nōḍuvudē namage sambhrama. Huṭṭuhabbada shubhāshayagaḷu — cennāgi ōdi, cennāgi āḍi!",
    },
    casual: {
      native: "ನೀನು ಬೆಳೆಯುವುದನ್ನು ನೋಡುವುದೇ ನಮಗೆ ಸಂಭ್ರಮ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು — ಚೆನ್ನಾಗಿ ಓದು, ಚೆನ್ನಾಗಿ ಆಡು!",
      roman:
        "Nīnu beḷeyuvudannu nōḍuvudē namage sambhrama. Huṭṭuhabbada shubhāshayagaḷu — cennāgi ōdu, cennāgi āḍu!",
    },
    english: "Watching you grow is our celebration. Happy birthday — study well and play well!",
  },
  {
    id: "warm-teacher",
    tone: "warm",
    audience: ["teacher"],
    respectful: {
      native: "ನಿಮ್ಮ ಪಾಠವೇ ನನ್ನ ದಾರಿಯ ಬೆಳಕು. ಹುಟ್ಟುಹಬ್ಬದ ಹಾರ್ದಿಕ ಶುಭಾಶಯಗಳು.",
      roman: "Nimma pāṭhavē nanna dāriya beḷaku. Huṭṭuhabbada hārdika shubhāshayagaḷu.",
    },
    casual: {
      native: "ನಿನ್ನ ಪಾಠವೇ ನನ್ನ ದಾರಿಯ ಬೆಳಕು. ಹುಟ್ಟುಹಬ್ಬದ ಹಾರ್ದಿಕ ಶುಭಾಶಯಗಳು.",
      roman: "Ninna pāṭhavē nanna dāriya beḷaku. Huṭṭuhabbada hārdika shubhāshayagaḷu.",
    },
    english: "Your teaching is the light on my path. Heartfelt birthday wishes.",
  },
  {
    id: "formal-occasion",
    tone: "formal",
    respectful: {
      native:
        "ಈ ಶುಭ ಸಂದರ್ಭದಲ್ಲಿ ನಿಮಗೆ ಹೃತ್ಪೂರ್ವಕ ಶುಭಾಶಯಗಳು. ನಿಮ್ಮ ಜೀವನ ಯಶಸ್ಸು ಮತ್ತು ಕೀರ್ತಿಯಿಂದ ಬೆಳಗಲಿ.",
      roman:
        "Ī shubha sandarbhadalli nimage hṛtpūrvaka shubhāshayagaḷu. Nimma jīvana yashassu mattu kīrtiyinda beḷagali.",
    },
    casual: {
      native:
        "ಈ ಶುಭ ಸಂದರ್ಭದಲ್ಲಿ ನಿನಗೆ ಹೃತ್ಪೂರ್ವಕ ಶುಭಾಶಯಗಳು. ನಿನ್ನ ಜೀವನ ಯಶಸ್ಸು ಮತ್ತು ಕೀರ್ತಿಯಿಂದ ಬೆಳಗಲಿ.",
      roman:
        "Ī shubha sandarbhadalli ninage hṛtpūrvaka shubhāshayagaḷu. Ninna jīvana yashassu mattu kīrtiyinda beḷagali.",
    },
    english:
      "Heartfelt wishes on this auspicious occasion. May your life shine with success and renown.",
  },
  {
    id: "formal-progress",
    tone: "formal",
    respectful: {
      native: "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು. ಮುಂಬರುವ ವರ್ಷ ನಿಮಗೆ ಆರೋಗ್ಯ, ನೆಮ್ಮದಿ ಮತ್ತು ಪ್ರಗತಿಯನ್ನು ತರಲಿ.",
      roman:
        "Huṭṭuhabbada shubhāshayagaḷu. Munbaruva varṣa nimage ārōgya, nemmadi mattu pragatiyannu tarali.",
    },
    casual: {
      native: "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು. ಮುಂಬರುವ ವರ್ಷ ನಿನಗೆ ಆರೋಗ್ಯ, ನೆಮ್ಮದಿ ಮತ್ತು ಪ್ರಗತಿಯನ್ನು ತರಲಿ.",
      roman:
        "Huṭṭuhabbada shubhāshayagaḷu. Munbaruva varṣa ninage ārōgya, nemmadi mattu pragatiyannu tarali.",
    },
    english: "Birthday wishes. May the coming year bring you health, peace and progress.",
  },
  {
    id: "formal-health",
    tone: "formal",
    respectful: {
      native: "ಆಯುರಾರೋಗ್ಯ ಮತ್ತು ಶಾಂತಿ ನಿಮ್ಮದಾಗಲಿ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು.",
      roman: "Āyurārōgya mattu shānti nimmadāgali. Huṭṭuhabbada shubhāshayagaḷu.",
    },
    casual: {
      native: "ಆಯುರಾರೋಗ್ಯ ಮತ್ತು ಶಾಂತಿ ನಿನ್ನದಾಗಲಿ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು.",
      roman: "Āyurārōgya mattu shānti ninnadāgali. Huṭṭuhabbada shubhāshayagaḷu.",
    },
    english: "May long life, health and peace be yours. Happy birthday.",
  },
  {
    id: "formal-team",
    tone: "formal",
    audience: ["colleague", "boss"],
    respectful: {
      native: "ನಿಮ್ಮ ಹುಟ್ಟುಹಬ್ಬಕ್ಕೆ ನಮ್ಮ ತಂಡದ ಪರವಾಗಿ ಶುಭಾಶಯಗಳು. ನಿಮ್ಮ ಮಾರ್ಗದರ್ಶನ ನಮಗೆ ಸದಾ ಬೆಂಬಲ.",
      roman:
        "Nimma huṭṭuhabbakke namma taṇḍada paravāgi shubhāshayagaḷu. Nimma mārgadarshana namage sadā bembala.",
    },
    casual: {
      native: "ನಿನ್ನ ಹುಟ್ಟುಹಬ್ಬಕ್ಕೆ ನಮ್ಮ ತಂಡದ ಪರವಾಗಿ ಶುಭಾಶಯಗಳು. ನಿನ್ನ ಒಡನಾಟ ನಮಗೆ ಸದಾ ಬೆಂಬಲ.",
      roman:
        "Ninna huṭṭuhabbakke namma taṇḍada paravāgi shubhāshayagaḷu. Ninna oḍanāṭa namage sadā bembala.",
    },
    english:
      "Birthday wishes on behalf of the whole team. Your guidance is always a support to us.",
  },
  {
    id: "formal-gratitude",
    tone: "formal",
    audience: ["colleague", "boss", "teacher"],
    respectful: {
      native: "ನಿಮ್ಮ ಹುಟ್ಟುಹಬ್ಬಕ್ಕೆ ಶುಭಾಶಯಗಳು. ನಿಮ್ಮ ಸಹಕಾರಕ್ಕೆ ನಾವು ಸದಾ ಕೃತಜ್ಞರಾಗಿದ್ದೇವೆ.",
      roman:
        "Nimma huṭṭuhabbakke shubhāshayagaḷu. Nimma sahakārakke nāvu sadā kṛtajñarāgiddēve.",
    },
    casual: {
      native: "ನಿನ್ನ ಹುಟ್ಟುಹಬ್ಬಕ್ಕೆ ಶುಭಾಶಯಗಳು. ನಿನ್ನ ಸಹಕಾರಕ್ಕೆ ನಾವು ಸದಾ ಕೃತಜ್ಞರಾಗಿದ್ದೇವೆ.",
      roman: "Ninna huṭṭuhabbakke shubhāshayagaḷu. Ninna sahakārakke nāvu sadā kṛtajñarāgiddēve.",
    },
    english: "Birthday wishes. We are always grateful for your support.",
  },
  {
    id: "blessing-hundred-years",
    tone: "blessing",
    respectful: {
      native: "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು! ನೀವು ನೂರ್ಕಾಲ ಸುಖವಾಗಿ ಬಾಳಿ.",
      roman: "Huṭṭuhabbada shubhāshayagaḷu! Nīvu nūrkāla sukhavāgi bāḷi.",
    },
    casual: {
      native: "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು! ನೀನು ನೂರ್ಕಾಲ ಸುಖವಾಗಿ ಬಾಳು.",
      roman: "Huṭṭuhabbada shubhāshayagaḷu! Nīnu nūrkāla sukhavāgi bāḷu.",
    },
    english: "Happy birthday! May you live a hundred years in happiness.",
  },
  {
    id: "blessing-god",
    tone: "blessing",
    respectful: {
      native: "ದೇವರು ನಿಮಗೆ ಆಯುರಾರೋಗ್ಯ ಮತ್ತು ಸಕಲ ಸೌಭಾಗ್ಯವನ್ನು ಕರುಣಿಸಲಿ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು!",
      roman:
        "Dēvaru nimage āyurārōgya mattu sakala saubhāgyavannu karuṇisali. Huṭṭuhabbada shubhāshayagaḷu!",
    },
    casual: {
      native: "ದೇವರು ನಿನಗೆ ಆಯುರಾರೋಗ್ಯ ಮತ್ತು ಸಕಲ ಸೌಭಾಗ್ಯವನ್ನು ಕರುಣಿಸಲಿ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು!",
      roman:
        "Dēvaru ninage āyurārōgya mattu sakala saubhāgyavannu karuṇisali. Huṭṭuhabbada shubhāshayagaḷu!",
    },
    english: "May God grant you long life, health and every good fortune. Happy birthday!",
  },
  {
    id: "blessing-lamp",
    tone: "blessing",
    respectful: {
      native: "ನಿಮ್ಮ ಬದುಕು ದೀಪದಂತೆ ಬೆಳಗಲಿ, ಪ್ರತಿ ದಿನವೂ ಹೊಸ ಸಂತಸ ತರಲಿ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು!",
      roman:
        "Nimma baduku dīpadante beḷagali, prati dinavū hosa santasa tarali. Huṭṭuhabbada shubhāshayagaḷu!",
    },
    casual: {
      native: "ನಿನ್ನ ಬದುಕು ದೀಪದಂತೆ ಬೆಳಗಲಿ, ಪ್ರತಿ ದಿನವೂ ಹೊಸ ಸಂತಸ ತರಲಿ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು!",
      roman:
        "Ninna baduku dīpadante beḷagali, prati dinavū hosa santasa tarali. Huṭṭuhabbada shubhāshayagaḷu!",
    },
    english: "May your life shine like a lamp and every day bring new joy. Happy birthday!",
  },
  {
    id: "blessing-parents",
    tone: "blessing",
    audience: ["mother", "father"],
    respectful: {
      native:
        "ನಿಮ್ಮ ಆಶೀರ್ವಾದವೇ ನಮ್ಮ ಮನೆಯ ಬಲ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು — ಸದಾ ಆರೋಗ್ಯವಾಗಿ, ಸಂತೋಷವಾಗಿ ಇರಿ.",
      roman:
        "Nimma āshīrvādavē namma maneya bala. Huṭṭuhabbada shubhāshayagaḷu — sadā ārōgyavāgi, santōṣavāgi iri.",
    },
    casual: {
      native:
        "ನಿನ್ನ ಪ್ರೀತಿಯೇ ನಮ್ಮ ಮನೆಯ ಬಲ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು — ಸದಾ ಆರೋಗ್ಯವಾಗಿ, ಸಂತೋಷವಾಗಿ ಇರು.",
      roman:
        "Ninna prītiyē namma maneya bala. Huṭṭuhabbada shubhāshayagaḷu — sadā ārōgyavāgi, santōṣavāgi iru.",
    },
    english: "Your blessing is the strength of our home. Happy birthday — stay well and happy always.",
  },
  {
    id: "blessing-grandparent",
    tone: "blessing",
    audience: ["grandmother", "grandfather"],
    respectful: {
      native:
        "ನಿಮ್ಮ ಕಥೆಗಳಲ್ಲೇ ನಮ್ಮ ಬಾಲ್ಯ ಬೆಳೆದಿದೆ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು — ನಿಮ್ಮ ಆಶೀರ್ವಾದ ಸದಾ ನಮ್ಮ ಮೇಲಿರಲಿ.",
      roman:
        "Nimma kathegaḷallē namma bālya beḷedide. Huṭṭuhabbada shubhāshayagaḷu — nimma āshīrvāda sadā namma mēlirali.",
    },
    casual: {
      native:
        "ನಿನ್ನ ಕಥೆಗಳಲ್ಲೇ ನಮ್ಮ ಬಾಲ್ಯ ಬೆಳೆದಿದೆ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು — ನಿನ್ನ ಆಶೀರ್ವಾದ ಸದಾ ನಮ್ಮ ಮೇಲಿರಲಿ.",
      roman:
        "Ninna kathegaḷallē namma bālya beḷedide. Huṭṭuhabbada shubhāshayagaḷu — ninna āshīrvāda sadā namma mēlirali.",
    },
    english:
      "Our childhood grew up inside your stories. Happy birthday — may your blessing always be on us.",
  },
  {
    id: "blessing-partner",
    tone: "blessing",
    audience: ["partner"],
    respectful: {
      native: "ನಿಮ್ಮ ಜೊತೆಯ ಪ್ರತಿ ವರ್ಷವೂ ನನ್ನ ಪಾಲಿಗೆ ಹಬ್ಬ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು, ನಮ್ಮ ಪ್ರೀತಿ ಹೀಗೇ ಬೆಳೆಯಲಿ.",
      roman:
        "Nimma joteya prati varṣavū nanna pālige habba. Huṭṭuhabbada shubhāshayagaḷu, namma prīti hīgē beḷeyali.",
    },
    casual: {
      native: "ನಿನ್ನ ಜೊತೆಯ ಪ್ರತಿ ವರ್ಷವೂ ನನ್ನ ಪಾಲಿಗೆ ಹಬ್ಬ. ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು, ನಮ್ಮ ಪ್ರೀತಿ ಹೀಗೇ ಬೆಳೆಯಲಿ.",
      roman:
        "Ninna joteya prati varṣavū nanna pālige habba. Huṭṭuhabbada shubhāshayagaḷu, namma prīti hīgē beḷeyali.",
    },
    english:
      "Every year with you is a festival for me. Happy birthday — may our love keep growing like this.",
  },
  {
    id: "funny-cake",
    tone: "funny",
    respectful: {
      native: "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು! ಕೇಕ್ ನೀವು ಕತ್ತರಿಸಿ, ತಿನ್ನುವುದು ನಾವು — ಇದೇ ನಮ್ಮ ಒಪ್ಪಂದ.",
      roman:
        "Huṭṭuhabbada shubhāshayagaḷu! Kēk nīvu kattarisi, tinnuvudu nāvu — idē namma oppanda.",
    },
    casual: {
      native: "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು! ಕೇಕ್ ನೀನು ಕತ್ತರಿಸು, ತಿನ್ನುವುದು ನಾವು — ಇದೇ ನಮ್ಮ ಗೆಳೆತನ.",
      roman:
        "Huṭṭuhabbada shubhāshayagaḷu! Kēk nīnu kattarisu, tinnuvudu nāvu — idē namma geḷetana.",
    },
    english: "Happy birthday! You cut the cake, we eat it — that is the arrangement.",
  },
  {
    id: "funny-number",
    tone: "funny",
    respectful: {
      native: "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು! ವಯಸ್ಸು ಬರೀ ಒಂದು ಸಂಖ್ಯೆ — ನಿಮ್ಮ ಸಂಖ್ಯೆ ವರ್ಷವರ್ಷಕ್ಕೂ ಚೆನ್ನಾಗುತ್ತಿದೆ.",
      roman:
        "Huṭṭuhabbada shubhāshayagaḷu! Vayassu barī ondu saṅkhye — nimma saṅkhye varṣavarṣakkū cennāguttide.",
    },
    casual: {
      native: "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು! ವಯಸ್ಸು ಬರೀ ಒಂದು ಸಂಖ್ಯೆ — ನಿನ್ನ ಸಂಖ್ಯೆ ವರ್ಷವರ್ಷಕ್ಕೂ ಚೆನ್ನಾಗುತ್ತಿದೆ.",
      roman:
        "Huṭṭuhabbada shubhāshayagaḷu! Vayassu barī ondu saṅkhye — ninna saṅkhye varṣavarṣakkū cennāguttide.",
    },
    english: "Happy birthday! Age is only a number — and yours keeps getting better every year.",
  },
  {
    id: "funny-wifi",
    tone: "funny",
    respectful: {
      native: "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು! ನಿಮ್ಮ ಬದುಕಿನಲ್ಲಿ ಸಂತೋಷ ವೈ-ಫೈನಂತೆ ಸದಾ ಕನೆಕ್ಟ್ ಆಗಿರಲಿ.",
      roman:
        "Huṭṭuhabbada shubhāshayagaḷu! Nimma badukinalli santōṣa vai-phainante sadā kanekṭ āgirali.",
    },
    casual: {
      native: "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು! ನಿನ್ನ ಬದುಕಿನಲ್ಲಿ ಸಂತೋಷ ವೈ-ಫೈನಂತೆ ಸದಾ ಕನೆಕ್ಟ್ ಆಗಿರಲಿ.",
      roman:
        "Huṭṭuhabbada shubhāshayagaḷu! Ninna badukinalli santōṣa vai-phainante sadā kanekṭ āgirali.",
    },
    english: "Happy birthday! May happiness stay connected to your life like Wi-Fi.",
  },
  {
    id: "funny-candles",
    tone: "funny",
    audience: ["friend", "younger-sibling", "elder-brother", "elder-sister", "partner"],
    respectful: {
      native: "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು! ನಿಮ್ಮ ಕೇಕಿನ ಮೇಲಿನ ಕ್ಯಾಂಡಲ್ ಎಣಿಸಲು ಹೋಗುವುದಿಲ್ಲ — ಸುಮ್ಮನೆ ತಿನ್ನೋಣ.",
      roman:
        "Huṭṭuhabbada shubhāshayagaḷu! Nimma kēkina mēlina kyāṇḍal eṇisalu hōguvudilla — summane tinnōṇa.",
    },
    casual: {
      native: "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು! ನಿನ್ನ ಕೇಕಿನ ಮೇಲಿನ ಕ್ಯಾಂಡಲ್ ಎಣಿಸಲು ಹೋಗುವುದಿಲ್ಲ — ಸುಮ್ಮನೆ ತಿನ್ನೋಣ.",
      roman:
        "Huṭṭuhabbada shubhāshayagaḷu! Ninna kēkina mēlina kyāṇḍal eṇisalu hōguvudilla — summane tinnōṇa.",
    },
    english: "Happy birthday! I am not going to count the candles on your cake — let us just eat it.",
  },
  {
    id: "funny-no-meeting",
    tone: "funny",
    audience: ["colleague", "boss"],
    respectful: {
      native: "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು! ಇಂದಾದರೂ ಮೀಟಿಂಗ್ ಇಲ್ಲದೆ ಕೇಕ್ ತಿನ್ನುವ ಅವಕಾಶ ನಿಮಗೆ ಸಿಗಲಿ.",
      roman:
        "Huṭṭuhabbada shubhāshayagaḷu! Indādarū mīṭiṅg illade kēk tinnuva avakāsha nimage sigali.",
    },
    casual: {
      native: "ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು! ಇಂದಾದರೂ ಮೀಟಿಂಗ್ ಇಲ್ಲದೆ ಕೇಕ್ ತಿನ್ನುವ ಅವಕಾಶ ನಿನಗೆ ಸಿಗಲಿ.",
      roman:
        "Huṭṭuhabbada shubhāshayagaḷu! Indādarū mīṭiṅg illade kēk tinnuva avakāsha ninage sigali.",
    },
    english: "Happy birthday! May you get to eat cake without a meeting, at least today.",
  },
];

/** Sign-offs, chosen by register. */
export const CLOSINGS = {
  respectful: {
    native: "ವಂದನೆಗಳೊಂದಿಗೆ,",
    roman: "Vandanegaḷondige,",
    english: "With regards,",
  },
  casual: {
    native: "ಪ್ರೀತಿಯಿಂದ,",
    roman: "Prītiyinda,",
    english: "With love,",
  },
};

export const MAX_MESSAGES = 6;
export const MAX_NAME_LENGTH = 40;

/**
 * GSM 03.38 basic alphabet. Anything outside it — all Kannada — forces UCS-2 encoding.
 */
const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
/** Extension characters cost two septets each. */
const GSM_EXTENDED = "^{}\\[~]|€";

/** Single-part and concatenated limits from 3GPP TS 23.038 / 23.040. */
export const GSM7_SINGLE = 160;
export const GSM7_CONCAT = 153;
export const UCS2_SINGLE = 70;
export const UCS2_CONCAT = 67;

/**
 * How many SMS parts a message needs.
 * Kannada is not in the GSM alphabet, so Kannada text is always UCS-2.
 */
export function smsSegments(text) {
  const value = typeof text === "string" ? text : "";
  if (value.length === 0) {
    return { encoding: "GSM-7", units: 0, segments: 0, limit: GSM7_SINGLE };
  }

  let gsmUnits = 0;
  let isGsm = true;
  for (const char of value) {
    if (GSM_BASIC.includes(char)) gsmUnits += 1;
    else if (GSM_EXTENDED.includes(char)) gsmUnits += 2;
    else {
      isGsm = false;
      break;
    }
  }

  if (isGsm) {
    const segments = gsmUnits <= GSM7_SINGLE ? 1 : Math.ceil(gsmUnits / GSM7_CONCAT);
    return {
      encoding: "GSM-7",
      units: gsmUnits,
      segments,
      limit: segments === 1 ? GSM7_SINGLE : GSM7_CONCAT,
    };
  }

  // UCS-2 counts 16-bit code units, which is exactly String#length in JavaScript.
  const units = value.length;
  const segments = units <= UCS2_SINGLE ? 1 : Math.ceil(units / UCS2_CONCAT);
  return {
    encoding: "UCS-2",
    units,
    segments,
    limit: segments === 1 ? UCS2_SINGLE : UCS2_CONCAT,
  };
}

/** Deterministic 32-bit PRNG (mulberry32). No Math.random anywhere in this file. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(items, seed) {
  const out = items.slice();
  const random = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Next seed in a fixed sequence, so a shuffle button stays reproducible. */
export function nextSeed(seed) {
  const current = Number.isFinite(seed) ? Math.abs(Math.trunc(seed)) : 1;
  return (current * 1664525 + 1013904223) % 2147483647 || 1;
}

function isTextLike(value) {
  return value === undefined || value === null || typeof value === "string" || typeof value === "number";
}

function cleanName(raw) {
  if (raw === undefined || raw === null) return "";
  return String(raw).replace(/\s+/g, " ").trim();
}

/** Drop a dangling "{name}" and tidy the spacing left behind when no name is given. */
function applyName(template, name) {
  if (name) return template.replaceAll("{name}", name);
  return template
    .replaceAll("{name}", "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/^[\s—-]+/, "")
    .trim();
}

/**
 * Start a line with a capital. Some salutations lead with the name ("{name} ಅಣ್ಣಾ,"), so with the
 * name left out the romanisation would otherwise begin lowercase. Kannada has no case, so this is
 * a no-op on the native line.
 */
function capitaliseFirst(text) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Wordings that suit this relationship: generic ones plus the ones addressed to it. */
export function templatesFor(relationshipId, tone = "any") {
  return TEMPLATES.filter((item) => {
    if (tone !== "any" && item.tone !== tone) return false;
    if (!item.audience) return true;
    return item.audience.includes(relationshipId);
  });
}

/**
 * Compose Kannada birthday messages.
 *
 * @param {object} input
 * @param {string} [input.name] the birthday person
 * @param {string} [input.relationshipId] one of RELATIONSHIPS
 * @param {"auto"|"respectful"|"casual"} [input.register]
 * @param {string} [input.tone] one of TONES
 * @param {number} [input.count] 1..MAX_MESSAGES
 * @param {number} [input.seed] integer; the same seed always gives the same messages
 * @param {string} [input.senderName] signed under the closing
 * @returns {{messages:Array, ...}|{error:string}}
 */
export function generateKannadaBirthdayWishes({
  name = "",
  relationshipId = "friend",
  register = "auto",
  tone = "any",
  count = 3,
  seed = 1,
  senderName = "",
} = {}) {
  const relationship = RELATIONSHIPS.find((item) => item.id === relationshipId);
  if (!relationship) return { error: "Choose who the message is for." };
  if (!TONES.some((item) => item.id === tone)) return { error: "Choose a valid tone." };
  if (register !== "auto" && !REGISTERS.some((item) => item.id === register)) {
    return { error: "Choose ನೀವು, ನೀನು or automatic." };
  }
  if (!Number.isInteger(count) || count < 1 || count > MAX_MESSAGES) {
    return { error: `Ask for between 1 and ${MAX_MESSAGES} messages.` };
  }
  if (!Number.isFinite(seed)) return { error: "The shuffle seed must be a number." };
  if (!isTextLike(name) || !isTextLike(senderName)) {
    return { error: "Names must be plain text." };
  }

  const cleanedName = cleanName(name);
  if (cleanedName.length > MAX_NAME_LENGTH) {
    return { error: `Keep the name under ${MAX_NAME_LENGTH} characters.` };
  }
  const cleanedSender = cleanName(senderName);
  if (cleanedSender.length > MAX_NAME_LENGTH) {
    return { error: `Keep your own name under ${MAX_NAME_LENGTH} characters.` };
  }

  const usedRegister = register === "auto" ? relationship.register : register;

  const pool = templatesFor(relationship.id, tone);
  if (pool.length === 0) return { error: "No wording matches that tone." };

  const safeSeed = Math.abs(Math.trunc(seed)) || 1;
  const picked = seededShuffle(pool, safeSeed).slice(0, Math.min(count, pool.length));

  // A relationship's salutation may embed a ನೀವು-only honorific (ಅವರೇ / ಗುರುಗಳೇ). If the
  // register is overridden to ನೀನು, fall back to that relationship's honorific-free
  // salutationCasual (when one is defined) so the greeting doesn't contradict the body.
  const salutationSource =
    usedRegister === "casual" && relationship.salutationCasual
      ? relationship.salutationCasual
      : relationship.salutation;
  const salutation = {
    native: applyName(salutationSource.native, cleanedName),
    roman: capitaliseFirst(applyName(salutationSource.roman, cleanedName)),
    english: capitaliseFirst(applyName(salutationSource.english, cleanedName)),
  };
  const closing = CLOSINGS[usedRegister];
  const signature = {
    native: cleanedSender ? `${closing.native}\n${cleanedSender}` : closing.native,
    roman: cleanedSender ? `${closing.roman}\n${cleanedSender}` : closing.roman,
    english: cleanedSender ? `${closing.english}\n${cleanedSender}` : closing.english,
  };

  const registerInfo = REGISTERS.find((item) => item.id === usedRegister);

  const messages = picked.map((item) => {
    const variant = item[usedRegister];
    const full = `${salutation.native}\n${variant.native}\n${signature.native}`;
    return {
      id: item.id,
      tone: item.tone,
      audienceSpecific: Boolean(item.audience),
      native: variant.native,
      roman: variant.roman,
      english: item.english,
      full,
      fullRoman: `${salutation.roman}\n${variant.roman}\n${signature.roman}`,
      fullEnglish: `${salutation.english}\n${item.english}\n${signature.english}`,
      sms: smsSegments(full),
    };
  });

  return {
    messages,
    language: LANGUAGE,
    relationship,
    register: usedRegister,
    registerInfo,
    autoRegister: relationship.register,
    registerOverridden: register !== "auto" && register !== relationship.register,
    tone,
    salutation,
    closing,
    requested: count,
    delivered: messages.length,
    poolSize: pool.length,
  };
}
