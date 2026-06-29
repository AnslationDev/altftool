import Footer from "@/platform/navigation/Footer";
import { SiteHeader } from "../components/SiteHeader";

export const metadata = {
  title: "Privacy Policy | QuoteNest Pros",
  description: "Privacy practices for QuoteNest Pros home-service quote requests.",
};

export default function PrivacyPolicyPage() {
  return (
    <main>
      <SiteHeader />
      <section className="hs-plain">
        <span className="hs-eyebrow">Privacy Policy</span>

        <h2>Overview</h2>
        <p>
          QuoteNest Pros helps homeowners request and compare local home-service quotes. This policy explains what
          information we collect, how we use it, and the choices available to you.
        </p>

        <h2>Information We Collect</h2>
        <p>
          We may collect information you provide, including your name, email address, phone number, ZIP code, service
          interest, project details, and messages submitted through forms on this website.
        </p>
        <p>
          We may also collect basic device and usage information, such as browser type, pages viewed, referral source,
          approximate location, and interaction data used to improve site performance and user experience.
        </p>

        <h2>How We Use Information</h2>
        <p>
          We use information to respond to requests, match users with relevant service providers, improve our website,
          prevent fraud or misuse, comply with legal obligations, and communicate about quote requests or related
          services.
        </p>

        <h2>Sharing Information</h2>
        <p>
          When you request quotes, we may share relevant project and contact information with service providers or
          partners who can respond to your request. We do not sell personal information for unrelated marketing.
        </p>

        <h2>Cookies And Analytics</h2>
        <p>
          We may use cookies or similar technologies to remember preferences, understand traffic patterns, measure
          performance, and improve the website. You can adjust browser settings to limit cookies.
        </p>

        <h2>Your Choices</h2>
        <p>
          You may request access, correction, or deletion of personal information by contacting us. Some information may
          be retained where required for security, legal, or business record purposes.
        </p>

        <h2>Data Security</h2>
        <p>
          We use reasonable administrative, technical, and organizational safeguards designed to protect personal
          information. No online system can be guaranteed completely secure.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy can be sent through our contact page or by contacting QuoteNest Pros customer
          support.
        </p>
      </section>
      <Footer />
    </main>
  );
}
