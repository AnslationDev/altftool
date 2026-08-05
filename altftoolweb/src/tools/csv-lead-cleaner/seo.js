const seo = {
  intro:
    "The CSV Lead Cleaner takes an uploaded lead list and returns a CRM-ready file by lower-casing every email address, dropping rows that have no email at all, and keeping only the first row for each unique email. It reports four counts — total rows read, rows kept, duplicates removed and rows discarded for a missing email — then previews the first five cleaned records and exports the result as cleaned_leads.csv with Name, Email, Phone and Company columns.",
  useCases: [
    "Two event sign-up exports and a webinar list are about to be merged into your CRM, and you need one deduplicated file so the same person is not imported three times and emailed three times.",
    "A purchased or scraped list has rows where only a company name was filled in, and you want those stripped before an import that will otherwise fail row by row.",
    "The same contact appears as Sam@Acme.com and sam@acme.com in two exports, and you need the case difference resolved so your CRM sees one record instead of two.",
  ],
  benefits: [
    ["Case-insensitive email dedupe", "Addresses are lower-cased before comparison, so Sam@Acme.com and sam@acme.com collapse into a single lead rather than slipping past a literal match."],
    ["Tells you what it removed", "Duplicates and email-less rows are counted separately, so you can see whether a shrinking list is a dedupe win or a sign the export was broken."],
    ["Fixed four-column output", "Every file comes out as Name, Email, Phone, Company in that order, so repeat imports map to the same CRM fields without redoing the column matching."],
  ],
  faqs: [
    [
      "What column headers does my CSV need?",
      "The cleaner recognizes Name or Full Name; Email, Email Address or E-mail; Phone, Mobile, Phone Number, Contact or Contact Number; and Company or Organization, without regard to case or surrounding spaces. Email is the only field that must be populated — rows missing Name, Phone or Company are kept with blanks, while a row with no email is counted as invalid and dropped.",
    ],
    [
      "Which duplicate does it keep?",
      "The first occurrence in file order; every later row with the same email is discarded and added to the duplicates count. If you want the newest record to win, sort your file newest-first before uploading.",
    ],
    [
      "Does it dedupe on phone number or name too?",
      "No — the email address is the only key. Two rows for the same person under different email addresses will both survive, so review the output if your source lists work and personal addresses separately.",
    ],
    [
      "Does it validate that the email addresses are real?",
      "No. It checks only that the email field is non-empty, so a typo like sam@acme,com passes through. Use a deliverability or syntax-validation step before sending if bounce rate matters.",
    ],
  ],
};

export default seo;
