const seo = {
  title: "Passkey Readiness Tester: Audit WebAuthn Options",
  metaDescription:
    "Paste your PublicKeyCredential options and check residentKey, RP ID, user handle PII, attachment and conditional mediation against WebAuthn Level 3.",
  steps: [
    "Enter the \"Origin the ceremony runs on\", pick the \"Ceremony\", and for an authentication ceremony set the \"Mediation passed to navigator.credentials.get()\".",
    "Paste your PublicKeyCredentialCreationOptions or PublicKeyCredentialRequestOptions into \"Credential options JSON\" (challenge and user.id in base64url), or load the \"Registration example\" or \"Authentication example\".",
    "Read the findings on RP ID, challenge length, user handle, algorithms, resident key, user verification, attachment, attestation and extensions, tick the \"Fallback and recovery\" boxes your sign-in page actually does, then press \"Copy review\".",
  ],
  intro:
    "Most passkey rollouts that \"do not work\" are not broken code — they are a options object that quietly asks for the wrong thing. residentKey left at its default produces a second-factor credential, not a passkey. authenticatorAttachment set to platform blocks the phone-and-QR route. Conditional autofill with a non-empty allowCredentials does nothing at all, silently. Paste the PublicKeyCredentialCreationOptions or PublicKeyCredentialRequestOptions object you pass to navigator.credentials and this checks every member against the WebAuthn Level 3 rules for discoverable credentials, then asks the handful of fallback questions no options object can answer. It runs entirely in the page: no credential is created, nothing is sent anywhere.",
  useCases: [
    "A registration call succeeds but the credential never appears in the user's passkey manager — check whether residentKey is required or merely preferred, and whether the credProps extension was requested to confirm it.",
    "Passkey autofill in the username field does nothing on any browser: verify that mediation is conditional, that allowCredentials is empty and that the ceremony is not fighting a timeout.",
    "Reviewing another team's WebAuthn integration before it ships, to confirm the RP ID actually covers the sign-in origin and that the user handle is opaque bytes rather than an email address.",
  ],
  benefits: [
    [
      "Catches the RP ID mistake early",
      "The RP ID has to be the origin's host or a parent domain of it, and it cannot be a public suffix. Get it wrong and the browser throws a SecurityError; get it too specific and moving sign-in to another subdomain later orphans every passkey on the account.",
    ],
    [
      "Checks the user handle for PII",
      "The specification says the user handle must not contain personally identifying information, because it is stored unencrypted on the authenticator. Base64url values are decoded and flagged when they turn out to be an email address or a readable username.",
    ],
    [
      "Covers the fallback path too",
      "Six recovery and UX questions — a non-passkey route in, NotAllowedError handling, availability probing, the autocomplete token, cross-device sign-in, more than one passkey per account — each with the concrete failure it prevents.",
    ],
  ],
  faqs: [
    [
      "What actually makes a credential a passkey?",
      "It has to be discoverable, which means the authenticator stores the credential itself and can list it without being told the credential ID first. That comes from residentKey: \"required\" in authenticatorSelection. With \"preferred\" you may get a non-discoverable credential instead — it still authenticates when you supply allowCredentials, but it cannot do usernameless or autofill sign-in and it will not show up in the user's passkey list.",
    ],
    [
      "Why does the tool warn about authenticatorAttachment: platform?",
      "It restricts the ceremony to an authenticator built into the machine in front of the user. That excludes security keys and, more importantly, excludes the hybrid transport — scanning a QR code to use a passkey that lives on a phone. On a desktop without Windows Hello or Touch ID the user gets nothing at all. Leaving the member unset is the recommended default; WebAuthn Level 3's hints array is the softer way to express a preference.",
    ],
    [
      "Does this create a passkey or test my live site?",
      "Neither. It reads the static options object you paste and applies the specification's rules to it. It makes no network request, calls no WebAuthn API and never touches an authenticator, which is why you can safely paste production options into it.",
    ],
    [
      "What does it not check?",
      "Everything that happens after the browser returns a credential. Your server still has to verify the client data origin and type, the RP ID hash inside authenticatorData, the signature, the UV flag when you required user verification, the BE and BS backup flags if you care whether the passkey is synced, and the signature counter. It also cannot tell whether your challenge is genuinely random and single-use — only how many bytes long it is.",
    ],
  ],
};

export default seo;
