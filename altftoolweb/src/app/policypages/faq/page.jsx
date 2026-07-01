import Link from "next/link";
import {
  ChevronRight,
} from "lucide-react";
import "../../styles/landing.css";
import "./faq.css";

const faqGroups = [
  {
    title: "Using AltF Tools",
    items: [
      {
        question: "What is AltF Tools?",
        answer:
          "AltF Tools is a productivity platform for discovering online tools, browser extensions, useful deals, resources, and digital workflows in one place.",
      },
      {
        question: "Do I need an account to use the tools?",
        answer:
          "Most public tools and discovery pages can be explored without an account. Some future or advanced features may require sign-in when personalization or saved activity is needed.",
      },
      {
        question: "Are AltF Tools free to use?",
        answer:
          "Many tools and pages are available for free. If a feature, product, deal, or third-party service has pricing, that information will be shown where relevant.",
      },
    ],
  },
  {
    title: "Tools, Extensions, And Deals",
    items: [
      {
        question: "How do I find the right tool?",
        answer:
          "Use the tools page search, featured collections, popular searches, and categories to filter by use case, category, or tool name.",
      },
      {
        question: "Are listed extensions built by AltF Tools?",
        answer:
          "Some resources may be created by AltF Tools, while others may link to third-party products or services. Always review the linked product page and permissions before installing anything.",
      },
      {
        question: "How are deals and recommendations selected?",
        answer:
          "AltF Tools surfaces resources based on usefulness, relevance, category fit, and available product information. Some links may be promotional or affiliate links when disclosed.",
      },
    ],
  },
  {
    title: "Privacy, Safety, And Support",
    items: [
      {
        question: "Do tools store the data I enter?",
        answer:
          "Tool inputs are generally processed only to generate results. Specific tools may rely on third-party services, so check the relevant tool page and Privacy Policy for details.",
      },
      {
        question: "How can I report an issue?",
        answer:
          "You can reach the AltF Tools team from the Contact Us page or the support link in the footer. Include the page URL, what happened, and any useful screenshots or steps.",
      },
      {
        question: "Can I request a new tool?",
        answer:
          "Yes. Use the Request a Tool or support link in the footer and describe the tool, use case, and any examples that would help us understand the workflow.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <main className="altf-home altf-faq">
      <section className="faq-hero-banner">
        <div className="faq-hero-overlay" aria-hidden="true" />
        <div className="faq-hero-content">
          <h1>Frequently Asked Questions</h1>
          <nav aria-label="Breadcrumb" className="faq-breadcrumb">
            <Link href="/">Home</Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span>FAQ</span>
          </nav>
          <p>
            Quick answers about AltF Tools, online utilities, extensions, deals,
            privacy, and support.
          </p>
        </div>
      </section>

      <section className="faq-section faq-questions-section">
        <div className="faq-container faq-questions-shell">
          <div className="faq-group-list">
            {faqGroups.map((group) => (
              <section className="faq-group" key={group.title}>
                <h3>{group.title}</h3>
                <div className="faq-accordion-list">
                  {group.items.map((item, index) => (
                    <details className="faq-accordion" key={item.question} open={index === 0}>
                      <summary>
                        <span>{item.question}</span>
                        <span className="faq-accordion-icon" aria-hidden="true" />
                      </summary>
                      <p>{item.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
