import { createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "samvatsara";
const TERMS_PATH = ["projects", PROJECT_ID, "terms", "terms"];

export const DEFAULT_TERMS = {
  hero: {
    eyebrow: "Legal",
    title: "Terms & Conditions",
    body: "Last updated: January 2026",
  },
  sections: [
    { title: "1. Acceptance of Terms", body: "By accessing this website, you agree to be bound by these terms and conditions. If you do not agree with any part of these terms, please discontinue use of the site." },
    { title: "2. Use of Our Website", body: "This website and its content are provided for general informational purposes about Aurelia Studio's services. You agree not to misuse the site, attempt unauthorized access to our systems, or reproduce our content without permission." },
    { title: "3. Intellectual Property", body: "All content on this website — including copy, visual design, illustrations, and code — is the property of Aurelia Studio unless otherwise noted, and may not be reproduced or distributed without written consent." },
    { title: "4. Client Engagements", body: "Specific terms for client projects, including scope, timeline, payment, and deliverables, are defined in individual project agreements and proposals, which take precedence over the general terms on this page for any engaged client work." },
    { title: "5. Payment & Refunds", body: "Project deposits and payment schedules are outlined in individual client agreements. Refund eligibility depends on project stage and the specific terms agreed upon at the start of the engagement." },
    { title: "6. Limitation of Liability", body: "Aurelia Studio is not liable for any indirect, incidental, or consequential damages arising from use of this website or our services, to the fullest extent permitted by law." },
    { title: "7. Third-Party Links", body: "Our site may link to third-party websites for reference or convenience. We are not responsible for the content, accuracy, or practices of any linked external sites." },
    { title: "8. Changes to These Terms", body: "We may revise these terms periodically. Continued use of the site after changes are posted constitutes your acceptance of the revised terms." },
    { title: "9. Contact Us", body: "Questions about these terms can be sent to hello@aureliastudio.com." },
  ],
  contactHeading: "",
  contactIntro: "",
  lastUpdated: "Last updated: January 2026",
};

const service = createSingletonDocService(TERMS_PATH, DEFAULT_TERMS);

export const subscribeTerms = service.subscribe;
export const saveTerms = service.save;
