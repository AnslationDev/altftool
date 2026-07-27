const seo = {
  intro:
    "This planner applies the numbered-zone method for exam rough work: each rough side is ruled into a fixed grid of zones, every zone is labelled with the question it serves, and one side is reserved as a formula bank for values you will reuse. Given your sheet count, zones per side and the number of questions needing written working, it computes whether capacity meets demand and how many zones each question can claim — so you never lose an intermediate result and recompute it under time pressure.",
  useCases: [
    "A JEE or NEET aspirant with two rough sheets planning zones for 20 calculation-heavy questions before the paper starts",
    "A banking exam candidate who keeps redoing percentage bases and wants a dedicated formula bank side",
    "A student whose rough work becomes an unreadable scrawl by hour two and needs a layout that stays navigable",
  ],
  benefits: [
    ["Capacity check before the exam", "Know in advance whether your sheets hold enough zones, and how many zones per side would fix a shortfall."],
    ["Nothing recomputed", "A labelled zone per question plus a formula bank means intermediate results are found, not re-derived."],
    ["Simple labelling scheme", "Sheet-side-zone labels (S1a-1, S1a-2 …) take seconds to write and make any working instantly findable."],
  ],
  faqs: [
    [
      "How do I organise rough work in an exam?",
      "Rule each rough side into a fixed grid — folding the sheet in half twice gives 4 zones — label each zone with the question number before writing, and reserve one side as a formula bank for reusable values. The structure means you can re-find any intermediate result instead of recomputing it.",
    ],
    [
      "How many rough sheets do exams give?",
      "It varies: many computer-based tests (like JEE Main) hand out about 5-6 blank sheets on request, while some OMR exams expect rough work in the question booklet's blank spaces. Plan for the worst case your exam allows, and ask the invigilator for extra sheets early rather than mid-calculation.",
    ],
    [
      "What is a formula bank side and why reserve one?",
      "It is one rough side where you write each reusable value exactly once — unit conversions, computed constants, formula rearrangements. Reserving it costs a few zones but typically saves more time than it costs, because repeated derivations are one of the biggest hidden time leaks in calculation-heavy papers.",
    ],
    [
      "Should I cross out wrong rough work?",
      "Yes, but with a single diagonal line, never scribbling. A lightly crossed zone stays readable, and partially correct working is often reusable when you revisit the question in a second pass.",
    ],
  ],
};

export default seo;
