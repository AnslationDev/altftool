const seo = {
  title: "Bill of Supply Generator: Rule 49 Format, GSTIN",
  metaDescription:
    "Print a Rule 49 bill of supply for exempt, nil-rated and composition sales, with GSTIN check-digit validation and the total in words.",
  steps: [
    "Choose Why no GST is charged, then fill Serial number (max 16 characters), Date of issue, and the Supplier and Recipient blocks with Trade name, Address and GSTIN.",
    "Press Add line for each row and enter Description of goods or services, HSN / SAC code, Unit, Quantity, Rate per unit (INR) and Discount (%).",
    "The total and its amount in words update live; use Copy bill for plain text, Print for the Printable bill of supply, or Reset to clear the form.",
  ],
  intro:
    "A bill of supply is the document a registered person issues instead of a tax invoice when no GST can be charged on the supply — exempt, nil-rated and non-GST goods or services, and every outward supply by a composition taxable person under Section 10. This generator lays out all eight particulars listed in Rule 49 of the CGST Rules, 2017, validates the supplier and recipient GSTIN against the base-36 check digit, enforces the 16-character serial number limit and prints the total in Indian-numbering words. It is built for composition dealers, exempt-goods traders and small service providers who need a compliant document without accounting software.",
  useCases: [
    "A composition dealer in Maharashtra billing a grocery buyer, who must print 'Composition taxable person, not eligible to collect tax on supplies' at the top of every document.",
    "A seller of fresh vegetables or unbranded flour issuing paperwork for a nil-rated supply where charging CGST or SGST would be wrong.",
    "A tuition or healthcare service provider covered by an exemption notification who still needs a serially numbered document for the buyer's books.",
  ],
  benefits: [
    ["Rule 49 checklist built in", "Flags a missing recipient name, missing HSN or SAC, or a missing signature before you print."],
    ["Real GSTIN validation", "Rejects a GSTIN whose state code or 15th check digit does not compute, not just one of the wrong length."],
    ["Print-ready output", "Amount in words, line-level discounts and rounding to the nearest rupee, all on one page that prints clean."],
  ],
  faqs: [
    [
      "What is the difference between a bill of supply and a tax invoice?",
      "A tax invoice shows GST charged to the buyer; a bill of supply shows no tax at all. You issue a bill of supply when the supply is exempt, nil-rated or non-GST, or when you are a composition taxable person who is barred from collecting GST from customers.",
    ],
    [
      "What must a bill of supply contain?",
      "Rule 49 requires the supplier's name, address and GSTIN, a consecutive serial number of not more than 16 characters unique for the financial year, the date of issue, the recipient's name and address (plus GSTIN if registered), the HSN or SAC code, a description of the supply, the value after discount, and the supplier's signature or digital signature.",
    ],
    [
      "Can a composition dealer issue a tax invoice?",
      "No. A composition taxable person cannot collect GST from customers, so they issue a bill of supply and pay the composition levy out of their own turnover. The declaration 'Composition taxable person, not eligible to collect tax on supplies' must appear at the top of the document under Rule 5(1)(f).",
    ],
    [
      "Do I need a bill of supply for a small sale?",
      "Rule 49's third proviso lets you skip issuing one where the value of the supply is less than ₹200, provided the recipient is unregistered and does not ask for a document, and you prepare a consolidated bill of supply for those sales at the close of business. This page is informational — confirm your own position with a chartered accountant or GST practitioner.",
    ],
  ],
};

export default seo;
