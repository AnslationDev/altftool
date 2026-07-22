// Grammar quiz questions organized by topic and difficulty
export const TOPICS = [
  "All Topics",
  "Tenses",
  "Articles",
  "Prepositions",
  "Conjunctions",
  "Pronouns",
  "Adjectives",
  "Adverbs",
  "Active & Passive Voice",
  "Direct & Indirect Speech",
  "Subject-Verb Agreement",
  "Punctuation",
  "Sentence Correction",
  "Error Detection",
];

export const DIFFICULTIES = ["All", "easy", "medium", "hard"];

export const QUESTIONS = [
  // ── TENSES ──
  {
    id: 1,
    topic: "Tenses",
    difficulty: "easy",
    question: "She _____ to school every day.",
    options: ["go", "goes", "going", "went"],
    answer: "goes",
    explanation:
      "With a third-person singular subject (She), the simple present tense requires adding '-s' or '-es' to the base verb.",
    hint: "Think about subject-verb agreement in the simple present tense.",
  },
  {
    id: 2,
    topic: "Tenses",
    difficulty: "easy",
    question: "They _____ playing football when it started to rain.",
    options: ["was", "were", "are", "is"],
    answer: "were",
    explanation:
      "'They' is a plural subject, so we use 'were' (not 'was') in the past continuous tense.",
    hint: "Consider the plural subject 'They' and the past continuous tense.",
  },
  {
    id: 3,
    topic: "Tenses",
    difficulty: "medium",
    question: "By the time he arrived, she _____ already left.",
    options: ["has", "had", "have", "was"],
    answer: "had",
    explanation:
      "The past perfect tense (had + past participle) is used to show an action completed before another past action.",
    hint: "Use the past perfect to show one past action before another.",
  },
  {
    id: 4,
    topic: "Tenses",
    difficulty: "medium",
    question: "I _____ in London for five years by next December.",
    options: ["will live", "will have lived", "have lived", "had lived"],
    answer: "will have lived",
    explanation:
      "The future perfect tense (will have + past participle) describes an action that will be completed before a specific future time.",
    hint: "This refers to an action that will be complete before a future date.",
  },
  {
    id: 5,
    topic: "Tenses",
    difficulty: "hard",
    question: "If she _____ harder, she would have passed the exam.",
    options: ["studied", "had studied", "studies", "has studied"],
    answer: "had studied",
    explanation:
      "In a third conditional sentence, the 'if' clause uses the past perfect (had + past participle) to express an unreal past situation.",
    hint: "This is a third conditional — an unreal past situation.",
  },
  {
    id: 6,
    topic: "Tenses",
    difficulty: "easy",
    question: "He _____ his homework before dinner last night.",
    options: ["finishes", "will finish", "finished", "is finishing"],
    answer: "finished",
    explanation:
      "The simple past tense is used to describe a completed action at a specific time in the past.",
    hint: "The action happened in the past — 'last night'.",
  },
  {
    id: 7,
    topic: "Tenses",
    difficulty: "medium",
    question: "She _____ for this company since 2018.",
    options: ["works", "worked", "has worked", "had worked"],
    answer: "has worked",
    explanation:
      "The present perfect tense (has/have + past participle) describes an action that started in the past and continues to the present.",
    hint: "'Since 2018' signals present perfect, indicating continuity up to now.",
  },

  // ── ARTICLES ──
  {
    id: 8,
    topic: "Articles",
    difficulty: "easy",
    question: "I saw _____ elephant at the zoo.",
    options: ["a", "an", "the", "—"],
    answer: "an",
    explanation:
      "'An' is used before words that begin with a vowel sound. 'Elephant' starts with a vowel sound 'e'.",
    hint: "Look at the first sound of 'elephant'.",
  },
  {
    id: 9,
    topic: "Articles",
    difficulty: "easy",
    question: "_____ sun rises in the east.",
    options: ["A", "An", "The", "—"],
    answer: "The",
    explanation:
      "'The' is used with unique nouns — things there is only one of, like the sun, the moon, the earth.",
    hint: "There is only one of this object.",
  },
  {
    id: 10,
    topic: "Articles",
    difficulty: "medium",
    question: "She is _____ honest woman.",
    options: ["a", "an", "the", "—"],
    answer: "an",
    explanation:
      "Although 'honest' starts with the letter 'h', it begins with a vowel sound /ɒ/, so 'an' is used.",
    hint: "Focus on the sound, not the letter.",
  },
  {
    id: 11,
    topic: "Articles",
    difficulty: "medium",
    question: "He plays _____ guitar very well.",
    options: ["a", "an", "the", "—"],
    answer: "the",
    explanation:
      "Musical instruments generally use 'the' when referring to the skill of playing.",
    hint: "Musical instruments use a specific article when discussing playing them.",
  },
  {
    id: 12,
    topic: "Articles",
    difficulty: "hard",
    question: "_____ information provided was incorrect.",
    options: ["A", "An", "The", "—"],
    answer: "The",
    explanation:
      "'Information' is an uncountable noun, so we don't use 'a/an'. 'The' is used here to refer to specific information.",
    hint: "'Information' is uncountable. We use 'the' when referring to specific information.",
  },

  // ── PREPOSITIONS ──
  {
    id: 13,
    topic: "Prepositions",
    difficulty: "easy",
    question: "She arrived _____ Monday morning.",
    options: ["in", "on", "at", "by"],
    answer: "on",
    explanation:
      "'On' is used with specific days (Monday, Tuesday) and dates.",
    hint: "Use 'on' with days of the week.",
  },
  {
    id: 14,
    topic: "Prepositions",
    difficulty: "easy",
    question: "The meeting is _____ 3 o'clock.",
    options: ["in", "on", "at", "by"],
    answer: "at",
    explanation:
      "'At' is used with specific times.",
    hint: "Use 'at' for specific clock times.",
  },
  {
    id: 15,
    topic: "Prepositions",
    difficulty: "medium",
    question: "He has been ill _____ last week.",
    options: ["from", "since", "for", "in"],
    answer: "since",
    explanation:
      "'Since' is used with a specific point in time (last week, 2020, Monday). 'For' is used with a duration.",
    hint: "'Last week' is a point in time, not a duration.",
  },
  {
    id: 16,
    topic: "Prepositions",
    difficulty: "medium",
    question: "She is angry _____ her brother.",
    options: ["at", "with", "on", "about"],
    answer: "with",
    explanation:
      "In British English, 'angry with' is used when referring to a person. 'Angry at' may also be acceptable in some dialects.",
    hint: "When angry about a person, use 'with'.",
  },
  {
    id: 17,
    topic: "Prepositions",
    difficulty: "hard",
    question: "The agreement was signed _____ behalf _____ the company.",
    options: ["in / of", "on / of", "at / for", "by / of"],
    answer: "on / of",
    explanation:
      "The correct phrase is 'on behalf of' — meaning as a representative of.",
    hint: "This is a fixed phrase in English.",
  },

  // ── CONJUNCTIONS ──
  {
    id: 18,
    topic: "Conjunctions",
    difficulty: "easy",
    question: "He was tired, _____ he kept working.",
    options: ["so", "but", "and", "or"],
    answer: "but",
    explanation:
      "'But' is a coordinating conjunction used to contrast two ideas.",
    hint: "The second clause contrasts with the first.",
  },
  {
    id: 19,
    topic: "Conjunctions",
    difficulty: "medium",
    question: "_____ it was raining, we went for a walk.",
    options: ["Although", "Because", "Since", "So"],
    answer: "Although",
    explanation:
      "'Although' introduces a contrast — despite the rain, they still went.",
    hint: "Choose a conjunction showing contrast/concession.",
  },
  {
    id: 20,
    topic: "Conjunctions",
    difficulty: "medium",
    question: "She will pass the exam _____ she studies hard.",
    options: ["unless", "if", "though", "until"],
    answer: "if",
    explanation:
      "'If' introduces a conditional clause — the exam success depends on studying.",
    hint: "This introduces a conditional statement.",
  },
  {
    id: 21,
    topic: "Conjunctions",
    difficulty: "hard",
    question: "No sooner _____ he left _____ it started to rain.",
    options: ["had / than", "did / than", "had / when", "was / that"],
    answer: "had / than",
    explanation:
      "The 'No sooner...than' structure uses inversion. 'No sooner had he left than...'",
    hint: "This is an inverted sentence structure with 'no sooner...than'.",
  },

  // ── PRONOUNS ──
  {
    id: 22,
    topic: "Pronouns",
    difficulty: "easy",
    question: "Each of the students _____ submitted their report.",
    options: ["have", "has", "are", "were"],
    answer: "has",
    explanation:
      "'Each' is a singular pronoun and always takes a singular verb.",
    hint: "'Each' is always singular.",
  },
  {
    id: 23,
    topic: "Pronouns",
    difficulty: "medium",
    question: "Between you and _____, I think he is wrong.",
    options: ["I", "me", "mine", "myself"],
    answer: "me",
    explanation:
      "After a preposition ('between'), we use an object pronoun ('me'), not a subject pronoun ('I').",
    hint: "What type of pronoun follows a preposition?",
  },
  {
    id: 24,
    topic: "Pronouns",
    difficulty: "medium",
    question: "Neither of the girls _____ ready.",
    options: ["are", "were", "is", "have been"],
    answer: "is",
    explanation:
      "'Neither' is singular and takes a singular verb ('is').",
    hint: "'Neither' takes a singular verb.",
  },

  // ── ACTIVE & PASSIVE VOICE ──
  {
    id: 25,
    topic: "Active & Passive Voice",
    difficulty: "easy",
    question: "The cake _____ by Mary.",
    options: ["baked", "was baked", "has baked", "bakes"],
    answer: "was baked",
    explanation:
      "This is a passive construction: subject + was/were + past participle.",
    hint: "The subject receives the action — passive voice.",
  },
  {
    id: 26,
    topic: "Active & Passive Voice",
    difficulty: "medium",
    question: "Which sentence is in the passive voice?",
    options: [
      "The teacher corrected the papers.",
      "The papers were corrected by the teacher.",
      "The teacher is correcting the papers.",
      "The teacher had corrected the papers.",
    ],
    answer: "The papers were corrected by the teacher.",
    explanation:
      "Passive voice: subject (papers) + be verb (were) + past participle (corrected) + by agent (the teacher).",
    hint: "In passive voice, the subject receives the action.",
  },
  {
    id: 27,
    topic: "Active & Passive Voice",
    difficulty: "hard",
    question:
      "Convert to passive: 'They will announce the results tomorrow.'",
    options: [
      "The results are announced tomorrow.",
      "The results will be announced tomorrow.",
      "The results are being announced tomorrow.",
      "The results would be announced tomorrow.",
    ],
    answer: "The results will be announced tomorrow.",
    explanation:
      "Future passive: will + be + past participle. 'will announce' becomes 'will be announced'.",
    hint: "Future active 'will + verb' becomes 'will be + past participle' in passive.",
  },

  // ── DIRECT & INDIRECT SPEECH ──
  {
    id: 28,
    topic: "Direct & Indirect Speech",
    difficulty: "medium",
    question:
      "He said, 'I am busy now.' Convert to indirect speech.",
    options: [
      "He said that he is busy now.",
      "He said that he was busy then.",
      "He said that he has been busy now.",
      "He told that he was busy now.",
    ],
    answer: "He said that he was busy then.",
    explanation:
      "In indirect speech: 'am' changes to 'was', 'now' changes to 'then'. We use 'said' (not 'told') without an object.",
    hint: "Remember to change tense and time expressions in indirect speech.",
  },
  {
    id: 29,
    topic: "Direct & Indirect Speech",
    difficulty: "hard",
    question:
      "She asked, 'Will you help me?' Convert to indirect speech.",
    options: [
      "She asked if I would help her.",
      "She asked that I will help her.",
      "She asked whether I help her.",
      "She asked me to will help her.",
    ],
    answer: "She asked if I would help her.",
    explanation:
      "Questions in indirect speech use 'if/whether'. 'will' changes to 'would', and the subject/object pronouns change.",
    hint: "Questions in indirect speech use 'if/whether' and no question mark.",
  },

  // ── SUBJECT-VERB AGREEMENT ──
  {
    id: 30,
    topic: "Subject-Verb Agreement",
    difficulty: "easy",
    question: "The quality of the goods _____ poor.",
    options: ["are", "is", "were", "have been"],
    answer: "is",
    explanation:
      "The subject is 'quality' (singular), not 'goods'. The verb must agree with the real subject.",
    hint: "Identify the actual subject, not the noun closest to the verb.",
  },
  {
    id: 31,
    topic: "Subject-Verb Agreement",
    difficulty: "medium",
    question: "Neither the teacher nor the students _____ present.",
    options: ["was", "is", "were", "has been"],
    answer: "were",
    explanation:
      "With 'neither...nor', the verb agrees with the subject closer to it — 'students' is plural, so 'were'.",
    hint: "The verb agrees with the nearest subject in 'neither...nor' constructions.",
  },
  {
    id: 32,
    topic: "Subject-Verb Agreement",
    difficulty: "hard",
    question: "The news _____ surprising.",
    options: ["are", "is", "have been", "were"],
    answer: "is",
    explanation:
      "'News' looks plural but is an uncountable noun and always takes a singular verb.",
    hint: "'News' is an uncountable noun.",
  },

  // ── ADJECTIVES ──
  {
    id: 33,
    topic: "Adjectives",
    difficulty: "easy",
    question: "She is _____ than her sister.",
    options: ["more tall", "taller", "tallest", "most tall"],
    answer: "taller",
    explanation:
      "One-syllable adjectives form comparatives by adding '-er' (tall → taller).",
    hint: "Short adjectives use '-er' for comparatives.",
  },
  {
    id: 34,
    topic: "Adjectives",
    difficulty: "medium",
    question: "He is the _____ student in the class.",
    options: [
      "more intelligent",
      "most intelligent",
      "intelligenter",
      "intelligentest",
    ],
    answer: "most intelligent",
    explanation:
      "Multi-syllable adjectives form superlatives with 'most' (intelligent → most intelligent).",
    hint: "Long adjectives use 'most' for superlatives.",
  },
  {
    id: 35,
    topic: "Adjectives",
    difficulty: "hard",
    question: "Which sentence uses an adjective correctly?",
    options: [
      "She felt badly about the mistake.",
      "He looked surprisingly at the news.",
      "The soup tastes delicious.",
      "She sings beautiful.",
    ],
    answer: "The soup tastes delicious.",
    explanation:
      "After linking verbs like 'taste', 'smell', 'feel', 'look', use an adjective (not an adverb). 'Delicious' (adjective) is correct.",
    hint: "Linking verbs are followed by adjectives, not adverbs.",
  },

  // ── ADVERBS ──
  {
    id: 36,
    topic: "Adverbs",
    difficulty: "easy",
    question: "She speaks _____ clearly.",
    options: ["very", "much", "many", "more"],
    answer: "very",
    explanation:
      "'Very' is an intensifying adverb used to modify another adverb ('clearly').",
    hint: "What word intensifies an adverb?",
  },
  {
    id: 37,
    topic: "Adverbs",
    difficulty: "medium",
    question: "He _____ arrives on time.",
    options: ["rarely", "seldom", "never", "always"],
    answer: "always",
    explanation:
      "Context tells us we need an adverb of frequency meaning 'at all times' to complete the sentence neutrally. Among the options, 'always' best completes a statement about consistent punctuality.",
    hint: "Which adverb means 'at all times / consistently'?",
  },
  {
    id: 38,
    topic: "Adverbs",
    difficulty: "hard",
    question:
      "Choose the correctly placed adverb: 'She _____ has never _____ been late.'",
    options: [
      "almost / — ",
      "— / almost",
      "nearly / —",
      "— / nearly",
    ],
    answer: "— / almost",
    explanation:
      "'Almost' modifies 'never'. The correct sentence is 'She has almost never been late.' The adverb 'almost' goes before 'never'.",
    hint: "'Almost never' is a standard adverb phrase.",
  },

  // ── PUNCTUATION ──
  {
    id: 39,
    topic: "Punctuation",
    difficulty: "easy",
    question: "Which sentence is punctuated correctly?",
    options: [
      "Its a beautiful day.",
      "It's a beautiful day.",
      "Its' a beautiful day.",
      "It'ss a beautiful day.",
    ],
    answer: "It's a beautiful day.",
    explanation:
      "'It's' is the contraction of 'it is'. 'Its' (without apostrophe) is the possessive pronoun.",
    hint: "Distinguish between the possessive 'its' and the contraction 'it's'.",
  },
  {
    id: 40,
    topic: "Punctuation",
    difficulty: "medium",
    question:
      "Which uses the semicolon correctly?",
    options: [
      "I love coffee; and tea.",
      "She is kind; she always helps others.",
      "He went to the store; bought milk.",
      "They won the game; because they trained hard.",
    ],
    answer: "She is kind; she always helps others.",
    explanation:
      "A semicolon connects two independent clauses (each can stand alone as a sentence) without a conjunction.",
    hint: "A semicolon joins two complete, independent clauses.",
  },

  // ── SENTENCE CORRECTION ──
  {
    id: 41,
    topic: "Sentence Correction",
    difficulty: "easy",
    question: "Identify the correct sentence:",
    options: [
      "She don't know the answer.",
      "She doesn't know the answer.",
      "She do not knows the answer.",
      "She not knows the answer.",
    ],
    answer: "She doesn't know the answer.",
    explanation:
      "With a third-person singular subject ('She'), we use 'doesn't' (does not) in negative sentences.",
    hint: "Third-person singular negation in simple present.",
  },
  {
    id: 42,
    topic: "Sentence Correction",
    difficulty: "medium",
    question: "Which is the correct sentence?",
    options: [
      "I have visited Paris last year.",
      "I visited Paris last year.",
      "I had visited Paris last year.",
      "I was visited Paris last year.",
    ],
    answer: "I visited Paris last year.",
    explanation:
      "Use the simple past (visited) for completed actions at a specific past time ('last year'). Present perfect cannot be used with specific past time markers.",
    hint: "'Last year' is a specific past time — which tense does that require?",
  },
  {
    id: 43,
    topic: "Sentence Correction",
    difficulty: "hard",
    question: "Identify the error in: 'The committee have decided to postpone the meeting.'",
    options: [
      "committee",
      "have",
      "decided",
      "No error — this is British English usage.",
    ],
    answer: "No error — this is British English usage.",
    explanation:
      "In British English, collective nouns like 'committee', 'team', 'jury' can take plural verbs when emphasizing individual members acting as a group.",
    hint: "Consider the difference between British and American English for collective nouns.",
  },

  // ── ERROR DETECTION ──
  {
    id: 44,
    topic: "Error Detection",
    difficulty: "easy",
    question:
      "Find the error: 'He is one of the student who has passed.'",
    options: [
      "one of the",
      "student",
      "who",
      "has passed",
    ],
    answer: "student",
    explanation:
      "'One of the' is always followed by a plural noun. It should be 'one of the students'.",
    hint: "'One of the' must be followed by a plural noun.",
  },
  {
    id: 45,
    topic: "Error Detection",
    difficulty: "medium",
    question:
      "Find the error: 'Neither of the two friends were present at the party.'",
    options: ["Neither", "were", "present", "at the party"],
    answer: "were",
    explanation:
      "'Neither' is singular and takes a singular verb 'was', not 'were'.",
    hint: "'Neither' is always singular.",
  },
  {
    id: 46,
    topic: "Error Detection",
    difficulty: "hard",
    question:
      "Find the error: 'It is you who is responsible for this.'",
    options: ["It is", "you", "who is", "responsible for this"],
    answer: "who is",
    explanation:
      "When the antecedent of 'who' is 'you' (second person), the verb should agree with 'you': 'who are'. So it should be 'It is you who are responsible for this.'",
    hint: "The verb after 'who' must agree with its antecedent.",
  },
];

export const ACHIEVEMENTS = [
  { id: "first_quiz", label: "First Quiz", description: "Complete your first quiz", icon: "🎯", condition: (stats) => stats.totalQuizzes >= 1 },
  { id: "perfect", label: "Perfect Score", description: "Score 100% on a quiz", icon: "🏆", condition: (stats) => stats.perfectScores >= 1 },
  { id: "streak_5", label: "5-Quiz Streak", description: "Complete 5 quizzes", icon: "🔥", condition: (stats) => stats.totalQuizzes >= 5 },
  { id: "all_topics", label: "Topic Master", description: "Try all quiz topics", icon: "📚", condition: (stats) => stats.topicsTried?.length >= TOPICS.length - 1 },
];
