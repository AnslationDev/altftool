export const CATEGORIES = [
  "All Categories",
  "Subject-Verb Agreement",
  "Tenses",
  "Pronouns",
  "Prepositions",
  "Modifiers",
  "Parallelism",
  "Idioms & Usage",
];

export const DIFFICULTIES = ["All", "beginner", "intermediate", "advanced"];

export const SENTENCE_CORRECTIONS = [
  {
    id: 1,
    category: "Subject-Verb Agreement",
    difficulty: "beginner",
    incorrect: "The box of chocolates are on the table.",
    correct: "The box of chocolates is on the table.",
    options: [
      "The box of chocolates are on the table.",
      "The box of chocolates is on the table.",
      "The boxes of chocolate is on the table.",
      "The box of chocolate are on the table."
    ],
    explanation: "The subject is 'box' (singular), not 'chocolates'. Therefore, the singular verb 'is' must be used.",
  },
  {
    id: 2,
    category: "Tenses",
    difficulty: "intermediate",
    incorrect: "I have visited Paris last year.",
    correct: "I visited Paris last year.",
    options: [
      "I have visited Paris last year.",
      "I had visited Paris last year.",
      "I visited Paris last year.",
      "I was visiting Paris last year."
    ],
    explanation: "The present perfect tense ('have visited') cannot be used with a specific past time marker like 'last year'. The simple past ('visited') is required.",
  },
  {
    id: 3,
    category: "Modifiers",
    difficulty: "advanced",
    incorrect: "Walking down the street, the trees were beautiful.",
    correct: "As I walked down the street, the trees were beautiful.",
    options: [
      "Walking down the street, the trees were beautiful.",
      "Walking down the street, beautiful were the trees.",
      "The trees were beautiful, walking down the street.",
      "As I walked down the street, the trees were beautiful."
    ],
    explanation: "This is a dangling modifier. 'Walking down the street' implies the trees were walking. The sentence must clarify who was walking (e.g., 'As I walked...').",
  },
  {
    id: 4,
    category: "Pronouns",
    difficulty: "beginner",
    incorrect: "Me and him went to the store.",
    correct: "He and I went to the store.",
    options: [
      "Me and him went to the store.",
      "Him and me went to the store.",
      "He and I went to the store.",
      "I and he went to the store."
    ],
    explanation: "Subject pronouns ('He' and 'I') must be used because they are the subjects of the verb 'went'. The first person pronoun ('I') usually comes second out of politeness.",
  },
  {
    id: 5,
    category: "Parallelism",
    difficulty: "intermediate",
    incorrect: "She likes hiking, swimming, and to ride a bicycle.",
    correct: "She likes hiking, swimming, and riding a bicycle.",
    options: [
      "She likes hiking, swimming, and to ride a bicycle.",
      "She likes hiking, swimming, and riding a bicycle.",
      "She likes to hike, swim, and riding a bicycle.",
      "She likes to hike, swimming, and to ride a bicycle."
    ],
    explanation: "Items in a list should be in parallel grammatical form. Since 'hiking' and 'swimming' are gerunds (-ing forms), 'riding' should also be a gerund.",
  },
  {
    id: 6,
    category: "Subject-Verb Agreement",
    difficulty: "advanced",
    incorrect: "Neither the manager nor the employees is aware of the change.",
    correct: "Neither the manager nor the employees are aware of the change.",
    options: [
      "Neither the manager nor the employees is aware of the change.",
      "Neither the manager nor the employees are aware of the change.",
      "Neither the managers nor the employee are aware of the change.",
      "Neither manager or employees is aware of the change."
    ],
    explanation: "In 'neither/nor' constructions, the verb must agree with the subject closest to it. The plural 'employees' is closest to the verb, so the plural 'are' is needed.",
  },
  {
    id: 7,
    category: "Prepositions",
    difficulty: "beginner",
    incorrect: "She is good in mathematics.",
    correct: "She is good at mathematics.",
    options: [
      "She is good in mathematics.",
      "She is good at mathematics.",
      "She is good with mathematics.",
      "She is good on mathematics."
    ],
    explanation: "The correct preposition to use with 'good' when referring to a skill or subject is 'at' (e.g., good at sports, good at math).",
  },
  {
    id: 8,
    category: "Idioms & Usage",
    difficulty: "intermediate",
    incorrect: "The reason I am late is because there was traffic.",
    correct: "The reason I am late is that there was traffic.",
    options: [
      "The reason I am late is because there was traffic.",
      "The reason I am late is due to there was traffic.",
      "The reason I am late is that there was traffic.",
      "The reason of my lateness is because there was traffic."
    ],
    explanation: "The phrase 'reason is because' is redundant since both words mean 'cause'. The correct grammatical structure is 'reason is that'.",
  },
  {
    id: 9,
    category: "Tenses",
    difficulty: "advanced",
    incorrect: "By the time we arrived at the theater, the movie started.",
    correct: "By the time we arrived at the theater, the movie had started.",
    options: [
      "By the time we arrived at the theater, the movie started.",
      "By the time we arrived at the theater, the movie was starting.",
      "By the time we arrived at the theater, the movie has started.",
      "By the time we arrived at the theater, the movie had started."
    ],
    explanation: "When two actions happen in the past, the past perfect ('had started') is used for the action that occurred first.",
  },
  {
    id: 10,
    category: "Modifiers",
    difficulty: "intermediate",
    incorrect: "She almost read the entire book in one sitting.",
    correct: "She read almost the entire book in one sitting.",
    options: [
      "She almost read the entire book in one sitting.",
      "She read almost the entire book in one sitting.",
      "Almost she read the entire book in one sitting.",
      "She read the entire book almost in one sitting."
    ],
    explanation: "Modifiers should be placed as close as possible to the word they modify. 'Almost' modifies 'the entire book', not the verb 'read'.",
  },
  {
    id: 11,
    category: "Idioms & Usage",
    difficulty: "beginner",
    incorrect: "He did good on his final exam.",
    correct: "He did well on his final exam.",
    options: [
      "He did good on his final exam.",
      "He did well on his final exam.",
      "He did nicely on his final exam.",
      "He did great on his final exam."
    ],
    explanation: "'Good' is an adjective that modifies nouns. 'Well' is an adverb that modifies verbs. Since it modifies the verb 'did', 'well' is correct.",
  },
  {
    id: 12,
    category: "Pronouns",
    difficulty: "intermediate",
    incorrect: "Every student must bring their own lunch.",
    correct: "Every student must bring his or her own lunch.",
    options: [
      "Every student must bring their own lunch.",
      "Every student must bring his or her own lunch.",
      "Every students must bring their own lunch.",
      "Every student must bring there own lunch."
    ],
    explanation: "'Every' is a singular pronoun and technically requires a singular possessive pronoun ('his or her'). (Note: While 'their' as a singular pronoun is increasingly accepted in casual speech, 'his or her' remains the strictly correct formal choice).",
  },
  {
    id: 13,
    category: "Subject-Verb Agreement",
    difficulty: "advanced",
    incorrect: "A number of students is waiting outside.",
    correct: "A number of students are waiting outside.",
    options: [
      "A number of students is waiting outside.",
      "A number of students are waiting outside.",
      "The number of students are waiting outside.",
      "A numbers of students are waiting outside."
    ],
    explanation: "The phrase 'a number of' means 'several' or 'many' and takes a plural verb. Contrast this with 'the number of', which refers to a specific single quantity and takes a singular verb.",
  },
  {
    id: 14,
    category: "Parallelism",
    difficulty: "advanced",
    incorrect: "The job requires strong communication skills, typing quickly, and to be organized.",
    correct: "The job requires strong communication skills, quick typing, and good organization.",
    options: [
      "The job requires strong communication skills, typing quickly, and to be organized.",
      "The job requires strong communication skills, quick typing, and to be organized.",
      "The job requires strong communication skills, quick typing, and good organization.",
      "The job requires strong communicating, typing quickly, and being organized."
    ],
    explanation: "Parallel structure dictates that items in a list should be grammatically consistent. The corrected version uses noun phrases for all three items.",
  },
  {
    id: 15,
    category: "Prepositions",
    difficulty: "intermediate",
    incorrect: "I prefer coffee than tea.",
    correct: "I prefer coffee to tea.",
    options: [
      "I prefer coffee than tea.",
      "I prefer coffee to tea.",
      "I prefer coffee over tea.",
      "I prefer coffee more than tea."
    ],
    explanation: "The verb 'prefer' is idiomatically followed by the preposition 'to', not the conjunction 'than'.",
  }
];
