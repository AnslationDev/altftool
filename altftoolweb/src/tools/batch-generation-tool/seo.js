const seo = {
  title: "Batch Generation Tool – Make 10,000 SKUs or Codes",
  metaDescription:
    "Expand one pattern like ALT-{00000} into up to 10,000 sequential or random values, then export as batch-data.txt, .csv or .json — all in your browser.",
  intro:
    "The Batch Generation Tool expands one pattern into up to 10,000 finished values at once, filling tokens like {00000}, {N}, {A}, {a}, {R} and {YYYY} on every row. Pick Sequential, Text Pattern, Random or Custom List, set the range, and the output recomputes live as you type — the Generate Data button exists to re-roll the random tokens, not to start a job. It is built for people who keep hand-typing near-identical strings: asset tags, usernames, SKUs, voucher codes, filenames.",
  useCases: [
    "You need 10,000 asset tags numbered ALT-00001 to ALT-10000 — the Sequential type with the ALT-{00000} pattern the tool opens with does the whole run.",
    "A promotion needs a few hundred voucher codes shaped CODE-{A}{N}{N}{N}, so you switch to Random and leave Unique Only on so no two come out the same.",
    "You already have the list: Import List reads a .txt or .csv as one item per line, and Add Prefix and Add Suffix wrap every row without touching the file.",
  ],
  benefits: [
    ["Live results, not a job queue", "Output recomputes on every config change, so the Generated Results panel is never stale; Generate Data only re-rolls the random tokens."],
    ["Duplicates removed on request", "Unique Only dedupes the run after the prefix, suffix and uppercase transforms, and in Random mode it retries to refill collisions instead of shrinking your batch."],
    ["Local by default", "Generation, export and the saved preset all stay in your browser, and the stats strip reports the run's elapsed time and approximate output size."],
  ],
  faqs: [
    [
      "How many items can I generate in one batch?",
      "Up to 10,000 per run. Every mode is hard-capped at that figure, and the results panel prints “Capped at 10,000 items per run.” when a longer range or a longer imported list is trimmed, rather than silently dropping rows.",
    ],
    [
      "What tokens can I use inside a pattern?",
      "{N} for the plain sequence number, a run of zeros like {0000} for a zero-padded one (the width is the number of zeros), {A} and {a} for a random upper- or lowercase letter, {R} for any random alphanumeric character, and {YYYY} for the current year. In Random mode {N} and the zero-padded token produce random digits instead of the sequence. Anything the tool does not recognise is left in place, so a typo stays visible rather than being swallowed.",
    ],
    [
      "Why did I get fewer items than I asked for?",
      "Unique Only is on by default. It removes duplicates after the prefix, suffix and uppercase transforms are applied, so a pattern with no varying token collapses to the handful of distinct values it can actually produce. In Random mode the engine retries to refill those collisions; in the other modes switch Unique Only off to keep every row.",
    ],
    [
      "What formats can I export, and where do the files go?",
      "TXT, CSV or JSON from the Export As menu: batch-data.txt with one value per line, batch-data.csv with index and value columns, or batch-data.json as a JSON array. The Download button saves the TXT directly and Copy All puts every value on the clipboard. Files are assembled in the browser and saved straight to your downloads folder.",
    ],
  ],
  steps: [
    "Under 1. Choose Pattern Type pick Sequential, Text Pattern, Random or Custom List, then fill in 2. Configure Pattern — type the pattern yourself (it starts at ALT-{00000}) or click the {N}, {000}, {A}, {a} and {R} chips to insert a token at the cursor. Custom List replaces the field with a textarea that takes one item per line, or you can load a .txt or .csv with Import List.",
    "Fill in 3. Set Range — Start, End and Step for Sequential, with Total Count filled in for you, or Start and Count for the other types — then set the Add Prefix, Add Suffix, Uppercase and Unique Only switches under 4. Advanced Options and click Generate Data. Results are live as you type and the button re-rolls the random tokens; the Generated Results panel shows the item count, lists the first 100 rows, and warns that it is capped at 10,000 items per run when a run hits the ceiling.",
    "Click Copy All to put every value on the clipboard one per line, Download to save batch-data.txt, or Export As and choose TXT, CSV or JSON to save batch-data.txt, batch-data.csv (index and value columns) or batch-data.json. Clear All empties the pattern and the custom list, and Save Preset stores the current settings in your own browser.",
  ],
};

export default seo;
