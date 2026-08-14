const seo = {
  title: "Family Emergency Contact Tree With Call Priority",
  metaDescription:
    "Turn one pipe-separated line per contact into a printable seven-column tree — priority, backup number, responsibility — and count the unfinished rows.",
  steps: [
    "In Records (one per line), type one contact per line with the seven fields separated by a pipe: Priority | Person / service | Relationship / role | Primary contact | Backup contact | Responsibility | Offline note.",
    "Leave Require complete rows ticked so Flag missing columns counts every line with a blank field, or load the Example records preset to see the layout first.",
    "The Structured inventory panel reports Complete rows, Needs review and Columns above the table of the first 100 records; Copy puts it on the clipboard and Download saves family-emergency-contact-tree.txt.",
  ],
  intro:
    "The Family Emergency Contact Tree turns one pipe-separated line per contact into a structured seven-column table — Priority, Person or service, Relationship or role, Primary contact, Backup contact, Responsibility and Offline note — and counts how many rows are complete versus how many are missing a column. Type or paste your household's call list, leave the completeness check on, and you get a printable tree plus a count of the rows that still need filling in. It is for families, carers and flat-shares who want one agreed order of who is called first and who does what, in a form that still works when the phone is dead.",
  useCases: [
    "You are putting a single sheet on the fridge before a trip so the sitter knows the order to call: you first, then the neighbour with the spare key, then the GP, each with a backup number and one line saying what that person is responsible for.",
    "An elderly parent has moved in and three siblings keep duplicating calls, so you set priority 1 to the sibling who lives nearest, priority 2 to the clinic, and write the responsibility column so everyone knows who handles medication questions.",
    "Your workplace asks for a home emergency plan and you want to check nothing is half-finished, so you turn on the completeness flag and fix every row the tool reports as needing review before printing.",
  ],
  benefits: [
    ["Priority order, not a flat list", "The first column forces you to decide who is called first and second, which is the decision people skip and then argue about in the moment."],
    ["Completeness check built in", "Toggling the flag counts rows with a blank or missing column, so a contact with no backup number is caught before the sheet goes on the wall."],
    ["Backup and responsibility columns", "Every entry carries a second contact route and a stated job, so the tree survives one unreachable person."],
  ],
  faqs: [
    [
      "What format do I type the contacts in?",
      "One record per line with the seven fields separated by a pipe character: Priority | Person / service | Relationship / role | Primary contact | Backup contact | Responsibility | Offline note. Any field you leave short is shown as a dash and counted as an incomplete row.",
    ],
    [
      "How many contacts can I list?",
      "You can enter as many lines as you like, and the rendered table shows the first 100 rows. The completeness counts cover every line you entered, not just the displayed ones.",
    ],
    [
      "Who should be first on a family emergency contact list?",
      "Put the person who can physically reach the household fastest at priority 1, not necessarily the closest relative. A neighbour five minutes away is more useful in the first hour than a sibling in another city, so many families set the local contact first and next of kin second.",
    ],
    [
      "Should I include medical details or account passwords in the tree?",
      "No. Keep the tree to names, roles, numbers and responsibilities; it is meant to be printed and left visible, so passwords, account numbers and detailed medical notes belong in a sealed or password-protected document referenced by the offline note column instead.",
    ],
  ],
};

export default seo;
