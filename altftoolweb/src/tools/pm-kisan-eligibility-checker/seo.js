const seo = {
  title: "PM-KISAN Eligibility: Exclusion List & e-KYC Check",
  metaDescription:
    "Runs your family against the PM-KISAN exclusion list — the 2-hectare limit ended in June 2019 — and flags e-KYC, Aadhaar seeding and DBT gaps.",
  steps: [
    "Under Land, tick 'The family owns cultivable land' and 'Land records stand in the applicant's name', then enter Cultivable landholding (hectares).",
    "Tick anything under Exclusion categories that applies to any family member, add Monthly pension (INR), and set the Payment readiness toggles: Aadhaar is seeded, e-KYC is complete, Bank account is DBT-enabled.",
    "Read the Annual benefit verdict with 'Why the family is excluded' and 'Before the money can arrive', then press Copy result.",
  ],
  intro:
    "PM-KISAN pays an eligible landholding farmer family Rs 6,000 a year as three four-monthly instalments of Rs 2,000 straight into a bank account, and this checker runs your situation against the scheme's own eligibility test. The two-hectare landholding ceiling that applied at launch was withdrawn with effect from 1 June 2019, so what decides the outcome now is the exclusion list in the operational guidelines — institutional landholders, holders of constitutional and political office, government employees above Group D, pensioners drawing Rs 10,000 a month or more, income-tax payers and practising registered professionals. It also flags Aadhaar seeding and e-KYC, which block payment even for an eligible family.",
  useCases: [
    "Checking whether a family stays eligible when one member is a retired Group D employee drawing a Rs 25,000 pension.",
    "Confirming that a five-hectare holding is still covered, since the two-hectare limit no longer applies.",
    "Finding out why an approved beneficiary has stopped receiving instalments — usually pending e-KYC or an unseeded bank account.",
  ],
  benefits: [
    [
      "The current rule, not the old one",
      "Applies the post-June 2019 position where landholding size no longer decides eligibility.",
    ],
    [
      "Group D exceptions handled",
      "Multi Tasking Staff, Class IV and Group D employees and pensioners are correctly kept outside two of the exclusions.",
    ],
    [
      "Separates eligibility from payment",
      "Tells you when a family qualifies but the instalment is stuck on e-KYC, Aadhaar seeding or a non-DBT account.",
    ],
  ],
  faqs: [
    [
      "Is there still a 2 hectare land limit for PM-KISAN?",
      "No. The scheme was extended to all landholding farmer families with effect from 1 June 2019, removing the original ceiling of 2 hectares of cultivable land. Size of holding no longer affects eligibility or the amount, which stays at Rs 6,000 a year.",
    ],
    [
      "Who is excluded from PM-KISAN?",
      "Institutional landholders; present and former holders of constitutional posts; present and former Ministers, MPs, MLAs, MLCs, Mayors and district panchayat Chairpersons; serving and retired government, PSU and local body employees other than Multi Tasking Staff, Class IV and Group D; retired pensioners drawing Rs 10,000 a month or more, again excepting Group D; anyone who paid income tax in the last assessment year; and practising registered doctors, engineers, lawyers, chartered accountants and architects.",
    ],
    [
      "How much is each PM-KISAN instalment and when does it come?",
      "Rs 2,000 per instalment, three times a year, covering the periods April to July, August to November and December to March. The money is transferred directly to the Aadhaar-seeded bank account of the beneficiary.",
    ],
    [
      "Why has my PM-KISAN instalment not been credited?",
      "The most common reasons are incomplete e-KYC, an Aadhaar number not seeded with the bank account, a bank account that is not DBT-enabled, or land records not yet mutated into the applicant's name. These can be fixed on the PM-KISAN portal or at a Common Service Centre; the state agriculture department handles verification.",
    ],
  ],
};

export default seo;
