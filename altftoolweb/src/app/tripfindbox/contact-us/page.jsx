import ContactForm from "@/app/tripfindbox/components/ContactForm";
import InfoPage from "@/app/tripfindbox/components/InfoPage";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Contact Us | TripFindBox",
    description: "Contact TripFindBox for travel search support and booking help.",
    path: "/tripfindbox/contact-us",
  });
}

export default function ContactUsPage() {
  return (
    <InfoPage
      eyebrow="Contact TripFindBox"
      title="Need Help With A Route Or Fare?"
      intro="Our travel support team can help you adjust your search, review trip options, and understand the next booking step."
      image="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1800&q=75"
      sections={[]}
    >
      <h2 className="tripnest-contact-section-title">Contact Us</h2>
      <div className="tripnest-contact-layout">
        <div className="tripnest-contact-panel">
          <ContactForm />
        </div>
        <div className="tripnest-map-panel" aria-label="TripFindBox office map">
          <iframe
            title="TripFindBox office location"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Gurugram%20Haryana%20India&output=embed"
          />
        </div>
      </div>
    </InfoPage>
  );
}
