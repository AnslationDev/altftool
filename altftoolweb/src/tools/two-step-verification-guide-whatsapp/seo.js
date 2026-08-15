const seo = {
  title: "WhatsApp Two-Step Verification Setup Checklist",
  metaDescription:
    "A local 12-point checklist for the WhatsApp 6-digit PIN, recovery email, linked devices, backups and SIM-swap defence - never asks for your PIN or OTP.",
  steps: [
    "Complete each control inside WhatsApp or your carrier/email settings first — the 12 checks are grouped under Two-step verification, Recovery, SIM and device, Sessions, Backups, Monitoring and Privacy, each showing where to do it.",
    "Tick the matching checkbox; the Hardening score adds each control's weighted points and stays capped at 69% while any control marked Critical is unticked.",
    "Follow \"Next best actions\" for the highest-weight gaps, press \"Copy result\" for a text summary of the score and remaining actions, or \"Reset\" to clear every checkbox.",
  ],
  intro:
    "This WhatsApp two-step verification guide is a local checklist for turning on the 6-digit registration PIN, adding recovery email, preparing SIM-swap protection, reviewing linked devices, enabling passkeys where available, and protecting encrypted chat backups. It never asks for your OTP, PIN, recovery email password or backup key.",
  useCases: [
    "Setting up WhatsApp safely before travel, phone repair or a SIM replacement.",
    "Hardening a business WhatsApp number against SIM-swap and linked-device abuse.",
    "Checking an account after an unexpected registration code, login alert or suspicious linked device.",
    "Helping family members turn on WhatsApp two-step verification without seeing their private messages.",
  ],
  benefits: [
    [
      "PIN plus recovery plan",
      "The score weights both the WhatsApp PIN and the recovery email because lockout prevention matters as much as takeover prevention.",
    ],
    [
      "SIM-swap aware",
      "Carrier port-out protection and linked-device cleanup sit beside WhatsApp settings, which is where real-world attacks often start.",
    ],
    [
      "Local-only checklist",
      "No WhatsApp login, no contact upload and no message access is required; the page only records local checkbox state.",
    ],
  ],
  faqs: [
    [
      "What is WhatsApp two-step verification?",
      "It is an optional 6-digit PIN that WhatsApp asks for when your phone number is registered again. It helps slow down SIM-swap and stolen-number takeovers.",
    ],
    [
      "Should I add an email to WhatsApp two-step verification?",
      "Yes. A recovery email helps reset the PIN if you forget it. That email should itself have a unique password and strong two-factor authentication.",
    ],
    [
      "Do linked devices stay active if my phone is safe?",
      "Linked WhatsApp Web or Desktop sessions can keep access until you log them out, so review linked devices regularly.",
    ],
    [
      "Does this tool connect to WhatsApp?",
      "No. It is only a browser-side guide and checklist. Do not paste OTPs, PINs or backup keys into it.",
    ],
  ],
};

export default seo;
