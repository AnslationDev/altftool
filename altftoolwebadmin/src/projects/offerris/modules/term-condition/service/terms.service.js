import { createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * Offerris — Terms & Conditions module data layer.
 *
 * Per CONTRACT.md, the terms page is a single doc with an inline sections array:
 *   legal/terms  singleton  { title, lastUpdated, sections:[{title,body}] }
 *
 * `{siteEmail}`/`{siteName}` placeholders are interpolated client-side by the
 * Offerris frontend from `getSite()` — leave them verbatim in the copy.
 */

const PROJECT_ID = "offerris";
const TERMS_PATH = ["projects", PROJECT_ID, "legal", "terms"];

export const DEFAULT_TERMS = {
  title: "Terms & Conditions",
  lastUpdated: "July 1, 2026",
  sections: [
    {
      title: "1. Acceptance of Terms",
      body: "By accessing or using the {siteName} website, you agree to be bound by these Terms & Conditions. If you do not agree, please discontinue use of the site.",
    },
    {
      title: "2. Services",
      body: "{siteName} provides digital agency services including but not limited to website design and development, mobile app development, SEO, email marketing, social media marketing, custom web application development, WordPress development, and UI/UX design. Specific service engagements are governed by a separate signed service agreement or statement of work.",
    },
    {
      title: "3. Intellectual Property",
      body: "All content on this website, including text, graphics, logos, and design elements, is the property of {siteName} unless otherwise noted, and is protected by applicable intellectual property laws. Client project deliverables are governed by the intellectual property terms of the applicable service agreement.",
    },
    {
      title: "4. User Conduct",
      body: "You agree not to use this website for any unlawful purpose, to attempt unauthorized access to our systems, or to interfere with the site's normal operation.",
    },
    {
      title: "5. Payment & Engagements",
      body: "Fees, payment schedules, and deliverables for client engagements are defined in individual service agreements. Late payments may result in pause of active work at {siteName}'s discretion.",
    },
    {
      title: "6. Limitation of Liability",
      body: "{siteName} is not liable for any indirect, incidental, or consequential damages arising from use of this website or our services, to the fullest extent permitted by applicable law.",
    },
    {
      title: "7. Third-Party Links",
      body: "This website may contain links to third-party sites. {siteName} is not responsible for the content or practices of any linked external site.",
    },
    {
      title: "8. Governing Law",
      body: "These Terms & Conditions are governed by the laws of the State of California, without regard to conflict of law principles.",
    },
    {
      title: "9. Changes to These Terms",
      body: "{siteName} may revise these terms at any time. Continued use of the website after changes constitutes acceptance of the revised terms.",
    },
    {
      title: "10. Contact Us",
      body: "Questions about these terms can be directed to {siteEmail}.",
    },
  ],
};

const service = createSingletonDocService(TERMS_PATH, DEFAULT_TERMS);

export const subscribeTerms = service.subscribe;
export const saveTerms = service.save;
