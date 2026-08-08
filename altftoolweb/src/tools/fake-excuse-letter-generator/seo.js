const seo = {
  title: "Fake Excuse Letter Generator: Work, School, Medical",
  metaDescription:
    "Fill a work, school, medical or family absence-letter template with names, date and reason, then copy it or download excuse-letter-work.txt.",
  steps: [
    "Pick Work, School, Medical or Family, then fill the fields that template uses: Manager's name and Your name for Work; Student name and Parent/Guardian name for School; Patient name, Doctor name and License number for Medical; Family member, Your name and Event name for Family.",
    "Add the Date (e.g., Jan 15, 2024) and an optional Reason, then press \"Generate Letter\".",
    "The letter appears as plain text, with anything left blank rendered as a visible placeholder such as [Patient Name] or MED-00000; the download button saves it as excuse-letter-work.txt for the work template.",
  ],
  intro:
    "The Fake Excuse Letter Generator fills one of four fixed absence-letter templates — work, school, medical and family — with the names, date and reason you type, and returns the finished formal letter as plain text you can copy or download. Each template has its own fields: work asks for manager and sender, school for student and parent or guardian, medical for patient, doctor and licence number, family for the event and the family member you are writing to. It is a novelty and drafting aid for people who want the structure and tone of a formal absence note, not a substitute for a genuine document from an employer, school or clinician.",
  useCases: [
    "You genuinely missed a shift and have to email HR, but you freeze at the wording, so you fill in the work template with your manager's name and the date and edit the draft into your own words before sending.",
    "Your child was off school on Tuesday and the office wants a signed note from a parent, so you use the school template to lay out the student name, date and reason in the format the office expects, then sign it yourself.",
    "You are writing a short film or a workplace-comedy sketch and need a prop letter on screen, so you generate a medical-style letter with obviously fictional names to use as set dressing.",
  ],
  benefits: [
    ["Four distinct letter shapes", "Work, school, medical and family templates each use their own salutation, body and sign-off rather than one generic paragraph."],
    ["Only asks for fields it uses", "The input row changes with the template, so the medical letter prompts for doctor and licence number while the family letter asks for the event instead."],
    ["Editable plain-text output", "The letter comes out as plain text you can copy into email or download as a .txt file and rewrite before anyone reads it."],
  ],
  faqs: [
    [
      "Is it legal to submit a fake excuse letter?",
      "Presenting a fabricated letter as if it came from a doctor, employer or school is fraud or forgery in most jurisdictions and is a firing or expulsion offence in many workplace and school policies. Use the output as a drafting skeleton for a letter you write in your own name, as a prop, or as a teaching example — not as a document you pass off as someone else's.",
    ],
    [
      "What details does the medical template ask for?",
      "Patient name, date of visit, doctor name, licence number and the activity to refrain from. Left blank they render as visible placeholders such as [Patient Name] and MED-00000, which is a deliberate reminder that the letter is not a real clinical document.",
    ],
    [
      "Can I download the letter as a file?",
      "Yes — the download button saves it as a plain-text file named excuse-letter-<type>.txt, for example excuse-letter-work.txt, and a copy button puts the same text on your clipboard.",
    ],
    [
      "How do I write a real absence letter instead?",
      "Keep it to three short parts: state the date or dates you were absent, give a brief honest reason, and say what you are doing about the missed work. The work template here follows exactly that structure, so replace the invented reason with the true one and it becomes a legitimate note.",
    ],
  ],
};

export default seo;
