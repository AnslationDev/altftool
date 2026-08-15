const seo = {
  title: "Email Attachment Metadata: What Actually Gets Sent",
  metaDescription:
    "Pick the file type and your clean-up step to see which document properties, tracked changes, hidden content and image EXIF still leave with the email.",
  steps: [
    "Choose \"What are you attaching?\" — Word document (.docx), Spreadsheet (.xlsx), Presentation (.pptx), PDF, Photo or image (.jpg / .png), or Zip archive.",
    "Choose \"What will you do before attaching?\" — attach as-is, Inspect Document, export a PDF copy, run a metadata stripper or rebuild — then tick the signals that apply.",
    "Read the \"Leaving with the email\" score out of 100 with Still attached and Removed by your preparation, and work through \"Clear these before you press Send\".",
  ],
  intro:
    "Email Attachment Metadata Explainer sets out what actually leaves your outbox with a file: SMTP carries an attachment byte-for-byte, so the recipient opens the identical document that sits on your disk, tracked changes and all. It classifies each risk by where it lives — Office core properties, editing history, hidden content, embedded pictures, the filename, or the mail headers — and shows which of the usual clean-up steps clears it, because Inspect Document, exporting a PDF and running a metadata stripper each remove different things. Intended for anyone sending contracts, proposals or spreadsheets outside their own organisation.",
  useCases: [
    "Check a proposal before it goes to a client, when the file started life as another client's document.",
    "Decide whether exporting to PDF is enough or whether the Word file needs Inspect Document first.",
    "Understand why a spreadsheet with hidden columns still contains the cost model the buyer should not see.",
    "Explain to a team why renaming 'Offer_v7_FINAL_signed_JS.xlsx' matters as much as clearing its properties.",
  ],
  benefits: [
    [
      "Per-file-type checklist",
      "Only shows the risks that can exist in the format you are attaching, from .docx to a zip archive.",
    ],
    [
      "Compares clean-up steps",
      "Makes clear that Inspect Document ignores image EXIF and that PDF export copies the Author across.",
    ],
    [
      "Separates file from transport",
      "Flags header and quoted-thread exposure that no amount of attachment cleaning will fix.",
    ],
  ],
  faqs: [
    [
      "Does email strip metadata from attachments?",
      "No. Attachments are Base64-encoded for transport and decoded back to an identical file, so document properties, tracked changes, comments and image EXIF all arrive intact. Only a step you take before attaching, or a data-loss-prevention system your employer runs, changes the file.",
    ],
    [
      "Does saving as PDF remove all the metadata from a Word document?",
      "It removes comments, tracked changes and hidden content because only the printed view is exported, but Word and PowerPoint copy the Author and Title fields straight into the PDF's own properties. Clear the source document's properties as well, or check the PDF's properties after export.",
    ],
    [
      "Can someone recover the part of a picture I cropped inside Word or PowerPoint?",
      "Yes. Office crops non-destructively, so the cropped-away pixels stay in the file and reappear when the crop handles are dragged back. Use Compress Pictures with 'Delete cropped areas of pictures' ticked, or crop in an image editor before inserting.",
    ],
    [
      "Is a password-protected zip enough to hide what I am sending?",
      "Not on its own. A standard zip encrypts file contents but leaves the central directory readable, so anyone with the archive can see every filename, folder path, size and modification time without the password. Repackage from a clean folder, or use an archive format that encrypts the file list too.",
    ],
  ],
};

export default seo;
