const seo = {
  title: "Microsoft Account 2FA: 15-Control Hardening Checklist",
  metaDescription:
    "Work through Authenticator, the single 25-character recovery code, session cleanup and the Outlook forwarding check, scored by blast radius.",
  steps: [
    "Tick each control you have already set across the four groups: sign in and second factor, sessions and devices, apps and privacy, mail and money.",
    "Set a target score and the plan lists the shortest route, highest-weight control first; the score stays capped at 69% while a critical control is open.",
    "Read the hardening score with controls completed, weighted points and critical controls missing, then press Copy result.",
  ],
  "intro": "This guide is a weighted, 15-control checklist for a Microsoft account: two-step verification, the single recovery code, verified alternate contact details, Authenticator approvals, session and app-password cleanup, and the Outlook forwarding check that catches an intruder who is still reading your mail. One Microsoft account typically holds Outlook, OneDrive, Windows sign-in and Xbox purchases together, so the controls are scored by how much of that a takeover would reach. Four are marked critical and the score is capped at 69% until all four are done.",
  "useCases": [
    "Locking down the account after Microsoft emails you about an unusual sign-in attempt.",
    "Setting up a new Windows PC where the Microsoft account becomes the machine's sign-in as well.",
    "Cleaning up an old Hotmail or Live address that still receives bank and government mail.",
    "Checking a family member's account for forwarding rules after they clicked a phishing link."
  ],
  "benefits": [
    [
      "Covers the post-compromise checks",
      "Mail forwarding rules and app passwords survive a password change, so both are on the list rather than assumed clean."
    ],
    [
      "Ranks by blast radius",
      "Controls are weighted by how much of your mail, files and payment methods each one protects."
    ],
    [
      "Local only",
      "The checklist runs in your browser and never asks for your Microsoft account, password, recovery code or an approval."
    ]
  ],
  "faqs": [
    [
      "How do I turn on two-step verification for a Microsoft account?",
      "Sign in at account.microsoft.com, open Security, choose Advanced security options, then turn on Two-step verification and follow the prompts. Set up the Microsoft Authenticator app during that flow rather than relying on SMS, and save the recovery code the same page offers."
    ],
    [
      "How many Microsoft recovery codes do I get?",
      "One. Microsoft issues a single 25-character recovery code from Advanced security options, and generating a fresh code immediately invalidates the previous one. Print it or store it in a password manager, because it is the route back in when you have lost both your phone and your alternate email."
    ],
    [
      "Can I delete the password from my Microsoft account?",
      "Yes. Advanced security options has a passwordless account setting that removes the password entirely, after which you sign in with the Authenticator app, Windows Hello, a security key or a code sent to your verified contact details. It removes the one credential that can be phished or reused elsewhere."
    ],
    [
      "Why does Microsoft make me wait before removing my security info?",
      "Changes that reduce your recovery options can take up to 30 days to take effect. The delay is deliberate: if someone else gets into the account, it stops them stripping out your phone number and alternate email before you have a chance to notice and react."
    ]
  ]
};

export default seo;
