const seo = {
  title: "Marketing Opt-Out Letter: GDPR Art. 21(2) Objection",
  metaDescription:
    "Pick the channels and the applicable law; the letter cites GDPR Art. 21(2) and dates each stop — immediate under GDPR, 10 business days under CAN-SPAM.",
  steps: [
    "Enter your details and the sender's, set Applicable law to EU GDPR, UK GDPR + PECR, India DPDP Act + TRAI TCCCP or United States CAN-SPAM / TCPA, and the send date.",
    "Tick the entries under Channels to stop such as Marketing email or SMS, and leave Add me to your suppression list (recommended) selected instead of erasure.",
    "Deadline per channel dates each stop and the Objection letter is drafted below it; press Copy request.",
  ],
  intro:
    "The Marketing Opt-Out Request Generator writes an objection to direct marketing under GDPR Article 21(2), which is an absolute right with no balancing test and no fee, and works out the date the sender must stop on each channel. It applies the real per-regime deadlines: immediate under GDPR Art. 21(3), 10 business days under CAN-SPAM 15 U.S.C. s.7704(a)(4), and 7 days for a TRAI preference registration in India. It also defaults to suppression rather than erasure, because a deleted record is what lets a company put you back on the list after the next data import.",
  useCases: [
    "Stop a retailer's email and SMS campaigns in one letter while keeping order confirmations and delivery updates running.",
    "Object to marketing calls and ask which partners your number was shared with, so you can send the same objection to them.",
    "Set a documented date for a US sender's 10-business-day CAN-SPAM deadline so continued emails are clearly a violation.",
  ],
  benefits: [
    ["Per-channel deadlines", "Each channel gets the date that channel's law actually gives the sender, not one generic figure."],
    ["Suppression by default", "Asks to be added to a suppression list, which is what stops a future import undoing the opt-out."],
    ["Service messages preserved", "The wording separates marketing from transactional messages so you do not lose delivery or security notices."],
  ],
  faqs: [
    [
      "How do I legally stop a company sending me marketing?",
      "Send a written objection citing GDPR Article 21(2). The right to object to direct marketing is absolute: there is no balancing test, no exemption and no fee, and Article 21(3) requires the controller to stop processing for that purpose as soon as it receives the objection. Keep proof of the date you sent it.",
    ],
    [
      "How long does a company have to stop marketing after I opt out?",
      "Under GDPR there is no grace period at all — processing for direct marketing must stop on receipt, though the controller still has one calendar month under Article 12(3) to confirm what it did. In the United States, CAN-SPAM allows up to 10 business days, and in India a TRAI preference registration takes effect within 7 days.",
    ],
    [
      "Should I ask a company to delete my data or just to stop marketing?",
      "Ask for suppression, not deletion, if your goal is to stop the marketing. A suppression list keeps the minimum data needed to recognise you and block future campaigns; if the record is erased entirely, the next purchased list or CRM import can add you straight back and the company has nothing to check against. Regulators including the ICO expect suppression lists to be kept for exactly this reason.",
    ],
    [
      "Can I stop marketing without losing order confirmations?",
      "Yes. An objection to direct marketing covers marketing only. Transactional and service messages — order confirmations, delivery notices, security alerts, product recalls and statutory notices — are processed for a different purpose and continue. Say so explicitly in the letter so the sender does not over-apply the opt-out. This is informational guidance, not legal advice.",
    ],
  ],
};

export default seo;
