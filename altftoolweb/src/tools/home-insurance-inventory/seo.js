const seo = {
  title: "Home Insurance Inventory: Local, Searchable, JSON",
  metaDescription:
    "Log each asset with its serial number and replacement value. Records stay in your browser's local storage and export to a JSON file you can back up.",
  steps: [
    "Type the item into the Asset box and its identifiers into 'Serial number and value' — make, model, serial or IMEI and the cost to replace it new — then press Add record.",
    "Saved records shows the running count, the Search records box filters across both fields as you type, and each card carries a Delete button that asks you to confirm first.",
    "Export JSON downloads the whole inventory as home-insurance-inventory.json; Import JSON loads a saved file back, replacing every record currently held in this browser's local storage.",
  ],
  intro:
    "A home insurance inventory is the itemised list of what you own that an insurer asks for after a fire, flood or burglary, and this tool keeps that list as searchable records in your own browser. Each entry pairs an asset with its serial number and replacement value; records are held in this browser's local storage, never uploaded, and you export the whole set as a JSON file whenever you want a copy off the device. Homeowners and renters get a running schedule of possessions they can search, prune and back up without handing the list to a service.",
  useCases: [
    "Walking room by room after moving in, logging the TV, laptop, appliances and bicycle with model and serial numbers while the boxes and receipts are still to hand",
    "Renewing contents cover and needing a defensible replacement-value total, rather than guessing a sum insured and discovering at claim time that you were underinsured",
    "Filing a burglary claim and being asked for the serial number of the stolen laptop, which you search out of the inventory instead of hunting for the original receipt",
  ],
  benefits: [
    ["The list never leaves your device", "Records live in this browser's local storage, so a schedule of your valuables is not sitting in someone else's database."],
    ["Search across both fields", "Typing a brand, model or serial number filters the whole inventory instantly, which is what you need under claim-time pressure."],
    ["Portable JSON export and import", "One click writes the inventory to a JSON file you can store in a safe, on a backup drive or off-site, and import back on another machine."],
  ],
  faqs: [
    [
      "Where is my inventory stored?",
      "In this browser's local storage, under a key specific to this tool, and nowhere else. Nothing is sent to a server, which also means clearing site data, using private browsing or switching to a different browser or device will lose the list — so export the JSON and keep that copy somewhere off the device.",
    ],
    [
      "What should I record for each item?",
      "At minimum the make, model, serial or IMEI number, the purchase date and what it would cost to replace new today. Insurers settle contents claims on either replacement cost or actual cash value after depreciation, and the serial number is what makes a claim on electronics or bicycles straightforward to verify.",
    ],
    [
      "Can I attach photos or receipts?",
      "Not inside the tool — records are text, so store photos and receipt scans in a folder or safe and reference the filename in the record. That keeps the exported JSON small and lets you back up the images with whatever you already use, rather than embedding megabytes of pictures in local storage.",
    ],
    [
      "Does this replace my insurer's own inventory form?",
      "No. It is a working record you keep for yourself; policies differ on what evidence they require and on limits for single high-value items such as jewellery or art, which often need separate scheduling. Check your policy wording or ask your insurer or broker before assuming an item is covered at the value you entered.",
    ],
  ],
};

export default seo;
