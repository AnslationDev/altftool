import Footer from "@/platform/navigation/Footer";
import { SiteHeader } from "../components/SiteHeader";
import { ContactForm } from "./ContactForm";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Contact Us | QuoteNest Pros",
    description: "Contact QuoteNest Pros for help with home-service quote requests, project details, provider questions, and next steps.",
    path: "/homeserv/contact-us",
  });
}

export default function ContactUsPage() {
  return (
    <main>
      <SiteHeader />
      <section className="hs-plain hs-contact-page">
        <span className="hs-eyebrow">Contact Us</span>
        <h1>Contact QuoteNest Pros</h1>
        <ContactForm />
      </section>
      <Footer />
    </main>
  );
}
