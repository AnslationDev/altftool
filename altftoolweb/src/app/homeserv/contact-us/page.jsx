import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { ContactForm } from "./ContactForm";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Contact Us | QuoteNest Pros",
    description: "Contact QuoteNest Pros for home-service quote support.",
    path: "/homeserv/contact-us",
  });
}

export default function ContactUsPage() {
  return (
    <main>
      <SiteHeader />
      <section className="plain-page contact-page">
        <p className="eyebrow">Contact Us</p>
        <ContactForm />
      </section>
      <SiteFooter />
    </main>
  );
}
