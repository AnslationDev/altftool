const seo = {
  title: "Education App Permission Audit - Camera, Mic",
  metaDescription:
    "Score a learning or proctoring app across 17 permissions. Camera, mic and screen capture are judged session-scoped; accessibility and overlay are not.",
  steps: [
    "Type the App name (for the report), then choose Checklist or Paste list — Paste list takes one permission per line copied from the Play Store listing or Settings > Apps > Permissions.",
    "In Checklist mode start from Typical class app, Everything granted or Clear all, then tick what the app actually holds under \"Permissions and settings this app currently holds\"; each of the 17 items is marked Required for core features, Optional feature only or Not needed by a learning app.",
    "A Privacy score out of 100 appears with a verdict band and rows for Permissions granted, Revoke now, Worth reviewing, Justified by a core feature, Restricted / special access granted and Exposure points, followed by the Revoke these first list and a table of every item with its Android / iOS manifest name; Copy result copies the report.",
  ],
  intro:
    "The Education App Permission Audit scores a student learning, tuition or exam app across seventeen permissions, separating teaching from surveillance. Camera, microphone and MediaProjection screen capture are legitimate for a live class or an invigilated exam but should be scoped to the session, so they score as optional; accessibility control and overlay permissions have no teaching use and score as full exposure. It matters most when the user is a child: India's DPDP Act 2023 requires verifiable parental consent under 18 and bars behavioural advertising directed at children, and COPPA covers under-13s in the US.",
  useCases: [
    "Check what a proctoring app can see before an online exam and turn on Do Not Disturb first.",
    "Review a child's tuition app for an advertising ID or a contacts grant.",
    "Decide whether a class app needs location for attendance or whether a per-session check-in would do.",
    "Prepare a list of concerns to raise with a school about a mandated learning app.",
  ],
  benefits: [
    [
      "Session-scoped, not standing",
      "Camera, microphone and screen capture are judged on whether the grant ends when the class does.",
    ],
    [
      "Flags the proctoring extras",
      "Reading the full installed-app list and accessibility control are surfaced separately from ordinary class features.",
    ],
    [
      "Child-data aware",
      "An advertising ID inside a students' app is presented as a compliance problem, not just a privacy preference.",
    ],
  ],
  faqs: [
    [
      "What can an online proctoring app actually see?",
      "With MediaProjection it captures everything on your screen for the session, including notifications from other apps that arrive mid-exam, and with QUERY_ALL_PACKAGES it can read your full list of installed apps. Grant screen capture per session only and turn on Do Not Disturb before starting.",
    ],
    [
      "Should a learning app for children have an advertising ID?",
      "No. India's DPDP Act 2023 prohibits behavioural advertising directed at children, and COPPA restricts data collection from under-13s in the US. An AD_ID permission in an app aimed at students is worth raising with the school as well as revoking.",
    ],
    [
      "Does a class app need my location?",
      "Not as a standing grant. Geofenced attendance, where it is used at all, should be a per-session check-in you approve, so set the permission to 'Ask every time' or deny it and ask what location data the school retains.",
    ],
    [
      "Why is accessibility access a red flag in an education app?",
      "An accessibility service can read everything on screen and tap on your behalf, which is far beyond anything teaching requires. It is the most abused permission on Android, so turn it off under Settings > Accessibility > Downloaded apps unless a student genuinely relies on it as an assistive tool.",
    ],
  ],
};

export default seo;
