const seo = {
  title: "Unlock PDF in Your Browser: Remove Known Password",
  metaDescription:
    "Enter the password you already have and download a decrypted copy — RC4 40/128-bit and AES-256, files up to 100 MB, nothing uploaded.",
  steps: [
    "Choose the password-protected PDF (up to 100 MB; RC4 40/128-bit and AES-256 supported) and type the user or owner password that opens it.",
    "Click Remove password — the file is decrypted in the browser tab, so neither the PDF nor the password is uploaded anywhere.",
    "Click Download unlocked PDF to save the copy named <original>-unlocked.pdf, or Copy summary for the algorithm removed, page count and output size.",
  ],
  intro:
    "Unlock PDF removes the encryption from a password-protected PDF you can already open, producing a copy with no password on it. It decrypts the document using the standard security handler defined in ISO 32000 — RC4 40-bit and 128-bit for older files, AES-256 for PDF 2.0 files — and accepts either the user password or the owner password, exactly as the specification requires. Everything runs in your browser, so the file and the password are never uploaded.",
  useCases: [
    "Strip the password from a bank or salary statement so it opens without retyping a date of birth every time.",
    "Prepare an encrypted contract for a workflow that cannot handle password-protected PDFs.",
    "Make an AES-256 protected report searchable in a local document index that refuses encrypted files.",
  ],
  benefits: [
    ["Runs entirely offline", "The PDF and the password stay in the browser tab; nothing is uploaded to a server."],
    ["Both password types accepted", "Works with the user password or the owner password, and reports which algorithm was in use."],
    ["Original quality kept", "Only the encryption layer is removed — pages, text, fonts and images are untouched."],
  ],
  faqs: [
    [
      "Can this tool open a PDF if I do not know the password?",
      "No. Without the correct password the file encryption key cannot be derived at all, so there is nothing to decrypt. This tool removes protection from files you can already open; it does not guess, crack or recover passwords.",
    ],
    [
      "Which PDF encryption types are supported?",
      "RC4 40-bit and 128-bit (encryption versions 1 and 2, revisions 2 and 3) and AES-256 (version 5, revision 6, the PDF 2.0 standard). Files using a custom or third-party security handler cannot be unlocked here.",
    ],
    [
      "What is the difference between a user password and an owner password?",
      "The user password is needed to open the document; the owner password controls permissions such as printing and copying. The standard security handler accepts either one to decrypt, so entering whichever you have is enough.",
    ],
    [
      "Is my file uploaded anywhere?",
      "No. The PDF is read into the browser tab with the File API and decrypted there using the Web Crypto API, so neither the document nor the password is sent over the network. Closing the tab discards both.",
    ],
  ],
};

export default seo;
