const seo = {
  intro:
    "This local checklist walks through the practical Gmail and Google Account hardening flow: recovery details, 2-Step Verification, authenticator apps, passkeys or security keys, backup codes, SMS removal, app-password cleanup and a recovery test. It does not connect to Google, ask for a password, or store backup codes; it only tracks which safety steps you tick in the browser.",
  useCases: [
    "Setting up a new Gmail account before using it for banking, work, domains, or social media recovery.",
    "Replacing SMS-based 2-Step Verification with an authenticator app, passkey, or hardware security key.",
    "Preparing a recovery plan before changing phones, travelling, or handing a device for repair.",
    "Helping a family member harden Gmail without seeing their password, codes, or private account data.",
  ],
  benefits: [
    [
      "Local-only guidance",
      "The tool is a checklist and explainer; it never signs in to Google or sends your account details anywhere.",
    ],
    [
      "Weighted progress",
      "Critical controls such as 2-Step Verification, passkeys and backup codes count more than optional hygiene tasks.",
    ],
    [
      "Recovery-first design",
      "The guide starts with recovery phone, recovery email and backup codes so users do not lock themselves out.",
    ],
  ],
  faqs: [
    [
      "Is a passkey better than an authenticator code for Gmail?",
      "Yes for phishing resistance. A passkey or hardware security key is cryptographically bound to the real Google domain, while an authenticator code can still be typed into a convincing fake sign-in page.",
    ],
    [
      "Should I remove SMS after setting up Google 2-Step Verification?",
      "If you have tested a stronger method and saved backup codes, removing SMS reduces SIM-swap risk. Do not remove it until another recovery path is confirmed.",
    ],
    [
      "Where should Gmail backup codes be stored?",
      "Store them in a trusted password manager or on paper in a safe place. Do not store them in Gmail drafts, photos, chat messages, or the same phone that receives your second factor.",
    ],
    [
      "Does this tool read my Google account?",
      "No. It is not connected to any Google API. It only provides a browser-side checklist and progress score.",
    ],
  ],
};

export default seo;
