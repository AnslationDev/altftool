const seo = {
  intro:
    "The Excel to HTML Converter turns a worksheet from an .xlsx, .xls or .csv file into a complete standalone HTML document — a single marked-up table wrapped in an HTML5 page with its own embedded stylesheet. It parses the workbook with the SheetJS engine in your browser, lists every sheet name so you can pick the tab you want, and shows both a live rendered preview and the raw HTML source. The generated markup already carries collapsed borders, zebra striping on even rows and a sticky header, so it looks presentable the moment you open it.",
  useCases: [
    "You need last quarter's numbers on a web page today and the CMS has no spreadsheet embed — convert the sheet, paste the table markup into the rich-text editor, and skip rebuilding 200 rows by hand.",
    "A colleague sends a multi-sheet workbook and you want to share just the 'Summary' tab with someone who has no Excel licence — pick that sheet, download the HTML file, and send a link they can open in any browser.",
    "You are writing documentation and want a reference table checked into the repo as text so it shows up in diffs — copy the HTML source instead of committing a binary .xlsx.",
  ],
  benefits: [
    ["Every sheet, individually", "The sidebar lists all worksheet names from the workbook so you convert the tab you actually want, not just the first one."],
    ["Preview and source side by side", "Toggle between the rendered table in a live iframe and the exact HTML you are about to copy, so there are no surprises after paste."],
    ["Styling already included", "The download is a full HTML5 document with embedded CSS — sticky headers, alternating row shading, horizontal scroll container — not a bare tag soup you have to style yourself."],
  ],
  faqs: [
    [
      "Does it convert all sheets at once?",
      "No — it converts one worksheet at a time, but every sheet in the workbook is listed and switching between them is one click. Each conversion downloads as its own file named after the source file plus the sheet name, for example budget-Q3.html.",
    ],
    [
      "What file types can I upload?",
      "XLSX, XLS and CSV. The file is read as an array buffer and parsed in the page, so nothing is uploaded to a server; if the workbook is corrupt or in an unsupported format you get a parse error rather than a broken table.",
    ],
    [
      "Do formulas come through as formulas?",
      "No — the converter renders the cached cell values, not the formula expressions, because HTML tables have no calculation layer. A cell containing =SUM(A1:A10) appears as its computed number.",
    ],
    [
      "Can I use the HTML in an email newsletter?",
      "You can, but move the styles inline first. The generated file puts CSS in a <style> block in the <head>, and several email clients strip head styles, so run the markup through an inliner or copy just the <table> element and add your own inline attributes.",
    ],
  ],
};

export default seo;
