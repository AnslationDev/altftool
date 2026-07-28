const seo = {
  title: "Invoice Generator — Free Online Invoice Maker",
  h1: "Invoice Generator",
  metaDescription:
    "Free invoice generator — add line items, set a tax rate and discount, see totals in ₹ live, then print or save as PDF from your browser. No signup.",
  intro:
    "The Invoice Generator builds a billing document from line items you type, recalculating on every keystroke through a React useMemo hook. Subtotal is the sum of quantity × rate across all rows; the discount is a flat amount subtracted first and capped at the subtotal, and tax is charged only on what remains — so the total works out to (subtotal − discount) × (1 + tax rate ÷ 100). Every amount is formatted with the browser's built-in Intl.NumberFormat API using the en-IN locale and INR currency, which renders figures in rupees with Indian lakh and crore digit grouping to two decimal places. The whole invoice lives in page state — there is no account, no upload and no server call — and the Print button simply calls window.print() to hand the page to your browser's own print dialog.",
  useCases: [
    "A freelancer billing a client for two or three deliverables who needs a numbered invoice with 18% tax on it today, without opening a spreadsheet.",
    "A small studio or consultancy issuing a one-off invoice with an agreed flat discount, where the tax has to be charged on the discounted amount rather than the list price.",
    "Anyone who needs a clean printed or PDF copy of a bill to attach to an email, produced without signing up for invoicing software.",
  ],
  benefits: [
    [
      "Discount is applied before tax",
      "The discount amount comes off the subtotal first, and the tax rate is applied to the remainder. The discount is also capped at the subtotal with Math.min, so an oversized discount can never push the total below zero.",
    ],
    [
      "Rupee formatting done properly",
      "Amounts run through Intl.NumberFormat with the en-IN locale and INR currency, so you get the ₹ symbol, Indian lakh/crore digit grouping and a maximum of two decimal places without formatting anything by hand.",
    ],
    [
      "Nothing is uploaded",
      "The invoice exists only as React state in the open tab. There is no signup, no file upload and no backend request, so client names and amounts never leave your device — and closing or refreshing the tab clears them.",
    ],
    [
      "Print or PDF with no plugin",
      "The Print button calls the browser's native window.print(). Choosing your printer produces a paper copy; choosing Save as PDF produces a PDF file, with no watermark and no third-party PDF library involved.",
    ],
  ],
  faqs: [
    [
      "How do I make an invoice for free without signing up?",
      "Fill in the fields on this page and print it. The generator asks for a business name, client name, invoice number, date, tax rate and discount, then lets you add line items with a description, quantity and rate. There is no account, no email address and no paywall — the entire tool is client-side JavaScript running in your tab.",
    ],
    [
      "Can I download the invoice as a PDF?",
      "Yes, through your browser rather than through the tool. The Print button calls window.print(), and in Chrome, Edge and Safari you then pick \"Save as PDF\" (or \"PDF → Save as PDF\" on macOS) as the destination instead of a printer. The tool itself does not generate a PDF file, so there is no watermark or file-size limit to worry about.",
    ],
    [
      "Is the tax calculated before or after the discount?",
      "After. The discount amount is subtracted from the subtotal first, and the tax rate is then applied to that reduced figure: tax = (subtotal − discount) × rate ÷ 100. The discount is capped at the subtotal, so entering a discount larger than the bill simply zeroes the taxable amount rather than producing a negative total. The tax rate box defaults to 18 but accepts any number.",
    ],
    [
      "Can I change the currency from rupees to dollars or euros?",
      "No — the currency is fixed. Every amount is formatted with Intl.NumberFormat locked to the en-IN locale and INR currency, so it always shows the ₹ symbol and Indian digit grouping. If you need to bill in another currency, use a multi-currency invoicing tool instead of editing the output afterwards.",
    ],
    [
      "Are my client details and amounts saved or sent anywhere?",
      "No. The invoice is held in React component state and nothing else — there is no fetch or API call in the source, no browser storage and no login. That also means nothing persists: reloading the page resets the form to its defaults, so print or save the PDF before you close the tab.",
    ],
    [
      "How many line items can I add to the invoice?",
      "There is no fixed limit — the Add item button appends rows for as long as you keep clicking. The invoice opens with two sample rows, and each row takes a description, a quantity and a rate, with the line amount computed as quantity × rate. The delete button is disabled when only one row is left, so an invoice always has at least one line.",
    ],
    [
      "Does this produce a GST-compliant tax invoice for India?",
      "Not on its own. It applies a single flat tax percentage to the taxable value, which is why the default is 18. It does not capture GSTIN numbers, HSN or SAC codes, place of supply, or split the tax into CGST, SGST and IGST — all of which a statutory Indian tax invoice requires. Treat the output as a general billing document and check the current requirements for your registration.",
    ],
    [
      "Why does the printed page include the editing form as well as the invoice?",
      "Because the Print button prints the page as it stands, without a dedicated print stylesheet to hide the input panel. If you want the invoice preview alone, use your print dialog's page-range or selection option, or collapse the browser window so the layout stacks before printing.",
    ],
  ],
  steps: [
    "Enter your business name, the client name, an invoice number such as INV-001 and the date — the date field is pre-filled with today in YYYY-MM-DD format.",
    "Add each line item with a description, quantity and rate, then set the tax rate percentage and any flat discount amount; the subtotal, discount, tax and total on the right recalculate as you type.",
    "Write a closing note, then click Print invoice to open your browser's print dialog and either print the document or choose Save as PDF as the destination.",
  ],
};

export default seo;
