const seo = {
  intro:
    "This converter rewrites a block of text from British to American spelling or back, changing colour to color, organise to organize, centre to center and travelled to traveled while leaving everything else exactly as typed. It works from a curated word list of roughly 400 forms plus three productive suffix rules (-our/-or, -ise/-ize, -yse/-yze), each guarded by an exception list so advertise, honorary, humorous, capsize and seize are never touched. Useful for students, editors and content teams who have to submit in one house style but wrote in the other.",
  useCases: [
    "Convert a dissertation written in British English before submitting it to a US journal that mandates Merriam-Webster spelling.",
    "Normalise a website's help centre articles to one variety after merging copy written by writers in India, the UK and the United States.",
    "Check a cover letter for a US employer and see, line by line, which British spellings were flagged and why.",
    "Teach the -our, -ise and -re patterns in an ESL class by pasting a paragraph and reading the rule column in the change table.",
  ],
  benefits: [
    ["Rules, not guesswork", "Every rewrite is either a listed word pair or a suffix rule with a written-out exception list."],
    ["Shows its working", "A change table lists each spelling swapped, the rule that fired and how many times it occurred."],
    ["Safe one-way pairs", "Ambiguous pairs like check, tire, program and story are converted British to American only, never back."],
  ],
  faqs: [
    [
      "What is the difference between British and American spelling?",
      "The main patterns are -our versus -or (colour/color), -ise versus -ize (organise/organize), -re versus -er (centre/center), -ae/-oe versus -e (anaemia/anemia), -ce versus -se in nouns (defence/defense), and a doubled l before suffixes in British English (travelled/traveled). Beyond those patterns there are a few hundred one-off pairs such as tyre/tire and cheque/check.",
    ],
    [
      "Is -ize wrong in British English?",
      "No. Oxford University Press and journals following Oxford spelling use -ize with British spelling elsewhere, so realize alongside colour is a valid British house style. Most UK newspapers, universities and government style guides prefer -ise, which is what this tool produces when you convert to British English.",
    ],
    [
      "Why did advertise, exercise and surprise stay the same?",
      "In those words the -ise is part of the stem rather than the verb-forming suffix, so American English spells them with s too. Around 40 such words, including analyse's cousins comprise, promise and franchise, sit on an exception list and are skipped by the -ise rule.",
    ],
    [
      "Does it convert vocabulary such as lorry and lift?",
      "Only if you switch on the vocabulary option, and only from British to American. Words like lift, boot, autumn and biscuit map to elevator, trunk, fall and cookie, but the American words are ambiguous in reverse, so the tool never converts them back. Read the output before using it in anything that matters.",
    ],
  ],
};

export default seo;
