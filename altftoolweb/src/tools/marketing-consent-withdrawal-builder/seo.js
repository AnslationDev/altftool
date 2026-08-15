const seo = {
  title: "Marketing Consent Withdrawal Letter, SMS or Call Script",
  metaDescription:
    "Write an opt-out for email, SMS, phone or letter, citing GDPR Article 7(3), DPDP section 6(6) or CAN-SPAM, plus the date they should have acted by.",
  steps: [
    "Choose \"Sending it by\" — Email, SMS / text reply, Phone call script or Written letter — and \"Rules that apply to you\": EU / EEA (GDPR), United Kingdom (UK GDPR / PECR), India (DPDP Act / TRAI), United States (CAN-SPAM / FCC) or Elsewhere / not sure.",
    "Fill in \"Your name as they hold it\", \"Email or number they contact you on\", Company, an optional Account or customer reference and \"Date you are sending it\", then tick the options you want: tell partners they shared your details with, ask for written confirmation, and delete your details from marketing lists.",
    "\"They should have acted by\" shows the calculated deadline next to rows for Channel, Message length and Escalate to — and, for an SMS, the segment count with its GSM-7 or UCS-2 encoding — while Your message holds the subject and body that Copy message copies.",
  ],
  intro:
    "The Marketing Consent Withdrawal Builder writes the message that stops a company marketing to you, in the form you are actually sending it — email, an SMS reply, a phone script or a letter — and cites the provision that applies where you live: Article 7(3) and Article 21(2) of the GDPR, section 6(6) of India's DPDP Act, or the CAN-SPAM and FCC opt-out rules in the United States. It then calculates the date by which the company should have acted, counting one calendar month for the GDPR and ten business days for a US opt-out, and counts SMS segments so a text reply does not silently split into three billable parts.",
  useCases: [
    "Reply to a retailer that keeps texting months after you unsubscribed from their emails.",
    "Send one written withdrawal covering email, SMS, calls and post instead of clicking four separate unsubscribe links.",
    "Read a prepared script during a marketing call and get a reference number before you hang up.",
    "Record the date a request was sent so you know exactly when it becomes overdue and escalatable.",
  ],
  benefits: [
    [
      "Right citation for your country",
      "GDPR, UK GDPR and PECR, India's DPDP Act with the TRAI preference register, or CAN-SPAM and the FCC.",
    ],
    [
      "A deadline you can hold them to",
      "Calendar-month and business-day arithmetic, so you know the exact date to escalate on.",
    ],
    [
      "Counts SMS segments",
      "GSM-7 and UCS-2 encoding detection with the 160 and 70 character limits, so a text reply does not split unexpectedly.",
    ],
  ],
  faqs: [
    [
      "How do I withdraw consent to marketing emails and texts?",
      "Send a dated written message naming the address or number they hold, stating that you withdraw consent and object to direct marketing, and asking for written confirmation. Keep the copy — the record of when you sent it is what turns a delay into a complaint you can escalate.",
    ],
    [
      "How long does a company have to stop marketing to me?",
      "Under the GDPR the marketing must stop once you object, and the controller has one calendar month to tell you what action it has taken. Under the US CAN-SPAM Act an opt-out must be honoured within ten business days, and the opt-out mechanism must keep working for at least 30 days after the message was sent.",
    ],
    [
      "How do I stop marketing calls in India?",
      "Withdraw consent with the company in writing under section 6(6) of the DPDP Act, and separately register your preference with your telecom operator on 1909 or the operator's DND app; TRAI requires a registered preference to take effect within seven days. The two are different systems, so doing only one leaves the other channel open.",
    ],
    [
      "Why does a company keep my email address after I unsubscribe?",
      "Because a suppression list is how it remembers not to contact you — usually holding your address in hashed form and nothing else. That is different from continuing to market to you, and different again from keeping your full marketing profile; if you want the profile itself deleted, ask for erasure explicitly. This is general information rather than legal advice.",
    ],
  ],
};

export default seo;
