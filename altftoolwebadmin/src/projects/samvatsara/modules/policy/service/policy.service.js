import { createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "samvatsara";
const PRIVACY_PATH = ["projects", PROJECT_ID, "policy", "privacy"];

export const DEFAULT_POLICY = {
  hero: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    body: "Last updated: January 2026",
  },
  sections: [
    { title: "1. What We Collect", body: "When you fill out our contact form, subscribe to our newsletter, or otherwise get in touch, we collect the information you provide directly — typically your name, email address, and any project details you choose to share. Our site analytics also collect standard, aggregated usage data such as pages visited and general location." },
    { title: "2. How We Use It", body: "We use the information you share to respond to inquiries, deliver the services you've requested, send newsletter updates you've opted into, and improve our website and studio operations. We do not sell, rent, or trade your personal information to third parties." },
    { title: "3. Cookies & Analytics", body: "Our website may use cookies and similar technologies to understand how visitors use our site and to improve performance. You can disable cookies through your browser settings at any time, though some site features may not function as intended." },
    { title: "4. Data Storage & Security", body: "We take reasonable technical and organizational measures to protect the information you share with us from unauthorized access, alteration, or disclosure. No method of transmission over the internet is entirely secure, and we can't guarantee absolute security." },
    { title: "5. Third-Party Services", body: "We may use trusted third-party tools for email delivery, analytics, and hosting. These providers only access the information necessary to perform their function and are bound by their own privacy commitments." },
    { title: "6. Your Rights", body: "You can request access to, correction of, or deletion of your personal information at any time by contacting us directly. You may also unsubscribe from our newsletter using the link included in every email we send." },
    { title: "7. Changes to This Policy", body: "We may update this privacy policy from time to time to reflect changes in our practices. Any updates will be posted on this page with a revised effective date." },
    { title: "8. Contact Us", body: "Questions about this policy can be sent to hello@aureliastudio.com — we'll get back to you personally." },
  ],
  contactHeading: "",
  contactIntro: "",
  lastUpdated: "Last updated: January 2026",
};

const service = createSingletonDocService(PRIVACY_PATH, DEFAULT_POLICY);

export const subscribePolicy = service.subscribe;
export const savePolicy = service.save;
