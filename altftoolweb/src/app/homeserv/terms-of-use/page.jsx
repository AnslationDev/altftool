import Footer from "@/platform/navigation/Footer";
import { SiteHeader } from "../components/SiteHeader";

export const metadata = {
  title: "Terms of Use | QuoteNest Pros",
  description: "Terms for using QuoteNest Pros home-service quote pages.",
};

export default function TermsOfUsePage() {
  return (
    <main>
      <SiteHeader />
      <section className="hs-plain">
        <span className="hs-eyebrow">Terms of Use</span>

        <h2>Acceptance Of Terms</h2>
        <p>
          By using QuoteNest Pros, you agree to these Terms of Use. If you do not agree, please do not use this website
          or submit quote requests through it.
        </p>

        <h2>Our Service</h2>
        <p>
          QuoteNest Pros provides a platform experience that helps users explore home-service categories and request
          quotes from local professionals or partners. We are not the contractor performing the work.
        </p>

        <h2>User Information</h2>
        <p>
          You agree to provide accurate, current, and complete information when submitting forms. You are responsible for
          reviewing any quote, contractor details, license information, insurance information, and agreement before hiring
          a provider.
        </p>

        <h2>No Guarantee</h2>
        <p>
          We may display service providers, quote estimates, savings examples, ratings, or response information for
          convenience. We do not guarantee availability, pricing, quality, timing, licensing, or final project outcome.
        </p>

        <h2>Permitted Use</h2>
        <p>
          You may use this website for personal, lawful home-service research and quote requests. You may not misuse the
          site, submit false information, interfere with security, scrape content, or use the service for unlawful
          purposes.
        </p>

        <h2>Third-Party Providers</h2>
        <p>
          Any work performed by a contractor or service provider is governed by your separate agreement with that
          provider. QuoteNest Pros is not responsible for contractor actions, omissions, estimates, warranties, or
          completed work.
        </p>

        <h2>Limitation Of Liability</h2>
        <p>
          To the fullest extent permitted by law, QuoteNest Pros is not liable for indirect, incidental, consequential,
          or special damages arising from your use of the website or services arranged through third parties.
        </p>

        <h2>Changes To Terms</h2>
        <p>
          We may update these terms from time to time. Continued use of the website after changes means you accept the
          updated terms.
        </p>

        <h2>Contact</h2>
        <p>Questions about these terms can be submitted through our contact page.</p>
      </section>
      <Footer />
    </main>
  );
}
