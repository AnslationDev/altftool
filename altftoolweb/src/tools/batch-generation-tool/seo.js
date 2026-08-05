const seo = {
  intro:
    "The Batch Generation Tool turns one template plus a set of named variables into up to 500 finished text outputs at once, expanding tokens like {batch}, {index}, {category} and {seed} on every row. It is built for people who keep rewriting the same block of copy with small changes — product blurbs, ticket bodies, filenames, caption variants — and want the whole run produced, validated and exported in one pass. Outputs only unlock for export once the batch clears validation, so an incomplete field cannot slip into a downloaded file.",
  useCases: [
    "You need 120 product description stubs for a catalogue upload, all following the same sentence structure but swapping title, category and a sequence number.",
    "A launch checklist needs 40 identically formatted task titles like launch-may-007 — you set the naming pattern to {batch}-{index} and let the padding work itself out.",
    "You wrote a template for internal release notes last quarter and want it back exactly as it was, so you reload it from the saved template list instead of rebuilding the fields.",
  ],
  benefits: [
    ["Validation before export", "ZIP, CSV and TXT stay locked until every required field, unique variable key and quantity check passes."],
    ["Reusable workflows, not one-off runs", "Templates and completed batches are stored locally so a monthly job is a reload, not a rebuild."],
    ["Live preview of the real output", "The first rows render with your actual variable values as you type, before you commit to generating the full run."],
  ],
  faqs: [
    [
      "How many items can I generate in one batch?",
      "Up to 500 items per batch. Quantity is validated on every change and anything below 1 or above 500 blocks generation with a message rather than silently truncating your run.",
    ],
    [
      "What variables can I use inside a template?",
      "Six built-in tokens — {batch}, {index}, {type}, {category}, {purpose} and {seed} — plus any custom variable key you add as a dynamic field. Keys are normalised to lowercase with underscores, and duplicate keys are rejected because two fields writing to the same token would make the output ambiguous.",
    ],
    [
      "Why is the export button disabled?",
      "Export unlocks only after validation passes and no output in the queue is marked failed. The validation panel lists the exact blockers, usually a missing batch name, type, category, purpose or template body, or a required dynamic field left empty.",
    ],
    [
      "What formats can I export, and where do the files go?",
      "ZIP, CSV or TXT. The ZIP contains one text file per item plus a manifest.json describing the run; the CSV uses the columns index, title, type, category, status and content. Files are assembled in the browser and saved straight to your downloads folder.",
    ],
  ],
  steps: [
    "Under 1. Choose Pattern Type pick Sequential, Text Pattern, Random or Custom List, then fill in 2. Configure Pattern — type the pattern yourself (it starts at ALT-{00000}) or click the {N}, {000}, {A}, {a} and {R} chips to insert a token at the cursor. Custom List replaces the field with a textarea that takes one item per line, or you can load a .txt or .csv with Import List.",
    "Fill in 3. Set Range — Start, End and Step for Sequential, with Total Count filled in for you, or Start and Count for the other types — then set the Add Prefix, Add Suffix, Uppercase and Unique Only switches under 4. Advanced Options and click Generate Data. Results are live as you type and the button re-rolls the random tokens; the Generated Results panel shows the item count, lists the first 100 rows, and warns that it is capped at 10,000 items per run when a run hits the ceiling.",
    "Click Copy All to put every value on the clipboard one per line, Download to save batch-data.txt, or Export As and choose TXT, CSV or JSON to save batch-data.txt, batch-data.csv (index and value columns) or batch-data.json. Clear All empties the pattern and the custom list, and Save Preset stores the current settings in your own browser.",
  ],
};

export default seo;
