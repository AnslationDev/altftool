const seo = {
  title: "EPF Claim Rejected? Decode the Remark and Who",
  metaDescription:
    "26 EPFO rejection families decoded: what the remark means, whether you, the employer or the field office can clear it, and the correction route.",
  intro:
    "An EPF claim rejection reason decoder turns the one-line remark EPFO shows against a rejected claim into three answers: what the remark means, who alone can clear it — you, the ex-employer, or the EPFO field office — and the correction route defined for it, whether that is an online Joint Declaration, an Aadhaar e-KYC, a Form 13 transfer, or a grievance on EPFiGMS. It is for members whose Form 19, Form 10C or Form 31 came back rejected and who cannot tell from the wording whose desk the problem sits on. The catalogue covers 26 rejection families and cites the provision behind each one — Paras 68B, 68HH, 68J, 68K, 68NN and 69 of the Employees' Provident Funds Scheme 1952, Paras 10, 12 and 14 of the Employees' Pension Scheme 1995, Sections 7A, 7Q, 14B and 17 of the EPF and Miscellaneous Provisions Act 1952, and Section 192A of the Income-tax Act 1961.",
  useCases: [
    "Work out whether a rejection is a member-side profile error or an employer-side data error before spending weeks on the wrong correction",
    "Check whether a Form 10C rejection is a real ineligibility or a wrong service figure, by testing contributory months against the 6-month floor and the 9-year-6-month ceiling",
    "See how many days short a Form 19 final settlement is of the two-month waiting period under Para 69(2)",
    "Confirm which Para 68 gate a Form 31 advance failed on — membership months, the three-occasion cap, or the age-54 threshold",
    "Send a colleague a direct link to the one rejection reason that matches their remark",
  ],
  benefits: [
    [
      "Names the responsible party",
      "Every entry says whether the member, the employer, both together, or the EPFO field office is the only party that can clear it, and why the other routes will fail.",
    ],
    [
      "Cites the provision, not a blog",
      "Each rejection carries the paragraph, section, circular or notification it comes from, with the date the rule text was read.",
    ],
    [
      "One link per rejection",
      "All 26 reasons have a stable anchor, so a specific rejection can be shared or bookmarked on its own.",
    ],
    [
      "Separates the three forms",
      "Form 19 pays the provident fund, Form 10C pays the pension fund, Form 31 releases part of your own balance while you are still a member — a large share of rejections is simply the wrong form.",
    ],
  ],
  faqs: [
    [
      "Why was my EPF claim rejected saying the name does not match Aadhaar?",
      "Because the name stored against your UAN is not character-for-character identical to the name in the linked Aadhaar, and EPFO validates every online claim against the Aadhaar record. Only you can fix it, through an online Joint Declaration under Manage on the Member portal. Under EPFO's Joint Declaration SOP circular dated 16 January 2025, a UAN allotted on or after 1 October 2017 that is already Aadhaar-validated goes straight to EPFO; an older UAN queues with the employer for approval first. Re-filing the same claim before the profile changes fails identically.",
    ],
    [
      "My Form 10C was rejected for service. What are the actual limits?",
      "The EPS withdrawal benefit needs at least 6 months of contributory service and less than 10 years of eligible service. Table D under Para 14 of the Employees' Pension Scheme 1995 begins at 6 months, so nothing is payable below that. At the top end Para 10(2) counts a part-year of 6 months or more as a full year, so 9 years 6 months is already treated as 10 years and the cash option closes — which is why the portal blocks Form 10C withdrawal benefit at 9 years 6 months rather than at 10 years. Above that the options are a Scheme Certificate now or a pension from age 58, or from 50 at a reduced rate.",
    ],
    [
      "Who updates the date of exit — me or my employer?",
      "The employer, in the first instance: the date of exit is filed through the Employer Interface or the ECR. There is one member-side route — EPFO's Mark Exit facility on the Member portal, live since January 2020 — but it only opens two months after the month of the last contribution received, and the date entered must be the last month for which contribution was actually paid, not your resignation date. If the establishment is closed or refuses, the remaining route is a grievance on EPFiGMS at epfigms.gov.in.",
    ],
    [
      "What is the difference between Form 19, Form 10C and Form 31?",
      "Form 19 settles the EPF provident fund balance after you leave, and Para 69(2) of the EPF Scheme 1952 admits it only after two months of continuous unemployment, or immediately on retirement after age 55 under Para 69(1)(a). Form 10C claims the EPS withdrawal benefit or a Scheme Certificate from the pension fund, which is a different pot calculated on Table D rather than the passbook figure. Form 31 is a part-withdrawal of your own provident fund while you are still employed and still a member, allowed only for the purposes listed in the Para 68 series — housing under 68B after five years' membership, marriage or education under 68K after seven years and at most three times, illness under 68J with no membership threshold, unemployment under 68HH after one month, and 90 per cent before retirement under 68NN from age 54.",
    ],
  ],
  steps: [
    "Copy the rejection remark exactly as the EPFO portal or the SMS shows it, or pick the closest wording from the list.",
    "Read the decoded result: the rejection family it belongs to, the forms it hits, and the match confidence.",
    "Note who has to fix it — you, the employer, both together, or the EPFO field office — because that decides whether a portal action or a grievance is the route.",
    "Open the full entry for the correction route step by step and the documents to have ready before starting.",
    "If the rejection was about eligibility, run the Form 19 two-month check, the Form 10C service check, or the Form 31 Para 68 check to see whether the record or the rule is the obstacle.",
  ],
};

export default seo;
