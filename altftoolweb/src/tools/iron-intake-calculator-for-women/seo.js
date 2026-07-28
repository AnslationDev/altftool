const seo = {
  intro:
    "This calculator gives a daily iron target in milligrams for women and girls, starting from the Institute of Medicine dietary reference intakes and then adjusting for the two things that change the number most: a vegetarian diet, and how heavy your periods are. The vegetarian adjustment is the IOM's own 1.8x factor, which exists because non-heme iron from plants is absorbed at roughly 10% against about 18% from a mixed diet. Extra iron for heavy bleeding is worked out from the iron content of blood — about 0.5 mg per millilitre — rather than a rule of thumb.",
  useCases: [
    "Check whether a vegetarian diet at 18 mg a day is actually enough, or whether the 1.8x factor pushes the real target above 30 mg.",
    "See how much extra dietary iron heavy periods demand before deciding whether to ask for a ferritin test.",
    "Compare the target for pregnancy against your normal figure when planning meals or reviewing a prenatal supplement label.",
    "Work out a teenager's iron target once periods have started, which is higher than most people assume.",
  ],
  benefits: [
    ["Official base figures", "Uses the published IOM dietary reference intakes rather than generic advice."],
    ["Vegetarian factor applied properly", "Applies the 1.8x adjustment for lower non-heme absorption instead of ignoring diet type."],
    ["Upper limit shown", "Flags the 45 mg tolerable upper intake level so a high target reads as a reason to get tested, not to take more."],
  ],
  faqs: [
    [
      "How much iron does a woman need per day?",
      "Under the IOM dietary reference intakes it is 18 mg a day for women aged 19 to 50, 15 mg for girls aged 14 to 18, 8 mg from 51 onwards or after periods stop, and 27 mg during pregnancy. Breastfeeding is lower, at 9 mg for women 19 and over. Vegetarians should multiply their figure by 1.8.",
    ],
    [
      "Why do vegetarians need more iron?",
      "Because of absorption, not content. Plant foods carry non-heme iron, which is absorbed at roughly 10%, while a mixed diet including meat delivers about 18% absorption. The IOM therefore sets the vegetarian requirement at 1.8 times the standard RDA — 32.4 mg a day for a woman aged 19 to 50.",
    ],
    [
      "How much iron do heavy periods cost you?",
      "Blood contains about 0.5 mg of iron per millilitre, so a cycle losing 80 mL — the clinical threshold for heavy menstrual bleeding — carries away roughly 40 mg of iron, about 10 mg more than the 30 mL median the standard RDA already assumes. Spread over a 28 day cycle and adjusted for absorption, that is several extra milligrams of dietary iron a day.",
    ],
    [
      "Can I take too much iron?",
      "Yes. The tolerable upper intake level is 45 mg a day from all sources for anyone aged 14 and over, and 40 mg for ages 9 to 13. Above that, gastrointestinal side effects are common and iron overload is a real risk for people with haemochromatosis. This tool is informational — if your target comes out high, that is a reason to get haemoglobin and ferritin tested and speak to a doctor, not to start high-dose supplements on your own.",
    ],
  ],
};

export default seo;
