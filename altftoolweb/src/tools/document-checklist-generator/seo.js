const seo = {
  title: "Document Checklist Generator: Visa, Loan, KYC, Job",
  metaDescription:
    "Seven templates of eight documents each, sorted High to Low priority with copy counts and masked-copy flags, exported to Markdown or CSV.",
  steps: [
    "Choose a Document workflow — Visa Application, Job Joining, Home / Personal Loan, Rental Agreement, College Admission, KYC / Account Opening or Business Setup — and set the Applicant / project name and Deadline.",
    "Tick items off as you collect them, and use Add custom document with a name and Category, then Add Document, for anything the template does not cover.",
    "Watch High Priority Pending fall to zero, then press Markdown to copy a tick-box list or CSV to download document-checklist.csv.",
  ],
  intro:
    "The Document Checklist Generator turns one of seven ready-made templates — visa, job joining, home or personal loan, rental agreement, college admission, KYC account opening and business setup — into a working checklist of eight documents each, tagged High, Medium or Low priority, grouped by category, and marked where a document is sensitive enough to share as a masked copy. It defaults to two copies for every High-priority item and one otherwise, tracks completion as a percentage, and exports the whole list to Markdown or CSV. Add your own rows for anything a specific embassy, bank or college asks for on top.",
  useCases: [
    "You have a visa appointment in three weeks and want a single list covering passport, bank statements for the last three to six months, itinerary and insurance, with the high-priority gaps at the top.",
    "A first-day joining kit needs offer letter, PAN, cancelled cheque and address proof, and HR wants a printed tick-list you can hand over with the folder.",
    "You are applying for a home loan and need to see immediately how many high-priority documents — salary slips, six months of bank statements, property papers — are still outstanding.",
  ],
  benefits: [
    [
      "Sorted by what blocks you first",
      "Items are ordered High, Medium then Low, and a separate counter shows only the high-priority documents still unticked.",
    ],
    [
      "Copy counts and sensitivity built in",
      "High-priority documents default to two copies, and identity or financial items are flagged so you know to share a masked version where that is accepted.",
    ],
    [
      "Exports in the format you actually need",
      "Markdown gives a tick-box list to paste into notes or a message; CSV gives category, priority, copies, sensitivity and status as columns for a shared sheet.",
    ],
  ],
  faqs: [
    [
      "What documents do I need for a visa application?",
      "The visa template starts with eight: valid passport (original plus copy), the signed application form, passport-size photographs, three to six months of bank statements, latest ITR or Form 16, travel itinerary, invitation or cover letter, and travel insurance. Requirements vary by country and visa class, so always check the specific embassy's published list as well.",
    ],
    [
      "How many bank statements do lenders usually ask for?",
      "The loan template assumes six months of bank statements and three months of salary slips, with ITR or Form 16 for the last two years where the lender wants them. Individual banks set their own windows, so confirm with the lender before submitting.",
    ],
    [
      "Which documents should I send as masked copies?",
      "The ones flagged sensitive — PAN, Aadhaar or other government ID, bank account proof and address proof. Masking the parts a recipient does not need limits what can be reused if the file is mishandled, and many Indian institutions now accept masked Aadhaar as standard.",
    ],
    [
      "Can I add documents that are not in the template?",
      "Yes. Any custom row you add takes its own name and category and joins the same priority sort, progress percentage and export, so a college-specific certificate sits alongside the standard eight.",
    ],
  ],
};

export default seo;
