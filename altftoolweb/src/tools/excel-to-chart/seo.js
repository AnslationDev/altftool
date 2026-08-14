const seo = {
  title: "Excel to Chart: XLSX, XLS, CSV to PNG or SVG",
  metaDescription:
    "Drop an .xlsx, .xls or .csv file and get a bar, line, area, pie, radar or scatter chart with axes pre-picked, then export PNG or true vector SVG.",
  steps: [
    "Drop a spreadsheet on Drag & drop spreadsheet data here or press Browse Files; the picker accepts .xlsx, .xls and .csv up to 10MB.",
    "In Chart Configuration switch Worksheet to another sheet in the workbook, change the X-Axis Column and the numeric series, and set the chart type, Title and Palette — Clear Data starts over with a different file.",
    "Press PNG or SVG to export the chart under its slugged title, for example monthly-sales.svg, or JSON Data to copy the parsed rows.",
  ],
  intro:
    "This converter reads an .xlsx, .xls or .csv file in your browser, inspects the first rows of each column to decide which are text and which are numeric, and plots the result as a bar, line, area, pie, radar or scatter chart with the axes pre-selected for you. Excel serial date numbers in date-named columns are converted back to readable dates, every sheet in a workbook is selectable, and the finished chart exports as a PNG raster or a true SVG vector. It is for anyone who has a spreadsheet and wants a presentable chart without opening Excel or a BI tool.",
  useCases: [
    "You have been sent a monthly sales workbook and need one clean chart for a slide, without rebuilding the data in another app",
    "A CSV export from an analytics dashboard has dates stored as Excel serial numbers like 45678, and you want them plotted as dates rather than as five-digit values",
    "Producing a chart for print or for a design file, where a scalable SVG is needed rather than a screenshot",
  ],
  benefits: [
    ["Axes guessed before you touch anything", "Columns are sampled and classified as numeric or text, so the first text column becomes the X axis and the numeric columns become series — a chart appears immediately."],
    ["Whole workbooks, not one sheet", "Every sheet in an .xlsx or .xls file is parsed and switchable, with headers and axis mapping recalculated when you change sheets."],
    ["Vector as well as raster export", "PNG is rendered from the live chart with a theme-matched background, and SVG is serialised from the chart's own vector nodes so it stays sharp at any size."],
  ],
  faqs: [
    [
      "Which file formats can I upload?",
      "Three: .xlsx, .xls and .csv. Excel workbooks are parsed sheet by sheet, and CSVs are parsed with headers from the first row and type detection on the values, so numbers arrive as numbers rather than text.",
    ],
    [
      "Why do my dates show as numbers like 45678?",
      "Because Excel stores dates as serial numbers counted from 1899-12-30, and a plain export loses the formatting. Values between 30000 and 60000 in a column whose header contains date, month, year, time or day are converted back to a readable date automatically; rename the column header if a date column is being missed.",
    ],
    [
      "Which chart types are available?",
      "Six — bar, line, area, pie, radar and scatter — with four colour palettes, optional stacking for bar and area charts with more than one series, a smooth-curve toggle for line charts, and grid and legend switches.",
    ],
    [
      "Should I export PNG or SVG?",
      "SVG for anything that will be resized, printed or edited afterwards, since it stays sharp and its elements remain editable in a vector program. PNG is the safer choice for pasting into email, chat or a slide deck where SVG support is patchy.",
    ],
  ],
};

export default seo;
