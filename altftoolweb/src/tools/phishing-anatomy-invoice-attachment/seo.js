const seo = {
  title: "Invoice Attachment Phishing Anatomy: Score",
  metaDescription:
    "Paste an invoice email's file name, From, Reply-To and body for a red-flag score out of 100 naming double extensions and macro lures.",
  steps: [
    "Enter the Attachment file name (for example Invoice_4417.pdf.lnk), the From address, any Reply-To address and the Supplier domain you expect.",
    "Add the Subject line and paste the Message body, then read the Red-flag score out of 100 and the band beneath it.",
    "Check the File name with formatting tricks removed row and the listed findings, then press Copy result to record why the invoice was held.",
  ],
  intro:
    "This tool takes apart a suspicious invoice email and names the specific trick each part is using — a double extension such as Invoice.pdf.lnk, a Unicode right-to-left override that reverses the visible file name, a password in the body that stops your gateway scanning the archive, or a Reply-To on a different domain from the From. It scores what you paste against the attachment classes Microsoft blocks in Outlook and the wording used to talk people into clicking Enable Content, then lists the verification steps that actually settle the question. Everything runs in your browser; nothing is uploaded.",
  useCases: [
    "An accounts-payable inbox receives an overdue invoice for a purchase order nobody recognises, and you need to explain to the requester exactly why it is being held.",
    "A colleague forwards an attachment called Statement.pdf.lnk and asks whether it is safe to open.",
    "A supplier appears to email new bank details mid-thread, and you need a written record of the red flags before the payment run.",
    "Security awareness training where staff need a concrete teardown of a real invoice lure rather than a generic 'be careful' slide.",
  ],
  benefits: [
    ["Names the actual trick", "Every finding says which technique is in play — double extension, bidi override, HTML smuggling, password-protected archive — not just a risk colour."],
    ["Catches the payment swap", "Bank-change wording is flagged even when there is no malware at all, which is how most invoice fraud actually loses money."],
    ["Nothing leaves the browser", "The file name, addresses and body you paste are analysed locally, so a live phishing message is never forwarded anywhere new."],
  ],
  faqs: [
    [
      "How can I tell if an invoice attachment is a virus?",
      "Look at the final extension, not the icon. Anything ending .exe, .scr, .js, .vbs, .lnk, .hta, .iso or a macro-enabled Office type (.docm, .xlsm, .xlsb) executes code and has no business being an invoice. Windows hides known extensions by default, so Invoice.pdf.lnk is displayed as Invoice.pdf — check the full name in the attachment properties.",
    ],
    [
      "Why does the email tell me to click Enable Content or Enable Editing?",
      "Because Office blocks macros in files that came from the internet. Since 2022 Microsoft blocks VBA macros by default in documents carrying the Mark of the Web, so the only way the payload runs is if you disable that protection yourself. A legitimate invoice never needs macros enabled.",
    ],
    [
      "Is a password-protected ZIP in an email a bad sign?",
      "Yes, when the password is printed in the same email. Encryption stops your mail gateway and antivirus opening the archive to scan it, which is the entire point of sending it that way. Genuine encrypted files are shared with a password sent over a different channel and agreed in advance.",
    ],
    [
      "The invoice came from my supplier's real address — can it still be fake?",
      "Yes. The From header is free text and can be forged unless the sending domain publishes an enforcing DMARC policy, and a supplier's mailbox can also be compromised outright so the mail is genuinely theirs. Treat any change of bank details as a separate request and confirm it by calling a number from your own records, not one in the email. This is general guidance — follow your organisation's own payment controls.",
    ],
  ],
};

export default seo;
