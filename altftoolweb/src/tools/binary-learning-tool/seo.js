const seo = {
  title: "Binary Learning Tool — Converter, Bit Values & Quiz",
  metaDescription:
    "Convert decimal to binary (padded to 8 bits) and back, see each bit over its 128–1 place value, then quiz yourself on random numbers from 0 to 255.",
  intro:
    "The Binary Learning Tool teaches base-2 by converting between decimal and binary and then showing the answer as eight labelled bit boxes weighted 128, 64, 32, 16, 8, 4, 2 and 1, so you can see which powers of two add up to your number. A built-in quiz asks you to write a random value from 0 to 255 in binary and grades it instantly. It suits school and college students meeting number bases for the first time, and anyone revising for a computer-science exam.",
  useCases: [
    "You are working through a homework sheet on number systems and want to check that 42 really is 101010 before you write out the rest of the answers.",
    "You keep losing marks for reading bit positions backwards, so you convert a few values and study the 2^7 to 2^0 labels sitting under each bit.",
    "You have a base-conversion test tomorrow and want timed practice, so you run the quiz repeatedly until you can produce the 8-bit pattern for any number under 256 without counting.",
  ],
  benefits: [
    ["Shows the place values, not just the answer", "Each output bit is drawn above its weight — 128 down to 1 — so the conversion becomes visible arithmetic rather than a black box."],
    ["Consistent 8-bit padding", "Results are padded to a full byte, so 5 appears as 00000101 and you learn to read fixed-width patterns the way real memory stores them."],
    ["Practice with immediate correction", "A wrong quiz answer reveals the correct binary for that exact number straight away, so the mistake is fixed while the question is still in mind."],
  ],
  faqs: [
    [
      "How do you convert a decimal number to binary?",
      "Subtract the largest power of two that fits, write a 1 in that position, and repeat with the remainder. For a byte the positions are 128, 64, 32, 16, 8, 4, 2 and 1 — so 42 is 32 + 8 + 2, giving 00101010.",
    ],
    [
      "Why is the result shown with eight digits?",
      "Output is padded to 8 bits because a byte is 8 bits, the smallest unit most computers address. The leading zeros carry no value — 00000101 and 101 are both 5 — but fixed width makes patterns easier to compare.",
    ],
    [
      "What range of numbers does the quiz use?",
      "The quiz picks a whole number from 0 to 255, which is exactly the range one unsigned 8-bit byte can hold (2^8 = 256 distinct values). Answers are checked as base-2, so leading zeros are optional.",
    ],
    [
      "What is the largest number 8 bits can store?",
      "255, when all eight bits are 1: 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1. Add a ninth bit and the maximum doubles plus one to 511, which is why byte-sized fields overflow at 256.",
    ],
  ],
};

export default seo;
