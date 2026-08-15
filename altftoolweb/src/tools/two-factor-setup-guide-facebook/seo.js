const seo = {
  title: "Facebook 2FA Setup Guide: Accounts Center",
  metaDescription:
    "Step-by-step Facebook 2FA checklist for security key, authenticator app or SMS, with a readiness score that flags unsaved recovery codes and SMS fallback.",
  steps: [
    "Under \"Which second factor are you setting up?\", choose Security key or passkey, Authentication app (TOTP), or Text message (SMS).",
    "Tick off each Setup checklist step as you finish it in Meta's Accounts Center — every step shows its menu path and a minutes estimate.",
    "Read the Account readiness score out of 100 with its Strong/Good/Partial/Weak band and warnings; \"Copy result\" exports the summary.",
  ],
  intro:
    "This guide walks through enabling two-factor authentication on a Facebook profile in Meta's Accounts Center, then scores how much lockout and takeover risk is left. Facebook offers three second factors — security key, authentication app and text message — and the checklist adapts to whichever you pick, including saving recovery codes and switching SMS off once a stronger factor works. It is aimed at anyone protecting a personal profile, a Page they admin, or a business account tied to ad spend.",
  useCases: [
    "Move a profile off SMS codes and onto a TOTP authenticator app without getting locked out mid-way.",
    "Register a hardware security key on a Facebook account that manages a Page or ad account.",
    "Check what you missed after enabling 2FA in a hurry — usually the recovery codes and the old SMS fallback.",
    "Give a family member or a new team member a plain-language checklist with the exact Accounts Center menu path.",
  ],
  benefits: [
    ["Method-aware checklist", "Steps change depending on whether you chose a security key, an authenticator app or SMS."],
    ["Scores the gaps, not just the switch", "Unsaved recovery codes and a live SMS fallback drag the score down even when 2FA is technically on."],
    ["Nothing is collected", "The checklist runs entirely in your browser — no account details, codes or logins are ever requested."],
  ],
  faqs: [
    [
      "Where is two-factor authentication in Facebook settings?",
      "Go to Settings & privacy, then Settings, then Accounts Center, then Password and security, then Two-factor authentication, and pick the profile you want to protect. Accounts Center handles each linked Facebook and Instagram profile separately, so switching it on for one does not switch it on for the others.",
    ],
    [
      "Is an authenticator app really safer than SMS on Facebook?",
      "Yes. SMS codes can be stolen by SIM-swap fraud, where an attacker moves your number to their own SIM and receives the codes without touching your phone. A TOTP app generates the 6-digit code on your device from a shared secret every 30 seconds, so there is nothing on the phone network to intercept.",
    ],
    [
      "What happens if I lose the phone with my Facebook authenticator app?",
      "You sign in with one of the one-time recovery codes Meta issued during setup, which is why saving them offline is a required step. Without codes or a second registered factor you have to go through Meta's identity-verification appeal, which can take several days and sometimes needs a photo ID.",
    ],
    [
      "Should I turn off the SMS backup after adding an app or key?",
      "Yes, once you have confirmed the stronger factor works and you have recovery codes saved. Any second factor left enabled is a way in, so leaving SMS active means your account is only as strong as your phone number. This is general security guidance, not advice about your specific account.",
    ],
  ],
};

export default seo;
