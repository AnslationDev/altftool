const seo = {
  title: "Employer Data Breach: Employee Response Checklist",
  metaDescription:
    "Tick the categories your company's breach notice lists — payroll banking, tax number, credentials — and get only the steps those categories make relevant.",
  steps: [
    "Under What does the notice say was involved?, tick the categories the letter names: Payroll bank account details, National ID or tax number, Work account credentials or password hashes and five more.",
    "The plan rebuilds around those ticks — Data sensitivity priority rates the notice, while Steps that apply to you counts the checklist rather than every possible precaution.",
    "Work through the grouped steps, ticking each one done; the ones badged Priority hold the percentage down while open. Press Copy result for the whole plan.",
  ],
  intro:
    "The Employer Data Breach Employee Checklist turns the data categories listed in your company's breach notice into the specific steps that apply to you, then scores your progress against those steps only. Tick what the notice says was involved — payroll bank details, a tax or national ID number, health plan data, ID scans, work credentials — and the plan reshapes: payroll banking leads to salary-diversion defences, a tax number to credit and refund fraud defences, credentials to password-reuse work. It also rates the severity of the notice itself, because the monitoring an employer offers is a reporting service, not protection.",
  useCases: [
    "Your HR or payroll provider was breached and the letter lists fields you do not recognise as risky.",
    "The notice mentions password hashes and you need to work out which personal accounts to change first.",
    "Dependants were included in the exposed dataset and you want to know what to do about a child's credit file.",
    "You are an HR or security lead writing employee guidance and want a defensible, category-driven list.",
  ],
  benefits: [
    [
      "Driven by your notice",
      "Steps appear only when the data category that makes them relevant was actually involved.",
    ],
    [
      "Honest scoring",
      "The percentage is calculated over applicable steps, so ticks on irrelevant advice never inflate it.",
    ],
    [
      "Severity separated from progress",
      "One score rates how bad the breach is, another rates how far you have got — they are different questions.",
    ],
  ],
  faqs: [
    [
      "What should I do first after my employer reports a data breach?",
      "Ask HR in writing which fields were involved, whether your record specifically was in the dataset, and whether the data left the network or was only accessible. Notices are deliberately broad, and the rest of your response depends entirely on that answer.",
    ],
    [
      "Is the free credit monitoring my employer offered enough?",
      "No. Monitoring reports fraud after it happens; it does not prevent an account being opened. Take it, because it usually has an enrolment deadline and costs you nothing, but pair it with a credit freeze if a tax or national ID number was exposed.",
    ],
    [
      "How does an HR breach lead to my salary being stolen?",
      "Through payroll diversion: the attacker emails payroll posing as you with new bank details, timed just before pay day. Ask payroll to confirm they call the employee on a number already on file before changing any account, and check the account shown in the self-service portal before the next two pay runs.",
    ],
    [
      "Should I change my personal passwords if only my work account was breached?",
      "Yes, wherever you reused the work password or a variation of it. Credential stuffing replays a leaked address and password against banks, email and shopping sites automatically, often within hours of a dump circulating. If you are considering a claim or compensation, take legal advice before signing any release.",
    ],
  ],
};

export default seo;
