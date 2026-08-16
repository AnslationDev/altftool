const seo = {
  title: "Dating App Permission Audit with Privacy Score",
  metaDescription:
    "Score a dating app's precise location, background location, contacts, all-photos and tracking grants 0-100, with the safest setting change for each.",
  steps: [
    "Type the App name and tick the 10 permission and profile settings the dating app holds — precise location, background location, all photos/videos, contacts, ad ID, broad profile discovery — or load the 'Typical dating app' preset.",
    "Check the privacy score out of 100 and its band from 'Minimal exposure' to 'Severe exposure', with the heaviest risks listed alongside a practical fix for each.",
    "Press 'Copy summary' for a text checklist of the score, granted-item count and top fixes.",
  ],
  intro:
    "The Dating App Permission Audit scores location, background location, all-photos access, contacts, camera, microphone, notifications, tracking and profile discovery settings for dating apps. It explains which grants are optional and which ones can expose home, work, routines, social graph or private photos.",
  useCases: [
    "Review dating app permissions after installing or reactivating an account.",
    "Decide whether to use precise location, approximate location or manual area settings.",
    "Limit photo library, contact sync and ad-tracking exposure.",
    "Create a quick privacy checklist before sharing a profile with friends or family.",
  ],
  benefits: [
    ["Dating-specific scoring", "Weights precise location, contacts, profile discovery and all-photos access more heavily."],
    ["Plain revoke advice", "Each permission includes a practical setting change."],
    ["Copyable report", "Export the privacy score and top fixes as a short text checklist."],
  ],
  faqs: [
    [
      "Does a dating app need precise location?",
      "Some matching features use location, but precise or background location can reveal sensitive routines. Prefer approximate or manual area settings when the app supports them.",
    ],
    [
      "Should I allow contacts?",
      "Contact sync may help block or find people, but it also uploads your social graph. Deny it unless you specifically need that feature.",
    ],
    [
      "Why avoid all-photos access?",
      "Your full photo library can contain IDs, screenshots, family images and location clues. Selected-photos access is safer.",
    ],
  ],
};

export default seo;
