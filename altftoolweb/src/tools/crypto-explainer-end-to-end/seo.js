const seo = {
  intro:
    "This explainer walks a message along its real path — your device, your network, the provider's servers, any cloud backup, a lawful request, the recipient's network, their device — and marks at each hop whether the content is readable and whether the metadata is visible. The distinction it makes concrete is between transport encryption, where every machine on the path decrypts, and end-to-end encryption, where only the two endpoints hold keys. It also counts what encryption never covers: metadata, cloud backups the provider can open, and anything with access to an unlocked endpoint.",
  useCases: [
    "Show a colleague why a Slack DM is not private from the workspace administrator.",
    "Work out what an unencrypted WhatsApp cloud backup gives away that the chat itself does not.",
    "Compare SMS with an end-to-end encrypted messenger before sending something sensitive.",
    "Explain to a team why an MDM-managed phone undoes the benefit of an encrypted messenger.",
  ],
  benefits: [
    ["Hop by hop, not slogan by slogan", "Each party on the path is listed with a yes or no for content and for metadata."],
    ["Backups and endpoints included", "The two places end-to-end encryption is most often quietly undone are modelled explicitly."],
    ["Side-by-side comparison", "Switching channels shows a concrete change in the number of third parties who can read the message."],
  ],
  faqs: [
    [
      "What is the difference between encrypted in transit and end-to-end encrypted?",
      "Encrypted in transit means each link is protected by TLS, but every server on the path decrypts the message to handle it, so the provider holds a readable copy. End-to-end encrypted means only the sender's and recipient's devices hold keys, so the provider stores ciphertext it cannot open. The difference lives at exactly one hop: the provider's servers.",
    ],
    [
      "Can WhatsApp read my messages if backups are on?",
      "The chat itself is end-to-end encrypted, but a chat backup to Google Drive or iCloud is only protected if you enable end-to-end encrypted backups, which is not on unless you turn it on. Without it, the backup holds a restorable plaintext copy that the backup provider can open.",
    ],
    [
      "Does end-to-end encryption hide who I am talking to?",
      "Usually not. Metadata — the accounts involved, timestamps, message sizes and frequency — is needed to route messages and is rarely encrypted end to end. Signal's sealed sender is the notable exception, hiding the sender's identity from the server; most other services retain full metadata.",
    ],
    [
      "Is my message safe if the other person's phone is compromised?",
      "No. Plaintext must exist at both endpoints for the message to be readable at all, so malware, management software, screenshots or someone holding an unlocked phone all bypass the encryption completely. Choose the channel for the network threat and secure the devices separately.",
    ],
  ],
};

export default seo;
