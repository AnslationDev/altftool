import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  Gavel,
  Handshake,
  ShieldCheck,
} from "lucide-react";
import "../../styles/landing.css";
import "./terms.css";

const quickPrinciples = [
  "Use services lawfully",
  "Respect platform ownership",
  "Review outputs carefully",
  "Clear liability boundaries",
];

const termsSections = [
  {
    id: "eligibility",
    number: "01",
    title: "Eligibility",
    list: [
      "You are at least 13 years old",
      "You have legal capacity to accept these Terms",
      "You comply with applicable laws and regulations",
    ],
  },
  {
    id: "use-of-services",
    number: "02",
    title: "Use of Services",
    paragraphs: ["You agree not to:"],
    list: [
      "Violate any laws or regulations",
      "Infringe intellectual property rights",
      "Disrupt or interfere with platform functionality",
      "Attempt unauthorized access to systems",
      "Upload malware, spam, or harmful content",
    ],
  },
  {
    id: "microtools-usage",
    number: "03",
    title: "Microtools Usage",
    paragraphs: [
      "All microtools are provided on an “as-is” and “as-available” basis. We do not guarantee accuracy, reliability, or suitability for any purpose.",
      "Use of tools is entirely at your own risk.",
      "Tool outputs are generated automatically and may vary based on input, system updates, or third-party dependencies.",
      "Results should not be relied upon as professional, legal, financial, or technical advice.",
    ],
  },
  {
    id: "intellectual-property",
    number: "04",
    title: "Intellectual Property",
    paragraphs: [
      "All content, tools, designs, and software are owned by AltF Tools or its licensors and protected by intellectual property laws.",
      "You may not copy, modify, distribute, or commercially exploit any part of the Services without written permission.",
      "All trademarks, logos, and brand elements displayed on the platform remain the exclusive property of AltF Tools.",
    ],
  },
  {
    id: "user-generated-content",
    number: "05",
    title: "User-Generated Content",
    paragraphs: [
      "By submitting content, you grant AltF Tools a non-exclusive, royalty-free license to use and display it. We reserve the right to remove content at our discretion.",
      "You are solely responsible for ensuring that submitted content does not violate any third-party rights or applicable laws.",
    ],
  },
  {
    id: "third-party-services",
    number: "06",
    title: "Third-Party Services",
    paragraphs: [
      "We do not control or endorse third-party websites or services and are not responsible for their content or practices.",
      "Accessing third-party services is done at your own discretion and risk.",
    ],
  },
  {
    id: "advertising-affiliates",
    number: "07",
    title: "Advertising & Affiliates",
    paragraphs: [
      "The platform may display advertisements or affiliate links. We may earn commissions at no additional cost to users.",
      "Some links may be affiliate-based, meaning we may earn a commission without additional cost to you.",
    ],
  },
  {
    id: "disclaimer-of-warranties",
    number: "08",
    title: "Disclaimer of Warranties",
    paragraphs: [
      "Services are provided “as-is” and “as-available” without warranties of any kind, express or implied.",
      "We make no guarantees regarding availability, accuracy, or uninterrupted operation of the Services.",
    ],
  },
  {
    id: "limitation-of-liability",
    number: "09",
    title: "Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by law, AltF Tools shall not be liable for any damages arising from use or inability to use the Services.",
      "This limitation applies even if we have been advised of the possibility of such damages.",
    ],
  },
  {
    id: "indemnification",
    number: "10",
    title: "Indemnification",
    paragraphs: [
      "You agree to indemnify and hold harmless AltF Tools from any claims arising from your use of the Services or violation of these Terms.",
      "This obligation survives termination of these Terms.",
    ],
  },
  {
    id: "termination",
    number: "11",
    title: "Termination",
    paragraphs: [
      "We may suspend or terminate access at any time without notice for violations or harmful conduct.",
      "Termination does not affect provisions that by nature should survive, including intellectual property and liability clauses.",
    ],
  },
  {
    id: "governing-law",
    number: "12",
    title: "Governing Law",
    paragraphs: [
      "These Terms are governed by the laws of India.",
      "Courts located in India shall have exclusive jurisdiction over disputes.",
    ],
  },
  {
    id: "changes-to-these-terms",
    number: "13",
    title: "Changes to These Terms",
    paragraphs: [
      "Continued use of the platform after updates constitutes acceptance of the revised Terms.",
      "Updated versions will be posted on this page with a revised effective date.",
    ],
  },
  {
    id: "contact",
    number: "14",
    title: "Contact",
    paragraphs: ["Email: altftool@gmail.com", "Website: www.altftool.com"],
  },
];

export default function TermsAndConditions() {
  return (
    <main className="altf-home altf-terms">
      <section className="terms-hero-banner">
        <div className="terms-hero-overlay" aria-hidden="true" />
        <div className="terms-hero-content">
          <h1>Terms & Conditions</h1>
          <nav aria-label="Breadcrumb" className="terms-breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span>Terms & Conditions</span>
          </nav>
          <p>
            These terms govern your access to and use of AltF Tools, microtools,
            and related services.
          </p>
        </div>
      </section>

      <section className="terms-section terms-overview-section">
        <div className="terms-container">
          <div className="terms-copy-block">
            <div className="home-reference-badge terms-theme-badge">
              <Handshake className="h-4 w-4" strokeWidth={2.35} />
              Our Agreement
            </div>
            <h2>
              Clear Rules For A{" "}
              <span>Trusted Platform.</span>
            </h2>
            <p>
              Welcome to <strong>AltF Tools</strong>. These Terms & Conditions
              govern your access to and use of our website, microtools, and
              related services. By using the platform, you agree to these Terms.
            </p>
            <ul className="terms-inline-principles" aria-label="Terms principles">
              {quickPrinciples.map((item) => (
                <li key={item}>
                  <CheckCircle2 className="h-4 w-4" strokeWidth={2.3} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="terms-highlight-grid" aria-label="Terms highlights">
            <TermsHighlight
              icon={ShieldCheck}
              title="Eligibility"
              text="Users must meet age and legal requirements."
            />
            <TermsHighlight
              icon={FileText}
              title="Acceptable Use"
              text="Services must be used lawfully and responsibly."
            />
            <TermsHighlight
              icon={Gavel}
              title="Legal Protection"
              text="Clear limits on warranties and liability."
            />
          </div>
        </div>
      </section>

      <section className="terms-section terms-policy-section">
        <div className="terms-container terms-policy-document">
          <div className="terms-policy-list">
            {termsSections.map((section) => (
              <TermsCard section={section} key={section.id} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function TermsHighlight({ icon: Icon, title, text }) {
  return (
    <article className="terms-highlight-card">
      <span>
        <Icon className="h-5 w-5" strokeWidth={2.25} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function TermsCard({ section }) {
  return (
    <article className="terms-policy-card" id={section.id}>
      <h2>{`${Number(section.number)}. ${section.title}`}</h2>

      <div className="terms-policy-card-body">
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
      </div>
    </article>
  );
}
