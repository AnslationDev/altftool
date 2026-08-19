const seo = {
  title: "Warranty & Receipt Tracker Saved in Your Browser",
  metaDescription:
    "Log each purchase as an Item plus warranty and receipt details, search every field, and export the lot to warranty-receipt-vault.json. Not encrypted.",
  steps: [
    "Type the product into Item and its serial number, seller, purchase date and cover expiry into Warranty and receipt details.",
    "Press Add record to save it to this browser's localStorage, then use Search records to match text in either field later.",
    "Press Export JSON for a warranty-receipt-vault.json copy, or Import JSON to load one back after confirming it replaces every record saved here.",
  ],
  intro:
    "The Warranty & Receipt Vault is a local record keeper for the purchase details you only need once, at the worst moment: each entry has an Item field and a free-text field for warranty and receipt details such as serial number, seller, purchase date and cover expiry. Records are saved in your browser's own localStorage, searchable across every field, and exportable to a JSON file you can back up or move to another device. It stores what you type — it does not verify warranty terms or remind you when cover ends.",
  useCases: [
    "Your washing machine fails eighteen months in and you need the serial number, the date of purchase and the length of cover — you search 'washing' and it is all in one record instead of in a shoebox.",
    "You have just moved into a new place and want one list of every appliance, with its model number and warranty end date typed into the same details field, built up as you unpack rather than reconstructed later.",
    "You are handing a laptop over to a family member and want to pass on the receipt details with it: Export JSON writes the whole vault to warranty-receipt-vault.json, so you copy that one entry out of the file before pressing Delete on your own copy.",
  ],
  benefits: [
    ["Search across everything you typed", "The filter matches text in any field, so a serial number, a shop name or a model number all find the same record."],
    ["Portable through plain JSON", "Export JSON saves the whole vault as an indented warranty-receipt-vault.json you can read in any editor, and Import JSON reads one back after warning you that it replaces every record currently saved here."],
    ["Nothing leaves the page", "Records are written only to this browser's localStorage — there is no account to create and nothing is transmitted to a server."],
  ],
  faqs: [
    [
      "Where is my data stored?",
      "In your browser's localStorage, under the key altftool-private-records:warranty-receipt-vault. That means it is tied to this browser on this device and this site origin — it does not sync to your phone, and another browser on the same computer will show an empty vault.",
    ],
    [
      "Is the vault encrypted or password protected?",
      "No. Despite the name it is a local store, not an encrypted one — anyone with access to your unlocked device and this browser profile can open the page and read the entries. Keep card numbers and other high-value secrets in a proper password manager, and store only what you need for a warranty claim here.",
    ],
    [
      "Will it remind me before a warranty expires?",
      "No — there are no notifications or date calculations. Expiry dates are stored as text you type into the details field, so put the date in a format you can search for and set your own calendar reminder for anything that matters.",
    ],
    [
      "What happens if I clear my browser data?",
      "Everything is gone, permanently. Clearing site data, using private browsing, or a browser that evicts storage will remove the records with no recovery, so export the JSON periodically and keep the file somewhere you actually back up.",
    ],
  ],
};

export default seo;
