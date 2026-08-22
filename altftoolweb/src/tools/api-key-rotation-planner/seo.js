const seo = {
  title: "API Key Rotation Planner: 90-Day Cadence",
  metaDescription:
    "Turn a key's creation date and exposure level into rotation due dates with a dual-key overlap window and a six-step revocation runbook (NIST SP 800-57).",
  steps: [
    "Pick a 'Key exposure level' preset — each sets the rotation interval in days — and enter 'Key created / last rotated on'.",
    "Adjust 'Rotation interval (days)' and the 'Dual-key overlap window (days)' both keys stay valid during a swap.",
    "Read 'Next rotation due' with its status, the 'Rotate on' / 'Revoke old key by' schedule and the six-step revocation runbook, then press 'Copy plan'.",
  ],
  intro:
    "This planner turns an API key's creation date and exposure level into a concrete rotation schedule: the next due date, a dual-key overlap window, and a six-step revocation runbook. It applies the cryptoperiod concept from NIST SP 800-57 and the 90-day rotation baseline that AWS and Google Cloud publish for long-lived access keys. It is built for developers and small teams running OpenAI, Anthropic or other AI API keys without a dedicated secrets-management platform.",
  useCases: [
    "A solo developer who created an OpenAI key eight months ago and wants a realistic cadence plus the exact steps to swap it without downtime",
    "A team lead standardising rotation intervals across production, staging and internal-tool keys with different exposure levels",
    "An engineer responding to a key leaked in a public repo who needs the revoke-and-audit sequence in the right order",
  ],
  benefits: [
    ["Exposure-based cadence", "Presets from 30 days for client-exposed keys to a 365-day hygiene ceiling, anchored to published provider guidance."],
    ["Zero-downtime overlap", "Every scheduled rotation shows the date the old key must be revoked after the dual-key overlap window."],
    ["Ordered revocation runbook", "Six steps — issue, deploy, verify, revoke, audit, record — so revocation is never done before the new key is live."],
  ],
  faqs: [
    [
      "How often should API keys be rotated?",
      "At least every 90 days for server-side production keys — the baseline AWS and Google Cloud recommend for long-lived access keys — and closer to 30 days for keys that ever touch client-side code, notebooks or shared machines. NIST SP 800-57 frames this as limiting a key's cryptoperiod: the shorter the key lives, the smaller the window an undetected leak can be exploited.",
    ],
    [
      "How do I rotate an API key without downtime?",
      "Run both keys in parallel for a short overlap window: create the new key, deploy it to every secret store and environment, verify in the provider dashboard that traffic has moved to it, and only then revoke the old key. A 7-day overlap is a common default; the overlap must always be shorter than the rotation interval itself.",
    ],
    [
      "What should I do if my AI API key is leaked?",
      "Revoke it immediately — do not wait for a scheduled rotation. Then issue a replacement with the narrowest scopes the workload needs, redeploy, and audit the old key's usage logs for unfamiliar IPs, spikes or endpoints during its lifetime, since a leaked key may have been used before you noticed. Most providers (OpenAI, Anthropic, AWS) let you disable a key instantly from the console.",
    ],
    [
      "Does letting a key expire count as revoking it?",
      "No. Expiry stops future use but revocation is the explicit act of disabling the credential in the provider's console, and it should be a recorded step in every rotation. The runbook in this tool puts revocation after deployment and verification of the new key, followed by a usage audit and a log entry with the next due date.",
    ],
  ],
};

export default seo;
