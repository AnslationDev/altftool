import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { ContactForm } from "./ContactForm";

export const metadata = {
  title: "Contact Us | QuoteNest Pros",
  description: "Contact QuoteNest Pros for home-service quote support.",
};

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
