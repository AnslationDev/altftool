const seo = {
  intro:
    "The Computer Parts Quiz is a 15-question multiple-choice test on desktop PC hardware, covering what CPU, GPU, PSU, SSD, BIOS and HDMI stand for, the difference between volatile RAM and permanent storage, what thermal paste and the chipset do, and which motherboard form factor is standard. Each answer is marked immediately — the correct option turns green even when you pick wrong — and the final screen gives a score out of 15 with the percentage. It suits students revising IT basics, first-time PC builders and anyone preparing for an entry-level hardware exam.",
  useCases: [
    "You are about to buy parts for your first build and want to check you actually understand what the PSU and chipset do before spending money on them.",
    "A student is revising for an IT fundamentals paper the night before and needs quick recall practice on acronyms like BIOS, HDMI and SSD.",
    "You are teaching a beginner class and want a short warm-up that shows the group which hardware terms they still confuse, such as RAM versus ROM.",
  ],
  benefits: [
    [
      "Corrections shown at the moment you answer",
      "The right option is highlighted as soon as you pick, so a wrong guess turns into a learned fact instead of a number you find out about at the end.",
    ],
    [
      "Covers concepts, not only acronyms",
      "Alongside the what-does-it-stand-for questions there are function questions on thermal paste, chipset data flow and air versus liquid cooling.",
    ],
    [
      "Running score while you go",
      "The current score and a question-by-question progress bar are on screen throughout, so you know where you stand before the summary.",
    ],
  ],
  faqs: [
    [
      "how many questions are in the computer parts quiz",
      "Fifteen, each with four options and exactly one correct answer, scored one point each for a maximum of 15 or 100%. The questions appear in the same fixed order every attempt, so a retry is genuine repetition practice.",
    ],
    [
      "what is the difference between RAM and a hard drive",
      "RAM is volatile — it loses everything when power is cut — while a hard drive or SSD holds data permanently between sessions. That distinction is one of the quiz questions because it is the single most commonly confused pair in beginner hardware exams.",
    ],
    [
      "which motherboard form factor is the most common for desktops",
      "ATX, which the quiz marks as the correct answer over Mini-ITX, Micro-ATX and E-ATX. ATX is the full-size standard most tower cases and desktop boards are built around, with Micro-ATX and Mini-ITX being the smaller variants.",
    ],
    [
      "can I go back and change an answer",
      "No. Each question locks once you select an option, and you move forward with the Next button until the results screen. Try Again resets the score to zero and returns you to question one.",
    ],
  ],
};

export default seo;
