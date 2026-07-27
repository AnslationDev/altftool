const seo = {
  intro:
    "The Portfolio Writeup Prompt Builder takes a project's before and after numbers, works out the real percentage change and multiple in the direction that counts as success, then writes an AI prompt that turns them into a case study built on a named structure — STAR, CARE, Problem-Process-Outcome or the Design Council's Double Diamond. It sizes each section against your target word count and estimates reading time at 238 words per minute. For designers, engineers and marketers who have the work but not the writeup.",
  useCases: [
    "Turn a checkout redesign that lifted completion from 61% to 74% into a hiring-manager-ready STAR case study.",
    "Write up a performance project where load time fell from 4.2s to 1.4s and state it correctly as a 3x improvement.",
    "Produce a Double Diamond writeup for a UX portfolio that a senior peer would not be able to poke holes in.",
    "Get a shorter Problem-Process-Outcome version of an existing case study for a one-screen portfolio card.",
  ],
  benefits: [
    ["Direction-aware maths", "Tell it whether higher or lower is better and a fall in bounce rate is scored as a win, not a loss."],
    ["Sized to the reader", "Target word count is split across the structure's sections and converted into a reading time."],
    ["No invented numbers", "The prompt forbids the model from adding any figure that is not in the facts you supplied."],
  ],
  faqs: [
    [
      "What should a portfolio case study include?",
      "At minimum: the problem, your specific role, what you actually did, and one measurable outcome with a before and after value. Recruiters skim, so the outcome sentence belongs at the top — this tool's prompt forces the opening line to state the number before any background.",
    ],
    [
      "How long should a portfolio case study be?",
      "Around 400-700 words is enough for most roles, which at 238 words per minute is a two- to three-minute read. Longer writeups are worth it only for a senior or lead role where the reader wants the reasoning behind each decision.",
    ],
    [
      "What is the difference between STAR and the Double Diamond?",
      "STAR (Situation, Task, Action, Result) is an interview answer format that keeps you accountable for your own contribution, while the Double Diamond (Discover, Define, Develop, Deliver) is the UK Design Council's process model and shows how you diverged and converged. Use STAR when the reader wants outcomes, Double Diamond when they want to see your process.",
    ],
    [
      "How do I calculate the improvement percentage?",
      "Percentage change is (after − before) ÷ before × 100, and when lower is better you flip the sign so a reduction reads as a positive improvement. A change from 4.2s to 1.4s is a 66.7% reduction, which is the same thing as 3x faster — quote whichever is less flattering to your own claim if you want to stay credible.",
    ],
  ],
};

export default seo;
