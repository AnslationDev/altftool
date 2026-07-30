/**
 * Multilingual Name Meaning Lookup — pure logic.
 *
 * A curated offline dictionary of given names whose etymologies are documented
 * in standard reference works: each entry names the language the name comes
 * from, the word it is built on, the gloss of that root, the forms the same
 * name takes in other languages, and — where it is established rather than
 * speculative — the Proto-Indo-European or Proto-Semitic root behind it.
 *
 * Meanings that scholarship genuinely disputes are marked "debated" rather than
 * given a confident gloss. This file contains no network access, no DOM, no
 * clock and no randomness: the same query always returns the same answer.
 */

export const LANGUAGE_FAMILIES = {
  Hebrew: "Semitic",
  Aramaic: "Semitic",
  Arabic: "Semitic",
  Amharic: "Semitic",
  Akkadian: "Semitic",
  Sanskrit: "Indo-Aryan",
  Hindi: "Indo-Aryan",
  Marathi: "Indo-Aryan",
  Bengali: "Indo-Aryan",
  Gujarati: "Indo-Aryan",
  Punjabi: "Indo-Aryan",
  Urdu: "Indo-Aryan",
  Nepali: "Indo-Aryan",
  Persian: "Iranian",
  "Old Persian": "Iranian",
  Avestan: "Iranian",
  Kurdish: "Iranian",
  Greek: "Hellenic",
  "Ancient Greek": "Hellenic",
  Latin: "Italic",
  Italian: "Romance",
  Spanish: "Romance",
  Portuguese: "Romance",
  French: "Romance",
  Romanian: "Romance",
  Catalan: "Romance",
  English: "Germanic",
  German: "Germanic",
  Dutch: "Germanic",
  Swedish: "Germanic",
  Norwegian: "Germanic",
  Danish: "Germanic",
  "Old English": "Germanic",
  Gothic: "Germanic",
  "Proto-Germanic": "Germanic",
  Russian: "Slavic",
  Ukrainian: "Slavic",
  Polish: "Slavic",
  Czech: "Slavic",
  Serbian: "Slavic",
  Croatian: "Slavic",
  Bulgarian: "Slavic",
  Slovak: "Slavic",
  "Old Church Slavonic": "Slavic",
  Irish: "Celtic",
  "Old Irish": "Celtic",
  Welsh: "Celtic",
  "Scottish Gaelic": "Celtic",
  Gaulish: "Celtic",
  Lithuanian: "Baltic",
  Latvian: "Baltic",
  Turkish: "Turkic",
  Azerbaijani: "Turkic",
  Uzbek: "Turkic",
  Hungarian: "Uralic",
  Finnish: "Uralic",
  Armenian: "Armenian",
  Georgian: "Kartvelian",
  Egyptian: "Afro-Asiatic",
  Hittite: "Anatolian",
  Swahili: "Niger-Congo",
};

/**
 * The dictionary. Every entry carries:
 *  origin       — the language the name is first attested in
 *  native       — its spelling in that language's own script, where applicable
 *  meaning      — the gloss
 *  certainty    — "documented" or "debated"
 *  root         — the word the name is built on, with its gloss
 *  deepRoot     — the reconstructed proto-root, when it is well established
 *  forms        — the same name in other languages
 *  tag          — a shared meaning group, used to find unrelated names that
 *                 nonetheless mean the same thing
 */
export const NAME_ENTRIES = [
  {
    id: "yohanan",
    name: "John",
    gender: "male",
    origin: "Hebrew",
    native: "יוֹחָנָן",
    translit: "Yōḥānān",
    meaning: "Yahweh has been gracious",
    certainty: "documented",
    root: { text: "ḥ-n-n", script: "ח־נ־ן", gloss: "to show favour, to be gracious", language: "Hebrew" },
    deepRoot: { label: "Proto-Semitic", form: "ḥ-n-n", gloss: "grace, favour" },
    tag: "god-is-gracious",
    forms: [
      { language: "Greek", form: "Ioannes", script: "Ἰωάννης" },
      { language: "Latin", form: "Iohannes" },
      { language: "Arabic", form: "Yahya", script: "يحيى", note: "the Quranic counterpart of John the Baptist" },
      { language: "Spanish", form: "Juan" },
      { language: "French", form: "Jean" },
      { language: "Italian", form: "Giovanni" },
      { language: "Portuguese", form: "João" },
      { language: "Russian", form: "Ivan", script: "Иван" },
      { language: "German", form: "Johannes / Hans" },
      { language: "Irish", form: "Seán" },
      { language: "Welsh", form: "Ioan" },
      { language: "Hungarian", form: "János" },
    ],
    notes: [
      "The feminine forms Joanna, Jane, Jean and Ioanna are built from the same Hebrew name.",
    ],
  },
  {
    id: "hannah",
    name: "Hannah",
    gender: "female",
    origin: "Hebrew",
    native: "חַנָּה",
    translit: "Ḥannāh",
    meaning: "grace, favour",
    certainty: "documented",
    root: { text: "ḥ-n-n", script: "ח־נ־ן", gloss: "to show favour, to be gracious", language: "Hebrew" },
    deepRoot: { label: "Proto-Semitic", form: "ḥ-n-n", gloss: "grace, favour" },
    tag: "god-is-gracious",
    forms: [
      { language: "Greek", form: "Anna", script: "Ἄννα" },
      { language: "Latin", form: "Anna" },
      { language: "English", form: "Anne / Ann / Hannah" },
      { language: "Russian", form: "Anna / Anya", script: "Анна" },
      { language: "Arabic", form: "Hanan", script: "حنان", note: "same Semitic root, meaning tenderness or compassion" },
      { language: "Czech", form: "Hana" },
    ],
    notes: ["Shares its consonantal root with the name John, which embeds the same verb."],
  },
  {
    id: "michael",
    name: "Michael",
    gender: "male",
    origin: "Hebrew",
    native: "מִיכָאֵל",
    translit: "Mīkhāʾēl",
    meaning: "Who is like God?",
    certainty: "documented",
    root: { text: "mī + kha + ʾēl", gloss: "who + like + God", language: "Hebrew" },
    tag: "divine-question",
    forms: [
      { language: "Greek", form: "Michaēl", script: "Μιχαήλ" },
      { language: "Arabic", form: "Mikaʾil", script: "ميكائيل" },
      { language: "Spanish", form: "Miguel" },
      { language: "French", form: "Michel" },
      { language: "Italian", form: "Michele" },
      { language: "Russian", form: "Mikhail", script: "Михаил" },
      { language: "Romanian", form: "Mihai" },
      { language: "Swedish", form: "Mikael" },
    ],
    notes: ["The name is a rhetorical question, not a statement — it asserts that nobody is."],
  },
  {
    id: "gabriel",
    name: "Gabriel",
    gender: "male",
    origin: "Hebrew",
    native: "גַּבְרִיאֵל",
    translit: "Gaḇrīʾēl",
    meaning: "God is my strength",
    certainty: "documented",
    root: { text: "geḇer + ʾēl", gloss: "strong man + God", language: "Hebrew" },
    tag: "divine-strength",
    forms: [
      { language: "Greek", form: "Gabriēl", script: "Γαβριήλ" },
      { language: "Arabic", form: "Jibril / Jibraʾil", script: "جبريل" },
      { language: "Russian", form: "Gavriil", script: "Гавриил" },
      { language: "Italian", form: "Gabriele" },
      { language: "Spanish", form: "Gabriel" },
    ],
    notes: ["Gabriella and Gabrielle are the feminine forms."],
  },
  {
    id: "yosef",
    name: "Joseph",
    gender: "male",
    origin: "Hebrew",
    native: "יוֹסֵף",
    translit: "Yōsēf",
    meaning: "he will add, he shall increase",
    certainty: "documented",
    root: { text: "y-s-f", script: "י־ס־ף", gloss: "to add, to increase", language: "Hebrew" },
    tag: "increase",
    forms: [
      { language: "Greek", form: "Iōsēph", script: "Ἰωσήφ" },
      { language: "Arabic", form: "Yusuf", script: "يوسف" },
      { language: "Spanish", form: "José" },
      { language: "Italian", form: "Giuseppe" },
      { language: "Russian", form: "Iosif", script: "Иосиф" },
      { language: "French", form: "Joseph" },
    ],
    notes: ["Genesis 30:24 glosses the name with the mother's wish that God add another son."],
  },
  {
    id: "david",
    name: "David",
    gender: "male",
    origin: "Hebrew",
    native: "דָּוִד",
    translit: "Dāwīḏ",
    meaning: "beloved",
    certainty: "documented",
    root: { text: "d-w-d", script: "ד־ו־ד", gloss: "to love; beloved, uncle", language: "Hebrew" },
    tag: "beloved",
    forms: [
      { language: "Arabic", form: "Dawud / Daoud", script: "داوود" },
      { language: "Greek", form: "Dauid", script: "Δαυίδ" },
      { language: "Georgian", form: "Davit" },
      { language: "Welsh", form: "Dafydd / Dewi" },
      { language: "Russian", form: "David", script: "Давид" },
    ],
    notes: [],
  },
  {
    id: "abraham",
    name: "Abraham",
    gender: "male",
    origin: "Hebrew",
    native: "אַבְרָהָם",
    translit: "ʾAḇrāhām",
    meaning: "father of a multitude",
    certainty: "documented",
    root: { text: "ʾāḇ + hămōn", gloss: "father + multitude", language: "Hebrew" },
    tag: "fatherhood",
    forms: [
      { language: "Arabic", form: "Ibrahim", script: "إبراهيم" },
      { language: "Greek", form: "Abraam", script: "Ἀβραάμ" },
      { language: "Amharic", form: "Abrham" },
      { language: "Spanish", form: "Abrahán" },
    ],
    notes: [
      "Genesis 17:5 supplies this gloss when renaming Abram; the earlier form Aḇrām means exalted father.",
    ],
  },
  {
    id: "sarah",
    name: "Sarah",
    gender: "female",
    origin: "Hebrew",
    native: "שָׂרָה",
    translit: "Śārāh",
    meaning: "noblewoman, princess",
    certainty: "documented",
    root: { text: "ś-r-r", script: "ש־ר־ר", gloss: "to rule, to be a chief", language: "Hebrew" },
    tag: "royalty",
    forms: [
      { language: "Arabic", form: "Sara", script: "سارة" },
      { language: "Greek", form: "Sarra", script: "Σάρρα" },
      { language: "Persian", form: "Sara" },
      { language: "Italian", form: "Sara" },
    ],
    notes: [],
  },
  {
    id: "miriam",
    name: "Mary",
    gender: "female",
    origin: "Hebrew",
    native: "מִרְיָם",
    translit: "Miryām",
    meaning: "uncertain",
    certainty: "debated",
    root: { text: "unresolved", gloss: "candidates include Hebrew mar (bitter), a root meaning beloved, and Egyptian mry (beloved)", language: "Hebrew" },
    tag: "uncertain",
    forms: [
      { language: "Greek", form: "Maria / Mariam", script: "Μαρία" },
      { language: "Arabic", form: "Maryam", script: "مريم" },
      { language: "Latin", form: "Maria" },
      { language: "French", form: "Marie" },
      { language: "Russian", form: "Mariya", script: "Мария" },
      { language: "Irish", form: "Máire / Muire" },
    ],
    notes: [
      "No proposed etymology is settled. The Egyptian mry option is popular because Miriam appears in an Egyptian setting, but it remains a hypothesis.",
    ],
  },
  {
    id: "daniel",
    name: "Daniel",
    gender: "male",
    origin: "Hebrew",
    native: "דָּנִיֵּאל",
    translit: "Dānīʾēl",
    meaning: "God is my judge",
    certainty: "documented",
    root: { text: "d-y-n + ʾēl", gloss: "to judge + God", language: "Hebrew" },
    tag: "divine-judgement",
    forms: [
      { language: "Arabic", form: "Daniyal", script: "دانيال" },
      { language: "Greek", form: "Daniēl", script: "Δανιήλ" },
      { language: "Russian", form: "Daniil", script: "Даниил" },
      { language: "Spanish", form: "Daniel" },
    ],
    notes: [],
  },
  {
    id: "shlomo",
    name: "Solomon",
    gender: "male",
    origin: "Hebrew",
    native: "שְׁלֹמֹה",
    translit: "Šəlōmōh",
    meaning: "peaceful",
    certainty: "documented",
    root: { text: "š-l-m", script: "ש־ל־ם", gloss: "to be whole, sound, at peace", language: "Hebrew" },
    deepRoot: { label: "Proto-Semitic", form: "š-l-m", gloss: "wholeness, peace" },
    tag: "peace",
    forms: [
      { language: "Arabic", form: "Sulayman", script: "سليمان" },
      { language: "Greek", form: "Solomōn", script: "Σολομών" },
      { language: "Spanish", form: "Salomón" },
      { language: "Russian", form: "Solomon", script: "Соломон" },
    ],
    notes: ["The greeting shalom and the Arabic salaam come from the same Semitic root."],
  },
  {
    id: "yehuda",
    name: "Judah",
    gender: "male",
    origin: "Hebrew",
    native: "יְהוּדָה",
    translit: "Yəhūḏāh",
    meaning: "praised",
    certainty: "documented",
    root: { text: "y-d-h", script: "י־ד־ה", gloss: "to praise, to give thanks", language: "Hebrew" },
    tag: "praise",
    forms: [
      { language: "Greek", form: "Ioudas", script: "Ἰούδας" },
      { language: "English", form: "Jude / Judah" },
      { language: "Spanish", form: "Judas" },
    ],
    notes: ["Semantically the Hebrew parallel of the Arabic name Muhammad, though from an unrelated root."],
  },
  {
    id: "chava",
    name: "Eve",
    gender: "female",
    origin: "Hebrew",
    native: "חַוָּה",
    translit: "Ḥawwāh",
    meaning: "living one",
    certainty: "documented",
    root: { text: "ḥ-y-h", script: "ח־י־ה", gloss: "to live", language: "Hebrew" },
    tag: "life",
    forms: [
      { language: "Arabic", form: "Hawwa", script: "حواء" },
      { language: "Greek", form: "Eua", script: "Εὔα" },
      { language: "Spanish", form: "Eva" },
      { language: "Polish", form: "Ewa" },
    ],
    notes: ["Genesis 3:20 glosses the name as mother of all living."],
  },
  {
    id: "nathanael",
    name: "Nathaniel",
    gender: "male",
    origin: "Hebrew",
    native: "נְתַנְאֵל",
    translit: "Nəṯanʾēl",
    meaning: "God has given",
    certainty: "documented",
    root: { text: "n-t-n + ʾēl", gloss: "to give + God", language: "Hebrew" },
    tag: "gift-of-god",
    forms: [
      { language: "Greek", form: "Nathanaēl", script: "Ναθαναήλ" },
      { language: "English", form: "Nathaniel / Nathan" },
      { language: "Hebrew", form: "Yonatan / Jonathan", script: "יְהוֹנָתָן", note: "Yahweh has given — the same idea with the divine name reversed" },
    ],
    notes: [],
  },

  /* --------------------------------------------------------------- Arabic */
  {
    id: "muhammad",
    name: "Muhammad",
    gender: "male",
    origin: "Arabic",
    native: "محمّد",
    translit: "Muḥammad",
    meaning: "the much-praised, worthy of praise",
    certainty: "documented",
    root: { text: "ḥ-m-d", script: "ح م د", gloss: "to praise, to commend", language: "Arabic" },
    tag: "praise",
    forms: [
      { language: "Turkish", form: "Mehmet" },
      { language: "Urdu", form: "Muhammad", script: "محمد" },
      { language: "Bosnian", form: "Muhamed" },
      { language: "Swahili", form: "Hamadi" },
    ],
    notes: [
      "Same root: Ahmad أحمد most praiseworthy, Mahmud محمود praised, Hamid حامد one who praises, Hamda حمدة, Hammad حمّاد.",
      "Arabic names are built by fitting a three-consonant root into a fixed pattern, so a root can generate dozens of related names.",
    ],
  },
  {
    id: "ali",
    name: "Ali",
    gender: "male",
    origin: "Arabic",
    native: "علي",
    translit: "ʿAlī",
    meaning: "high, elevated, exalted",
    certainty: "documented",
    root: { text: "ʿ-l-w", script: "ع ل و", gloss: "to be high, to rise", language: "Arabic" },
    tag: "height-nobility",
    forms: [
      { language: "Turkish", form: "Ali" },
      { language: "Persian", form: "Ali", script: "علی" },
      { language: "Urdu", form: "Ali" },
    ],
    notes: ["Same root: Aliyah عالية, Alaa علاء nobility, Muta'ali متعالي the transcendent."],
  },
  {
    id: "fatima",
    name: "Fatima",
    gender: "female",
    origin: "Arabic",
    native: "فاطمة",
    translit: "Fāṭima",
    meaning: "she who weans, one who abstains",
    certainty: "documented",
    root: { text: "f-ṭ-m", script: "ف ط م", gloss: "to wean, to sever", language: "Arabic" },
    tag: "abstention",
    forms: [
      { language: "Turkish", form: "Fatma" },
      { language: "Urdu", form: "Fatima", script: "فاطمہ" },
      { language: "Spanish", form: "Fátima", note: "reached Iberia through Arabic-speaking al-Andalus" },
    ],
    notes: [],
  },
  {
    id: "aisha",
    name: "Aisha",
    gender: "female",
    origin: "Arabic",
    native: "عائشة",
    translit: "ʿĀʾisha",
    meaning: "living, alive, thriving",
    certainty: "documented",
    root: { text: "ʿ-y-sh", script: "ع ي ش", gloss: "to live", language: "Arabic" },
    tag: "life",
    forms: [
      { language: "Turkish", form: "Ayşe" },
      { language: "Urdu", form: "Ayesha", script: "عائشہ" },
      { language: "Swahili", form: "Asha" },
    ],
    notes: ["Same root: maʿīsha معيشة livelihood, ʿayyāsh عياش."],
  },
  {
    id: "hasan",
    name: "Hasan",
    gender: "male",
    origin: "Arabic",
    native: "حسن",
    translit: "Ḥasan",
    meaning: "good, handsome, fine",
    certainty: "documented",
    root: { text: "ḥ-s-n", script: "ح س ن", gloss: "to be good, to be beautiful", language: "Arabic" },
    tag: "beauty-goodness",
    forms: [
      { language: "Turkish", form: "Hasan" },
      { language: "Urdu", form: "Hassan" },
      { language: "Persian", form: "Hasan", script: "حسن" },
    ],
    notes: [
      "Same root: Husayn حسين the diminutive, Ihsan إحسان excellence, Muhsin محسن benefactor, Husna حسنى, Ahsan أحسن best.",
    ],
  },
  {
    id: "amina",
    name: "Amina",
    gender: "female",
    origin: "Arabic",
    native: "آمنة",
    translit: "ʾĀmina",
    meaning: "safe, secure, trustworthy",
    certainty: "documented",
    root: { text: "ʾ-m-n", script: "أ م ن", gloss: "to be safe, to trust", language: "Arabic" },
    deepRoot: { label: "Proto-Semitic", form: "ʾ-m-n", gloss: "firmness, reliability" },
    tag: "faith-trust",
    forms: [
      { language: "Hausa", form: "Aminu" },
      { language: "Turkish", form: "Emine" },
      { language: "Swahili", form: "Amina" },
    ],
    notes: [
      "Same root: Amin أمين trustworthy, Iman إيمان faith, Amanah أمانة a trust.",
      "The Hebrew word amen and the name Amnon come from the same Semitic root.",
    ],
  },
  {
    id: "karim",
    name: "Karim",
    gender: "male",
    origin: "Arabic",
    native: "كريم",
    translit: "Karīm",
    meaning: "generous, noble",
    certainty: "documented",
    root: { text: "k-r-m", script: "ك ر م", gloss: "to be generous, to honour", language: "Arabic" },
    tag: "generosity",
    forms: [
      { language: "Turkish", form: "Kerim" },
      { language: "Persian", form: "Karim", script: "کریم" },
      { language: "Urdu", form: "Kareem" },
    ],
    notes: ["Same root: Karima كريمة, Akram أكرم most generous, Ikram إكرام honouring, Mukarram مكرّم."],
  },
  {
    id: "salim",
    name: "Salim",
    gender: "male",
    origin: "Arabic",
    native: "سليم",
    translit: "Salīm",
    meaning: "safe, sound, unharmed",
    certainty: "documented",
    root: { text: "s-l-m", script: "س ل م", gloss: "to be whole, safe, at peace", language: "Arabic" },
    deepRoot: { label: "Proto-Semitic", form: "š-l-m", gloss: "wholeness, peace" },
    tag: "peace",
    forms: [
      { language: "Turkish", form: "Selim" },
      { language: "Urdu", form: "Saleem" },
      { language: "Swahili", form: "Salim" },
    ],
    notes: [
      "Same root: Salma سلمى, Salman سلمان, Salam سلام peace, Islam إسلام submission.",
      "Directly cognate with Hebrew shalom and the name Solomon.",
    ],
  },
  {
    id: "nur",
    name: "Nur",
    gender: "unisex",
    origin: "Arabic",
    native: "نور",
    translit: "Nūr",
    meaning: "light",
    certainty: "documented",
    root: { text: "n-w-r", script: "ن و ر", gloss: "to give light, to shine", language: "Arabic" },
    tag: "light",
    forms: [
      { language: "Turkish", form: "Nur" },
      { language: "Urdu", form: "Noor", script: "نور" },
      { language: "Persian", form: "Nur", script: "نور" },
      { language: "Indonesian", form: "Nurul" },
    ],
    notes: ["Same root: Munir منير radiant, Anwar أنور, Munira منيرة, Nuriya نورية."],
  },
  {
    id: "rahim",
    name: "Rahim",
    gender: "male",
    origin: "Arabic",
    native: "رحيم",
    translit: "Raḥīm",
    meaning: "merciful, compassionate",
    certainty: "documented",
    root: { text: "r-ḥ-m", script: "ر ح م", gloss: "womb; by extension mercy and compassion", language: "Arabic" },
    deepRoot: { label: "Proto-Semitic", form: "r-ḥ-m", gloss: "womb, compassion" },
    tag: "mercy",
    forms: [
      { language: "Turkish", form: "Rahim" },
      { language: "Urdu", form: "Raheem" },
      { language: "Persian", form: "Rahim", script: "رحیم" },
    ],
    notes: [
      "Same root: Rahman رحمن, Rahma رحمة mercy, Abdur Rahman عبد الرحمن.",
      "Hebrew raḥamim compassion and reḥem womb come from the same root, which literally derives mercy from the womb.",
    ],
  },
  {
    id: "umar",
    name: "Umar",
    gender: "male",
    origin: "Arabic",
    native: "عمر",
    translit: "ʿUmar",
    meaning: "long-lived, flourishing",
    certainty: "documented",
    root: { text: "ʿ-m-r", script: "ع م ر", gloss: "to live long, to build up, to inhabit", language: "Arabic" },
    tag: "life",
    forms: [
      { language: "Turkish", form: "Ömer" },
      { language: "Urdu", form: "Umar / Omar" },
      { language: "Swahili", form: "Omari" },
    ],
    notes: [
      "Same root: Ammar عمّار, Umara عمارة, imarah عمارة building.",
      "Not related to Amir أمير, which belongs to the separate root ʾ-m-r meaning to command.",
    ],
  },
  {
    id: "amir",
    name: "Amir",
    gender: "male",
    origin: "Arabic",
    native: "أمير",
    translit: "ʾAmīr",
    meaning: "commander, prince",
    certainty: "documented",
    root: { text: "ʾ-m-r", script: "أ م ر", gloss: "to command, to order", language: "Arabic" },
    tag: "royalty",
    forms: [
      { language: "Turkish", form: "Emir" },
      { language: "Persian", form: "Amir", script: "امیر" },
      { language: "English", form: "Emir / Admiral", note: "admiral entered European languages from amīr al-baḥr, commander of the sea" },
    ],
    notes: [
      "The Hebrew name Amir אָמִיר, meaning treetop or sheaf, is a separate word that happens to look alike.",
    ],
  },
  {
    id: "malik",
    name: "Malik",
    gender: "male",
    origin: "Arabic",
    native: "مالك",
    translit: "Mālik",
    meaning: "owner, master; king in the form Malik ملك",
    certainty: "documented",
    root: { text: "m-l-k", script: "م ل ك", gloss: "to own, to rule", language: "Arabic" },
    deepRoot: { label: "Proto-Semitic", form: "m-l-k", gloss: "to rule, king" },
    tag: "royalty",
    forms: [
      { language: "Hebrew", form: "Melekh / Malka", script: "מֶלֶךְ", note: "king / queen, same Semitic root" },
      { language: "Urdu", form: "Malik" },
      { language: "Punjabi", form: "Malik", note: "also widespread as a surname" },
    ],
    notes: ["Same root: Malika ملكة queen, Mamluk مملوك owned, Mulk ملك dominion."],
  },
  {
    id: "habib",
    name: "Habib",
    gender: "male",
    origin: "Arabic",
    native: "حبيب",
    translit: "Ḥabīb",
    meaning: "beloved, dear one",
    certainty: "documented",
    root: { text: "ḥ-b-b", script: "ح ب ب", gloss: "to love", language: "Arabic" },
    tag: "beloved",
    forms: [
      { language: "Turkish", form: "Habib" },
      { language: "Urdu", form: "Habib" },
      { language: "Swahili", form: "Habiba" },
    ],
    notes: ["Same root: Habiba حبيبة, Muhib محب, hubb حب love."],
  },
  {
    id: "yasmin",
    name: "Yasmin",
    gender: "female",
    origin: "Persian",
    native: "یاسمن",
    translit: "yāsaman",
    meaning: "jasmine flower",
    certainty: "documented",
    root: { text: "yāsaman", gloss: "the jasmine plant", language: "Persian" },
    tag: "flower",
    forms: [
      { language: "Arabic", form: "Yasmin", script: "ياسمين" },
      { language: "Greek", form: "iasminon", script: "ἰασμίνον" },
      { language: "English", form: "Jasmine" },
      { language: "Spanish", form: "Jazmín" },
      { language: "Italian", form: "Gelsomino" },
    ],
    notes: ["A rare case where the plant name, the loanword and the given name travelled together from Persia to Europe."],
  },

  /* ------------------------------------------------------------- Sanskrit */
  {
    id: "arjuna",
    name: "Arjuna",
    gender: "male",
    origin: "Sanskrit",
    native: "अर्जुन",
    translit: "arjuna",
    meaning: "white, bright, silvery",
    certainty: "documented",
    root: { text: "ṛj- / arj-", gloss: "to be bright, to shine white", language: "Sanskrit" },
    deepRoot: {
      label: "Proto-Indo-European",
      form: "*h₂erǵ-",
      gloss: "bright, white, shining",
      cognates: [
        { language: "Ancient Greek", form: "arguros", script: "ἄργυρος", gloss: "silver" },
        { language: "Latin", form: "argentum", gloss: "silver" },
        { language: "Hittite", form: "ḫarki-", gloss: "white" },
      ],
    },
    tag: "light",
    forms: [
      { language: "Hindi", form: "Arjun", script: "अर्जुन" },
      { language: "Bengali", form: "Arjun" },
      { language: "Indonesian", form: "Arjuna", note: "through the Javanese Mahabharata tradition" },
    ],
    notes: ["Argentina and the chemical symbol Ag for silver descend from the same Indo-European root."],
  },
  {
    id: "deva",
    name: "Deva",
    gender: "unisex",
    origin: "Sanskrit",
    native: "देव",
    translit: "deva",
    meaning: "god, shining one, heavenly",
    certainty: "documented",
    root: { text: "div-", gloss: "to shine; the bright sky", language: "Sanskrit" },
    deepRoot: {
      label: "Proto-Indo-European",
      form: "*deywos",
      gloss: "sky god, celestial being",
      cognates: [
        { language: "Latin", form: "deus / dīvus", gloss: "god / divine" },
        { language: "Ancient Greek", form: "Zeus", script: "Ζεύς", gloss: "from the same sky-god root *dyēus" },
        { language: "Lithuanian", form: "Dievas", gloss: "god" },
        { language: "Old Irish", form: "día", gloss: "god" },
      ],
    },
    tag: "divinity",
    forms: [
      { language: "Hindi", form: "Dev / Devi", script: "देव / देवी" },
      { language: "Marathi", form: "Devendra" },
      { language: "Nepali", form: "Dev" },
    ],
    notes: ["Devendra combines deva with indra, giving lord of the gods."],
  },
  {
    id: "vidya",
    name: "Vidya",
    gender: "female",
    origin: "Sanskrit",
    native: "विद्या",
    translit: "vidyā",
    meaning: "knowledge, learning",
    certainty: "documented",
    root: { text: "vid-", gloss: "to know, to perceive", language: "Sanskrit" },
    deepRoot: {
      label: "Proto-Indo-European",
      form: "*weyd-",
      gloss: "to see, to know",
      cognates: [
        { language: "Ancient Greek", form: "oida / idea", script: "οἶδα / ἰδέα", gloss: "I know / form, idea" },
        { language: "Latin", form: "vidēre", gloss: "to see" },
        { language: "Old English", form: "witan", gloss: "to know — English wit and wise" },
        { language: "Russian", form: "videt'", script: "видеть", gloss: "to see" },
      ],
    },
    tag: "knowledge",
    forms: [
      { language: "Hindi", form: "Vidya", script: "विद्या" },
      { language: "Marathi", form: "Vidya" },
      { language: "Tamil", form: "Vidhya" },
    ],
    notes: ["The Vedas take their name from the same root — literally the knowledge."],
  },
  {
    id: "raja",
    name: "Raja",
    gender: "male",
    origin: "Sanskrit",
    native: "राजन्",
    translit: "rājan",
    meaning: "king, ruler",
    certainty: "documented",
    root: { text: "rāj-", gloss: "to rule, to direct, to make straight", language: "Sanskrit" },
    deepRoot: {
      label: "Proto-Indo-European",
      form: "*h₃rēǵs",
      gloss: "ruler, one who sets things straight",
      cognates: [
        { language: "Latin", form: "rēx, rēgis", gloss: "king" },
        { language: "Gaulish", form: "-rix", gloss: "king, as in Vercingetorix" },
        { language: "Old Irish", form: "rí", gloss: "king" },
        { language: "Gothic", form: "reiks", gloss: "ruler — German Reich" },
      ],
    },
    tag: "royalty",
    forms: [
      { language: "Hindi", form: "Raja / Rajesh", script: "राजा / राजेश" },
      { language: "Malay", form: "Raja" },
      { language: "Thai", form: "Racha", note: "borrowed through Pali rāja" },
    ],
    notes: [
      "Rajesh is rāja plus īśa, lord; Rajendra is rāja plus indra.",
      "The Latin words regal, regime and rectify all descend from the same Indo-European root.",
    ],
  },
  {
    id: "surya",
    name: "Surya",
    gender: "male",
    origin: "Sanskrit",
    native: "सूर्य",
    translit: "sūrya",
    meaning: "the sun",
    certainty: "documented",
    root: { text: "svar- / sūr-", gloss: "sun, light, sky", language: "Sanskrit" },
    deepRoot: {
      label: "Proto-Indo-European",
      form: "*sóh₂wl̥",
      gloss: "sun",
      cognates: [
        { language: "Latin", form: "sōl", gloss: "sun" },
        { language: "Ancient Greek", form: "hēlios", script: "ἥλιος", gloss: "sun" },
        { language: "Lithuanian", form: "saulė", gloss: "sun" },
        { language: "Old English", form: "sunne", gloss: "sun" },
      ],
    },
    tag: "light",
    forms: [
      { language: "Hindi", form: "Surya", script: "सूर्य" },
      { language: "Telugu", form: "Suryam" },
      { language: "Indonesian", form: "Surya" },
    ],
    notes: [],
  },
  {
    id: "narendra",
    name: "Narendra",
    gender: "male",
    origin: "Sanskrit",
    native: "नरेन्द्र",
    translit: "narendra",
    meaning: "lord of men, king",
    certainty: "documented",
    root: { text: "nara + indra", gloss: "man + chief, lord", language: "Sanskrit" },
    deepRoot: {
      label: "Proto-Indo-European",
      form: "*h₂nḗr",
      gloss: "man, vital force",
      cognates: [
        { language: "Ancient Greek", form: "anēr, andros", script: "ἀνήρ", gloss: "man" },
        { language: "Armenian", form: "ayr", gloss: "man" },
        { language: "Welsh", form: "nêr", gloss: "chief, lord" },
      ],
    },
    tag: "man-human",
    forms: [
      { language: "Hindi", form: "Narendra", script: "नरेंद्र" },
      { language: "Marathi", form: "Narendra" },
      { language: "Nepali", form: "Narendra" },
    ],
    notes: [
      "The nara element is the same Indo-European word for man that sits inside the Greek names Alexander and Andrew.",
    ],
  },
  {
    id: "priya",
    name: "Priya",
    gender: "female",
    origin: "Sanskrit",
    native: "प्रिय",
    translit: "priya",
    meaning: "beloved, dear",
    certainty: "documented",
    root: { text: "prī-", gloss: "to please, to love", language: "Sanskrit" },
    deepRoot: {
      label: "Proto-Indo-European",
      form: "*preyH-",
      gloss: "to love, to be dear",
      cognates: [
        { language: "Old English", form: "frēond", gloss: "friend — one who is dear" },
        { language: "Gothic", form: "frijōn", gloss: "to love" },
        { language: "Russian", form: "priyatel'", script: "приятель", gloss: "friend" },
      ],
    },
    tag: "beloved",
    forms: [
      { language: "Hindi", form: "Priya / Priyanka", script: "प्रिया / प्रियंका" },
      { language: "Bengali", form: "Priya" },
      { language: "Nepali", form: "Priya" },
    ],
    notes: ["English free and friend descend from the same root, through the sense of one's own dear people."],
  },
  {
    id: "amrita",
    name: "Amrita",
    gender: "female",
    origin: "Sanskrit",
    native: "अमृत",
    translit: "amṛta",
    meaning: "immortal; the nectar of immortality",
    certainty: "documented",
    root: { text: "a- + mṛta", gloss: "not + dead", language: "Sanskrit" },
    deepRoot: {
      label: "Proto-Indo-European",
      form: "*mer-",
      gloss: "to die",
      cognates: [
        { language: "Ancient Greek", form: "ambrosia", script: "ἀμβροσία", gloss: "the immortals' food — the same a- plus mortal compound" },
        { language: "Latin", form: "mors, mortalis", gloss: "death, mortal" },
        { language: "Old Church Slavonic", form: "mrěti", gloss: "to die" },
      ],
    },
    tag: "immortality",
    forms: [
      { language: "Hindi", form: "Amrit / Amrita", script: "अमृत" },
      { language: "Punjabi", form: "Amrit" },
      { language: "Nepali", form: "Amrit" },
    ],
    notes: ["Amrita and the Greek ambrosia are the same compound built twice from the same inherited parts."],
  },
  {
    id: "shanti",
    name: "Shanti",
    gender: "female",
    origin: "Sanskrit",
    native: "शान्ति",
    translit: "śānti",
    meaning: "peace, tranquillity",
    certainty: "documented",
    root: { text: "śam-", gloss: "to be calm, to be at rest", language: "Sanskrit" },
    tag: "peace",
    forms: [
      { language: "Hindi", form: "Shanti", script: "शांति" },
      { language: "Marathi", form: "Prashant", note: "pra + śānta, exceptionally calm" },
      { language: "Nepali", form: "Shanti" },
    ],
    notes: [],
  },
  {
    id: "jyoti",
    name: "Jyoti",
    gender: "unisex",
    origin: "Sanskrit",
    native: "ज्योति",
    translit: "jyoti",
    meaning: "light, radiance",
    certainty: "documented",
    root: { text: "dyut-", gloss: "to shine, to flash", language: "Sanskrit" },
    tag: "light",
    forms: [
      { language: "Hindi", form: "Jyoti", script: "ज्योति" },
      { language: "Marathi", form: "Jyotsna" },
      { language: "Bengali", form: "Jyotirmoy" },
    ],
    notes: [],
  },
  {
    id: "krishna",
    name: "Krishna",
    gender: "male",
    origin: "Sanskrit",
    native: "कृष्ण",
    translit: "kṛṣṇa",
    meaning: "black, dark, dark blue",
    certainty: "documented",
    root: { text: "kṛṣ-", gloss: "dark, black", language: "Sanskrit" },
    deepRoot: {
      label: "Proto-Indo-European",
      form: "*kers-",
      gloss: "black, dark",
      cognates: [
        { language: "Old Church Slavonic", form: "črъnъ", gloss: "black — Russian chorny" },
        { language: "Lithuanian", form: "keršas", gloss: "black and white spotted" },
      ],
    },
    tag: "colour",
    forms: [
      { language: "Hindi", form: "Krishna / Kishan", script: "कृष्ण" },
      { language: "Tamil", form: "Kannan", note: "the Tamil equivalent by tradition rather than by sound" },
      { language: "Indonesian", form: "Kresna" },
    ],
    notes: [],
  },
  {
    id: "arya",
    name: "Arya",
    gender: "unisex",
    origin: "Sanskrit",
    native: "आर्य",
    translit: "ārya",
    meaning: "noble, honourable",
    certainty: "documented",
    root: { text: "ārya", gloss: "noble; the self-designation of Vedic and Iranian speakers", language: "Sanskrit" },
    tag: "height-nobility",
    forms: [
      { language: "Hindi", form: "Arya / Aryan", script: "आर्य" },
      { language: "Old Persian", form: "ariya", note: "the source of the country name Iran, from Ērān, land of the Aryas" },
      { language: "Avestan", form: "airya" },
    ],
    notes: [
      "The word is a linguistic and cultural self-description in its ancient sources. Its nineteenth and twentieth century use as a racial category was a later distortion with no basis in the texts.",
    ],
  },
  {
    id: "vijay",
    name: "Vijay",
    gender: "male",
    origin: "Sanskrit",
    native: "विजय",
    translit: "vijaya",
    meaning: "victory, conquest",
    certainty: "documented",
    root: { text: "vi- + ji-", gloss: "apart, thoroughly + to conquer", language: "Sanskrit" },
    tag: "victory",
    forms: [
      { language: "Hindi", form: "Vijay", script: "विजय" },
      { language: "Marathi", form: "Vijaya" },
      { language: "Sinhala", form: "Vijaya" },
    ],
    notes: [],
  },
  {
    id: "ananda",
    name: "Ananda",
    gender: "male",
    origin: "Sanskrit",
    native: "आनन्द",
    translit: "ānanda",
    meaning: "bliss, joy",
    certainty: "documented",
    root: { text: "ā- + nand-", gloss: "toward + to rejoice", language: "Sanskrit" },
    tag: "joy",
    forms: [
      { language: "Hindi", form: "Anand", script: "आनंद" },
      { language: "Bengali", form: "Ananda" },
      { language: "Thai", form: "Ananda", note: "through Pali Buddhist usage" },
    ],
    notes: [],
  },

  /* ---------------------------------------------------------------- Greek */
  {
    id: "alexander",
    name: "Alexander",
    gender: "male",
    origin: "Ancient Greek",
    native: "Ἀλέξανδρος",
    translit: "Alexandros",
    meaning: "defender of men",
    certainty: "documented",
    root: { text: "alexein + anēr, andros", script: "ἀλέξειν + ἀνήρ", gloss: "to ward off, defend + man", language: "Ancient Greek" },
    deepRoot: {
      label: "Proto-Indo-European",
      form: "*h₂nḗr",
      gloss: "man — the andros element",
      cognates: [
        { language: "Sanskrit", form: "nara", script: "नर", gloss: "man, as in Narendra" },
        { language: "Armenian", form: "ayr", gloss: "man" },
      ],
    },
    tag: "man-human",
    forms: [
      { language: "Latin", form: "Alexander" },
      { language: "Arabic", form: "Iskandar", script: "إسكندر" },
      { language: "Persian", form: "Eskandar", script: "اسکندر" },
      { language: "Urdu", form: "Sikandar", script: "سکندر" },
      { language: "Spanish", form: "Alejandro" },
      { language: "Italian", form: "Alessandro" },
      { language: "Russian", form: "Aleksandr", script: "Александр" },
      { language: "Hungarian", form: "Sándor" },
    ],
    notes: ["Alexandria, Iskandariyya and Sikandarabad are all named for the same man."],
  },
  {
    id: "andrew",
    name: "Andrew",
    gender: "male",
    origin: "Ancient Greek",
    native: "Ἀνδρέας",
    translit: "Andreas",
    meaning: "manly, brave",
    certainty: "documented",
    root: { text: "andreios", script: "ἀνδρεῖος", gloss: "manly, from anēr, andros — man", language: "Ancient Greek" },
    deepRoot: { label: "Proto-Indo-European", form: "*h₂nḗr", gloss: "man" },
    tag: "man-human",
    forms: [
      { language: "Latin", form: "Andreas" },
      { language: "French", form: "André" },
      { language: "Spanish", form: "Andrés" },
      { language: "Russian", form: "Andrei", script: "Андрей" },
      { language: "Italian", form: "Andrea", note: "masculine in Italian" },
    ],
    notes: [],
  },
  {
    id: "sophia",
    name: "Sophia",
    gender: "female",
    origin: "Ancient Greek",
    native: "Σοφία",
    translit: "Sophia",
    meaning: "wisdom",
    certainty: "documented",
    root: { text: "sophos", script: "σοφός", gloss: "wise, skilled", language: "Ancient Greek" },
    tag: "knowledge",
    forms: [
      { language: "Latin", form: "Sophia" },
      { language: "Italian", form: "Sofia" },
      { language: "Polish", form: "Zofia" },
      { language: "Russian", form: "Sofiya", script: "София" },
      { language: "French", form: "Sophie" },
    ],
    notes: ["Philosophy is philo- plus sophia, the love of wisdom."],
  },
  {
    id: "george",
    name: "George",
    gender: "male",
    origin: "Ancient Greek",
    native: "Γεώργιος",
    translit: "Geōrgios",
    meaning: "farmer, earth-worker",
    certainty: "documented",
    root: { text: "gē + ergon", script: "γῆ + ἔργον", gloss: "earth + work", language: "Ancient Greek" },
    tag: "occupation",
    forms: [
      { language: "Latin", form: "Georgius" },
      { language: "Spanish", form: "Jorge" },
      { language: "Italian", form: "Giorgio" },
      { language: "Russian", form: "Georgiy / Yuri", script: "Георгий / Юрий" },
      { language: "Arabic", form: "Jirjis", script: "جرجس" },
      { language: "Polish", form: "Jerzy" },
    ],
    notes: ["Geography and energy share the two Greek elements in this name."],
  },
  {
    id: "nicholas",
    name: "Nicholas",
    gender: "male",
    origin: "Ancient Greek",
    native: "Νικόλαος",
    translit: "Nikolaos",
    meaning: "victory of the people",
    certainty: "documented",
    root: { text: "nikē + laos", script: "νίκη + λαός", gloss: "victory + people", language: "Ancient Greek" },
    tag: "victory",
    forms: [
      { language: "Latin", form: "Nicolaus" },
      { language: "Spanish", form: "Nicolás" },
      { language: "Russian", form: "Nikolai", script: "Николай" },
      { language: "German", form: "Klaus / Nikolaus" },
      { language: "Italian", form: "Nicola" },
    ],
    notes: ["Nike, Nicole and Berenice all carry the same nikē element."],
  },
  {
    id: "theodore",
    name: "Theodore",
    gender: "male",
    origin: "Ancient Greek",
    native: "Θεόδωρος",
    translit: "Theodōros",
    meaning: "gift of God",
    certainty: "documented",
    root: { text: "theos + dōron", script: "θεός + δῶρον", gloss: "god + gift", language: "Ancient Greek" },
    tag: "gift-of-god",
    forms: [
      { language: "Latin", form: "Theodorus / Deodatus" },
      { language: "Russian", form: "Fyodor", script: "Фёдор" },
      { language: "Spanish", form: "Teodoro" },
      { language: "Greek", form: "Dorothea", script: "Δωροθέα", note: "the same two words in the opposite order" },
    ],
    notes: [
      "Names meaning gift of God appear independently in many languages: Nathaniel and Jonathan in Hebrew, Bogdan in Slavic, Atallah عطاالله in Arabic and Khodadad خداداد in Persian.",
    ],
  },
  {
    id: "peter",
    name: "Peter",
    gender: "male",
    origin: "Ancient Greek",
    native: "Πέτρος",
    translit: "Petros",
    meaning: "stone, rock",
    certainty: "documented",
    root: { text: "petra", script: "πέτρα", gloss: "rock", language: "Ancient Greek" },
    tag: "nature",
    forms: [
      { language: "Aramaic", form: "Kepha", script: "כיפא", note: "the original nickname the Greek translates" },
      { language: "Latin", form: "Petrus" },
      { language: "Spanish", form: "Pedro" },
      { language: "French", form: "Pierre" },
      { language: "Russian", form: "Pyotr", script: "Пётр" },
      { language: "Arabic", form: "Butros", script: "بطرس" },
    ],
    notes: ["Cephas, still used in some churches, is the untranslated Aramaic form."],
  },
  {
    id: "philip",
    name: "Philip",
    gender: "male",
    origin: "Ancient Greek",
    native: "Φίλιππος",
    translit: "Philippos",
    meaning: "lover of horses",
    certainty: "documented",
    root: { text: "philos + hippos", script: "φίλος + ἵππος", gloss: "loving + horse", language: "Ancient Greek" },
    tag: "nature",
    forms: [
      { language: "Latin", form: "Philippus" },
      { language: "Spanish", form: "Felipe" },
      { language: "Italian", form: "Filippo" },
      { language: "Russian", form: "Filipp", script: "Филипп" },
    ],
    notes: ["The hippos element also appears in hippopotamus, literally river horse."],
  },
  {
    id: "zoe",
    name: "Zoe",
    gender: "female",
    origin: "Ancient Greek",
    native: "Ζωή",
    translit: "Zōē",
    meaning: "life",
    certainty: "documented",
    root: { text: "zōē", script: "ζωή", gloss: "life", language: "Ancient Greek" },
    tag: "life",
    forms: [
      { language: "Latin", form: "Zoe" },
      { language: "Russian", form: "Zoya", script: "Зоя" },
      { language: "Hebrew", form: "Chava / Eve", script: "חַוָּה", note: "an independent name with the same meaning" },
    ],
    notes: ["Early Greek-speaking Christians used Zoe as a direct translation of the Hebrew name Eve."],
  },
  {
    id: "irene",
    name: "Irene",
    gender: "female",
    origin: "Ancient Greek",
    native: "Εἰρήνη",
    translit: "Eirēnē",
    meaning: "peace",
    certainty: "documented",
    root: { text: "eirēnē", script: "εἰρήνη", gloss: "peace", language: "Ancient Greek" },
    tag: "peace",
    forms: [
      { language: "Russian", form: "Irina", script: "Ирина" },
      { language: "Spanish", form: "Irene" },
      { language: "Italian", form: "Irene" },
    ],
    notes: [],
  },

  /* ---------------------------------------------------------------- Latin */
  {
    id: "victor",
    name: "Victor",
    gender: "male",
    origin: "Latin",
    native: "Victor",
    translit: "victor",
    meaning: "conqueror, winner",
    certainty: "documented",
    root: { text: "vincere", gloss: "to conquer, to overcome", language: "Latin" },
    tag: "victory",
    forms: [
      { language: "Italian", form: "Vittorio" },
      { language: "Spanish", form: "Víctor" },
      { language: "Russian", form: "Viktor", script: "Виктор" },
      { language: "Latin", form: "Vincent", note: "from vincēns, conquering — the same verb" },
    ],
    notes: ["Victoria is the feminine form and also the Latin word for victory itself."],
  },
  {
    id: "paul",
    name: "Paul",
    gender: "male",
    origin: "Latin",
    native: "Paulus",
    translit: "paulus",
    meaning: "small, modest",
    certainty: "documented",
    root: { text: "paulus", gloss: "little, small", language: "Latin" },
    tag: "humility",
    forms: [
      { language: "Spanish", form: "Pablo" },
      { language: "Italian", form: "Paolo" },
      { language: "Russian", form: "Pavel", script: "Павел" },
      { language: "Arabic", form: "Bulus", script: "بولس" },
      { language: "Hungarian", form: "Pál" },
    ],
    notes: [],
  },
  {
    id: "clara",
    name: "Clara",
    gender: "female",
    origin: "Latin",
    native: "Clara",
    translit: "clarus",
    meaning: "bright, clear, famous",
    certainty: "documented",
    root: { text: "clarus", gloss: "bright, clear, distinguished", language: "Latin" },
    tag: "light",
    forms: [
      { language: "French", form: "Claire" },
      { language: "Italian", form: "Chiara" },
      { language: "German", form: "Klara" },
      { language: "Spanish", form: "Clara" },
    ],
    notes: ["English clarity, declare and clarion come from the same adjective."],
  },
  {
    id: "lucia",
    name: "Lucia",
    gender: "female",
    origin: "Latin",
    native: "Lucia",
    translit: "lux, lucis",
    meaning: "light",
    certainty: "documented",
    root: { text: "lux, lucis", gloss: "light", language: "Latin" },
    deepRoot: {
      label: "Proto-Indo-European",
      form: "*lewk-",
      gloss: "light, brightness",
      cognates: [
        { language: "Sanskrit", form: "roka", script: "रोक", gloss: "light" },
        { language: "Ancient Greek", form: "leukos", script: "λευκός", gloss: "white, bright" },
        { language: "Old English", form: "lēoht", gloss: "light" },
      ],
    },
    tag: "light",
    forms: [
      { language: "Italian", form: "Lucia" },
      { language: "Spanish", form: "Lucía / Luz" },
      { language: "English", form: "Lucy" },
      { language: "Latin", form: "Lucius", note: "the masculine form" },
    ],
    notes: [
      "The similar-looking name Luke is unrelated: Greek Loukas means a man from Lucania.",
    ],
  },
  {
    id: "marcus",
    name: "Marcus",
    gender: "male",
    origin: "Latin",
    native: "Marcus",
    translit: "Marcus",
    meaning: "of Mars, dedicated to the god of war",
    certainty: "documented",
    root: { text: "Mārs, Mārtis", gloss: "the Roman god Mars", language: "Latin" },
    tag: "divinity",
    forms: [
      { language: "Italian", form: "Marco" },
      { language: "Spanish", form: "Marcos" },
      { language: "Polish", form: "Marek" },
      { language: "Latin", form: "Martinus / Martin", note: "also built on the name of Mars" },
    ],
    notes: ["The month of March carries the same god's name."],
  },
  {
    id: "regina",
    name: "Regina",
    gender: "female",
    origin: "Latin",
    native: "Regina",
    translit: "regina",
    meaning: "queen",
    certainty: "documented",
    root: { text: "rēx, rēgis", gloss: "king", language: "Latin" },
    deepRoot: {
      label: "Proto-Indo-European",
      form: "*h₃rēǵs",
      gloss: "ruler",
      cognates: [
        { language: "Sanskrit", form: "rājan", script: "राजन्", gloss: "king — the name Raja" },
        { language: "Old Irish", form: "rí", gloss: "king" },
        { language: "Gothic", form: "reiks", gloss: "ruler" },
      ],
    },
    tag: "royalty",
    forms: [
      { language: "Italian", form: "Regina" },
      { language: "German", form: "Regina" },
      { language: "Spanish", form: "Reina" },
    ],
    notes: ["Regina and the Sanskrit name Raja are the same inherited word, not a borrowing in either direction."],
  },
  {
    id: "felix",
    name: "Felix",
    gender: "male",
    origin: "Latin",
    native: "Felix",
    translit: "fēlīx",
    meaning: "fortunate, happy, fruitful",
    certainty: "documented",
    root: { text: "fēlīx", gloss: "fruitful, and so lucky and happy", language: "Latin" },
    tag: "joy",
    forms: [
      { language: "Spanish", form: "Félix" },
      { language: "Italian", form: "Felice" },
      { language: "English", form: "Felicity / Felicia" },
    ],
    notes: ["Arabic Saeed سعيد and Sanskrit Ananda carry the same idea from unrelated roots."],
  },

  /* --------------------------------------------------------- Persian etc. */
  {
    id: "roshan",
    name: "Roshan",
    gender: "unisex",
    origin: "Persian",
    native: "روشن",
    translit: "rōšan",
    meaning: "bright, luminous",
    certainty: "documented",
    root: { text: "rōšan", gloss: "light, brightness", language: "Persian" },
    tag: "light",
    forms: [
      { language: "Urdu", form: "Roshan", script: "روشن" },
      { language: "Hindi", form: "Roshni", script: "रोशनी", note: "the borrowed noun meaning light" },
      { language: "Kurdish", form: "Roj", note: "related sense of sun and daylight" },
    ],
    notes: [],
  },
  {
    id: "darius",
    name: "Darius",
    gender: "male",
    origin: "Old Persian",
    native: "𐎭𐎠𐎼𐎹𐎺𐎢𐏁",
    translit: "Dārayavauš",
    meaning: "he who holds firm the good",
    certainty: "documented",
    root: { text: "dāraya- + vahu-", gloss: "to hold, to possess + good", language: "Old Persian" },
    tag: "virtue",
    forms: [
      { language: "Persian", form: "Dariush", script: "داریوش" },
      { language: "Ancient Greek", form: "Dareios", script: "Δαρεῖος" },
      { language: "Latin", form: "Darius" },
      { language: "Hebrew", form: "Daryavesh", script: "דָּרְיָוֶשׁ" },
    ],
    notes: ["The name is recorded in the king's own trilingual Behistun inscription."],
  },
  {
    id: "mehran",
    name: "Mehran",
    gender: "male",
    origin: "Persian",
    native: "مهران",
    translit: "Mehrān",
    meaning: "of the sun; kindness, love",
    certainty: "documented",
    root: { text: "mehr", gloss: "sun, affection — from Avestan Miθra", language: "Persian" },
    tag: "light",
    forms: [
      { language: "Avestan", form: "Miθra", note: "the deity of covenant and light" },
      { language: "Sanskrit", form: "Mitra", script: "मित्र", note: "friend, contract — the same inherited word" },
      { language: "Latin", form: "Mithras", note: "the Roman mystery cult name" },
    ],
    notes: ["Persian mehr and Sanskrit mitra descend from one Indo-Iranian word meaning covenant, then friend."],
  },

  /* ------------------------------------------------------ Germanic, Slavic, Celtic */
  {
    id: "william",
    name: "William",
    gender: "male",
    origin: "Proto-Germanic",
    native: "Wilhelm",
    translit: "wiljô + helmaz",
    meaning: "resolute protector",
    certainty: "documented",
    root: { text: "wil + helm", gloss: "will, desire + helmet, protection", language: "Proto-Germanic" },
    tag: "protection",
    forms: [
      { language: "German", form: "Wilhelm" },
      { language: "French", form: "Guillaume" },
      { language: "Spanish", form: "Guillermo" },
      { language: "Italian", form: "Guglielmo" },
      { language: "Irish", form: "Liam", note: "a shortening of Uilliam" },
    ],
    notes: [],
  },
  {
    id: "robert",
    name: "Robert",
    gender: "male",
    origin: "Proto-Germanic",
    native: "Hrodebert",
    translit: "hrōþi + berhtaz",
    meaning: "bright with fame",
    certainty: "documented",
    root: { text: "hrod + beraht", gloss: "fame, glory + bright", language: "Proto-Germanic" },
    tag: "fame",
    forms: [
      { language: "Italian", form: "Roberto" },
      { language: "German", form: "Rupert" },
      { language: "French", form: "Robert" },
      { language: "English", form: "Robin", note: "a medieval pet form" },
    ],
    notes: ["The beraht element also ends Albert, Herbert and Bertram."],
  },
  {
    id: "richard",
    name: "Richard",
    gender: "male",
    origin: "Proto-Germanic",
    native: "Ricohard",
    translit: "rīks + harduz",
    meaning: "strong ruler",
    certainty: "documented",
    root: { text: "rīc + hard", gloss: "ruler, powerful + hardy, brave", language: "Proto-Germanic" },
    deepRoot: {
      label: "Proto-Indo-European",
      form: "*h₃rēǵs",
      gloss: "ruler — the rīc element",
      cognates: [
        { language: "Sanskrit", form: "rājan", script: "राजन्", gloss: "king" },
        { language: "Latin", form: "rēx", gloss: "king" },
      ],
    },
    tag: "royalty",
    forms: [
      { language: "French", form: "Richard" },
      { language: "Spanish", form: "Ricardo" },
      { language: "German", form: "Richard" },
    ],
    notes: ["Germanic rīc is the same inherited word as Sanskrit rājan and Latin rēx."],
  },
  {
    id: "frederick",
    name: "Frederick",
    gender: "male",
    origin: "Proto-Germanic",
    native: "Frithuric",
    translit: "friþuz + rīks",
    meaning: "peaceful ruler",
    certainty: "documented",
    root: { text: "frid + rīc", gloss: "peace + ruler", language: "Proto-Germanic" },
    tag: "peace",
    forms: [
      { language: "German", form: "Friedrich" },
      { language: "Italian", form: "Federico" },
      { language: "Spanish", form: "Federico" },
      { language: "Swedish", form: "Fredrik" },
    ],
    notes: [],
  },
  {
    id: "charles",
    name: "Charles",
    gender: "male",
    origin: "Proto-Germanic",
    native: "Karl",
    translit: "karlaz",
    meaning: "free man",
    certainty: "documented",
    root: { text: "karl", gloss: "man, freeman, husbandman", language: "Proto-Germanic" },
    tag: "man-human",
    forms: [
      { language: "German", form: "Karl" },
      { language: "Spanish", form: "Carlos" },
      { language: "Italian", form: "Carlo" },
      { language: "Hungarian", form: "Károly" },
      { language: "Russian", form: "korol'", script: "король", note: "the Slavic word for king, taken from Charlemagne's name" },
    ],
    notes: [
      "One of the few cases where a personal name became the ordinary noun for king across a whole language family.",
    ],
  },
  {
    id: "vladimir",
    name: "Vladimir",
    gender: "male",
    origin: "Old Church Slavonic",
    native: "Владимиръ",
    translit: "Volodiměrъ",
    meaning: "ruler of the world; great in power",
    certainty: "documented",
    root: { text: "vlad- + měrъ", gloss: "to rule + great; later reinterpreted with mir, peace or world", language: "Old Church Slavonic" },
    tag: "royalty",
    forms: [
      { language: "Ukrainian", form: "Volodymyr", script: "Володимир" },
      { language: "Polish", form: "Włodzimierz" },
      { language: "German", form: "Waldemar" },
    ],
    notes: ["The second element was originally měrъ, great; the modern reading as mir, peace, is a later folk reanalysis."],
  },
  {
    id: "bogdan",
    name: "Bogdan",
    gender: "male",
    origin: "Old Church Slavonic",
    native: "Богданъ",
    translit: "Bogъ + danъ",
    meaning: "given by God",
    certainty: "documented",
    root: { text: "bog + dan", gloss: "god + given", language: "Old Church Slavonic" },
    tag: "gift-of-god",
    forms: [
      { language: "Ukrainian", form: "Bohdan", script: "Богдан" },
      { language: "Romanian", form: "Bogdan" },
      { language: "Serbian", form: "Bogdan" },
    ],
    notes: ["A precise Slavic equivalent of the Greek Theodore and the Hebrew Nathaniel."],
  },
  {
    id: "kevin",
    name: "Kevin",
    gender: "male",
    origin: "Old Irish",
    native: "Caoimhghín",
    translit: "Cóemgen",
    meaning: "of gentle birth, comely born",
    certainty: "documented",
    root: { text: "cóem + gen", gloss: "gentle, beautiful + birth, kin", language: "Old Irish" },
    tag: "beauty-goodness",
    forms: [
      { language: "Irish", form: "Caoimhín" },
      { language: "English", form: "Kevin" },
      { language: "Irish", form: "Caoimhe", note: "the related feminine name" },
    ],
    notes: [],
  },
];

/* --------------------------------------------------------------- indexing */

/**
 * Fold a name to a comparable key: lower case, Latin diacritics removed,
 * Hebrew points and Arabic harakat removed, punctuation and spacing dropped.
 * Greek, Hebrew, Arabic and Devanagari letters are kept so a name typed in its
 * own script still matches.
 */
export function normalise(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[֑-ׇً-ٰٟۖ-ۭ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9Ͱ-῿֐-ࣿऀ-ॿ]/g, "");
}

function splitForms(form) {
  return String(form)
    .split(/\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** name key -> [{ entryId, label, language, kind }] */
export const NAME_INDEX = (() => {
  const index = new Map();
  const add = (key, record) => {
    if (!key) return;
    const list = index.get(key);
    if (list) list.push(record);
    else index.set(key, [record]);
  };

  NAME_ENTRIES.forEach((entry) => {
    add(normalise(entry.name), {
      entryId: entry.id,
      label: entry.name,
      language: entry.origin,
      kind: "headword",
    });
    add(normalise(entry.translit), {
      entryId: entry.id,
      label: entry.translit,
      language: entry.origin,
      kind: "transliteration",
    });
    if (entry.native) {
      add(normalise(entry.native), {
        entryId: entry.id,
        label: entry.native,
        language: entry.origin,
        kind: "native script",
      });
    }
    entry.forms.forEach((form) => {
      splitForms(form.form).forEach((part) => {
        add(normalise(part), {
          entryId: entry.id,
          label: part,
          language: form.language,
          kind: "cognate form",
        });
      });
      if (form.script) {
        add(normalise(form.script), {
          entryId: entry.id,
          label: form.script,
          language: form.language,
          kind: "native script",
        });
      }
    });
  });
  return index;
})();

/** Every headword and variant, sorted, for the browse list. */
export const ALL_KEYS = Array.from(NAME_INDEX.keys()).sort();

function entryById(id) {
  return NAME_ENTRIES.find((entry) => entry.id === id) ?? null;
}

/* ------------------------------------------------------------- similarity */

/** Levenshtein edit distance. Deterministic, no allocation surprises. */
export function editDistance(a, b) {
  const s = String(a);
  const t = String(b);
  if (s === t) return 0;
  if (s.length === 0) return t.length;
  if (t.length === 0) return s.length;
  let previous = Array.from({ length: t.length + 1 }, (_, i) => i);
  for (let i = 1; i <= s.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= t.length; j += 1) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
    }
    previous = current;
  }
  return previous[t.length];
}

/**
 * Closest dictionary keys to a query, ordered by edit distance then
 * alphabetically so ties break the same way every time.
 */
export function suggestNames(query, limit = 6) {
  const key = normalise(query);
  if (key.length < 2) return [];
  const scored = ALL_KEYS.map((candidate) => ({
    key: candidate,
    distance: editDistance(key, candidate),
    prefix: candidate.startsWith(key) || key.startsWith(candidate),
  }))
    .filter((row) => row.prefix || row.distance <= Math.max(2, Math.floor(key.length / 3)))
    .sort((a, b) => {
      if (a.prefix !== b.prefix) return a.prefix ? -1 : 1;
      if (a.distance !== b.distance) return a.distance - b.distance;
      return a.key < b.key ? -1 : 1;
    })
    .slice(0, limit);

  return scored.map((row) => {
    const record = NAME_INDEX.get(row.key)[0];
    const entry = entryById(record.entryId);
    return { label: record.label, entryId: record.entryId, headword: entry ? entry.name : record.label };
  });
}

/* ---------------------------------------------------------------- lookups */

/** Entries built on the same root gloss as this one. */
export function relatedByRoot(entry) {
  if (!entry || !entry.root) return [];
  const key = normalise(entry.root.text);
  return NAME_ENTRIES.filter(
    (other) => other.id !== entry.id && other.root && normalise(other.root.text) === key,
  );
}

/** Entries whose deep root is the same reconstructed form. */
export function relatedByDeepRoot(entry) {
  if (!entry || !entry.deepRoot) return [];
  return NAME_ENTRIES.filter(
    (other) =>
      other.id !== entry.id && other.deepRoot && other.deepRoot.form === entry.deepRoot.form,
  );
}

/** Unrelated names that nonetheless carry the same meaning. */
export function relatedByMeaning(entry) {
  if (!entry || !entry.tag || entry.tag === "uncertain") return [];
  return NAME_ENTRIES.filter((other) => other.id !== entry.id && other.tag === entry.tag);
}

/** Group an entry's forms by language family for display. */
export function formsByFamily(entry) {
  if (!entry) return [];
  const groups = new Map();
  entry.forms.forEach((form) => {
    const family = LANGUAGE_FAMILIES[form.language] ?? "Other";
    const list = groups.get(family);
    if (list) list.push(form);
    else groups.set(family, [form]);
  });
  return Array.from(groups.entries())
    .map(([family, forms]) => ({ family, forms }))
    .sort((a, b) => (a.family < b.family ? -1 : 1));
}

/**
 * Look a name up.
 * Returns { error } for unusable input, { notFound, suggestions } when the
 * dictionary has nothing, and a full record otherwise.
 */
export function lookupName(query) {
  const raw = String(query ?? "").trim();
  if (raw.length === 0) return { error: "Type a name to look up." };
  if (raw.length > 60) return { error: "That is too long to be a given name." };
  const key = normalise(raw);
  if (key.length === 0) {
    return { error: "That does not contain any letters this dictionary can read." };
  }

  const records = NAME_INDEX.get(key);
  if (!records) {
    return {
      notFound: true,
      query: raw,
      suggestions: suggestNames(raw),
      dictionarySize: NAME_ENTRIES.length,
    };
  }

  const seen = new Set();
  const matches = [];
  records.forEach((record) => {
    if (seen.has(record.entryId)) return;
    seen.add(record.entryId);
    const entry = entryById(record.entryId);
    if (!entry) return;
    const sameRoot = relatedByRoot(entry);
    const sameDeepRoot = relatedByDeepRoot(entry);
    const alreadyLinked = new Set([...sameRoot, ...sameDeepRoot].map((item) => item.id));
    matches.push({
      entry,
      matchedOn: record.label,
      matchLanguage: record.language,
      matchKind: record.kind,
      families: formsByFamily(entry),
      sameRoot,
      sameDeepRoot,
      // Names that mean the same thing but are NOT built from a shared root.
      sameMeaning: relatedByMeaning(entry).filter((item) => !alreadyLinked.has(item.id)),
    });
  });

  if (matches.length === 0) {
    return { notFound: true, query: raw, suggestions: suggestNames(raw), dictionarySize: NAME_ENTRIES.length };
  }
  return { query: raw, matches, dictionarySize: NAME_ENTRIES.length };
}

/** Headwords grouped by origin language, for browsing the dictionary. */
export function browseByOrigin() {
  const groups = new Map();
  NAME_ENTRIES.forEach((entry) => {
    const list = groups.get(entry.origin);
    if (list) list.push(entry);
    else groups.set(entry.origin, [entry]);
  });
  return Array.from(groups.entries())
    .map(([origin, entries]) => ({
      origin,
      family: LANGUAGE_FAMILIES[origin] ?? "Other",
      entries: entries.slice().sort((a, b) => (a.name < b.name ? -1 : 1)),
    }))
    .sort((a, b) => (a.origin < b.origin ? -1 : 1));
}

/** A plain-text summary of one match, for the copy button. */
export function summariseMatch(match) {
  if (!match || !match.entry) return "";
  const entry = match.entry;
  const lines = [
    `${entry.name} — ${entry.meaning}${entry.certainty === "debated" ? " (disputed)" : ""}`,
    `Origin: ${entry.origin}${entry.native ? ` (${entry.native}, ${entry.translit})` : ""}`,
    `Root: ${entry.root.text}${entry.root.script ? ` ${entry.root.script}` : ""} — ${entry.root.gloss} (${entry.root.language})`,
  ];
  if (entry.deepRoot) {
    lines.push(`${entry.deepRoot.label} root: ${entry.deepRoot.form} — ${entry.deepRoot.gloss}`);
    (entry.deepRoot.cognates ?? []).forEach((cognate) => {
      lines.push(`  · ${cognate.language} ${cognate.form}${cognate.script ? ` ${cognate.script}` : ""} — ${cognate.gloss}`);
    });
  }
  lines.push("Forms in other languages:");
  entry.forms.forEach((form) => {
    lines.push(`  · ${form.language}: ${form.form}${form.script ? ` ${form.script}` : ""}${form.note ? ` — ${form.note}` : ""}`);
  });
  if (match.sameMeaning.length > 0) {
    lines.push(`Same meaning, unrelated roots: ${match.sameMeaning.map((item) => item.name).join(", ")}`);
  }
  entry.notes.forEach((note) => lines.push(`Note: ${note}`));
  return lines.join("\n");
}
