import { createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "offerhoppr";
const PRIVACY_PATH = ["projects", PROJECT_ID, "policy", "privacy"];

export const DEFAULT_POLICY = {
  badge: "Legal",
  title: "Privacy Policy",
  effectiveDate: "Effective: January 2026",
  sections: [
    { title: "1. What We Collect", body: "When you browse Offerhoppr, sign up for our newsletter, or submit the contact form, we collect the information you provide directly — typically your name and email address — along with standard, aggregated analytics data such as pages visited and general location." },
    { title: "2. How We Use It", body: "We use the information you share to respond to inquiries, send newsletter updates you've opted into, and improve the offers and experience we surface on the site. We do not sell, rent, or trade your personal information to third parties." },
    { title: "3. Cookies & Tracking", body: "Offerhoppr uses cookies and similar technologies to remember your preferences, measure traffic, and track when coupon codes are used. You can disable cookies through your browser settings at any time, though some features may not work as intended." },
    { title: "4. Affiliate Disclosure", body: "Some links on Offerhoppr are affiliate links. If you make a purchase through one of these links, we may earn a commission at no extra cost to you. This never affects which offers we choose to feature." },
    { title: "5. Data Storage & Security", body: "We take reasonable technical and organizational measures to protect the information you share with us from unauthorized access, alteration, or disclosure. No method of transmission over the internet is entirely secure, and we can't guarantee absolute security." },
    { title: "6. Third-Party Services", body: "We may use trusted third-party tools for email delivery, analytics, and hosting. These providers only access the information necessary to perform their function and are bound by their own privacy commitments." },
    { title: "7. Your Rights", body: "You can request access to, correction of, or deletion of your personal information at any time by contacting us directly. You may also unsubscribe from our newsletter using the link included in every email we send." },
    { title: "8. Changes to This Policy", body: "We may update this privacy policy from time to time to reflect changes in our practices. Any updates will be posted on this page with a revised effective date." },
    { title: "9. Contact Us", body: "Questions about this policy can be sent to hello@offerhoppr.com — we'll get back to you personally." },
  ],
};

const service = createSingletonDocService(PRIVACY_PATH, DEFAULT_POLICY);

export const subscribePolicy = service.subscribe;
export const savePolicy = service.save;
