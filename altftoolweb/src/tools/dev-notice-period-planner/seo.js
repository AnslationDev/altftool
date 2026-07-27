const seo = {
  intro:
    "This planner maps out an Indian notice period end to end: it computes your last working day from the resignation date, the buyout (notice recovery) for any shortfall at your contract's per-day salary rate, how far earned leave can offset that shortfall, and a dated four-phase handover schedule. It is built for developers and other IT professionals resigning in India, where notice length comes from the appointment letter — 30, 60 or 90 days in most IT contracts — and notice recovery attracts no GST per CBIC Circular 178/10/2022-GST.",
  useCases: [
    "A developer with a 90-day contract who must join the new company in 60 days estimates the buyout for the 30-day shortfall before negotiating with HR",
    "An engineer checks how many of their 12 earned-leave days can be set off against the notice shortfall and how many will be encashed instead",
    "A tech lead resigning plans documentation, shadowing and reverse-shadowing phases across the served notice so the handover survives their exit",
  ],
  benefits: [
    ["Buyout computed your contract's way", "Choose basic, gross or CTC as the recovery base and a ÷30 or ÷26 per-day divisor to match your appointment letter."],
    ["Leave offset and encashment split", "Shows leave days consumed against the shortfall versus days encashed on basic salary, and the net full-and-final impact."],
    ["Dated handover plan", "Splits the served notice into document, shadow, reverse-shadow and buffer phases with actual calendar dates."],
  ],
  faqs: [
    [
      "How is notice period buyout calculated in India?",
      "Shortfall days × per-day salary on the base named in your contract — most commonly basic salary divided by 30, so a 30-day shortfall on a Rs 60,000 basic costs about Rs 60,000. Some employers charge on gross or CTC and some divide by 26 working days instead, which is why the appointment letter is the deciding document.",
    ],
    [
      "Is there GST on notice period recovery?",
      "No. CBIC Circular No. 178/10/2022-GST dated 3 August 2022 clarified that amounts an employer recovers for unserved notice are not consideration for a taxable supply, so no GST is added to the buyout. Employers who charged 18% GST on notice recovery before this circular were subsequently covered by favourable rulings.",
    ],
    [
      "Can earned leave be adjusted against the notice period?",
      "Often yes, but it is a matter of company policy, not statutory right — many Indian IT employers let accumulated earned leave offset shortfall days one for one, while others pay it out separately as encashment on basic salary. Check the leave policy or ask HR in writing before counting on the offset.",
    ],
    [
      "Is a 90-day notice period legally enforceable in India?",
      "The notice length in your appointment letter is a binding contractual term, but courts generally will not force an employee to keep working — the practical remedy is recovery of notice pay for the unserved days, and the employer can withhold the relieving letter until dues are settled. State Shops and Establishments Acts set only minimum notice (commonly 30 days), so consult a lawyer for a genuine dispute.",
    ],
  ],
};

export default seo;
