import InfoPage from "@/app/business-ops/tripfindbox/components/InfoPage";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "About Us | TripFindBox",
    description: "Learn how TripFindBox helps travelers compare routes, discover deals, and plan smoother trips.",
    path: "/business-ops/tripfindbox/about-us",
  });
}

export default function AboutUsPage() {
  return (
    <InfoPage
      eyebrow="About TripFindBox"
      title="Travel Planning Built Around Better Flight Choices"
      intro="TripFindBox helps travelers discover flight deals, compare route options, and plan trips with a simple booking-first experience."
      image="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1800&q=75"
      sections={[
        {
          heading: "Who we are",
          body: [
            "TripFindBox is a travel search experience created for people who want planning to feel clear, quick, and useful. We bring flight routes, cabin choices, traveler details, and deal signals into one focused flow so users can compare options without jumping between disconnected screens.",
            "Our goal is to make travel discovery feel less crowded. Whether someone is planning a business trip, a family vacation, or a flexible weekend getaway, TripFindBox keeps the important details close to the booking form and makes each next step easier to understand.",
          ],
        },
        {
          heading: "What we help with",
          body: [
            "From quick one-way trips to round-trip vacations, TripFindBox helps users review destinations, compare route ideas, and move from search to travel details without losing context. The experience is designed around the search itself, so origins, destinations, dates, travelers, and cabin choices stay easy to edit.",
            "We also create travel inspiration through destination pages, route pages, and deal sections. These pages help travelers explore popular cities, airline options, and flexible trip ideas before returning to a live search.",
          ],
        },
        {
          heading: "Our promise",
          body: [
            "We keep the experience focused on practical travel decisions: clear routes, readable pricing, helpful travel notes, and support-friendly booking steps. TripFindBox is not built to overwhelm travelers with unnecessary screens; it is built to make choosing a flight feel calmer and more organized.",
            "As the platform grows, our travel API structure is ready for live fare providers while keeping sensitive keys on the server. That means the interface can stay simple while the data layer becomes more powerful behind the scenes.",
          ],
        },
      ]}
    />
  );
}
