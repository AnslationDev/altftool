const seo = {
  title: "Netflix Account Security Checklist: 15 Weighted Controls",
  metaDescription:
    "Weighted 15-control Netflix checklist: password, device sign-out, Household and billing checks. Score capped at 69% until all critical controls are done.",
  steps: [
    "Work through the grouped checklist, ticking each control you have set on your Netflix account — every row shows its +weight and the four highest-impact rows carry a Critical badge.",
    "Watch the Hardening score panel update: it reports Controls completed, Weighted points and Critical controls missing, and holds the score at 69% while any critical control is open.",
    "Enter a Target score (%) to get the shortest 'Do these next' route, highest-impact control first, then press Copy result for a text summary of your score band and remaining controls.",
  ],
  "intro": "This guide is a weighted, 15-control checklist for a Netflix account: a unique password, signing out of all devices, reviewing the device access list, profile lock PINs, the Netflix Household setting and the billing checks that catch a quiet takeover. Netflix does not offer authenticator-app two-factor authentication, so the password and the device list carry the load here, which is why they are scored highest. Four controls are marked critical and the score is held at 69% until all four are done.",
  "useCases": [
    "Ejecting an old flatmate, ex-partner or former friend who still streams on your account.",
    "Working out who else is watching after unfamiliar shows appear in your viewing activity.",
    "Getting the Netflix Household set correctly so genuine family devices stop being asked to verify.",
    "Checking whether a payment-failure email is real before touching your card details."
  ],
  "benefits": [
    [
      "Honest about what Netflix offers",
      "There is no authenticator-app option, so the checklist weights the controls that exist rather than pretending otherwise."
    ],
    [
      "Ejection, not just prevention",
      "Signing out of all devices and reviewing the access list are what actually remove someone already streaming."
    ],
    [
      "Runs locally",
      "The page never asks for your Netflix email, password or card, and keeps no record of what you tick."
    ]
  ],
  "faqs": [
    [
      "Does Netflix have two-factor authentication?",
      "Not in the usual sense: there is no authenticator-app or security-key option on a Netflix account. Netflix relies on a password plus one-time sign-in codes sent to the account email or phone, and on the Household check for devices outside your home, which is why keeping that email address current matters so much."
    ],
    [
      "How do I remove someone from my Netflix account?",
      "Open Account > Security and choose Sign out of all devices, then change the password so they cannot sign back in. Check Manage access and devices afterwards, and remove any extra member slots or shared profiles from the account page as well."
    ],
    [
      "What is a Netflix Household and why does it ask for a code?",
      "The Household is the home your account is tied to, based on the devices connected to your home internet. Devices used outside it may be asked to verify with a code sent to the account email, which is how Netflix limits password sharing between separate homes."
    ],
    [
      "Is the Netflix email saying my payment failed genuine?",
      "Treat it as fake until you have checked. Netflix does not ask for card or bank details by email or text message, so open netflix.com yourself and look at the billing page rather than tapping the link. Report the message and delete it if the account shows no problem."
    ]
  ]
};

export default seo;
