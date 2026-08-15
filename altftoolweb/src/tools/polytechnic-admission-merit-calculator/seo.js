const seo = {
  title: "Polytechnic Merit Calculator: Class 10 Plus",
  metaDescription:
    "Merit = Class 10 % x weight + entrance % x the rest, out of 100. Presets cover Maharashtra DTE Class-10-only, JEECUP/JEXPO/DCECE entrance-only and 50:50.",
  steps: [
    "Enter \"Class 10 marks obtained\" and \"Class 10 maximum marks\", then the \"Entrance exam score\" and \"Entrance exam maximum\".",
    "Set \"Weight given to Class 10 marks (%)\" or tap a preset such as \"Class 10 marks only (e.g. Maharashtra Poly / DTE)\" or \"Entrance exam only (e.g. JEECUP, JEXPO, DCECE)\".",
    "Read the Merit index out of 100 with the Class 10 percentage, Entrance percentage and each weighted contribution listed separately, then press Copy result.",
  ],
  intro:
    "This tool computes a polytechnic (engineering diploma) admission merit index as a weighted average on a 100-point scale: Class 10 percentage times its weight plus entrance-exam percentage times the remaining weight. That single formula covers the two models Indian states actually publish — pure qualifying-marks merit (Maharashtra DTE ranks on SSC percentage alone) and pure entrance merit (JEECUP, JEXPO, DCECE rank on the exam score). It is for Class 10 pass-outs estimating where they stand before diploma counselling.",
  useCases: [
    "A Maharashtra student setting the weight to 100% Class 10 to see the exact SSC percentage that becomes their DTE merit mark",
    "A UP student converting a JEECUP score out of 400 into a percentage to compare with last year's closing ranks",
    "A student comparing how a 50:50 institute formula shifts their standing versus an entrance-only list",
  ],
  benefits: [
    ["One formula, every state model", "Weight presets cover Class-10-only, entrance-only and 50:50 mixed merit lists."],
    ["Shows each contribution", "Breaks the index into the Class 10 share and the entrance share so you see what drives it."],
    ["Any marks base", "Works with 500- or 600-mark boards and any entrance maximum — everything is normalised to percent."],
  ],
  faqs: [
    [
      "How is polytechnic admission merit calculated?",
      "It depends on the state. Maharashtra ranks candidates on their Class 10 (SSC) percentage itself; UP (JEECUP), West Bengal (JEXPO) and Bihar (DCECE) rank on the entrance-exam score, using Class 10 marks only for eligibility and tie-breaks. Both are the weighted formula this tool uses: merit = Class 10 % x weight + entrance % x (100 - weight).",
    ],
    [
      "What is the minimum Class 10 percentage for polytechnic admission?",
      "Most states require a pass in Class 10, commonly with 35% overall for general-category candidates, and specific subject requirements (maths and science) for engineering streams. The exact floor is set by each state's admission brochure, so check the year's official notification rather than relying on a single national figure.",
    ],
    [
      "Can I get polytechnic admission without an entrance exam?",
      "Yes, in states that admit on Class 10 merit alone — Maharashtra's DTE diploma admissions are the leading example, where the merit mark is simply the SSC percentage. In entrance-based states you must appear for the state test (JEECUP, JEXPO, DCECE and similar) to be ranked.",
    ],
    [
      "How do I convert my entrance score into a merit percentage?",
      "Divide the score by the paper's maximum and multiply by 100 — a 90 out of 150 is 60%. This tool does that normalisation for both the entrance score and Class 10 marks before applying the weights, so boards with 500-mark and 600-mark totals compare on the same scale.",
    ],
  ],
};

export default seo;
