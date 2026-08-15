const seo = {
  title: "Spreadsheet Formula Prompt Builder for Excel & Sheets",
  metaDescription:
    "Turn a pasted header row into real A1 column letters and bounded ranges, then build an AI prompt tied to Excel 365, 2019, Sheets or Calc.",
  steps: [
    "Paste your header row into 'Header row — paste it, tab or comma separated'; it splits on tabs, commas or pipes and reads only the first non-empty line.",
    "Set 'Header is on row' and 'Last row with data', then pick the Application (Excel 365/2021, Excel 2019/2016, Google Sheets or LibreOffice Calc) and the Argument separator.",
    "Read the generated prompt with each header mapped to its real column letter and bounded range, then press 'Copy prompt' and paste it into your AI assistant.",
  ],
  intro:
    "The Spreadsheet Formula Prompt Builder turns a pasted header row into real A1-style column letters and bounded data ranges, then writes an AI prompt that asks for a formula in the dialect of the app you actually use — Excel 365, Excel 2019/2016, Google Sheets or LibreOffice Calc. It exists because most formula answers fail for one of two reasons: the model guesses the wrong column letters, or it hands an Excel 2016 user XLOOKUP. The generated prompt pins down the layout, names the functions your version has, names the ones it does not, and sets the argument separator to a comma or semicolon to match your locale.",
  useCases: [
    "You need a multi-condition SUMIFS across a 30-column export and cannot face counting to work out that the Amount header sits in column AD.",
    "Your workplace is still on Excel 2016 and every answer you get online uses XLOOKUP or FILTER, which return #NAME? the moment you paste them.",
    "You are on a German or French locale where formulas take semicolons, and the comma-separated formulas you keep pasting will not parse at all.",
  ],
  benefits: [
    [
      "Maps headers to correct column letters, past Z",
      "Column indexing uses proper bijective base-26, so the 27th column is AA and the 703rd is AAA — the point where hand-counting reliably goes wrong.",
    ],
    [
      "Blocks functions your version does not have",
      "Each target app carries an explicit unavailable list, so the prompt tells the model outright not to reach for XLOOKUP on Excel 2019 or QUERY outside Google Sheets.",
    ],
    [
      "Demands the edge cases in the answer",
      "The prompt requires a stated result for blank cells, text where a number is expected, no match and division by zero, plus one rejected alternative and why.",
    ],
  ],
  faqs: [
    [
      "Which spreadsheet applications does it support?",
      "Four: Excel 365 / Excel 2021, Excel 2019 / 2016 without dynamic arrays, Google Sheets, and LibreOffice Calc. Each carries its own available and unavailable function lists plus an array-formula note — for example Excel 2019 gets told to use INDEX/MATCH and CTRL+SHIFT+ENTER, while Excel 365 is told its dynamic arrays spill on their own.",
    ],
    [
      "Should I use a comma or a semicolon between arguments?",
      "It depends on your file's locale, not your application. Comma in en-US and most English locales; semicolon where the comma is the decimal mark, such as de-DE, fr-FR and es-ES. Pick the one your existing formulas use and the prompt will require it throughout.",
    ],
    [
      "How do I paste my headers?",
      "Copy the header row straight out of the sheet — it splits on tabs, commas or pipes, and only the first non-empty line is read. You can map up to 200 columns and a last data row of up to 5,000,000, which covers any real spreadsheet.",
    ],
    [
      "Does it write the formula for me?",
      "No — it writes the prompt. You paste that into the AI assistant of your choice, and it comes back with the formula, the cell to put it in, a clause-by-clause explanation and the edge-case behaviour. The builder also estimates the prompt's length in characters, words and approximate tokens at about four characters per token.",
    ],
  ],
};

export default seo;
