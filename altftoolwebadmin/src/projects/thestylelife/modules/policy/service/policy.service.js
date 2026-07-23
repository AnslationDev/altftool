import { createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * TheStyleLife — Privacy Policy module data layer.
 *
 * Single doc `projects/thestylelife/legal/privacy` with an inline `sections`
 * array (see CONTRACT.md). Unlike Shophobia's `lastUpdated` field, this
 * shape carries `subcopy` — the PageHero line rendered directly under the
 * page title (e.g. "Last updated July 1, 2026. ..."). `{siteEmail}` /
 * `{siteName}` placeholders are interpolated client-side by the frontend
 * from site settings.
 */

const PROJECT_ID = "thestylelife";
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
    "Last updated July 1, 2026. This policy explains what we collect through this website and how it's handled.",
  sections: [
    {
      title: "1. What We Collect",
      body: "When you submit our contact form, subscribe to The Edit, or correspond with us by email, we collect the information you provide directly — your name, email address, company, and any details about your project or timeline. We also collect standard technical data (browser type, device, approximate location, and pages visited) through analytics tools to understand how the site is used.",
    },
    {
      title: "2. How We Use It",
      body: "Information submitted through our contact form is used solely to respond to your inquiry and, if a project moves forward, to begin a working relationship. Newsletter subscribers receive The Edit and nothing else. We do not sell, rent, or trade personal information to third parties under any circumstances.",
    },
    {
      title: "3. Cookies & Analytics",
      body: "We use privacy-respecting analytics to understand aggregate site traffic and performance. These tools do not track you across other websites, and no data collected is used for third-party advertising.",
    },
    {
      title: "4. Data Retention",
      body: "Contact form submissions that do not result in an engagement are retained for twelve months, then deleted. Client records are retained for the duration of the engagement plus applicable legal and accounting requirements.",
    },
    {
      title: "5. Your Rights",
      body: "You may request access to, correction of, or deletion of any personal information we hold about you at any time by emailing us directly. We respond to all requests within thirty days.",
    },
    {
      title: "6. Security",
      body: "We apply industry-standard technical and organizational measures to protect the information you share with us, including encrypted transmission and restricted internal access on a need-to-know basis.",
    },
    {
      title: "7. Changes to This Policy",
      body: "We may update this policy from time to time to reflect changes in our practices or legal requirements. Material changes will be noted with an updated effective date at the top of this page.",
    },
    {
      title: "8. Contact",
      body: "Questions about this policy can be directed to {siteEmail}.",
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
