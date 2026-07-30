/**
 * Malayalam birthday wishes composer.
 *
 * Pure data + pure functions. No React, no DOM, no network, no clock, no ambient randomness:
 * every shuffle is seeded, so identical input always yields byte-identical output.
 *
 * Three real rules drive the output:
 *
 * 1. T-V distinction. Malayalam separates നീ (nī, familiar) from നിങ്ങൾ (niṅṅaḷ, respectful)
 *    and താങ്കൾ (tāṅkaḷ, the formal written honorific). Malayalam verbs do not inflect for
 *    person, so the register lives entirely in the pronoun and its case forms —
 *    നിന്റെ / നിങ്ങളുടെ / താങ്കളുടെ, നിനക്ക് / നിങ്ങൾക്ക് / താങ്കൾക്ക്. The നീ and നിങ്ങൾ
 *    wordings are written out separately rather than word-swapped, because the familiar
 *    stem (നിന്‍-) is irregular. താങ്കൾ *is* a regular stem swap on നിങ്ങൾ (both take the
 *    same case endings), so it is derived from the respectful text by FORMAL_STEM below.
 * 2. Relationship, not just a name slot. Templates carry a `for` list; wordings written for
 *    a parent, a partner, a child, a teacher or a manager are only ever offered to that
 *    relationship, and they are ranked ahead of the general wordings. Two relationships
 *    therefore get genuinely different sentences, not the same sentence with a new name.
 * 3. SMS length. Malayalam is outside the GSM 03.38 7-bit alphabet, so the message is sent
 *    as UCS-2: 70 characters in a single SMS, 67 per part once concatenated
 *    (3GPP TS 23.038 / 23.040).
 */

export const LANGUAGE = {
  name: "Malayalam",
  nativeName: "മലയാളം",
  script: "Malayalam",
  iso: "ml",
};

/** Politeness registers, least to most formal. */
export const REGISTERS = [
  {
    id: "casual",
    label: "നീ — familiar",
    pronoun: "നീ",
    pronounRoman: "nī",
    note: "Used with friends, a partner, younger siblings and children.",
  },
  {
    id: "respectful",
    label: "നിങ്ങൾ — respectful",
    pronoun: "നിങ്ങൾ",
    pronounRoman: "niṅṅaḷ",
    note: "The everyday polite form: parents, elder siblings, colleagues, anyone older.",
  },
  {
    id: "formal",
    label: "താങ്കൾ — formal honorific",
    pronoun: "താങ്കൾ",
    pronounRoman: "tāṅkaḷ",
    note: "Written and ceremonial Malayalam: managers, teachers, clients, public messages.",
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
 * Who the message is for. `register` is the pronoun a Malayalam speaker would default to.
 * Salutations avoid gendered vocatives except where the kinship term itself is gendered
 * (ചേട്ടൻ / ചേച്ചി, അമ്മ / അച്ഛൻ), which is unavoidable in Malayalam.
 */
export const RELATIONSHIPS = [
  {
    id: "friend",
    label: "Friend",
    register: "casual",
    salutation: {
      native: "പ്രിയ സുഹൃത്ത് {name},",
      roman: "Priya suhr̥tt {name},",
      english: "Dear friend {name},",
    },
  },
  {
    id: "elder-brother",
    label: "Elder brother",
    register: "respectful",
    salutation: {
      native: "{name} ചേട്ടാ,",
      roman: "{name} cēṭṭā,",
      english: "Elder brother {name},",
    },
  },
  {
    id: "elder-sister",
    label: "Elder sister",
    register: "respectful",
    salutation: {
      native: "{name} ചേച്ചീ,",
      roman: "{name} cēccī,",
      english: "Elder sister {name},",
    },
  },
  {
    id: "younger-sibling",
    label: "Younger brother or sister",
    register: "casual",
    salutation: {
      native: "പ്രിയ {name},",
      roman: "Priya {name},",
      english: "Dear {name},",
    },
  },
  {
    id: "mother",
    label: "Mother",
    register: "respectful",
    salutation: {
      native: "പ്രിയപ്പെട്ട അമ്മേ,",
      roman: "Priyappeṭṭa ammē,",
      english: "Dearest Amma,",
    },
  },
  {
    id: "father",
    label: "Father",
    register: "respectful",
    salutation: {
      native: "പ്രിയപ്പെട്ട അച്ഛാ,",
      roman: "Priyappeṭṭa acchā,",
      english: "Dearest Achcha,",
    },
  },
  {
    id: "partner",
    label: "Partner or spouse",
    register: "casual",
    salutation: {
      native: "പ്രിയപ്പെട്ട {name},",
      roman: "Priyappeṭṭa {name},",
      english: "My dearest {name},",
    },
  },
  {
    id: "child",
    label: "Son or daughter",
    register: "casual",
    salutation: {
      native: "എന്റെ പൊന്നു {name},",
      roman: "Enṟe ponnu {name},",
      english: "My darling {name},",
    },
  },
  {
    id: "colleague",
    label: "Colleague",
    register: "respectful",
    salutation: {
      native: "ടീമിന്റെ പേരിൽ, പ്രിയ {name},",
      roman: "Ṭīminṟe pēril, priya {name},",
      english: "On behalf of the team, dear {name},",
    },
  },
  {
    id: "boss",
    label: "Manager or senior",
    register: "formal",
    salutation: {
      native: "ബഹുമാനപ്പെട്ട {name},",
      roman: "Bahumānappeṭṭa {name},",
      english: "Respected {name},",
    },
  },
  {
    id: "teacher",
    label: "Teacher",
    register: "formal",
    salutation: {
      native: "ബഹുമാനപ്പെട്ട {name} ടീച്ചർ,",
      roman: "Bahumānappeṭṭa {name} ṭīccar,",
      english: "Respected {name} teacher,",
    },
  },
];

/**
 * Message bodies. `casual` uses നീ / നിന്റെ / നിനക്ക്; `respectful` uses നിങ്ങൾ and its
 * case forms. The താങ്കൾ text is derived from `respectful` — see toFormalVariant().
 * `for` restricts a wording to the listed relationships.
 */
export const TEMPLATES = [
  {
    id: "warm-basic",
    tone: "warm",
    casual: {
      native: "ഹൃദയം നിറഞ്ഞ ജന്മദിനാശംസകൾ! നിന്റെ ഈ വർഷം സന്തോഷവും നല്ല ആരോഗ്യവും നിറഞ്ഞതാകട്ടെ.",
      roman:
        "Hr̥dayaṁ niṟañña janmadināśaṁsakaḷ! Ninṟe ī varṣaṁ santōṣavuṁ nalla ārōgyavuṁ niṟaññatākaṭṭe.",
    },
    respectful: {
      native: "ഹൃദയം നിറഞ്ഞ ജന്മദിനാശംസകൾ! നിങ്ങളുടെ ഈ വർഷം സന്തോഷവും നല്ല ആരോഗ്യവും നിറഞ്ഞതാകട്ടെ.",
      roman:
        "Hr̥dayaṁ niṟañña janmadināśaṁsakaḷ! Niṅṅaḷuṭe ī varṣaṁ santōṣavuṁ nalla ārōgyavuṁ niṟaññatākaṭṭe.",
    },
    english: "Heartfelt birthday wishes! May this year of yours be full of happiness and good health.",
  },
  {
    id: "warm-pirannal",
    tone: "warm",
    casual: {
      native: "പിറന്നാൾ ആശംസകൾ! നിന്റെ എല്ലാ ആഗ്രഹങ്ങളും സഫലമാകട്ടെ.",
      roman: "Piṟannāḷ āśaṁsakaḷ! Ninṟe ellā āgrahaṅṅaḷuṁ saphalamākaṭṭe.",
    },
    respectful: {
      native: "പിറന്നാൾ ആശംസകൾ! നിങ്ങളുടെ എല്ലാ ആഗ്രഹങ്ങളും സഫലമാകട്ടെ.",
      roman: "Piṟannāḷ āśaṁsakaḷ! Niṅṅaḷuṭe ellā āgrahaṅṅaḷuṁ saphalamākaṭṭe.",
    },
    english: "Happy birthday! May every one of your wishes come true.",
  },
  {
    id: "warm-coming-year",
    tone: "warm",
    casual: {
      native: "ജന്മദിനാശംസകൾ! വരുന്ന വർഷം നിനക്ക് ചിരിയും സ്നേഹവും സമാധാനവും സമ്മാനിക്കട്ടെ.",
      roman: "Janmadināśaṁsakaḷ! Varunna varṣaṁ ninakk ciriyuṁ snēhavuṁ samādhānavuṁ sammānikkaṭṭe.",
    },
    respectful: {
      native: "ജന്മദിനാശംസകൾ! വരുന്ന വർഷം നിങ്ങൾക്ക് ചിരിയും സ്നേഹവും സമാധാനവും സമ്മാനിക്കട്ടെ.",
      roman: "Janmadināśaṁsakaḷ! Varunna varṣaṁ niṅṅaḷkk ciriyuṁ snēhavuṁ samādhānavuṁ sammānikkaṭṭe.",
    },
    english: "Happy birthday! May the coming year gift you laughter, love and peace.",
  },
  {
    id: "warm-best-part",
    tone: "warm",
    for: [
      "friend",
      "partner",
      "child",
      "mother",
      "father",
      "elder-brother",
      "elder-sister",
      "younger-sibling",
    ],
    casual: {
      native: "ജന്മദിനാശംസകൾ! എന്റെ ജീവിതത്തിലെ ഏറ്റവും നല്ല ഭാഗം നീയാണ്.",
      roman: "Janmadināśaṁsakaḷ! Enṟe jīvitattile ēṟṟavuṁ nalla bhāgaṁ nīyāṇ.",
    },
    respectful: {
      native: "ജന്മദിനാശംസകൾ! എന്റെ ജീവിതത്തിലെ ഏറ്റവും നല്ല ഭാഗം നിങ്ങളാണ്.",
      roman: "Janmadināśaṁsakaḷ! Enṟe jīvitattile ēṟṟavuṁ nalla bhāgaṁ niṅṅaḷāṇ.",
    },
    english: "Happy birthday! You are the best part of my life.",
  },
  {
    id: "warm-friendship",
    tone: "warm",
    for: ["friend"],
    casual: {
      native: "ജന്മദിനാശംസകൾ! കൊല്ലങ്ങൾ എത്ര കഴിഞ്ഞാലും നിന്നോടുള്ള കൂട്ട് പഴയതുപോലെ തന്നെ.",
      roman: "Janmadināśaṁsakaḷ! Kollaṅṅaḷ etra kaḻiññāluṁ ninnōṭuḷḷa kūṭṭ paḻayatupōle tanne.",
    },
    respectful: {
      native: "ജന്മദിനാശംസകൾ! കൊല്ലങ്ങൾ എത്ര കഴിഞ്ഞാലും നിങ്ങളോടുള്ള കൂട്ട് പഴയതുപോലെ തന്നെ.",
      roman: "Janmadināśaṁsakaḷ! Kollaṅṅaḷ etra kaḻiññāluṁ niṅṅaḷōṭuḷḷa kūṭṭ paḻayatupōle tanne.",
    },
    english: "Happy birthday! However many years pass, our friendship stays exactly as it was.",
  },
  {
    id: "warm-partner",
    tone: "warm",
    for: ["partner"],
    casual: {
      native: "ജന്മദിനാശംസകൾ! നിന്റെ കൂടെയുള്ള ഓരോ വർഷവും എന്റെ ഏറ്റവും നല്ല വർഷമാകുന്നു.",
      roman: "Janmadināśaṁsakaḷ! Ninṟe kūṭeyuḷḷa ōrō varṣavuṁ enṟe ēṟṟavuṁ nalla varṣamākunnu.",
    },
    respectful: {
      native: "ജന്മദിനാശംസകൾ! നിങ്ങളുടെ കൂടെയുള്ള ഓരോ വർഷവും എന്റെ ഏറ്റവും നല്ല വർഷമാകുന്നു.",
      roman: "Janmadināśaṁsakaḷ! Niṅṅaḷuṭe kūṭeyuḷḷa ōrō varṣavuṁ enṟe ēṟṟavuṁ nalla varṣamākunnu.",
    },
    english: "Happy birthday! Every year spent with you turns out to be my best year yet.",
  },
  {
    id: "warm-child",
    tone: "warm",
    for: ["child"],
    casual: {
      native:
        "ജന്മദിനാശംസകൾ! നീ ഞങ്ങളുടെ ഏറ്റവും വലിയ സന്തോഷമാണ്; ഈ വർഷവും ചിരിച്ചു വളരട്ടെ.",
      roman:
        "Janmadināśaṁsakaḷ! Nī ñaṅṅaḷuṭe ēṟṟavuṁ valiya santōṣamāṇ; ī varṣavuṁ ciriccu vaḷaraṭṭe.",
    },
    respectful: {
      native:
        "ജന്മദിനാശംസകൾ! നിങ്ങൾ ഞങ്ങളുടെ ഏറ്റവും വലിയ സന്തോഷമാണ്; ഈ വർഷവും ചിരിച്ചു വളരട്ടെ.",
      roman:
        "Janmadināśaṁsakaḷ! Niṅṅaḷ ñaṅṅaḷuṭe ēṟṟavuṁ valiya santōṣamāṇ; ī varṣavuṁ ciriccu vaḷaraṭṭe.",
    },
    english:
      "Happy birthday! You are our greatest joy — may you keep laughing and growing this year too.",
  },
  {
    id: "formal-occasion",
    tone: "formal",
    casual: {
      native: "ഈ ജന്മദിനത്തിൽ നിനക്ക് ഹൃദയപൂർവ്വം ആശംസകൾ. നിന്റെ ജീവിതം വിജയവും അഭിമാനവും നിറഞ്ഞതാകട്ടെ.",
      roman:
        "Ī janmadinattil ninakk hr̥dayapūrvvaṁ āśaṁsakaḷ. Ninṟe jīvitaṁ vijayavuṁ abhimānavuṁ niṟaññatākaṭṭe.",
    },
    respectful: {
      native:
        "ഈ ജന്മദിനത്തിൽ നിങ്ങൾക്ക് ഹൃദയപൂർവ്വം ആശംസകൾ. നിങ്ങളുടെ ജീവിതം വിജയവും അഭിമാനവും നിറഞ്ഞതാകട്ടെ.",
      roman:
        "Ī janmadinattil niṅṅaḷkk hr̥dayapūrvvaṁ āśaṁsakaḷ. Niṅṅaḷuṭe jīvitaṁ vijayavuṁ abhimānavuṁ niṟaññatākaṭṭe.",
    },
    english: "Heartfelt wishes to you on this birthday. May your life be filled with success and honour.",
  },
  {
    id: "formal-progress",
    tone: "formal",
    casual: {
      native: "ജന്മദിനാശംസകൾ. വരുന്ന വർഷം നിനക്ക് ആരോഗ്യവും സമാധാനവും പുരോഗതിയും നൽകട്ടെ.",
      roman: "Janmadināśaṁsakaḷ. Varunna varṣaṁ ninakk ārōgyavuṁ samādhānavuṁ purōgatiyuṁ nalkaṭṭe.",
    },
    respectful: {
      native: "ജന്മദിനാശംസകൾ. വരുന്ന വർഷം നിങ്ങൾക്ക് ആരോഗ്യവും സമാധാനവും പുരോഗതിയും നൽകട്ടെ.",
      roman: "Janmadināśaṁsakaḷ. Varunna varṣaṁ niṅṅaḷkk ārōgyavuṁ samādhānavuṁ purōgatiyuṁ nalkaṭṭe.",
    },
    english: "Birthday wishes. May the coming year bring you health, peace and progress.",
  },
  {
    id: "formal-colleague",
    tone: "formal",
    for: ["colleague", "boss"],
    casual: {
      native: "ജന്മദിനാശംസകൾ! നിന്നോടൊപ്പം ജോലി ചെയ്യാൻ കഴിയുന്നത് ഒരു ഭാഗ്യമാണ്.",
      roman: "Janmadināśaṁsakaḷ! Ninnōṭoppaṁ jōli ceyyān kaḻiyunnat oru bhāgyamāṇ.",
    },
    respectful: {
      native: "ജന്മദിനാശംസകൾ! നിങ്ങളോടൊപ്പം ജോലി ചെയ്യാൻ കഴിയുന്നത് ഒരു ഭാഗ്യമാണ്.",
      roman: "Janmadināśaṁsakaḷ! Niṅṅaḷōṭoppaṁ jōli ceyyān kaḻiyunnat oru bhāgyamāṇ.",
    },
    english: "Happy birthday! Being able to work alongside you is genuinely good fortune.",
  },
  {
    id: "formal-leader",
    tone: "formal",
    for: ["boss"],
    casual: {
      native: "ജന്മദിനാശംസകൾ! നിന്റെ നേതൃത്വം ഞങ്ങൾക്കെല്ലാം ഒരു മാതൃകയാണ്.",
      roman: "Janmadināśaṁsakaḷ! Ninṟe nētr̥tvaṁ ñaṅṅaḷkkellāṁ oru mātr̥kayāṇ.",
    },
    respectful: {
      native: "ജന്മദിനാശംസകൾ! നിങ്ങളുടെ നേതൃത്വം ഞങ്ങൾക്കെല്ലാം ഒരു മാതൃകയാണ്.",
      roman: "Janmadināśaṁsakaḷ! Niṅṅaḷuṭe nētr̥tvaṁ ñaṅṅaḷkkellāṁ oru mātr̥kayāṇ.",
    },
    english: "Happy birthday! Your leadership is an example to every one of us.",
  },
  {
    id: "formal-teacher",
    tone: "formal",
    for: ["teacher"],
    casual: {
      native: "ജന്മദിനാശംസകൾ! നീ പകർന്ന അറിവാണ് ഇന്ന് എന്റെ വഴിവിളക്ക്.",
      roman: "Janmadināśaṁsakaḷ! Nī pakarnna aṟivāṇ inn enṟe vaḻiviḷakk.",
    },
    respectful: {
      native: "ജന്മദിനാശംസകൾ! നിങ്ങൾ പകർന്ന അറിവാണ് ഇന്ന് എന്റെ വഴിവിളക്ക്.",
      roman: "Janmadināśaṁsakaḷ! Niṅṅaḷ pakarnna aṟivāṇ inn enṟe vaḻiviḷakk.",
    },
    english: "Happy birthday! The knowledge you passed on is the lamp that lights my way today.",
  },
  {
    id: "blessing-long-life",
    tone: "blessing",
    casual: {
      native: "ജന്മദിനാശംസകൾ! ദൈവം നിനക്ക് ദീർഘായുസ്സും നല്ല ആരോഗ്യവും നൽകട്ടെ.",
      roman: "Janmadināśaṁsakaḷ! Daivaṁ ninakk dīrghāyussuṁ nalla ārōgyavuṁ nalkaṭṭe.",
    },
    respectful: {
      native: "ജന്മദിനാശംസകൾ! ദൈവം നിങ്ങൾക്ക് ദീർഘായുസ്സും നല്ല ആരോഗ്യവും നൽകട്ടെ.",
      roman: "Janmadināśaṁsakaḷ! Daivaṁ niṅṅaḷkk dīrghāyussuṁ nalla ārōgyavuṁ nalkaṭṭe.",
    },
    english: "Happy birthday! May God grant you a long life and good health.",
  },
  {
    id: "blessing-lamp",
    tone: "blessing",
    casual: {
      native:
        "നിന്റെ ജീവിതം വിളക്കുപോലെ പ്രകാശിക്കട്ടെ, ഓരോ ദിവസവും പുതിയ സന്തോഷം കൊണ്ടുവരട്ടെ. ജന്മദിനാശംസകൾ!",
      roman:
        "Ninṟe jīvitaṁ viḷakkupōle prakāśikkaṭṭe, ōrō divasavuṁ putiya santōṣaṁ koṇṭuvaraṭṭe. Janmadināśaṁsakaḷ!",
    },
    respectful: {
      native:
        "നിങ്ങളുടെ ജീവിതം വിളക്കുപോലെ പ്രകാശിക്കട്ടെ, ഓരോ ദിവസവും പുതിയ സന്തോഷം കൊണ്ടുവരട്ടെ. ജന്മദിനാശംസകൾ!",
      roman:
        "Niṅṅaḷuṭe jīvitaṁ viḷakkupōle prakāśikkaṭṭe, ōrō divasavuṁ putiya santōṣaṁ koṇṭuvaraṭṭe. Janmadināśaṁsakaḷ!",
    },
    english: "May your life shine like a lamp and every day bring new joy. Happy birthday!",
  },
  {
    id: "blessing-parents",
    tone: "blessing",
    for: ["mother", "father"],
    casual: {
      native:
        "നിന്റെ കൂടെയുള്ളതാണ് ഞങ്ങളുടെ വീടിന്റെ ബലം. ഹൃദയം നിറഞ്ഞ ജന്മദിനാശംസകൾ — എന്നും സുഖമായും സന്തോഷമായും ഇരിക്കണേ.",
      roman:
        "Ninṟe kūṭeyuḷḷatāṇ ñaṅṅaḷuṭe vīṭinṟe balaṁ. Hr̥dayaṁ niṟañña janmadināśaṁsakaḷ — ennuṁ sukhamāyuṁ santōṣamāyuṁ irikkaṇē.",
    },
    respectful: {
      native:
        "നിങ്ങളുടെ അനുഗ്രഹമാണ് ഞങ്ങളുടെ വീടിന്റെ ബലം. ഹൃദയം നിറഞ്ഞ ജന്മദിനാശംസകൾ — എന്നും സുഖമായും സന്തോഷമായും ഇരിക്കണം.",
      roman:
        "Niṅṅaḷuṭe anugrahamāṇ ñaṅṅaḷuṭe vīṭinṟe balaṁ. Hr̥dayaṁ niṟañña janmadināśaṁsakaḷ — ennuṁ sukhamāyuṁ santōṣamāyuṁ irikkaṇaṁ.",
    },
    english:
      "Your blessing is the strength of our home. Heartfelt birthday wishes — stay well and happy always.",
  },
  {
    id: "blessing-workmate",
    tone: "blessing",
    for: ["colleague", "boss"],
    casual: {
      native: "ജന്മദിനാശംസകൾ! ഈ പുതിയ വർഷം നിന്റെ അധ്വാനത്തിന് നല്ല ഫലം നൽകട്ടെ.",
      roman: "Janmadināśaṁsakaḷ! Ī putiya varṣaṁ ninṟe adhvānattin nalla phalaṁ nalkaṭṭe.",
    },
    respectful: {
      native: "ജന്മദിനാശംസകൾ! ഈ പുതിയ വർഷം നിങ്ങളുടെ അധ്വാനത്തിന് നല്ല ഫലം നൽകട്ടെ.",
      roman: "Janmadināśaṁsakaḷ! Ī putiya varṣaṁ niṅṅaḷuṭe adhvānattin nalla phalaṁ nalkaṭṭe.",
    },
    english: "Happy birthday! May this new year pay your hard work back properly.",
  },
  {
    id: "blessing-sibling",
    tone: "blessing",
    for: ["elder-brother", "elder-sister", "younger-sibling"],
    casual: {
      native:
        "ജന്മദിനാശംസകൾ! ഈ വീട്ടിലെ ഏറ്റവും വലിയ ഭാഗ്യം നമ്മൾ ഒരുമിച്ചുള്ളതാണ്; നിനക്ക് ദീർഘായുസ്സ് നേരുന്നു.",
      roman:
        "Janmadināśaṁsakaḷ! Ī vīṭṭile ēṟṟavuṁ valiya bhāgyaṁ nammaḷ orumicchuḷḷatāṇ; ninakk dīrghāyuss nērunnu.",
    },
    respectful: {
      native:
        "ജന്മദിനാശംസകൾ! ഈ വീട്ടിലെ ഏറ്റവും വലിയ ഭാഗ്യം നമ്മൾ ഒരുമിച്ചുള്ളതാണ്; നിങ്ങൾക്ക് ദീർഘായുസ്സ് നേരുന്നു.",
      roman:
        "Janmadināśaṁsakaḷ! Ī vīṭṭile ēṟṟavuṁ valiya bhāgyaṁ nammaḷ orumicchuḷḷatāṇ; niṅṅaḷkk dīrghāyuss nērunnu.",
    },
    english:
      "Happy birthday! The best luck this house ever had is having each other — wishing you a long life.",
  },
  {
    id: "formal-household",
    tone: "formal",
    for: ["mother", "father", "partner", "child"],
    casual: {
      native: "ജന്മദിനാശംസകൾ. നിന്റെ ചിരിയാണ് ഈ വീടിന്റെ ഏറ്റവും വലിയ സമ്പത്ത്.",
      roman: "Janmadināśaṁsakaḷ. Ninṟe ciriyāṇ ī vīṭinṟe ēṟṟavuṁ valiya sampatt.",
    },
    respectful: {
      native: "ജന്മദിനാശംസകൾ. നിങ്ങളുടെ ചിരിയാണ് ഈ വീടിന്റെ ഏറ്റവും വലിയ സമ്പത്ത്.",
      roman: "Janmadināśaṁsakaḷ. Niṅṅaḷuṭe ciriyāṇ ī vīṭinṟe ēṟṟavuṁ valiya sampatt.",
    },
    english: "Birthday wishes. Your laughter is the greatest wealth this house owns.",
  },
  {
    id: "funny-cake",
    tone: "funny",
    casual: {
      native: "ജന്മദിനാശംസകൾ! കേക്ക് നീ മുറിക്ക്, തിന്നാൻ ഞങ്ങളുണ്ട് — അതാണ് യഥാർത്ഥ കൂട്ടുകെട്ട്.",
      roman: "Janmadināśaṁsakaḷ! Kēkk nī muṟikk, tinnān ñaṅṅaḷuṇṭ — atāṇ yathārtha kūṭṭukeṭṭ.",
    },
    respectful: {
      native: "ജന്മദിനാശംസകൾ! കേക്ക് നിങ്ങൾ മുറിക്കൂ, തിന്നാൻ ഞങ്ങളുണ്ട് — അതാണ് യഥാർത്ഥ സ്നേഹം.",
      roman: "Janmadināśaṁsakaḷ! Kēkk niṅṅaḷ muṟikkū, tinnān ñaṅṅaḷuṇṭ — atāṇ yathārtha snēhaṁ.",
    },
    english: "Happy birthday! You cut the cake, we are here to eat it — that is real affection.",
  },
  {
    id: "funny-number",
    tone: "funny",
    casual: {
      native: "ജന്മദിനാശംസകൾ! വയസ്സ് വെറും ഒരു അക്കം മാത്രമാണ് — നിന്റെ അക്കം വർഷാവർഷം മെച്ചമാകുന്നു.",
      roman:
        "Janmadināśaṁsakaḷ! Vayass veṟuṁ oru akkaṁ mātramāṇ — ninṟe akkaṁ varṣāvarṣaṁ meccamākunnu.",
    },
    respectful: {
      native:
        "ജന്മദിനാശംസകൾ! വയസ്സ് വെറും ഒരു അക്കം മാത്രമാണ് — നിങ്ങളുടെ അക്കം വർഷാവർഷം മെച്ചമാകുന്നു.",
      roman:
        "Janmadināśaṁsakaḷ! Vayass veṟuṁ oru akkaṁ mātramāṇ — niṅṅaḷuṭe akkaṁ varṣāvarṣaṁ meccamākunnu.",
    },
    english: "Happy birthday! Age is only a number — and yours gets better every single year.",
  },
  {
    id: "funny-wifi",
    tone: "funny",
    casual: {
      native: "ജന്മദിനാശംസകൾ! നിന്റെ ജീവിതത്തിൽ സന്തോഷം വൈഫൈ പോലെ എപ്പോഴും കണക്റ്റ് ആയിരിക്കട്ടെ.",
      roman: "Janmadināśaṁsakaḷ! Ninṟe jīvitattil santōṣaṁ Wi-Fi pōle eppōḻuṁ connect āyirikkaṭṭe.",
    },
    respectful: {
      native: "ജന്മദിനാശംസകൾ! നിങ്ങളുടെ ജീവിതത്തിൽ സന്തോഷം വൈഫൈ പോലെ എപ്പോഴും കണക്റ്റ് ആയിരിക്കട്ടെ.",
      roman: "Janmadināśaṁsakaḷ! Niṅṅaḷuṭe jīvitattil santōṣaṁ Wi-Fi pōle eppōḻuṁ connect āyirikkaṭṭe.",
    },
    english: "Happy birthday! May happiness stay connected to your life the way Wi-Fi does.",
  },
  {
    id: "funny-sibling",
    tone: "funny",
    for: ["elder-brother", "elder-sister", "younger-sibling"],
    casual: {
      native: "ജന്മദിനാശംസകൾ! വഴക്കും കളിയാക്കലും ഉണ്ടെങ്കിലും നിന്നെപ്പോലെ ഒരാൾ വേറെയില്ല.",
      roman: "Janmadināśaṁsakaḷ! Vaḻakkuṁ kaḷiyākkaluṁ uṇṭeṅkiluṁ ninneppōle orāḷ vēṟeyilla.",
    },
    respectful: {
      native: "ജന്മദിനാശംസകൾ! വഴക്കും കളിയാക്കലും ഉണ്ടെങ്കിലും നിങ്ങളെപ്പോലെ ഒരാൾ വേറെയില്ല.",
      roman: "Janmadināśaṁsakaḷ! Vaḻakkuṁ kaḷiyākkaluṁ uṇṭeṅkiluṁ niṅṅaḷeppōle orāḷ vēṟeyilla.",
    },
    english: "Happy birthday! Quarrels and teasing aside, there is nobody else quite like you.",
  },
];

/** Sign-offs, chosen by register. */
export const CLOSINGS = {
  casual: {
    native: "ഒരുപാട് സ്നേഹത്തോടെ,",
    roman: "Orupāṭ snēhattōṭe,",
    english: "With lots of love,",
  },
  respectful: {
    native: "സ്നേഹാശംസകളോടെ,",
    roman: "Snēhāśaṁsakaḷōṭe,",
    english: "With warm wishes,",
  },
  formal: {
    native: "ആദരപൂർവ്വം ആശംസകളോടെ,",
    roman: "Ādarapūrvvaṁ āśaṁsakaḷōṭe,",
    english: "With respectful good wishes,",
  },
};

export const MAX_MESSAGES = 6;
export const MAX_NAME_LENGTH = 40;

/**
 * താങ്കൾ and നിങ്ങൾ take identical case endings (-ുടെ, -ക്ക്, -ഓട്, -എ), so the honorific
 * is a clean stem substitution on the respectful text. നിങ്ങ + ൾ/ള -> താങ്ക + ൾ/ള.
 * ഞങ്ങൾ ("we") does not match, so first-person plurals are left alone.
 */
const FORMAL_STEM = { native: /നിങ്ങ(ൾ|ള)/g, roman: /([Nn])iṅṅaḷ/g };

function toFormalVariant(respectful) {
  return {
    native: respectful.native.replace(FORMAL_STEM.native, "താങ്ക$1"),
    roman: respectful.roman.replace(FORMAL_STEM.roman, (match, initial) =>
      initial === "N" ? "Tāṅkaḷ" : "tāṅkaḷ",
    ),
  };
}

/** Resolve a template into one register's wording. */
export function variantFor(template, register) {
  if (register === "casual") return template.casual;
  if (register === "formal") return toFormalVariant(template.respectful);
  return template.respectful;
}

/** GSM 03.38 basic alphabet. Anything outside it (all Malayalam) forces UCS-2 encoding. */
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
 * Malayalam is not in the GSM alphabet, so Malayalam text is always UCS-2.
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

/** Deterministic 32-bit PRNG (mulberry32) — the only source of randomness in this file. */
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
    .trim();
}

/**
 * Compose Malayalam birthday messages.
 *
 * @param {object} input
 * @param {string} [input.name] the birthday person
 * @param {string} [input.relationshipId] one of RELATIONSHIPS
 * @param {"auto"|"casual"|"respectful"|"formal"} [input.register]
 * @param {string} [input.tone] one of TONES
 * @param {number} [input.count] 1..MAX_MESSAGES
 * @param {number} [input.seed] integer; the same seed gives the same messages
 * @param {string} [input.senderName] signed under the closing
 * @returns {{messages:Array}|{error:string}}
 */
export function generateMalayalamBirthdayWishes({
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
    return { error: "Choose നീ, നിങ്ങൾ, താങ്കൾ or automatic." };
  }
  if (!Number.isInteger(count) || count < 1 || count > MAX_MESSAGES) {
    return { error: `Ask for between 1 and ${MAX_MESSAGES} messages.` };
  }
  if (!Number.isFinite(seed)) return { error: "The shuffle seed must be a number." };

  const cleanedName = cleanName(name);
  if (cleanedName.length > MAX_NAME_LENGTH) {
    return { error: `Keep the name under ${MAX_NAME_LENGTH} characters.` };
  }
  const cleanedSender = cleanName(senderName);
  if (cleanedSender.length > MAX_NAME_LENGTH) {
    return { error: `Keep your own name under ${MAX_NAME_LENGTH} characters.` };
  }

  const usedRegister = register === "auto" ? relationship.register : register;

  // Only wordings that suit this relationship, then the tone filter on top.
  const forRelationship = TEMPLATES.filter(
    (item) => !Array.isArray(item.for) || item.for.includes(relationship.id),
  );
  let pool = forRelationship;
  if (tone !== "any") {
    const toned = forRelationship.filter((item) => item.tone === tone);
    if (toned.length === 0) {
      return { error: `No ${tone} wording is written for a ${relationship.label.toLowerCase()}.` };
    }
    pool = toned;
  }
  if (pool.length === 0) return { error: "No wording matches that combination." };

  const safeSeed = Math.abs(Math.trunc(seed)) || 1;
  const shuffled = seededShuffle(pool, safeSeed);
  // Wordings written for this relationship come first; the general ones fill the rest.
  const ordered = [
    ...shuffled.filter((item) => Array.isArray(item.for)),
    ...shuffled.filter((item) => !Array.isArray(item.for)),
  ];
  const picked = ordered.slice(0, Math.min(count, ordered.length));

  const salutation = {
    native: applyName(relationship.salutation.native, cleanedName),
    roman: applyName(relationship.salutation.roman, cleanedName),
    english: applyName(relationship.salutation.english, cleanedName),
  };
  const closing = CLOSINGS[usedRegister];
  const signature = {
    native: cleanedSender ? `${closing.native}\n${cleanedSender}` : closing.native,
    roman: cleanedSender ? `${closing.roman}\n${cleanedSender}` : closing.roman,
    english: cleanedSender ? `${closing.english}\n${cleanedSender}` : closing.english,
  };

  const messages = picked.map((item) => {
    const variant = variantFor(item, usedRegister);
    const full = `${salutation.native}\n${variant.native}\n${signature.native}`;
    return {
      id: item.id,
      tone: item.tone,
      tailored: Array.isArray(item.for),
      native: variant.native,
      roman: variant.roman,
      english: item.english,
      full,
      fullRoman: `${salutation.roman}\n${variant.roman}\n${signature.roman}`,
      fullEnglish: `${salutation.english}\n${item.english}\n${signature.english}`,
      sms: smsSegments(full),
    };
  });

  const registerInfo = REGISTERS.find((item) => item.id === usedRegister);

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
    tailoredCount: messages.filter((item) => item.tailored).length,
  };
}
