const seo = {
  intro:
    "Fake Data generates batches of realistic-looking but entirely invented test records — name, email, phone, password, address, IP, country, gender, age, job title and company — with each field synthesised at random from its own built-in pool of sample values. Pick which of the eleven fields you want, choose how many records to build (1 to 500), and generate a table you can copy as tab-separated rows or download as a JSON array. It is for developers, QA testers and analysts who need placeholder rows that look plausible in a UI without ever touching real customer data.",
  useCases: [
    "You have built a customer list screen and it looks fine with three hand-typed rows, so you generate 200 records with name, email, company and job title to see how the table, pagination and column truncation behave under real width.",
    "A bug report needs a reproducible dataset, so you export a 50-record JSON file of names, emails and IP addresses and attach it to the ticket instead of a sanitised dump from production.",
    "You are demoing a dashboard to a client next week and need screenshots that show populated rows, so you generate records with country, age and gender fields and paste the tab-separated output straight into a spreadsheet.",
  ],
  benefits: [
    ["Field-by-field control", "Toggle any of the eleven fields on or off, so the output has exactly the columns your schema expects and nothing else."],
    ["Two export shapes", "Copy the table as tab-separated text that pastes cleanly into Sheets or Excel, or download the same records as a formatted JSON array."],
    ["Mixed international samples", "Names, cities, phone formats and postcodes are drawn from Indian, US, UK, Australian and other pools, so test data is not all one locale."],
  ],
  faqs: [
    [
      "How many fake records can I generate at once?",
      "Up to 500 records per run, with a minimum of 1. Each record gets a sequential id starting at 1, plus whichever of the eleven fields you have selected.",
    ],
    [
      "Is the generated data based on real people?",
      "No. Every value is assembled at random from fixed sample lists built into the tool — first and last names, email domains, street and city names, job titles and company word pairs — so any resemblance to a real person or address is coincidence, not lookup.",
    ],
    [
      "Can I export the fake data as JSON or CSV?",
      "JSON download and tab-separated copy are both built in. The download produces a fake-data.json file containing the full record array; the table copy button puts headers and rows on the clipboard separated by tabs, which spreadsheets read as columns.",
    ],
    [
      "Are the generated passwords safe to use for real accounts?",
      "No — treat them as test strings only. Each one is guaranteed to include at least one uppercase letter, one lowercase letter, one digit and one symbol at roughly 10 to 14 characters, but it is produced by Math.random rather than a cryptographic generator, so use a dedicated password manager for anything real.",
    ],
  ],
};

export default seo;
