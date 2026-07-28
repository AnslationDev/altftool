const seo = {
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
