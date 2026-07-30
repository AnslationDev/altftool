const seo = {
  intro:
    "The Invoice-to-Time-Log Reconciler multiplies each time-log row's hours by its rate, sums the result per activity, and compares that expected amount against the invoiced amount for the same activity, marking a line Match when the variance falls within your tolerance and Review when it does not. Paste time-log rows as 'Activity | hours | rate' and invoice lines as 'Activity | amount', set a tolerance (default ±1), and you get a per-activity variance table plus a match count such as 2/3. It is for freelancers, agencies and clients who need to know exactly which line drifted, not just that the invoice total looks wrong.",
  useCases: [
    "You bill a client 5.5 hours of research at 1500 and 8 hours of design at 1800, and want to confirm every invoice line reproduces the log before you send it.",
    "A contractor's invoice arrives higher than your tracker suggests, and you need to see whether the gap sits in one activity or is spread as rounding across all of them.",
    "Your tracker records fractional hours and the invoice was rounded, so you set a tolerance of 50 to suppress the pennies and surface only the lines that are genuinely off.",
  ],
  benefits: [
    [
      "Variance per activity, not per total",
      "Groups repeated rows by activity name and shows expected, invoiced and the signed difference for each, so a 500 overcharge on one line is not cancelled by an undercharge on another.",
    ],
    [
      "Tolerance you control",
      "Any line whose absolute variance is within your tolerance is marked Match, which lets rounding pass while real discrepancies still show as Review.",
    ],
    [
      "Catches missing and extra lines",
      "Activities present in only one of the two lists still appear, with the missing side counted as zero, so an invoiced item that was never logged is impossible to miss.",
    ],
  ],
  faqs: [
    [
      "What format do the time logs need to be in?",
      "One row per line as 'Activity | hours | rate', for example 'Research | 5.5 | 1500'. Invoice lines use two fields, 'Activity | amount', such as 'Research | 8250'. Activity names must match between the two lists for a line to be paired.",
    ],
    [
      "How is the variance calculated?",
      "Variance = invoiced amount − (hours × rate), computed per activity after summing duplicate rows. A positive variance means the invoice charged more than the log supports; a negative one means hours were logged but under-billed.",
    ],
    [
      "What does the tolerance setting do?",
      "It sets the absolute variance, in currency units, that still counts as a match — the default is ±1. Raise it to something like 50 when the invoice was rounded to whole units, and set it to 0 when you want an exact reconciliation.",
    ],
    [
      "Can I use it with different rates for different activities?",
      "Yes — the rate lives on each time-log row, so research at 1500 and design at 1800 are each expanded at their own rate before being compared to the matching invoice line. Rows sharing an activity name are added together first.",
    ],
  ],
};

export default seo;
