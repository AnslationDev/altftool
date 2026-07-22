import { createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * Offerris — Privacy Policy module data layer.
 *
 * Per CONTRACT.md, the policy is a single doc with an inline sections array:
 *   legal/privacy  singleton  { title, lastUpdated, sections:[{title,body}] }
 *
 * `{siteEmail}`/`{siteName}` placeholders are interpolated client-side by the
 * Offerris frontend from `getSite()` — leave them verbatim in the copy.
 */

const PROJECT_ID = "offerris";
const PRIVACY_PATH = ["projects", PROJECT_ID, "legal", "privacy"];

export const DEFAULT_POLICY = {
  title: "Privacy Policy",
  lastUpdated: "July 1, 2026",
  sections: [
    {
      title: "1. Information We Collect",
      body: "We collect information you provide directly to us — such as your name, email address, company, and project details — when you submit a contact form, subscribe to our newsletter, or engage us for services. We also collect limited technical data automatically, including IP address, browser type, and pages visited, through standard analytics tools.",
    },
    {
      title: "2. How We Use Your Information",
      body: "We use the information we collect to respond to inquiries, deliver contracted services, send newsletter updates you've opted into, improve our website and offerings, and comply with legal obligations. We do not sell your personal information to third parties.",
    },
    {
      title: "3. Cookies & Tracking",
      body: "Our website uses cookies and similar technologies to understand site usage and improve performance. You can control cookie preferences through your browser settings; disabling cookies may affect certain site functionality.",
    },
    {
      title: "4. Data Sharing",
      body: "We may share information with service providers who support our operations — such as hosting, email delivery, and analytics platforms — under agreements that require them to protect your data. We may also disclose information if required by law.",
    },
    {
      title: "5. Data Retention",
      body: "We retain personal information for as long as necessary to fulfill the purposes described in this policy, unless a longer retention period is required by law or legitimate business need, such as active client contracts.",
    },
    {
      title: "6. Your Rights",
      body: "Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict the use of your personal information. To exercise these rights, contact us using the details below.",
    },
    {
      title: "7. Security",
      body: "We implement reasonable administrative, technical, and physical safeguards designed to protect personal information from unauthorized access, disclosure, or misuse.",
    },
    {
      title: "8. Changes to This Policy",
      body: "We may update this privacy policy periodically. Material changes will be reflected by an updated revision date at the top of this page.",
    },
    {
      title: "9. Contact Us",
      body: "Questions about this privacy policy can be directed to {siteEmail}.",
    },
  ],
};

const service = createSingletonDocService(PRIVACY_PATH, DEFAULT_POLICY);

export const subscribePolicy = service.subscribe;
export const savePolicy = service.save;
