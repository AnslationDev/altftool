const seo = {
  title: "Reading Speed Calculator: Timed WPM Test",
  metaDescription:
    "Read a 72, 75 or 80-word passage hidden until a 3-second countdown, then get your words per minute and band, from Beginner to Speed Reader.",
  steps: [
    "Under Choose Passage pick Technology & Future, The Ocean Depths or Urban Architecture — each card shows its word count — then press Start Reading Test.",
    "Read the text as it un-blurs at the end of the 3-second countdown; the timer beside the passage title ticks every 100 ms and shows elapsed seconds to one decimal place.",
    "Press I Finished Reading for your WPM and band — Beginner under 150, Below Average 150-250, Average 250-350, Advanced 350-500, Speed Reader over 500 — and the attempt joins History, which keeps the last 8 with the passage used.",
  ],
  intro:
    "Reading Speed Calculator times you reading one of three fixed passages and divides its word count by your elapsed time to give a words-per-minute figure — the standard WPM formula, words ÷ minutes. The passage stays blurred until a 3-second countdown ends, the timer runs at tenth-of-a-second resolution while you read, and you stop it yourself with a button when you reach the end. Results are banded from Beginner under 150 WPM to Speed Reader above 500, with your last 8 attempts kept so you can see whether a number is repeatable.",
  useCases: [
    "You have a stack of reports or a reading list and want a realistic WPM figure so you can estimate how many hours it will actually take, instead of guessing.",
    "You have started a speed-reading routine and want a consistent before-and-after measurement, so you re-run the same passage each week and compare against your stored attempts.",
    "You are preparing for a timed exam with heavy reading sections and want to know whether your pace on unfamiliar non-fiction is near the 250-350 WPM average band or well below it.",
  ],
  benefits: [
    [
      "The passage is hidden until the clock starts",
      "Text stays blurred and unselectable through the 3-second countdown, so you cannot skim ahead and inflate the result.",
    ],
    [
      "Three different topics to read",
      "Technology, deep ocean and architecture passages of 72, 75 and 80 words let you retest on unseen text instead of on a passage you have memorised.",
    ],
    [
      "Keeps a run history",
      "Your last 8 results are listed with the passage used, which is what separates a genuine improvement from one fast attempt.",
    ],
  ],
  faqs: [
    [
      "What is an average reading speed?",
      "Around 250 WPM for an adult reading non-fiction with comprehension, which is why 250-350 WPM is the Average band here. Below 150 WPM shows as Beginner, 150-250 as Below Average, 350-500 as Advanced, and above 500 as Speed Reader.",
    ],
    [
      "How is my WPM calculated?",
      "Words in the passage divided by your elapsed time in minutes. The passages are 72, 75 and 80 words, and the timer ticks every 100 ms from the end of the countdown until you press I Finished Reading.",
    ],
    [
      "Does this check whether I understood what I read?",
      "No — there is no comprehension quiz, so the score is pure speed. That matters, because pushing WPM far above your normal pace usually costs comprehension; a slower number you actually absorbed is worth more than a fast one you skimmed.",
    ],
    [
      "Why is my score different each time?",
      "Short passages exaggerate small timing differences: on a 75-word passage, stopping the timer half a second late changes the result by roughly 15-20 WPM. Run several attempts across all three passages and use the pattern rather than a single figure.",
    ],
  ],
};

export default seo;
