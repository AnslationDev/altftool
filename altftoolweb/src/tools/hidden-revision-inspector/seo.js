const seo = {
  intro:
    "The Hidden Revision Inspector unzips an Office OOXML file in your browser and runs eighteen structural checks over its XML parts — tracked-change elements, the track-revisions setting, comments and speaker notes, populated core and custom properties, hidden sheets, very-hidden sheets, hidden slides, hidden-text markers, hidden rows and columns, embedded files, VBA and ActiveX parts, and relationships marked External. It reports counts only: it tells you that six comments and two author fields exist, never who wrote them or what they say. It is for anyone about to send a document outside their organisation who wants to know what is still inside it.",
  useCases: [
    "You are about to email a contract .docx to the other side and want to confirm no tracked deletions or reviewer comments survived the final edit.",
    "A workbook is going to a client and you need to check whether any sheet is set to hidden or veryHidden before it leaves.",
    "A deck arrived from outside and you want to see whether it carries macro parts, ActiveX controls or external links before opening it.",
  ],
  benefits: [
    ["Counts, never content", "Every check reports how many markers exist; comment text, author names and property values are never read out or displayed."],
    ["Finds veryHidden sheets", "Detects the sheet state that Excel's own unhide menu will not show you, alongside ordinary hidden sheets, rows and columns."],
    ["Exportable evidence", "A counts-only JSON report can be downloaded for a review file without carrying any of the document's private data."],
  ],
  faqs: [
    [
      "How can I tell if a Word document still has tracked changes?",
      "Look for insertion, deletion, move and property-change elements in the document XML, plus the package setting that turns tracking on for future edits. This tool counts both separately, so you can distinguish 'there are unresolved tracked edits in here' from 'tracking is switched on but nothing is pending'.",
    ],
    [
      "What is a veryHidden sheet in Excel?",
      "It is a worksheet whose state attribute is set to veryHidden rather than hidden, which removes it from the right-click Unhide list entirely — it can only be revealed through the VBA editor. This inspector counts hidden and veryHidden sheets as two distinct checks so a sheet deliberately buried that way still shows up.",
    ],
    [
      "Which file types can it inspect and how large can they be?",
      "Any OOXML package: docx, docm, dotx, dotm, xlsx, xlsm, xltx, xltm, xlam, pptx, pptm, potx, potm, ppsx, ppsm and plain zip. Limits are 20 MB per file, 5,000 package entries, 80 MB total uncompressed, and up to 2,000 XML parts of 2 MB each — bounds that also stop a zip bomb from exhausting the tab.",
    ],
    [
      "Does it open macros or follow external links?",
      "No. VBA and legacy macro-sheet parts are counted as present and never executed, ActiveX and control parts are never loaded, and relationships marked External are counted without displaying or fetching their destinations. Everything happens locally in the browser tab with no upload.",
    ],
  ],
};

export default seo;
