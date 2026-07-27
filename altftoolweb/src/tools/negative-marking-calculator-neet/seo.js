const seo = {
  intro:
    "This NEET negative marking calculator converts an attempt strategy into an expected NEET UG score using the official +4 for a correct answer and -1 for an incorrect answer scheme over a 180-question, 720-mark paper. Enter how many questions you answer from knowledge, your mock-test accuracy and how many you guess, and it separates marks gained from marks surrendered to negative marking. It also shows the break-even accuracy of 20% below which answering costs you marks, so you can decide question by question whether to attempt or leave blank.",
  useCases: [
    "A repeater checking whether adding 20 blind guesses to a 150-question attempt actually raises the expected score or only widens the spread.",
    "A student with 82% mock accuracy testing how many marks are being handed back through wrong answers before the next attempt-strategy change.",
    "A coaching mentor showing a batch that eliminating two options turns a guess worth 0.25 marks into one worth 1.5 marks.",
  ],
  benefits: [
    ["Splits gain from loss", "Marks earned at +4 and marks deducted at -1 are shown separately instead of only a net figure."],
    ["Shows the guessing range", "Every projection carries a best case and worst case for the guessed block, not just an average."],
    ["Break-even accuracy built in", "The 20% threshold where a NEET attempt becomes profitable is calculated from the marking scheme you enter."],
  ],
  faqs: [
    [
      "How much is deducted for a wrong answer in NEET?",
      "One mark is deducted for every incorrect response, while a correct response earns 4 marks. A question left blank neither earns nor costs anything, so the swing between a correct and an incorrect answer is 5 marks.",
    ],
    [
      "Is guessing worth it in NEET?",
      "Yes on average, because each NEET question has four options. A blind guess is right 25% of the time, giving an expected 0.25 × 4 − 0.75 × 1 = +0.25 marks per guess. Eliminating even one option raises that to about +0.67 marks, and eliminating two raises it to +1.5.",
    ],
    [
      "What accuracy do I need before answering is profitable?",
      "20%. With M marks for a correct answer and P deducted for a wrong one, answering breaks even at an accuracy of P ÷ (M + P), which for NEET is 1 ÷ (4 + 1). Above 20% accuracy on a question type, attempting beats leaving it blank.",
    ],
    [
      "How many marks is the NEET paper out of?",
      "720 marks from 180 compulsory questions — 45 each in Physics, Chemistry, Botany and Zoology — in 180 minutes, following the removal of the optional Section B from NEET UG 2025. Check the NTA information bulletin for your exam year, since NTA has changed the pattern more than once.",
    ],
  ],
};

export default seo;
