import Footer from "@/platform/navigation/Footer";
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
      <section className="hs-plain hs-contact-page">
        <span className="hs-eyebrow">Contact Us</span>
        <ContactForm />
      </section>
      <Footer />
    </main>
  );
}
