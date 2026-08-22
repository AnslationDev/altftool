const seo = {
  title: "Food Delivery App Permission Audit: 15 Items",
  metaDescription:
    "Score a food or grocery app across 15 weighted permissions. Background location counts as optional, and SMS or contacts access is flagged to revoke.",
  steps: [
    "Name the app in 'App name (for the report)', then choose Checklist or Paste list entry.",
    "Tick the permissions the app holds from the 15 listed, or paste one per line from the Play Store 'About this app > App permissions' screen.",
    "Read the privacy score out of 100, the ranked 'Revoke these first' list, and every item with its Android / iOS manifest name and sensitivity.",
  ],
  intro:
    "The Food Delivery App Permission Audit scores a food or grocery app against the three things it must do: locate the delivery address, take payment and track one live order. Fifteen permissions are weighted by sensitivity, with background location treated as optional rather than core — live order tracking runs through a foreground service with a visible notification, so 'Allow all the time' buys the app a movement history it does not need. The audit is written India-first, where masked in-app calling already connects you to the delivery partner without any call log or SMS access.",
  useCases: [
    "Decide whether to switch a delivery app from 'Allow all the time' to 'While using the app' after an order.",
    "Check why an app asked for SMS access when the OTP already autofills.",
    "Audit a grocery app that added contacts access alongside a gifting feature.",
    "Compare two delivery apps' permission lists before deleting one from your phone.",
  ],
  benefits: [
    [
      "Background location scored honestly",
      "Live tracking is a foreground service job, so 'all the time' location is treated as an optional extra, not a requirement.",
    ],
    [
      "Built around masked calling",
      "Indian platforms connect you to a rider through a routed number, so call log and CALL_PHONE grants score as exposure.",
    ],
    [
      "Ranked, not just listed",
      "The revoke list is ordered by sensitivity, so the biggest win is at the top rather than buried in a checklist.",
    ],
  ],
  faqs: [
    [
      "Does a food delivery app need background location?",
      "No. Tracking an order you placed runs in a foreground service with a visible notification, which works while the app is open or in the notification shade. ACCESS_BACKGROUND_LOCATION only adds tracking after you leave the app, and Google Play classes it as a restricted permission needing a core-functionality declaration.",
    ],
    [
      "Why does a delivery app ask for contacts?",
      "Usually for a 'send a meal to a friend' or referral feature, which needs one phone number typed in, not the whole address book. Granting it uploads details of people who never agreed to anything, so it scores as unnecessary.",
    ],
    [
      "Do I need to give SMS permission for the OTP?",
      "No. Android's SMS Retriever and SMS User Consent APIs deliver the single matching login message to the app with no permission at all. Full READ_SMS access exposes every bank alert and private message on the phone for no extra function.",
    ],
    [
      "Can I use a delivery app without location permission?",
      "Yes, in most cases — saved addresses work without it and you can search by locality or pincode. Precise location mainly speeds up dropping a pin on a new address, so 'While using the app' is a reasonable middle ground.",
    ],
  ],
};

export default seo;
