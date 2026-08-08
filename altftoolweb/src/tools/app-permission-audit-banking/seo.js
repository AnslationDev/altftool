const seo = {
  title: "Banking App Permission Audit: What to Revoke Now",
  metaDescription:
    "Check which permissions a bank or wallet app really needs. SMS, accessibility, overlays and notification access are flagged as red flags to revoke.",
  steps: [
    "Type the bank, wallet or lending app into the App name box.",
    "Tick every permission the app currently holds across the three groups — Needed for the app to do its job, Only needed for one feature, and A bank has no business asking — or press Keep only core permissions to start from a safe baseline.",
    "Read the Risk score out of 100 and the Revoke first list, which names the safer alternative for each grant, then press Copy audit.",
  ],
  intro:
    "The Banking App Permission Audit checks a bank, wallet or lending app against the permissions it genuinely needs: transaction notifications, biometric unlock, camera for QR or KYC, microphone for a one-off video call, and foreground location for branch or ATM search. It flags high-risk requests such as SMS, call logs, accessibility service, display-over-other-apps, notification access and installed-app inventory because those grants expose OTPs, contacts, screen contents or device fingerprints that a banking app should not need for day-to-day use.",
  useCases: [
    "Review a newly installed bank app before granting every Android permission prompt.",
    "Decide what to revoke after finishing video KYC or cheque capture.",
    "Explain to a family member why SMS, overlays and accessibility access are dangerous in finance apps.",
    "Compare a bank app and a lending app before choosing which one to keep on a primary phone.",
  ],
  benefits: [
    ["Separates core from optional", "Transaction alerts and biometric unlock are treated differently from one-off KYC camera or microphone access."],
    ["Highlights fraud-enabling grants", "Accessibility, overlays, notification access and SMS are elevated because they are common in banking trojan playbooks."],
    ["Shows what breaks", "Each permission explains the feature you lose if you revoke it and the safer alternative where one exists."],
  ],
  faqs: [
    [
      "Does a banking app need SMS permission for OTP autofill?",
      "No. Android's SMS Retriever and SMS User Consent APIs can pass one matching OTP to an app without giving it READ_SMS access to every message. Manual copy-paste is also safer than full inbox access.",
    ],
    [
      "Is accessibility permission ever normal for a banking app?",
      "Treat it as a red flag. Accessibility services can read screen contents and tap on your behalf, which is why device-takeover malware asks for it. A normal bank login or payment flow should not need it.",
    ],
    [
      "Should I keep camera permission enabled after KYC?",
      "Keep camera only if you regularly scan QR codes or cheques. If it was granted for a one-time video KYC flow, revoke it afterwards and grant again only when needed.",
    ],
  ],
};

export default seo;
