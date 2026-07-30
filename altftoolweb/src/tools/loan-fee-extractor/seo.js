const seo = {
  intro:
    "The Loan Fee Extractor scans pasted loan agreement text sentence by sentence and pulls out every clause that mentions a charge, penalty or rate reset, sorting the matches into six categories: processing and origination, late payment, prepayment and foreclosure, rate reset, insurance and add-ons, and collection or bounce charges. For each match it also lifts the numeric amount or percentage from the sentence and shows the surrounding clause snippet, capped at 240 characters. It is for borrowers who want a fast map of where the money leaks in a long agreement before they read it line by line.",
  useCases: [
    "A personal loan sanction letter runs to fourteen pages and you want to find every fee, penalty and bounce charge in it before the disbursal call, without reading all of it twice.",
    "You suspect the agreement contains a prepayment or foreclosure penalty the sales agent never mentioned, and want the exact clause text and percentage to quote back to the lender.",
    "You are comparing two offers and want to line up the processing fee, late payment rate and any insurance add-on charge from both agreements in one table.",
  ],
  benefits: [
    [
      "Six clause categories, not a plain keyword search",
      "Matches are labelled as processing, late payment, prepayment, rate reset, insurance or collection, so you see which category the agreement is silent on.",
    ],
    [
      "Pulls the number out of the sentence",
      "It extracts currency amounts and percentages from each matched clause, and says so explicitly when a clause names a charge with no figure attached.",
    ],
    [
      "Keeps the original wording",
      "Every finding carries the source sentence up to 240 characters, so you can verify the match rather than trusting a summary.",
    ],
  ],
  faqs: [
    [
      "What kinds of charges does the loan fee extractor find?",
      "Six categories: processing and origination or application fees, late payment and overdue or default charges, prepayment and foreclosure or early repayment penalties, rate reset clauses including floating, benchmark and spread language, insurance and protection-plan add-ons, and collection, bounce, dishonour, ECS or NACH charges.",
    ],
    [
      "Does it work on a scanned PDF of my loan agreement?",
      "Only if you paste the text. It reads plain text you paste into the box, so a scanned image has to be converted to selectable text first. Copying from a digital PDF or the lender's key-fact statement works directly.",
    ],
    [
      "Why did it report a clause with no amount?",
      "Because the sentence names a charge type but contains no figure — it will show 'No numeric amount found' rather than guessing. Agreements often push the actual rates into a separate schedule or annexure, which is exactly the case worth chasing with the lender.",
    ],
    [
      "Can I rely on this instead of reading the agreement?",
      "No. This is keyword and amount extraction, not legal interpretation, and it will miss charges phrased in wording outside its patterns or buried in annexures. Read the full agreement and the key-fact statement, and consult a qualified adviser before signing anything you do not understand.",
    ],
  ],
};

export default seo;
