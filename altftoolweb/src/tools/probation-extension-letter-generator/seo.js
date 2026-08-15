const seo = {
  title: "Probation Extension Letter: Revised End Date +",
  metaDescription:
    "Drafts a probation extension letter and works out the revised end date with month-end clamping, a review meeting date and total probation served.",
  steps: [
    "Fill the employer and employee fields, then under Dates set 'Date of joining', 'Original probation end date', 'Letter date' and 'Extension length (months)'.",
    "Enter at least one line in 'Reasons for the extension (one per line)' — the letter will not build without one — and set the review lead days and Tone (Supportive or Formal).",
    "Check 'Revised probation ends' and the 'Review meeting by' date, read any warning about a late letter, then press 'Copy letter'.",
  ],
  intro:
    "A probation extension letter is the written record that an employee's probationary period has been prolonged, why, and when the decision to confirm or not will now be taken. This generator produces that letter and does the date arithmetic behind it: it adds the extension to the original probation end date with proper month-end clamping, books a review meeting a set number of days before the new end date, and totals how long the person will have been on probation from the date of joining. It flags the two mistakes that cause disputes — issuing the letter after probation has already lapsed, and letting total probation run past twelve months without a contractual basis.",
  useCases: [
    "Extending probation by three months for an engineer whose delivery has improved but not yet met the agreed standard.",
    "Recording specific, evidenced reasons so a later confirmation or exit decision is defensible.",
    "Checking whether an extension pushes the employee past six months of continuous service, which triggers notice obligations under most state Shops and Establishments Acts.",
    "Producing an acknowledgement slip the employee signs and HR files with the appointment letter.",
  ],
  benefits: [
    ["Correct date maths", "Month-end dates clamp properly, so 31 January plus one month becomes 28 February, not an invalid date."],
    ["Catches a late letter", "If the letter date falls after the original probation end, the tool warns that the extension may be challenged as confirmation by conduct."],
    ["Reasons are mandatory", "The letter will not generate without at least one stated reason, which is what makes an extension defensible."],
  ],
  faqs: [
    [
      "Can an employer extend probation in India?",
      "Yes, if the appointment letter or applicable standing orders allow it, and the extension is communicated in writing before the original probation period expires. Under the Model Standing Orders made under the Industrial Employment (Standing Orders) Act, 1946, a probationer is a workman who has not completed three months of service in a permanent post, which is the classic statutory reference point for probation length.",
    ],
    [
      "What happens if probation ends and nobody sends a letter?",
      "The employee will usually argue they were confirmed by conduct, because the employer allowed the period to lapse while continuing to take their work. Issue the extension on or before the last day of the original probation and keep proof of delivery; this tool warns you when the letter date falls after that day.",
    ],
    [
      "How long can probation be extended?",
      "There is no single national cap — it depends on the contract, any certified standing orders and the state Shops and Establishments Act. Extensions of one to six months are common; total probation beyond twelve months is unusual and needs an express contractual clause and a documented business reason.",
    ],
    [
      "Does a probationer get notice before termination?",
      "Often yes. Contracts usually give probationers a shorter notice period, but state Shops and Establishments Acts commonly require notice or wages in lieu once an employee crosses a service threshold — for example one month's notice after six months of service under section 39 of the Karnataka Act. This is general information; check the statute for your state and take legal advice on a specific case.",
    ],
  ],
};

export default seo;
