import { createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * Snapagee — Terms & Conditions module data layer.
 *
 * Single doc `projects/snapagee/legal/terms` with an inline `sections` array
 * (see CONTRACT.md). Same `subcopy` convention as the policy module. The
 * `DEFAULT_TERMS` seed below is copied verbatim from the frontend's
 * currently-hardcoded `app/terms-and-conditions/page.jsx` `SECTIONS`
 * constant so the admin's Firestore default matches exactly what the live
 * site already shows.
 */

const PROJECT_ID = "snapagee";
const TERMS_PATH = ["projects", PROJECT_ID, "legal", "terms"];

const cleanText = (value = "") => String(value ?? "").trim();

function cleanSections(sections) {
  return (Array.isArray(sections) ? sections : [])
    .map((section) => ({
      title: cleanText(section?.title),
      body: cleanText(section?.body),
    }))
    .filter((section) => section.title || section.body);
}

export const DEFAULT_TERMS = {
  title: "Terms & Conditions",
  subcopy: "Last updated January 2026. Please read these terms carefully before using our website or services.",
  sections: [
    {
      title: "1. Acceptance of Terms",
      body: "By accessing or using this website, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use this site.",
    },
    {
      title: "2. Services",
      body: "Snapagee provides digital marketing, design, and engineering services as described on this website. Specific engagements are governed by a separate signed proposal or statement of work, which takes precedence over these general terms where applicable.",
    },
    {
      title: "3. Use of Website",
      body: "You agree to use this website only for lawful purposes and in a way that does not infringe the rights of, or restrict or inhibit the use of, this site by any third party. You may not attempt to gain unauthorized access to any part of this site or its related systems.",
    },
    {
      title: "4. Intellectual Property",
      body: "All content on this website — including text, graphics, logos, and design — is the property of Snapagee or its licensors and is protected by applicable intellectual property laws. You may not reproduce or distribute this content without prior written permission.",
    },
    {
      title: "5. Client Deliverables",
      body: "Ownership of deliverables produced for a client engagement transfers as specified in the relevant signed proposal, typically upon full payment. Until then, all work product remains the property of Snapagee.",
    },
    {
      title: "6. Limitation of Liability",
      body: "This website and its content are provided \"as is\" without warranties of any kind. Snapagee shall not be liable for any indirect, incidental, or consequential damages arising from your use of this site.",
    },
    {
      title: "7. Third-Party Links",
      body: "This site may contain links to third-party websites. We are not responsible for the content or practices of any linked sites.",
    },
    {
      title: "8. Changes to Terms",
      body: "We may revise these terms at any time. Continued use of the site after changes are posted constitutes acceptance of the revised terms.",
    },
    {
      title: "9. Governing Law",
      body: "These terms are governed by the laws of the State of California, without regard to its conflict of law principles.",
    },
    {
      title: "10. Contact Us",
      body: "Questions about these Terms & Conditions can be sent to {siteEmail}.",
    },
  ],
};

const service = createSingletonDocService(TERMS_PATH, DEFAULT_TERMS);

export const subscribeTerms = service.subscribe;

export function saveTerms(payload) {
  return service.save({
    title: cleanText(payload.title),
    subcopy: cleanText(payload.subcopy),
    sections: cleanSections(payload.sections),
  });
}
