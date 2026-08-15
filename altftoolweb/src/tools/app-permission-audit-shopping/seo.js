const seo = {
  title: "Shopping App Permission Audit: Score 0-100 & Revoke List",
  metaDescription:
    "Scores the 17 permissions and settings a shopping app holds, 0-100, ranks what to revoke first, and names each Android manifest permission.",
  steps: [
    "Type the app into 'App name (for the report)', then choose 'Checklist' or 'Paste list' to enter its permissions.",
    "Tick each item under 'Permissions and settings this app currently holds', or start from the 'Typical marketplace' chip and untick what your app does not hold.",
    "Read the 0-100 Privacy score, work through 'Revoke these first', and press 'Copy result' to save the list with each Android manifest name.",
  ],
  intro:
    "The Shopping App Permission Audit scores an e-commerce app against the three things it has to do — browse, take payment, deliver — and flags everything collected beyond that. Seventeen permissions and settings are weighted by sensitivity, including the ones shopping apps most often ask for without needing: SMS access (OTP autofill works through the SMS Retriever API with no permission), call logs, calendar and background location. The result is a 0-100 score, a ranked revoke list and the exact Android manifest name for each item.",
  useCases: [
    "Decide whether to give a marketplace app SMS access for OTP autofill or to type the code yourself.",
    "Trim a shopping app back to notifications and payment after a sale season.",
    "Compare two shopping apps' permission demands before choosing where to place a large order.",
    "Check what an app kept after you granted 'Allow all the time' location during checkout.",
  ],
  benefits: [
    [
      "Tests each permission against delivery",
      "If a grant does not help you browse, pay or receive an order, it scores as full exposure.",
    ],
    [
      "Knows the OTP shortcut",
      "SMS access is scored as unnecessary because Android's SMS Retriever API autofills a code without any permission.",
    ],
    [
      "Rewards the protective settings",
      "Biometric checkout locking counts as a core, risk-reducing control rather than another permission to strip.",
    ],
  ],
  faqs: [
    [
      "Why does a shopping app want SMS permission?",
      "Usually to autofill the login OTP — but it does not need the permission to do that. Google's SMS Retriever and SMS User Consent APIs hand the app one matching message with no READ_SMS grant, so full SMS access exposes bank alerts and private messages for no functional gain.",
    ],
    [
      "Should I give a shopping app my location?",
      "Approximate location is enough for delivery estimates and serviceability checks, and precise location only helps when you are dropping a pin on a new address. Background or 'all the time' location has no shopping use — nothing about an order happens while the app is closed.",
    ],
    [
      "Does revoking a permission delete the data already collected?",
      "No. Revoking stops future collection only. To remove what has already been sent, use the app's data-download and account-deletion options; under India's DPDP Act 2023 you can also ask a company to erase personal data it no longer needs for the stated purpose.",
    ],
    [
      "Why would a shopping app want my contacts?",
      "Almost always for a referral feature, which works just as well from a share link. Granting it uploads the names and numbers of people who never installed the app, so it is one of the first things to revoke.",
    ],
  ],
};

export default seo;
