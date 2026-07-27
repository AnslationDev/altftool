const seo = {
  intro:
    "A flat interest rate charges interest on the full original principal for the entire tenure, while a reducing-balance rate charges it only on what you still owe. This converter turns a quoted flat rate into the reducing-balance rate that produces the same EMI, which is the only way to compare a flat-rate offer against a normal bank loan.",
  useCases: [
    "Check what a dealer's \"8% flat\" car or two-wheeler loan actually costs against a bank quoting reducing balance.",
    "Compare a gold or personal loan quoted flat against a competing offer quoted on reducing balance.",
    "Work out the true rate before signing, when the lender only shows you the EMI and the flat rate.",
  ],
  benefits: [
    ["Compares like with like", "Converts both quotes to the same basis so the cheaper loan is obvious."],
    ["Shows the real gap", "A flat rate is usually close to double its reducing-balance equivalent."],
    ["Works from the EMI", "Derives the effective rate from the instalment the lender actually quoted you."],
  ],
  faqs: [
    [
      "Is a flat rate the same as a reducing rate?",
      "No, and the difference is large. A flat rate is charged on the original principal every month even though you have already repaid part of it, so a flat rate is usually close to twice its reducing-balance equivalent — roughly 8% flat behaves like about 15% reducing over five years.",
    ],
    [
      "How do I convert a flat rate to a reducing balance rate?",
      "Compute the EMI from the flat rate — principal plus flat interest, divided by the number of months — then solve for the reducing-balance rate that produces that same EMI. There is no simple closed formula; it is found by iteration, which is what this tool does.",
    ],
    [
      "Why do lenders quote flat rates at all?",
      "Because the number looks smaller. A dealer quoting 8% flat is offering roughly the same deal as a bank quoting 15% reducing, but the flat figure reads as the better offer to anyone comparing headline rates.",
    ],
    [
      "Which rate does an RBI-regulated bank use?",
      "Banks quote retail loans on a reducing balance, where each EMI's interest is charged only on the outstanding principal. Flat rates turn up mostly in dealer finance, consumer-durable loans and some NBFC products.",
    ],
  ],
};

export default seo;
