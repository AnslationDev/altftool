const seo = {
  title: "Lesson Plan Prompt Builder: Bloom's + Timed 5E Plan",
  metaDescription:
    "Turns a topic, year group and period length into an AI prompt: measurable Bloom's objectives and 5E, Hunter or Gagné phases timed to the minute.",
  steps: [
    "Enter the Topic, Subject, Year group or age band, Lesson length in minutes (5 to 480) and Class size, then choose an Instructional model: 5E, Hunter's Elements, Gagné's Nine Events or Gradual Release.",
    "Tick the Bloom's levels you want an objective for, from Remember to Create, then pick Assessment types such as Exit ticket and Differentiation levers such as Language support (EAL/ESL).",
    "Check the phase table, where every phase's minutes add up to the lesson length you entered, then press Copy prompt to take the prompt into your AI assistant.",
  ],
  intro:
    "This builder turns a topic, a year group and a lesson length into a structured prompt that makes an AI model write a usable lesson plan instead of generic teaching advice. It writes objectives against the six levels of the revised Bloom's taxonomy (Anderson & Krathwohl, 2001) in Mager's A-B-C-D shape, and time-boxes the lesson minute by minute across the phases of the 5E model, Hunter's Elements of Effective Instruction, Gagné's Nine Events or Gradual Release. It is for classroom teachers, trainee teachers and instructional designers who want a plan that fits the actual period length.",
  useCases: [
    "A Year 8 science teacher with a 55-minute period turning 'photosynthesis' into a 5E plan where Explore and Explain get real minutes rather than being squeezed at the end.",
    "A trainee teacher whose observation feedback said the objectives were not measurable, rebuilding them at the Analyse and Evaluate levels with observable verbs.",
    "A corporate trainer planning a 3-hour workshop on Gagné's nine events and needing each event budgeted before writing the deck.",
  ],
  benefits: [
    ["Minutes that actually add up", "Phase times are shared out by weight and always total the exact lesson length you entered, with at least one minute per phase."],
    ["Objectives you can assess", "Each level supplies observable verbs and blocks 'understand', 'know' and 'appreciate', which cannot be measured."],
    ["Framework kept honest", "Every phase carries its purpose and the source it comes from, so the plan follows the model rather than name-dropping it."],
  ],
  faqs: [
    [
      "What are the six levels of Bloom's taxonomy?",
      "In the 2001 revision by Anderson and Krathwohl they are Remember, Understand, Apply, Analyse, Evaluate and Create. The revision changed the original 1956 nouns into verbs and swapped the top two levels, so Create rather than Evaluate now sits at level 6.",
    ],
    [
      "How should I split a 60-minute lesson across the 5E model?",
      "The common template gives roughly 10% Engage, 25% Explore, 25% Explain, 25% Elaborate and 15% Evaluate, which on 60 minutes comes out as about 6 / 15 / 15 / 15 / 9 minutes. Bybee's original 5E description sets no percentages, so treat these as a starting point and shift time toward whichever phase your class needs.",
    ],
    [
      "What makes a learning objective measurable?",
      "Mager's three criteria: an observable performance, the condition it is performed under and the criterion for success — taught as Audience, Behaviour, Condition, Degree. 'Students will calculate the mean of a 10-value data set, without a calculator, with 8 of 10 correct' is measurable; 'students will understand averages' is not, because understanding cannot be observed.",
    ],
    [
      "Which lesson framework should I choose?",
      "Pick 5E for inquiry-led science and maths, where students investigate before the teacher explains. Use Hunter's eight elements for skills that need modelling and guided practice, Gagné's nine events for training and e-learning modules, and Gradual Release (I do / We do / You do) when you are handing responsibility to students over a sequence of lessons.",
    ],
  ],
};

export default seo;
