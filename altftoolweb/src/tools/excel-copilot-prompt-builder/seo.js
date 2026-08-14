const seo = {
  title: "Excel Copilot Prompt Builder With A1 Range Checks",
  metaDescription:
    "Builds a Copilot prompt naming the worksheet, A1 range, header row and each column letter. Rejects ranges past column XFD or row 1,048,576.",
  steps: [
    "Enter the Sheet name, A1 range, Header row and Column headers, and tick 'Range is an Excel table' if you formatted it with Ctrl+T.",
    "Pick a Task and Output target; a range past column XFD or row 1,048,576 is rejected with an error instead of a prompt.",
    "Check the normalised range, the data-row count and the header count above the Copilot-ready prompt, then press Copy prompt.",
  ],
  intro:
    "Excel Copilot Prompt Builder assembles a spreadsheet-assistant prompt that names the exact worksheet, the A1 range, the header row and every column letter, so Copilot works on the cells you meant rather than guessing. The range you type is validated against the .xlsx worksheet grid — 1,048,576 rows and 16,384 columns ending at XFD — and the tool counts rows, data rows and total cells before it writes the prompt. It is for anyone whose Copilot answers keep referencing columns that do not exist or silently skipping part of the data.",
  useCases: [
    "Turn a vague request like 'find the outliers' into a prompt that specifies Sheet 'Sales', range A1:F250, header row 1 and all six column names.",
    "Get a PivotTable design prompt that uses only your real field names, so Copilot stops inventing a 'Category' column your sheet never had.",
    "Check before you paste whether the range you selected is 400 cells or 800,000 — and narrow it if a single request is covering too much.",
    "Hand a colleague a reusable prompt for the monthly cleanup pass instead of re-explaining the sheet layout every time.",
  ],
  benefits: [
    ["Grid limits checked", "Rejects ranges past column XFD or row 1,048,576 before you waste a Copilot turn on them."],
    ["Real column map", "Pairs each header you list with the column letter it sits in, so references cannot drift."],
    ["Nothing leaves the browser", "The prompt is assembled locally; no cell values are typed in or sent anywhere."],
  ],
  faqs: [
    [
      "How do I write a good Excel Copilot prompt?",
      "Name the worksheet, give the range in A1 notation, say which row holds the headers, list the column names, and state one specific outcome. Copilot has no reliable way to infer which of several tables on a sheet you mean, so an unnamed range is the single most common cause of an answer that looks right but reads the wrong cells.",
    ],
    [
      "Why does Copilot say my data needs to be in a table?",
      "Several Copilot analysis features in Excel require the data to be formatted as an Excel table, which you create by selecting the range and pressing Ctrl+T. A table gives the range a name and stable structured references such as SalesData[Revenue], so formulas keep pointing at the right column when rows are added.",
    ],
    [
      "What are Excel's row and column limits?",
      "A worksheet in the .xlsx format holds 1,048,576 rows and 16,384 columns, the last column being XFD, and a single formula is capped at 8,192 characters. Worksheet names are limited to 31 characters and cannot contain : \\ / ? * [ or ].",
    ],
    [
      "Does this tool send my spreadsheet anywhere?",
      "No. You type a sheet name, a range and your column headers — never the cell values — and the prompt is built entirely in your browser. Copy the result and paste it into Copilot yourself, which also means you can review the wording before anything touches your workbook.",
    ],
  ],
};

export default seo;
