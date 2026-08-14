const seo = {
  title: "Scanned PDF Metadata: What Each Clean-Up Removes",
  metaDescription:
    "Compare strip, re-print, flatten and print-and-rescan against scanner IDs, invisible OCR text, failed redactions and tracking dots.",
  steps: [
    "Tick what the scan contains under \"What does the scan contain?\", grouped into Document properties, OCR and text, Hidden objects and Visible on the page; Producer and Creator fields, CreationDate and ModDate, Invisible OCR text under the page image, Black boxes drawn over live text, and Headers, footers, stamps and fax banners start ticked.",
    "Choose a clean-up step in \"How will you prepare the file before sending?\": Send the scanner's PDF as-is, Strip metadata (ExifTool -all=), Re-print to a new PDF (Print > Save as PDF), Flatten every page to an image, or Print on paper and scan the paper again.",
    "\"Remaining exposure\" scores what survives out of 100, the list counts signals still in the file, high-severity items left and whether the document stays searchable, and \"Deal with these before sending\" names each surviving item with its fix — Copy result copies that summary as text.",
  ],
  intro:
    "Scanned Document Metadata Explainer maps the hidden content of a scanned PDF to the structure that holds it — the /Info dictionary and XMP packet, the invisible OCR text layer drawn in text render mode 3, objects left behind by incremental saves, and marks baked into the page image — then shows which clean-up step removes each one. Stripping properties, re-printing to a new PDF, flattening to images and print-and-rescan all remove different things, and only one of them destroys extractable text. Aimed at anyone emailing a scanned contract, ID copy or filing who wants to know what leaves the building with it.",
  useCases: [
    "Check whether a black box drawn over a name in a scanned agreement can still be copied out as text.",
    "Decide between stripping metadata and flattening pages before sending a scan to an external party.",
    "Explain to a team why the office multifunction printer's model and the scanning employee's account end up in every PDF.",
    "Assess a scan of a printed page for colour-laser tracking dots before publishing it anonymously.",
  ],
  benefits: [
    [
      "Clean-up steps compared",
      "Shows exactly what strip, re-print, flatten and print-and-rescan each remove, instead of guessing.",
    ],
    [
      "Covers the text layer",
      "Most metadata advice stops at document properties and misses the searchable OCR text underneath the image.",
    ],
    [
      "Flags the accessibility cost",
      "Warns when your chosen step destroys the text layer and with it search and screen-reader access.",
    ],
  ],
  faqs: [
    [
      "Does a scanned PDF contain hidden text?",
      "Yes, if OCR was applied. Searchable scans draw the recognised words invisibly behind the page image using text render mode 3, so every word can be selected, copied and indexed by a search engine even though you only see a picture.",
    ],
    [
      "Why can people still read text I covered with a black box in a PDF?",
      "Because a filled rectangle or highlight annotation only sits on top of the content. The original characters remain in the content stream, so selecting the area and pasting it, or deleting the annotation, brings the text straight back. Use a redaction function that removes the underlying content, then verify by copy-pasting the area.",
    ],
    [
      "What personal information does an office scanner add to a PDF?",
      "Typically the Producer or Creator string naming the device model and firmware, CreationDate and ModDate accurate to the second with a UTC offset, the scan job settings, and — on scan-to-email from a networked multifunction printer — the directory account of the person who ran the job in the Author field.",
    ],
    [
      "Do printers really add invisible tracking dots to pages?",
      "Most colour laser printers do. The Machine Identification Code is a faint yellow dot grid encoding the printer's serial number and the date and time of printing, and a high-resolution scan of that page reproduces it. Monochrome laser and inkjet output generally does not carry it.",
    ],
  ],
};

export default seo;
