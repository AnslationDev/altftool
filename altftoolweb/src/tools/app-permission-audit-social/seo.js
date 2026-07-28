const seo = {
  intro:
    "The Social Media App Permission Audit scores a social app's camera, microphone, photos, location, contacts, notifications, Bluetooth, ad ID, background activity and accessibility permissions. It explains which permissions are useful for posting and messaging, and which ones create unnecessary privacy exposure.",
  useCases: [
    "Review Instagram, Facebook, Snapchat, TikTok, X, Reddit or similar app permissions.",
    "Decide what to revoke after installing a social app on a new phone.",
    "Explain why contact sync, precise location, all-photos access and ad tracking are high-risk.",
    "Create a short privacy cleanup plan for family members.",
  ],
  benefits: [
    ["Social-app specific", "The scoring reflects posting, stories, DMs, live rooms, friend discovery and advertising use cases."],
    ["Practical revoke advice", "Each permission includes a plain action such as selected-photos access or approximate location."],
    ["Copyable report", "Export the privacy score and top fixes as text."],
  ],
  faqs: [
    [
      "Does a social app need contacts?",
      "Usually no for core use. Contact sync helps friend discovery but uploads other people's details too, so it is a high-risk optional permission.",
    ],
    [
      "Should I allow camera and microphone?",
      "Allow them only when you actively create posts, live streams or voice notes. Browsing and messaging usually do not need always-on access.",
    ],
    [
      "What is selected-photos access?",
      "On modern iOS and Android versions, you can let an app see only the photos you choose instead of your whole library.",
    ],
  ],
};

export default seo;
