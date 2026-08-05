const seo = {
  intro:
    "Data Lens profiles a CSV the way a data scientist opens one: it infers each column as numeric, date or categorical, then reports missing counts, exact duplicate rows, per-column min/max/mean/median/standard deviation and skew, IQR outliers using the standard 1.5 × IQR fences, a 20-bin histogram, and a Pearson correlation for every pair of numeric columns. It raises warnings for the things that quietly ruin an analysis — constant columns, all-unique ID columns, over 80% missing, correlations above 0.9 — and offers one-click cleaning steps you can export back out as CSV. It is for anyone who has just been handed a spreadsheet and needs to know what is wrong with it before building anything on top.",
  useCases: [
    "A colleague sends an export and you need to know, in under a minute, how many rows are duplicated and which columns are mostly empty before you trust any total",
    "You are about to fit a model and want to spot two features correlated above 0.9, plus any column that is really an ID, so you can drop them first",
    "A survey export has ragged headers, stray whitespace and the literal string None scattered through it, and you want a clean CSV back rather than doing find-and-replace by hand",
  ],
  benefits: [
    ["Every column profiled by its actual type", "Numeric columns get distribution stats and outlier fences, categoricals get their top 10 values by frequency, dates get a chronological-order check."],
    ["Warnings that name the specific column", "Constant columns, all-unique likely IDs, over-80% missing, more than 5% outliers and near-duplicate feature pairs are each called out by name and number."],
    ["Cleaning you can inspect then export", "Normalise headers, trim values, drop low-quality columns, dedupe, and fill numeric gaps with the median or categorical gaps with the mode — then download the result as CSV."],
  ],
  faqs: [
    [
      "What file types can I upload?",
      "CSV files, parsed in the browser with a streaming parser so a large file does not have to be read into memory at once. Nothing is uploaded to a server — the file is read from your machine, profiled locally, and any cleaned output is downloaded straight back to you.",
    ],
    [
      "How does it decide which values are outliers?",
      "By the interquartile-range rule: it computes Q1 and Q3, takes IQR = Q3 − Q1, and treats anything below Q1 − 1.5 × IQR or above Q3 + 1.5 × IQR as an outlier. If more than 5% of a column's values fall outside those fences, the column is flagged in the warnings so you can decide whether they are errors or real extremes.",
    ],
    [
      "How are column types detected?",
      "A column is numeric only if every non-empty value parses as a finite number once commas are stripped; otherwise, if at least 80% of values parse as dates it is treated as a date column; everything else is categorical. That means a mostly-numeric column with one stray text entry will be read as categorical, which is usually a signal worth investigating.",
    ],
    [
      "What do the missing-value fills actually do?",
      "Median imputation for numeric columns and mode (most frequent value) for categorical ones, applied only to blank, null or undefined cells. Both change your data's distribution — median filling shrinks variance and mode filling inflates the most common category — so use them for a quick pass and consider whether the missingness itself carries information before relying on the filled version.",
    ],
  ],
  steps: [
    "Under Upload CSV File, click Browse Files and choose a .csv — the picker accepts only that extension and anything else is refused with \"Please select a CSV file\". The filename then replaces the No file selected line, and the ✕ beside it clears the choice.",
    "Click Analyse CSV. The button changes to Analysing… with a running percentage while the file is parsed, then the Profile, Clean and Visual Builder tabs appear. Profile opens on Dataset Overview with Rows, Columns, Missing Cells and Duplicate Rows, followed by per-column Missing, Min, Max, Mean, Median, Std Dev, Outliers and Unique figures.",
    "On the Clean tab tick the operations you want — Remove duplicate rows, Fill missing numbers with median, Drop low-quality columns (constant / >80% missing), Normalize column names (lowercase, underscores) and the rest — click Preview to see the first 10 rows of the result, then Apply to dataset to keep it or Download CSV to save it as datlens_cleaned.csv.",
  ],
};

export default seo;
