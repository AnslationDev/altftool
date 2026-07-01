import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Fingerprint,
} from "lucide-react";
import "../../styles/landing.css";
import "./privacy.css";

const quickPrinciples = [
  "No selling personal data",
  "Minimal collection by default",
  "Tool inputs processed for results",
  "Clear third-party disclosure",
];

const policySections = [
  {
    id: "information-we-collect",
    number: "01",
    title: "Information We Collect",
    paragraphs: [
      "Personal Information: Name, email address, and information voluntarily submitted through forms or contact channels.",
      "Non-Personal Information: IP address, browser type, device data, usage metrics, and referral sources.",
      "Cookies: Used to enhance functionality, analyze traffic, improve tools, and support advertising.",
      "We avoid collecting sensitive personal data unless it is necessary for a specific feature and clearly disclosed in advance.",
    ],
  },
  {
    id: "how-we-use-information",
    number: "02",
    title: "How We Use Information",
    list: [
      "Operate and improve tools and services",
      "Respond to inquiries and support requests",
      "Analyze usage and performance",
      "Display advertisements and promotions",
      "Comply with legal obligations",
      "Maintain security and prevent abuse or misuse",
      "Improve user experience and interface usability",
    ],
    paragraphs: [
      "We do not use personal data for automated decision-making or profiling that produces legal or significant effects.",
    ],
  },
  {
    id: "microtools-data-processing",
    number: "03",
    title: "Microtools & Data Processing",
    paragraphs: [
      "User input is processed only to generate results. We do not store sensitive data such as passwords or financial information unless explicitly stated for a specific tool.",
      "Some tools may rely on third-party APIs. Their data handling is governed by their own privacy policies.",
      "Data entered into tools is typically processed in real time and discarded immediately after the result is generated.",
      "Where temporary processing is required, data is handled securely and retained only for the minimum duration necessary.",
    ],
  },
  {
    id: "blogs-user-content",
    number: "04",
    title: "Blogs & User Content",
    paragraphs: [
      "Blog content is informational only. Any personal information shared publicly is done at the user's discretion.",
      "Users are advised not to share sensitive or confidential information in public comments or community interactions.",
    ],
  },
  {
    id: "advertising-third-parties",
    number: "05",
    title: "Advertising & Third Parties",
    paragraphs: [
      "Third-party advertisers may use cookies or similar technologies. We do not control their data practices.",
      "Third-party services may collect information independently in accordance with their own privacy policies and terms.",
      "AltF Tools encourages users to review third-party privacy policies before interacting with external content.",
    ],
  },
  {
    id: "data-sharing",
    number: "06",
    title: "Data Sharing",
    paragraphs: ["We do not sell personal data. Information may be shared only:"],
    list: [
      "With trusted service providers",
      "To comply with legal requirements",
      "To protect users and platform integrity",
      "During business transfers or acquisitions",
    ],
    note: "All service providers are required to follow appropriate data protection and confidentiality obligations.",
  },
  {
    id: "data-security",
    number: "07",
    title: "Data Security",
    paragraphs: [
      "Reasonable technical and organizational measures are applied, but no system can guarantee absolute security.",
      "We regularly review security practices and update safeguards to reflect industry standards and evolving risks.",
    ],
  },
  {
    id: "children-privacy",
    number: "08",
    title: "Children's Privacy",
    paragraphs: [
      "Services are not intended for children under 13. Any such data will be removed if identified.",
      "Parents or guardians who believe a child has provided personal data may contact us for prompt removal.",
    ],
  },
  {
    id: "policy-updates",
    number: "09",
    title: "Policy Updates",
    paragraphs: [
      "This Privacy Policy may be updated at any time. Continued use of the platform constitutes acceptance of the revised policy.",
      "We recommend reviewing this policy periodically to stay informed about how your information is protected.",
    ],
  },
  {
    id: "contact",
    number: "10",
    title: "Contact",
    paragraphs: [
      "Email: altftool@gmail.com",
      "Website: www.altftool.com",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <main className="altf-home altf-privacy">
      <section className="privacy-hero-banner">
        <div className="privacy-hero-overlay" aria-hidden="true" />
        <div className="privacy-hero-content">
          <h1>Privacy Policy</h1>
          <nav aria-label="Breadcrumb" className="privacy-breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span>Privacy Policy</span>
          </nav>
          <p>
            Learn how AltF Tools collects, uses, protects, and handles information
            across our tools, apps, blogs, extensions, and related services.
          </p>
        </div>
      </section>

      <section className="privacy-section privacy-overview-section">
        <div className="privacy-container">
          <div className="privacy-copy-block">
            <div className="home-reference-badge privacy-theme-badge">
              <Fingerprint className="h-4 w-4" strokeWidth={2.35} />
              Our Privacy Promise
            </div>
            <h2>
              Clear, Careful, And{" "}
              <span>Built Around Trust.</span>
            </h2>
            <p>
              At <strong>AltF Tools</strong>, protecting user privacy is a core
              principle. This Privacy Policy explains how information is collected,
              used, and safeguarded across our platform.
            </p>
            <p>
              This policy applies to all visitors, users, and interactions across
              AltF Tools, including web pages, tools, blogs, and related services.
            </p>
            <ul className="privacy-inline-principles" aria-label="Privacy principles">
              {quickPrinciples.map((item) => (
                <li key={item}>
                  <CheckCircle2 className="h-4 w-4" strokeWidth={2.3} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="privacy-section privacy-policy-section">
        <div className="privacy-container privacy-policy-document">
          <div className="privacy-policy-list">
            {policySections.map((section) => (
              <PolicyCard section={section} key={section.id} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function PolicyCard({ section }) {
  return (
    <article className="privacy-policy-card" id={section.id}>
      <h2>{`${Number(section.number)}. ${section.title}`}</h2>

      <div className="privacy-policy-card-body">
        {section.paragraphs?.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}

        {section.list ? (
          <ul>
            {section.list.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}

        {section.note ? <p className="privacy-policy-note">{section.note}</p> : null}
      </div>
    </article>
  );
}
