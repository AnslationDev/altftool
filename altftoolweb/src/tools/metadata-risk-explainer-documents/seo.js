const seo = {
  title: "What Word and PDF Metadata Reveals About You",
  metaDescription:
    "See what dc:creator, cp:lastModifiedBy, Company, /Producer and XMP IDs tell a recipient. Tick what your file still carries for a score and clean-up order.",
  steps: [
    "Choose File type — \"Word, Excel or PowerPoint (OOXML)\", \"PDF\" or \"A Word file exported to PDF\" — and answer \"Who receives it?\".",
    "Under \"What is still in the file?\", tick the fields your document still carries (Author name, Last modified by, Company, Tracked changes, XMP document and instance IDs and the rest), or start from Typical uncleaned file, Worst case or Fully cleaned.",
    "You get an exposure score out of 100 with the highest-risk field, the flagged dangerous combinations, and a Clean-up order for that specific file.",
  ],
  intro:
    "This explainer maps the metadata inside Office and PDF files to the specific thing each field tells a recipient. An OOXML file (.docx, .xlsx, .pptx) is a ZIP whose docProps/core.xml holds dc:creator and cp:lastModifiedBy and whose docProps/app.xml holds Company, Manager, Template and TotalTime; a PDF keeps an Information dictionary with /Author, /Producer and /CreationDate plus an XMP packet with lineage identifiers. Tick what your file still carries and it scores the exposure, flags the worst combinations, and gives a clean-up order.",
  useCases: [
    "Check a report before publishing it, so a local OneDrive path does not name your employer's tenant and your account.",
    "Review a contract draft that may still carry tracked changes and comments from an internal argument.",
    "Understand why a PDF with a black box over a name is not redacted at all.",
    "Brief a team on what Document Inspector actually removes, and on what it leaves behind.",
  ],
  benefits: [
    ["Names the real parts and keys", "Fields are labelled with dc:creator, cp:lastModifiedBy, Company in app.xml, /Producer and xmpMM:DocumentID."],
    ["Separates Office from PDF", "Exporting to PDF creates new metadata rather than removing the old, and the tool models both stages."],
    ["Gives an order, not a list", "The clean-up plan starts with whichever risk is actually present in your file."],
  ],
  faqs: [
    [
      "What metadata is stored in a Word document?",
      "In docProps/core.xml: the author (dc:creator), the last person to save it (cp:lastModifiedBy), the revision number and the created and modified timestamps with a UTC offset. In docProps/app.xml: the Company from the Office licence, the Manager, the template name and TotalTime, the number of minutes the file has been edited. The body can also hold tracked changes, comments, hidden text and full-resolution originals of cropped images.",
    ],
    [
      "Does saving as PDF remove document metadata?",
      "No. Exporting usually carries the author and title across into the PDF Information dictionary and adds new fields such as /Producer and /CreationDate, plus XMP identifiers linking the PDF to the source file. It does drop tracked changes and comments in most exports, but the safest approach is to clean the source first and then inspect the exported PDF as well.",
    ],
    [
      "Why is a black box over text not a real redaction?",
      "Because the rectangle is drawn on top of a text layer that is still in the PDF's content stream. Anyone can select the area and copy the text out, or extract it with a command-line tool in seconds. Proper redaction deletes the underlying characters and images, then applies the change; always verify by trying to select the redacted area afterwards.",
    ],
    [
      "How do I remove personal information from an Office file?",
      "Use File, Info, Check for Issues, Inspect Document, then remove the 'Document Properties and Personal Information' section along with comments, revisions and hidden content. Also correct the user name in Office options, otherwise the next save writes your name straight back in. For documents subject to disclosure obligations, follow your organisation's own review process rather than relying on the inspector alone.",
    ],
  ],
};

export default seo;
