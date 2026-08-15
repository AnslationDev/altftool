const seo = {
  title: "Email Attachment Risk Check: Only the Last Extension",
  metaDescription:
    "Rates an attachment from its file name alone: last extension, Outlook's blocked list, .pdf.exe double extensions, RTL overrides. Nothing is uploaded.",
  steps: [
    "Type the Attachment file name exactly as your mail client shows it, or tap a sample such as Invoice_4471.pdf.exe.",
    "Only the final extension is read; the check also looks for a second extension, right-to-left override characters and trailing spaces.",
    "Read the Risk score out of 100 with its verdict, the Findings list and Safe handling for this file, then press Copy result.",
  ],
  intro:
    "Attachment File Type Risk Explainer rates an email attachment from its file name alone, using the one rule that decides what happens on a double-click: only the final extension counts. It sorts extensions into programs, scripts, shortcuts, macro-capable documents, containers and inert data, marks the ones on Microsoft's default Outlook blocked-attachment list, and detects the disguises — a second extension such as .pdf.exe, a right-to-left override character, trailing spaces, or an archive wrapped inside another archive. Nothing is uploaded; the name is analysed in the browser.",
  useCases: [
    "Decide whether an unexpected 'invoice' attachment is a PDF or an executable wearing a PDF name.",
    "Explain to a colleague why Windows shows Statement.pdf when the file on disk is Statement.pdf.exe.",
    "Check whether a .docm, .xlsm or .one attachment needs macro-blocking before anyone opens it.",
    "Brief a helpdesk team on which extensions mail filters already block, so they know a wrapped .zip is a deliberate workaround.",
  ],
  benefits: [
    ["Only the last extension counts", "Shows the full dotted chain and names which part actually decides how the file opens."],
    ["Catches invisible tricks", "Flags right-to-left override characters and padding spaces that make the displayed name differ from the real one."],
    ["Tells you what to do next", "Each rating comes with handling steps for that category, not a generic warning."],
  ],
  faqs: [
    [
      "Which email attachments are the most dangerous?",
      "Anything that executes without a further prompt: .exe, .scr, .com, .msi, .pif, .cpl and .jar, scripts such as .js, .vbs, .ps1, .bat, .cmd, .hta and .wsf, and shortcut files such as .lnk. Microsoft blocks roughly fifty of these in Outlook by default, so if one still reaches you it has usually been renamed or zipped to get past the filter.",
    ],
    [
      "What is a double extension, and why does it work?",
      "It is a file named like Invoice.pdf.exe, where the harmless-looking .pdf is just part of the name. It works because Windows Explorer hides extensions for known file types by default, so the file is displayed as Invoice.pdf. Turn on File name extensions in Explorer's View tab and the disguise disappears.",
    ],
    [
      "Is a .docx safer than a .doc or .docm?",
      "Yes. The XML-based .docx format cannot store VBA macros at all, while .doc, .docm, .xlsm and .pptm can. Since 2022 Microsoft also blocks macros by default in Office files that arrive from the internet, which is why attackers moved towards .lnk shortcuts, .iso images and OneNote .one files.",
    ],
    [
      "Can a PDF or an image be dangerous?",
      "Usually not by itself. Most malicious PDFs simply contain a link to a fake login page, which is a phishing problem rather than a file problem, though reader vulnerabilities do exist and are patched regularly. An .svg is the exception among images: it is XML and can contain script when opened in a browser. This tool is educational — if you handle a suspected attack at work, report it rather than investigating alone.",
    ],
  ],
};

export default seo;
