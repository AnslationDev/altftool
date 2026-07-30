const seo = {
  intro:
    "PDF Password Remover decrypts a password-protected PDF in your browser and re-saves it without encryption, producing a copy you can open, print and copy from freely. Drop in the file, type the password if one is required, and download the unlocked PDF. It detects the common case where a PDF has only an owner (permissions) password by attempting decryption with an empty user password, so those files unlock without you typing anything.",
  useCases: [
    "A bank statement arrives encrypted with your date of birth, and you need one clean copy to attach to a mortgage application instead of retyping the password on every open.",
    "A vendor sends a specification PDF locked against text copying, and you need to pull the part numbers out into a spreadsheet.",
    "You are archiving years of payslips into a document store whose search indexer cannot read encrypted files, so each one has to be saved without its password first.",
  ],
  benefits: [
    ["Handles owner-only locks automatically", "Files restricted against copying or printing but openable without a prompt are unlocked with an empty user password, no typing needed."],
    ["Tells you what it found before you act", "It reports the page count and whether the file needs a user password, so you know which kind of protection you are dealing with."],
    ["Honest about unsupported encryption", "AES-256 files are named and refused rather than silently producing a broken output PDF."],
  ],
  faqs: [
    [
      "Do I need the password to remove PDF protection?",
      "Only if the PDF has a user password — the one demanded before the file will open at all. If it has just an owner password restricting printing or copying, decryption is attempted with an empty user password and the file unlocks with no password entered.",
    ],
    [
      "Is my PDF or its password uploaded anywhere?",
      "No. The file is read with the browser's own file APIs, decrypted and re-saved in the page, and the password never leaves the tab. Nothing is transmitted to a server.",
    ],
    [
      "Why does it say AES-256 encryption is not supported?",
      "The decryptor covers the older RC4 and AES-128 handlers used by most protected PDFs, but not AES-256 (the revision introduced with PDF 2.0 and Acrobat X). When that handler is detected the tool stops and says so instead of writing a corrupted file.",
    ],
    [
      "Is it legal to remove a password from a PDF?",
      "Remove protection only from documents you own or have explicit permission to modify — for example your own statements or a file whose sender gave you the password. Stripping protection to bypass someone else's access controls or licensing may breach copyright or computer-misuse law; check with a lawyer if the document is not yours.",
    ],
  ],
};

export default seo;
