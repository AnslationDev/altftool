import { createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "dealnbook";
const TERMS_PATH = ["projects", PROJECT_ID, "legal", "terms"];

export const DEFAULT_TERMS = {
  title: "Terms & Conditions",
  effectiveDate: "Effective: January 2026",
  sections: [
    { title: "1. Acceptance of Terms", body: "By accessing this website, you agree to be bound by these terms and conditions. If you do not agree with any part of these terms, please discontinue use of the site." },
    { title: "2. Use of Our Website", body: "This website and its content are provided for general informational purposes about the offers, coupons, and deals we curate. You agree not to misuse the site, attempt unauthorized access to our systems, or reproduce our content without permission." },
    { title: "3. Accuracy of Offers", body: "We work to verify every offer before publishing it, but discounts, prices, and availability are controlled by the merchants themselves and can change or expire without notice. We are not responsible for offers that no longer work by the time you use them." },
    { title: "4. Affiliate Relationships", body: "Dealnbook may earn a commission when you click through and make a purchase or booking using a link on our site. This does not affect the price you pay and does not influence which offers we choose to feature." },
    { title: "5. Intellectual Property", body: "All content on this website — including copy, visual design, and code — is the property of Dealnbook unless otherwise noted, and may not be reproduced or distributed without written consent." },
    { title: "6. Limitation of Liability", body: "Dealnbook is not liable for any indirect, incidental, or consequential damages arising from use of this website or reliance on any offer listed here, to the fullest extent permitted by law." },
    { title: "7. Third-Party Links", body: "Our site links to third-party merchant websites for reference and convenience. We are not responsible for the content, accuracy, or practices of any linked external sites." },
    { title: "8. Changes to These Terms", body: "We may revise these terms periodically. Continued use of the site after changes are posted constitutes your acceptance of the revised terms." },
    { title: "9. Contact Us", body: "Questions about these terms can be sent to hello@dealnbook.com." },
  ],
};

const service = createSingletonDocService(TERMS_PATH, DEFAULT_TERMS);

export const subscribeTerms = service.subscribe;
export const saveTerms = service.save;
