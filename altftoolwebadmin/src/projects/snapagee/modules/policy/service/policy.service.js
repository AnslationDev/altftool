import { createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * Snapagee — Privacy Policy module data layer.
 *
 * Single doc `projects/snapagee/legal/privacy` with an inline `sections`
 * array (see CONTRACT.md). `subcopy` is the PageHeader description line
 * rendered directly under the page title. The `DEFAULT_POLICY` seed below
 * is copied verbatim from the frontend's currently-hardcoded
 * `app/privacy-policy/page.jsx` `SECTIONS` constant so the admin's
 * Firestore default matches exactly what the live site already shows —
 * this repo has no `data/legal-privacy.json` fallback yet, so this default
 * IS the source of truth on first load.
 */

const PROJECT_ID = "snapagee";
const POLICY_PATH = ["projects", PROJECT_ID, "legal", "privacy"];

const cleanText = (value = "") => String(value ?? "").trim();

function cleanSections(sections) {
  return (Array.isArray(sections) ? sections : [])
    .map((section) => ({
      title: cleanText(section?.title),
      body: cleanText(section?.body),
    }))
    .filter((section) => section.title || section.body);
}

export const DEFAULT_POLICY = {
  title: "Privacy Policy",
  subcopy:
    "Last updated January 2026. This policy explains how we collect, use, and protect your information.",
  sections: [
    {
      title: "1. Information We Collect",
      body: "We collect information you provide directly to us, such as when you fill out our contact form, subscribe to our newsletter, or otherwise communicate with us. This may include your name, email address, company name, and any project details you share. We also automatically collect limited technical information — such as browser type, device type, and pages visited — through standard analytics tools when you use our site.",
    },
    {
      title: "2. How We Use Your Information",
      body: "We use the information we collect to respond to inquiries, deliver the services you request, send occasional newsletter updates you've opted into, and improve our website and offerings. We do not sell your personal information to third parties.",
    },
    {
      title: "3. Cookies & Analytics",
      body: "Our site may use cookies and similar technologies to understand how visitors use it and to improve performance. You can control or disable cookies through your browser settings; doing so may affect some site functionality.",
    },
    {
      title: "4. Sharing of Information",
      body: "We may share information with trusted service providers who help us operate our business — such as email delivery, hosting, and analytics providers — under obligations to protect your data. We may also disclose information if required by law or to protect our rights.",
    },
    {
      title: "5. Data Retention",
      body: "We retain personal information only as long as necessary to fulfill the purposes described in this policy, or as required by law, after which it is securely deleted or anonymized.",
    },
    {
      title: "6. Your Rights",
      body: "Depending on your location, you may have the right to access, correct, or request deletion of your personal information. To exercise any of these rights, contact us using the details below.",
    },
    {
      title: "7. Security",
      body: "We take reasonable technical and organizational measures to protect your information against unauthorized access, alteration, or disclosure. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
    },
    {
      title: "8. Changes to This Policy",
      body: "We may update this policy from time to time. Changes will be posted on this page with an updated revision date.",
    },
    {
      title: "9. Contact Us",
      body: "If you have questions about this Privacy Policy, contact us at {siteEmail} or write to us at 548 Market Street, Suite 61000, San Francisco, CA 94104.",
    },
  ],
};

const service = createSingletonDocService(POLICY_PATH, DEFAULT_POLICY);

export const subscribePolicy = service.subscribe;

export function savePolicy(payload) {
  return service.save({
    title: cleanText(payload.title),
    subcopy: cleanText(payload.subcopy),
    sections: cleanSections(payload.sections),
  });
}
