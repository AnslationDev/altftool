import InfoPage from "@/app/tripfindbox/components/InfoPage";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Privacy Policy | TripFindBox",
    description: "Read how TripFindBox handles travel search information and user privacy.",
    path: "/tripfindbox/privacy-policy",
  });
}

export default function PrivacyPolicyPage() {
  return (
    <InfoPage
      eyebrow="Privacy Policy"
      title="How TripFindBox Handles Your Travel Information"
      intro="TripFindBox uses travel search information to support route discovery, fare comparison, and a smoother planning experience."
      image="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=75"
      sections={[
        {
          heading: "Information we use",
          body: [
            "When you search, we may use trip details such as origin, destination, dates, travelers, and cabin preference to display relevant travel options and improve the search flow. These details help the website keep your selected route available across loading, results, no-results, and details screens.",
            "We may also use general interaction details, such as selected filters or route modifications, to make the experience easier to navigate. This helps TripFindBox understand which parts of the search flow need clearer labels, better spacing, or faster access.",
          ],
        },
        {
          heading: "How it helps your trip",
          body: [
            "Search details help us keep your selected route available so you can modify a trip without starting over. For example, if a no-result screen appears, your origin, destination, dates, passengers, and cabin can remain editable in the search area.",
            "TripFindBox is designed to support travel planning, not unnecessary data collection. The information used in the booking flow should remain connected to your search and route comparison experience.",
          ],
        },
        {
          heading: "Your control",
          body: [
            "You can change your search details at any time. Updating a location, travel date, traveler count, or cabin class refreshes the search context and helps you compare a new route more accurately.",
            "TripFindBox is designed to avoid exposing private API secrets in the browser and keeps sensitive integration keys on the server side. This keeps future travel provider connections safer while allowing the user interface to remain responsive.",
          ],
        },
        {
          heading: "Data protection approach",
          body: [
            "We use a practical privacy approach focused on protecting route searches, contact messages, and booking-flow details. As the platform grows, provider integrations should continue to separate public display data from private credentials.",
            "If you contact TripFindBox, your message may include personal details such as your name, email address, phone number, route, and travel question. These details are used to respond to your request and improve support quality.",
          ],
        },
      ]}
    />
  );
}
