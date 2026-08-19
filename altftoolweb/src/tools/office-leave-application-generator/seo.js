const seo = {
  title: "Office Leave Application with Notice Check",
  metaDescription:
    "Drafts a casual, earned, sick or emergency leave letter or email, checks the notice you have given for that type, and states the balance left after it.",
  steps: [
    "Choose a Leave type — Casual leave (CL), Earned / privilege leave (EL/PL), Sick leave (SL), Emergency / urgent personal leave and the rest — and set Sending as to Printed letter or Email, then fill in your name, designation, manager and company.",
    "Enter First day of leave, Last day of leave and Date you are applying, name Who will cover your work, optionally add Current balance of this leave type, and tick Deduct working days only or Mention attached document.",
    "Days deducted from balance heads the result with a notice verdict for that leave type, over rows for Calendar days in the period, Working days (Mon-Fri), Notice given, Balance after this leave, Subject line and Word count; the finished draft sits under Your application and Copy application copies it. A separate Earned leave accrual (Factories Act 1948, s.79) box turns Days worked last calendar year into an entitlement.",
  ],
  intro:
    "Office Leave Application Generator drafts a workplace leave request — casual, earned, sick, emergency, bereavement, comp-off, unpaid, maternity or paternity — as a letter or an email, then checks the notice you have given against what that leave type normally expects and works out the balance you will be left with. It also calculates earned leave accrual under section 79 of the Factories Act 1948, which grants one day of leave per 20 days worked (one per 15 for workers under 18) once 240 days of work in the preceding calendar year are complete.",
  useCases: [
    "Request five working days of earned leave with the handover named and the remaining balance stated in the mail itself.",
    "Send a same-day sick leave note and have it worded as a regularisation rather than an advance request.",
    "Check whether three days' notice is enough for the leave type you are applying under before you press send.",
    "Work out how many days of earned leave accrue after 250 days of work in the previous calendar year.",
  ],
  benefits: [
    ["Notice check built in", "The gap between your application date and the first day of leave is compared with the notice that leave type usually expects."],
    ["Balance maths included", "Enter your current balance and the letter states what is left, or warns you that the request overdraws it."],
    ["Statutory accrual formula", "Earned leave is computed from the Factories Act rule, including the half-day rounding, rather than a guess."],
  ],
  faqs: [
    [
      "How much earned leave do I get under the Factories Act?",
      "Section 79 of the Factories Act 1948 gives a worker who has worked at least 240 days in a calendar year one day of earned leave for every 20 days worked in the following year — one for every 15 days if the worker is under 18. A fraction of half a day or more is rounded up to a full day.",
    ],
    [
      "How much notice should I give for leave?",
      "It depends on the type. Earned or privilege leave and leave without pay are usually expected 15 days ahead, casual leave two to three days ahead, and sick, emergency or bereavement leave can be applied for the same day and regularised on return. Your employee handbook is the authority, not a general rule.",
    ],
    [
      "How many weeks of maternity leave am I entitled to?",
      "Under the Maternity Benefit Act 1961 as amended in 2017, 26 weeks of paid maternity leave applies for the first two surviving children and 12 weeks from the third onward, subject to the qualifying service condition in the Act. There is no equivalent central statutory paternity leave for private-sector employees.",
    ],
    [
      "Should a leave email mention who will cover my work?",
      "Yes — naming the person who will cover, and confirming a written handover before your last working day, is what usually turns a leave request into a quick approval. Add a contact number only if you genuinely want to be reachable.",
    ],
  ],
};

export default seo;
