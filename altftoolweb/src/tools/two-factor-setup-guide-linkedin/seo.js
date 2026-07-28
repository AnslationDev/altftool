const seo = {
  "intro": "This guide is a weighted, 15-control checklist for locking down a LinkedIn account: two-step verification with an authenticator app, saved recovery codes, a verified primary email, clean sessions, and the visibility settings that decide who can find you. Each control carries a score share based on how much it blocks a real takeover, and four of them are marked critical, so the score stays capped at 69% until all four are done. It is aimed at anyone whose job search, client work or professional reputation lives on LinkedIn and who wants a definite finish line rather than a vague sense of being secure.",
  "useCases": [
    "Working through the setup after LinkedIn emails you about a sign-in from a city you have never visited.",
    "Hardening the account before a job search, when recruiter messages and unknown connection requests will spike.",
    "Cleaning up after leaving an employer, so the old work email and any company tools lose their hold on the profile.",
    "Helping a less technical colleague or parent switch from SMS codes to an authenticator app without missing the recovery codes."
  ],
  "benefits": [
    [
      "Weighted, not just a tick list",
      "Controls are scored by takeover impact, so the password and second factor count for far more than a visibility toggle."
    ],
    [
      "Critical controls gate the score",
      "The score refuses to rise above 69% while any critical control is open, which stops a false sense of safety."
    ],
    [
      "Nothing is collected",
      "The checklist runs entirely in your browser and never asks for your LinkedIn password, phone number or a verification code."
    ]
  ],
  "faqs": [
    [
      "How do I turn on two-factor authentication on LinkedIn?",
      "Open Settings & Privacy > Sign in & security > Two-step verification, choose Set up, and pick Authenticator App instead of Phone. LinkedIn asks for your password, shows a QR code to scan into an authenticator app, and then displays single-use recovery codes that you should save immediately."
    ],
    [
      "Is an authenticator app really safer than LinkedIn SMS codes?",
      "Yes, because SMS codes can be intercepted through a SIM swap, where an attacker persuades your mobile operator to move your number to their SIM. An authenticator app generates the code on your device using the TOTP standard, a 6-digit code refreshed every 30 seconds, so nothing travels over the phone network."
    ],
    [
      "What happens if I lose the phone that has my LinkedIn codes?",
      "Sign in with one of the recovery codes LinkedIn gave you when you enabled two-step verification; each code works once. If you did not save them, you have to go through LinkedIn's identity verification, which typically means uploading a government ID and waiting for manual review, so save the codes before you need them."
    ],
    [
      "Can I use a passkey instead of a password on LinkedIn?",
      "LinkedIn supports passkeys, which appear under Sign in & security when your account and device are eligible. A passkey signs you in with your device unlock instead of a typed password and cannot be handed to a phishing site, because the browser will only release it to the genuine linkedin.com domain."
    ]
  ]
};

export default seo;
