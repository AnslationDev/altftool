import { createSingletonDocService } from "@/lib/firestoreCrud";

/**
 * TheStyleLife — Terms & Conditions module data layer.
 *
 * Single doc `projects/thestylelife/legal/terms` with an inline `sections`
 * array (see CONTRACT.md). Same `subcopy` convention as the policy module —
 * the PageHero line rendered directly under the page title. `{siteEmail}` /
 * `{siteName}` placeholders are interpolated client-side by the frontend
 * from site settings.
 */

const PROJECT_ID = "thestylelife";
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
  subcopy: "Last updated July 1, 2026. Please read these terms carefully before engaging our services.",
  sections: [
    {
      title: "1. Acceptance of Terms",
      body: "By accessing this website or engaging TheStyleLife for services, you agree to be bound by these terms. If you do not agree, please do not use this site or engage our services.",
    },
    {
      title: "2. Services",
      body: "TheStyleLife provides website design and development, mobile app development, SEO, email marketing, social media marketing, custom web application development, WordPress development, and UI/UX design services. The specific scope, timeline, and deliverables for any engagement are defined in a separate signed proposal or statement of work.",
    },
    {
      title: "3. Payment Terms",
      body: "Engagement fees, payment schedules, and milestones are outlined in each project's individual proposal. Unless otherwise agreed in writing, invoices are due within fifteen days of issue.",
    },
    {
      title: "4. Intellectual Property",
      body: "Upon full payment, clients receive ownership of final deliverables created specifically for their project. TheStyleLife retains the right to display completed work in its portfolio unless a client requests otherwise in writing.",
    },
    {
      title: "5. Revisions & Scope",
      body: "Each engagement includes a defined number of revision rounds, specified in the proposal. Work requested beyond the agreed scope is billed separately at our standard rates.",
    },
    {
      title: "6. Termination",
      body: "Either party may terminate an engagement with thirty days' written notice. Fees for work completed up to the termination date remain payable.",
    },
    {
      title: "7. Limitation of Liability",
      body: "TheStyleLife's liability for any claim arising from our services is limited to the fees paid for the specific engagement in question. We are not liable for indirect or consequential damages.",
    },
    {
      title: "8. Governing Law",
      body: "These terms are governed by the laws of the State of New York, without regard to its conflict of law principles.",
    },
    {
      title: "9. Contact",
      body: "Questions about these terms can be directed to {siteEmail}.",
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
