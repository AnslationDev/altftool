const seo = {
  title: "Random Giveaway Winner Picker with a Published",
  metaDescription:
    "Draws winners with a seeded Fisher-Yates shuffle and prints the seed, so the same list and seed reproduce the same names. Duplicates handled.",
  steps: [
    "Paste one name per line into the Entries box, adding x3 or , 3 after a name to give that entrant extra tickets.",
    "Set Winners to draw and Alternates (backup winners), tick One ticket per person (merge duplicates) if repeats should count once, then press Draw again.",
    "Read the winners above the Draw seed row and press Copy result to save the names and seed, so anyone can re-run the same draw.",
  ],
  intro:
    "The Giveaway Winner Picker draws winners from a pasted entry list using a seeded mulberry32 random generator and the Fisher-Yates shuffle — the standard unbiased shuffle, in which every possible order is equally likely. It is built for creators and small brands running comment or email giveaways who need the draw to be defensible: the seed is published with the result, so anyone with the same list can re-run it and get the same names. Duplicate entries are detected and can either be merged to one ticket each or counted as extra tickets, and winners are drawn without replacement so nobody wins twice.",
  useCases: [
    "Draw 2 winners and 1 alternate from 800 pasted Instagram comment handles, merging people who commented twice.",
    "Run a weighted draw where members who shared the post get 3 tickets and everyone else gets 1.",
    "Re-run last week's draw from its published seed to show a viewer the result was not changed.",
  ],
  benefits: [
    ["Auditable, not just random", "Every draw prints its seed, so the same list and seed reproduce the same winners."],
    ["Duplicates handled explicitly", "Repeat names are listed and you choose whether they get one ticket or many."],
    ["Alternates in the same draw", "Backup winners are drawn without replacement, ready if a winner does not reply."],
  ],
  faqs: [
    [
      "How do I pick a giveaway winner fairly?",
      "Use a shuffle that gives every order equal probability — Fisher-Yates — and publish the seed so the draw can be repeated and checked. Sorting entries by a random number, the common shortcut, is measurably biased and should not be used.",
    ],
    [
      "What are my chances of winning a giveaway?",
      "With equal tickets, each entrant's chance is exactly the number of winners divided by the number of entries: 3 winners from 200 entries is 1.5%. Extra tickets change this proportionally — 3 tickets out of 1,000 total tickets is a 0.3% share.",
    ],
    [
      "Should duplicate entries count more than once?",
      "That is your call, but state it in the rules before the draw. Merging duplicates gives one ticket per person, which most comment giveaways promise; counting each repeat rewards people who commented many times.",
    ],
    [
      "Can someone prove the draw was not rigged?",
      "Yes — publish the entry list and the seed shown with the result. Anyone can paste the same list, enter the same seed, and get an identical winner order, because the generator is deterministic for a given seed.",
    ],
  ],
};

export default seo;
