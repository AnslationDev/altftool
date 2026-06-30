import InfoPage from "@/app/tripfindbox/components/InfoPage";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Terms & Conditions | TripFindBox",
    description: "Review TripFindBox terms for using the travel search and booking flow.",
    path: "/tripfindbox/terms-and-conditions",
  });
}

export default function TermsAndConditionsPage() {
  return (
    <InfoPage
      eyebrow="Terms & Conditions"
      title="Using TripFindBox For Travel Search"
      intro="These terms explain the general expectations for using TripFindBox to discover routes, compare travel options, and continue through the booking flow."
      image="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=75"
      sections={[
        {
          heading: "Travel search information",
          body: [
            "TripFindBox presents travel search information for planning and comparison. Route availability, pricing, baggage details, and timing can change before final booking confirmation, especially when live provider data is connected.",
            "The website may show sample route content, destination pages, airline pages, and deal pages to help travelers research common trips. These pages are intended for guidance and should not be treated as final ticket confirmation.",
          ],
        },
        {
          heading: "Booking flow",
          body: [
            "The current booking screens are prepared for a future full fare-order integration. Always review traveler details, route timing, baggage information, fare conditions, cancellation rules, and payment details before confirming a purchase.",
            "If a route is unavailable, TripFindBox may show no-result guidance, alternative suggestions, or nearby route ideas. These suggestions are meant to help planning and do not guarantee future availability.",
          ],
        },
        {
          heading: "Responsible use",
          body: [
            "Use TripFindBox for genuine travel planning and avoid actions that interrupt search availability, misuse route data, or attempt to access restricted systems. Automated abuse, scraping, or attempts to expose private provider credentials are not allowed.",
            "Travelers are responsible for entering accurate passenger information, selecting the correct route, and reviewing all final details before continuing through any booking step.",
          ],
        },
        {
          heading: "Support and changes",
          body: [
            "TripFindBox may update its search flow, route pages, provider connections, visual layout, and support information as the product improves. Continued use of the website means you accept the latest available version of these terms.",
            "For questions about route searches, booking guidance, or website policies, contact support@tripfindbox.com and include enough trip detail for the team to understand your request.",
          ],
        },
      ]}
    />
  );
}
