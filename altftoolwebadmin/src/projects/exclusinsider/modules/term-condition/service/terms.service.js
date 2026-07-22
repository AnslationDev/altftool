import { createSingletonDocService } from "@/lib/firestoreCrud";

const PROJECT_ID = "exclusinsider";
const TERMS_PATH = ["projects", PROJECT_ID, "legal", "terms"];

export const DEFAULT_TERMS = {
  title: "Terms & Conditions",
  sections: [
    {
      title: "1. Acceptance Of Terms",
      body: "By accessing this website or submitting an application through it, you agree to be bound by these Terms & Conditions. If you do not agree, please discontinue use of the site.",
    },
    {
      title: "2. Nature Of Engagement",
      body: "This website provides information about ExclusInsider's services. Submitting an intake application does not create a client relationship or binding obligation on either party. A formal engagement begins only upon a signed proposal or agreement between ExclusInsider and the client.",
    },
    {
      title: "3. Intellectual Property",
      body: "All content on this site — including copy, design, layout, and code — is the property of ExclusInsider Growth House LLC and may not be reproduced, distributed, or repurposed without written permission.",
    },
    {
      title: "4. Client Deliverables",
      body: "Ownership of deliverables produced under a signed client agreement transfers to the client upon full payment, as specified in that agreement. Pre-existing tools, frameworks, and proprietary methodologies used to produce those deliverables remain the property of ExclusInsider.",
    },
    {
      title: "5. Confidentiality",
      body: "We treat information shared through our intake process, and throughout any subsequent engagement, as confidential. Case studies or client mentions are published only with explicit prior written consent.",
    },
    {
      title: "6. Limitation Of Liability",
      body: "This website and its content are provided as-is. ExclusInsider makes no guarantee of specific business outcomes, rankings, or results from information presented here. Formal service guarantees, where applicable, are defined exclusively within a signed client agreement.",
    },
    {
      title: "7. Third-Party Links",
      body: "This site may reference or link to third-party tools and platforms. We are not responsible for the content, policies, or practices of any third-party site.",
    },
    {
      title: "8. Governing Law",
      body: "These terms are governed by the laws of the State of New York, without regard to conflict-of-law principles.",
    },
    {
      title: "9. Changes To These Terms",
      body: "We may revise these terms periodically. Continued use of the site after changes are posted constitutes acceptance of the revised terms.",
    },
    {
      title: "10. Contact",
      body: "Questions about these terms can be directed to our email address.",
    },
  ],
};

const service = createSingletonDocService(TERMS_PATH, DEFAULT_TERMS);

export const subscribeTerms = service.subscribe;
export const saveTerms = service.save;
