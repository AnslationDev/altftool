const seo = {
  title: "What Your CV Metadata Reveals to Recruiters & ATS",
  metaDescription:
    "See what the Author field, revision count, total editing time, tracked changes, hidden text and filename tell a recruiter, by how you send the file.",
  steps: [
    "Choose How are you sending it? - emailing the Word file, exporting a PDF, uploading to an employer's ATS portal, one-click apply, or handing over paper.",
    "Tick what describes your CV: an Author field naming someone else, revision number and total editing time, tracked changes, invisible keyword stuffing or another employer's name in the filename.",
    "Read the Visible to the reviewer score out of 100 and the specific fix listed for each flagged item, then press Copy result.",
  ],
  intro:
    "Resume Metadata Risk Explainer sets out what a recruiter or applicant tracking system reads from your CV besides the words: the Author and Company properties, revision count and total editing time, the creation date, tracked changes and comments, hidden keyword text, the filename, and the candidate record the platform keeps. Each item is tied to the submission route you choose, because emailing a Word file, exporting a PDF, uploading to a portal and handing over paper expose very different amounts. Written for job seekers who want their file to say only what they intended.",
  useCases: [
    "Check a CV built from a colleague's template before sending it, when the Author property still names them.",
    "See why a Word file shows a seven-minute editing time on an application you described as tailored.",
    "Decide whether to rename 'CV_Northwind_v3.pdf' before sending it to a different employer.",
    "Understand what an employer's application system stores about you after a rejection.",
  ],
  benefits: [
    [
      "Route-aware",
      "Shows how much a PDF export removes and what it copies across from the Word original.",
    ],
    [
      "Covers the file and the platform",
      "Includes the candidate record an ATS keeps, not just the properties inside your document.",
    ],
    [
      "Actionable fixes",
      "Every flagged item comes with the specific setting or step that clears it.",
    ],
  ],
  faqs: [
    [
      "Can a recruiter see who really wrote my CV?",
      "They can see the Author and 'Last modified by' properties, which hold the name registered in the copy of Office that created and last saved the file. If you started from someone else's document, their name travels with yours until you edit the properties.",
    ],
    [
      "Should I send my CV as a PDF or a Word file?",
      "PDF is safer for metadata: exporting drops comments, tracked changes and text hidden by formatting because only the printed view is written out. Word and PowerPoint still copy the Author and Title into the PDF's own properties, so clear those in the source document first. Send Word only when the employer explicitly asks for it.",
    ],
    [
      "Does hidden white text with keywords actually work on ATS systems?",
      "No — and it backfires. Parsers extract text regardless of its colour or size, so the stuffed keywords appear in the parsed profile a recruiter reads, where they look like deliberate deception. Put genuine keywords in visible sentences instead.",
    ],
    [
      "How long does a company keep my CV after I am rejected?",
      "It depends on the employer's stated retention period and local law, and the record usually includes recruiter notes and the original file, visible to the hiring team. Check the privacy notice attached to the application, and use the access or erasure rights available to you if you want it removed.",
    ],
  ],
};

export default seo;
