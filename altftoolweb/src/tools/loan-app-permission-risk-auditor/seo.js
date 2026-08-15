const seo = {
  title: "Loan App Permission Auditor: 28 Android Permissions",
  intro:
    "The Loan App Permission Risk Auditor reads a pasted AndroidManifest.xml or plain permission list and classifies every declared permission against a focused checklist of 28 sensitive Android permissions grouped into nine areas — contacts, SMS, call logs, files and media, accessibility, location, package installation, screen overlay and device admin. It then runs eight combination rules that flag pairings such as contacts plus SMS, or accessibility plus overlay, and returns one of four review levels: high-attention, elevated, review recommended, or no focused signal. It is built for borrowers, journalists and consumer-protection volunteers who want to understand what a lending app is asking for, and the text never leaves the browser.",
  useCases: [
    "A lending app you installed keeps sending threatening messages to people in your phonebook, and you want to see whether its manifest actually declares READ_CONTACTS and READ_SMS together before you file a complaint.",
    "You pulled the permission list from a Play Store listing or an APK inspector and want to know which of the requested permissions are the ones worth denying, plus the exact Android Settings path to turn each one off.",
    "You are helping a relative uninstall an app that will not go away, and you need to check whether it declares a device-admin receiver that must be deactivated in Security settings before removal will work.",
  ],
  benefits: [
    [
      "Combination rules, not just a list",
      "Eight paired-capability checks catch risky overlaps like background location plus contacts that a flat permission list hides.",
    ],
    [
      "Plain-language remediation per group",
      "Every flagged group returns the specific Android Settings path to revoke it, including special-access screens for overlay and install-unknown-apps.",
    ],
    [
      "Accepts raw manifest XML or a pasted list",
      "It auto-detects the input kind, strips the android.permission. prefix, counts duplicates, and still reports unrecognised permissions separately.",
    ],
  ],
  faqs: [
    [
      "Which permissions does this tool check for?",
      "It checks 28 named Android permissions across nine sensitive groups: contacts, SMS and MMS, call logs and phone state, files and media, accessibility service, location including background location, package installation, display-over-other-apps, and device administrator. Anything else you paste is listed as an unclassified declared permission rather than silently dropped.",
    ],
    [
      "Does a permission in the manifest mean the app already has access?",
      "No. A manifest declaration is only a request; runtime permissions still require the user to grant them, and accessibility services, overlays and device admin each need a separate opt-in in Android Settings. The audit tells you what could be asked for, not what was granted or used.",
    ],
    [
      "How does it decide the review level?",
      "It returns high-attention review if any high-level combination rule fires or three or more high-attention groups appear; elevated review if there is at least one high-attention group or a medium combination; review recommended if any checklist permission appears at all; and no focused signal otherwise.",
    ],
    [
      "Can this prove an app is a fraud or a malware scanner?",
      "No — it is an informational checklist, not a malware scan, a legal determination or evidence of wrongdoing. If you are facing harassment, coercion or unauthorised debits, preserve screenshots and messages and contact your regional consumer-protection or cybercrime authority.",
    ],
  ],
};

export default seo;
