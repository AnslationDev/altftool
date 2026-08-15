const seo = {
  title: "Self-Signed Certificate Risk: Scored by Where It Runs",
  metaDescription:
    "Scores a self-signed or private-CA TLS setup out of 100 by context and trust model, with a yes/no table for machine-in-the-middle and browser trust.",
  steps: [
    "Answer \"Where is the certificate used?\" — localhost, CI or test fixture, a device on your own LAN, an internal service, staging, or a public production site.",
    "Answer \"How are clients meant to trust it?\" — a bare self-signed leaf, a pinned certificate, or a private CA in the trust stores — and tick everything under \"Which of these are true?\".",
    "Read the Risk score out of 100, the yes/no list under \"What this certificate actually gives you\", and each Finding's fix; Copy assessment saves the write-up.",
  ],
  intro:
    "Self Signed Certificate Risk Explainer scores a TLS setup on where it runs and how clients are meant to trust it, then lists what the certificate actually guarantees. TLS provides confidentiality and authentication; a self-signed certificate provides the first and none of the second, so an on-path attacker can substitute its own certificate undetected. The output separates the cases where that genuinely does not matter — a CI fixture, a localhost server — from the cases where it teaches a habit that costs you later.",
  useCases: [
    "Decide whether a self-signed certificate on an internal service is acceptable or whether the team should stand up a private CA.",
    "Explain to a reviewer why setting rejectUnauthorized to false in client code is worse than the warning it silences.",
    "Work out why a private CA root installed on an Android device still does not satisfy the company's own app.",
    "Check whether a staging environment should use the same certificate pipeline as production before real data lands on it.",
  ],
  benefits: [
    ["Context decides the verdict", "The same certificate scores 5 on localhost and 100 on a public production host, because the exposure is what differs."],
    ["Guarantees stated plainly", "A yes/no table for eavesdropping, machine-in-the-middle, browser trust, third-party clients and Certificate Transparency."],
    ["Concrete fixes", "Every finding names the specific remedy — SANs, a Network Security Config, DNS-01 issuance, or automated renewal."],
  ],
  faqs: [
    [
      "Is a self-signed certificate secure?",
      "It encrypts the connection but proves nothing about who is on the other end, so it stops passive eavesdropping and does not stop an active machine-in-the-middle. That is acceptable when the client already knows exactly which certificate to expect — a pinned certificate or your own CA — and unacceptable when a human is asked to judge the warning instead.",
    ],
    [
      "Do I need HTTPS for local development?",
      "Usually not. The W3C Secure Contexts specification treats http://localhost, http://127.0.0.1 and http://[::1] as potentially trustworthy origins, so service workers, getUserMedia, the Clipboard API and WebCrypto's SubtleCrypto all work over plain HTTP there. Add local TLS only to reproduce HTTPS-specific behaviour such as Secure cookies or mixed-content rules, and use a local CA like mkcert rather than a bare self-signed certificate.",
    ],
    [
      "Why can I not click through the certificate warning on this site?",
      "Because the host has sent a Strict-Transport-Security header. Browsers remove the bypass link for HSTS hosts, so an untrusted certificate makes the site unreachable rather than merely warned about. Either serve a certificate that chains to a trusted root, or stop sending HSTS on that host while it is untrusted.",
    ],
    [
      "How long can a TLS certificate be valid for?",
      "Publicly trusted certificates are capped at 398 days under the CA/Browser Forum Baseline Requirements, in force since 1 September 2020. Ballot SC-081, adopted in 2025, reduces the maximum to 200 days in March 2026, 100 days in March 2027 and 47 days in March 2029, which makes automated renewal a requirement rather than a convenience. Private CAs set their own limits, but Apple platforms reject server certificates with unusually long lifetimes regardless of who issued them.",
    ],
  ],
};

export default seo;
