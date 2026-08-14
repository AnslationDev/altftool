const seo = {
  title: "Office Macro Inspector: Check .docm/.xlsm for VBA",
  metaDescription:
    "Check a .docm or .xlsm locally for vbaProject parts, macro content types and relationships — three evidence levels, 20 MB cap, no upload.",
  steps: [
    "Click \"Choose file\" under Office document and pick a local file — .docx, .docm, .xlsx, .xlsm, .pptx, .pptm and the legacy .doc, .xls and .ppt are all accepted, up to 20 MB.",
    "Click \"Run local inspection\". The package is read in this browser tab and counted for vbaProject.bin part paths, the application/vnd.ms-office.vbaproject content type, vbaProject relationships and macro-sheet parts — no document is opened and no VBA is executed.",
    "Read the status badge — \"Macro-related package cues observed\", \"Macro-capable container cue only\" or \"No selected direct macro cue observed\" — with the Package entries, Direct/string cues, Relationship cues and Warnings tiles, then \"Download report\" to save office-macro-cue-counts-only.json, which carries no filenames or document values.",
  ],
  intro:
    "The Office Macro Inspector reads an Office file's package structure locally and reports whether it carries macro-related cues — a vbaProject.bin part path, the application/vnd.ms-office.vbaproject content type, a vbaProject relationship, or legacy macro-sheet parts — without ever opening the document or executing VBA. Results land in one of three evidence levels: direct package cues observed, macro-capable container only (the extension or a macroEnabled content type says it could hold macros), or no selected cue observed. It is for anyone who has been sent a .docm or .xlsm and wants a structural read before deciding what to do with it — a clear result is not proof the file is macro-free or safe.",
  useCases: [
    "An invoice arrives as an .xlsm from a supplier who normally sends .xlsx, and you want to know whether the workbook actually contains a VBA project before opening it in Excel.",
    "You are triaging a batch of attachments forwarded by a colleague and need to separate the ones with real macro cues from the ones that are merely macro-capable by extension.",
    "You need to hand a reviewer evidence of what you checked, without disclosing the document itself — the counts-only JSON report carries no filenames or document values.",
  ],
  benefits: [
    [
      "Separates capability from evidence",
      "Distinguishes a file that merely has a macro-capable extension from one whose package actually carries a VBA part, relationship or content type.",
    ],
    [
      "Nothing is opened or executed",
      "Inspection stops at package paths, [Content_Types].xml and relationship XML — no VBA is parsed, no formula evaluated, no relationship followed.",
    ],
    [
      "Bounded against hostile archives",
      "Hard caps of 20 MB per file, 1,500 package entries and 3 MB of selected XML mean a zip bomb or malformed container fails safely instead of hanging the tab.",
    ],
  ],
  faqs: [
    [
      "Does this tell me if a document is safe to open?",
      "No. It reports structural macro cues only — a result with no cue does not prove a document is macro-free, trustworthy or malware-free, and the presence of a macro does not establish malicious intent. Encrypted, obfuscated or malformed packages can hide cues entirely. Treat it as one input alongside antivirus scanning and verifying the sender.",
    ],
    [
      "What exactly does it look for inside an Office file?",
      "In modern OOXML packages it counts vbaProject.bin part paths, content-type entries equal to application/vnd.ms-office.vbaproject, vbaProject relationship types, macro-sheet parts, ActiveX and ctrlProps parts, and relationships marked TargetMode=\"external\". Legacy .doc, .xls and .ppt files get only an OLE signature check plus a bounded raw-string scan for markers such as _VBA_PROJECT and \"Attribute VB_\".",
    ],
    [
      "What is the file size limit?",
      "20 MB. Beyond that the package is rejected rather than partially parsed. Other bounds apply too: at most 1,500 package entries, 512 KB per selected XML part, 3 MB of selected XML in total, 96 relationship parts, and an 8 MB window for the legacy string scan.",
    ],
    [
      "Is my document uploaded anywhere?",
      "No. The file is read in your browser and never leaves it, and the downloadable report is counts and evidence levels only — it deliberately excludes filenames and any content from the document.",
    ],
  ],
};

export default seo;
