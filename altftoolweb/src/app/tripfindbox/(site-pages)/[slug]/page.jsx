import FlightSearchBox from "@/app/tripfindbox/components/FlightSearchBox";
import FloatingCallIcon from "@/app/tripfindbox/components/FloatingCallIcon";
import { Footer } from "@/app/tripfindbox/components/HeroSection";
import ResultsHeader from "@/app/tripfindbox/components/ResultsHeader";
import RouteBottomSlider from "@/app/tripfindbox/components/RouteBottomSlider";
import SeoRouteDealsGrid from "@/app/tripfindbox/components/SeoRouteDealsGrid";
import { getTripFindBoxContactInfo, telHref } from "@/app/tripfindbox/lib/contactInfo";
import { getSitemapPage, sitemapPages } from "@/app/tripfindbox/lib/sitemapPages";
import { tfbPath } from "@/app/tripfindbox/lib/tfbLink";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import Link from "next/link";

export const dynamic = "force-dynamic";

function titleFromSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function fallbackSitemapPage(slug) {
  const title = titleFromSlug(slug);

  if (slug.startsWith("flights-to-")) {
    return {
      title,
      slug,
      section: "Top Cities",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=70",
    };
  }

  return {
    title,
    slug,
    section: "TripFindBox Routes",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=70",
  };
}

function cleanRouteName(title) {
  return title.replace(/\s+Flights$/i, "").replace(/^Flights to\s+/i, "");
}

function routeCategory(section) {
  if (section === "Top Airlines") return "Airlines";
  if (section === "Top Cities") return "Destinations";
  if (section === "Top Deals") return "Deals";
  if (section === "Quick Links") return "Company";
  if (section === "Useful Links") return "Travel Help";
  return "Routes";
}

function pageKind(section, title) {
  const lowered = title.toLowerCase();
  if (section === "Top Airlines") return "airline";
  if (section === "Top Cities") return "city";
  if (section === "Top Deals") return "deal";
  if (lowered.includes("faq")) return "faq";
  if (lowered.includes("booking")) return "booking";
  if (section === "Useful Links" || lowered.includes("security") || lowered.includes("policy") || lowered.includes("fees")) return "policy";
  return "generic";
}

const airlineSummaries = {
  "Spirit Airlines": "Spirit Airlines is known for low-fare travel across the United States, the Caribbean, and Latin America. TripFindBox presents Spirit route planning with clear reminders for baggage, seat choices, and fare add-ons because ultra-low-cost tickets can vary by included services.",
  "Frontier Airlines": "Frontier Airlines focuses on budget-friendly routes across many U.S. cities, with optional extras for bags, seats, and flexibility. TripFindBox helps travelers compare Frontier-style fare windows while keeping the total trip details easy to review.",
  "American Airlines": "American Airlines operates a broad domestic and international network through major U.S. hubs. TripFindBox helps travelers compare American Airlines route ideas, cabin choices, and schedule windows before moving into a live search.",
  "United Airlines": "United Airlines connects many U.S. cities with international destinations through hubs such as Chicago, Denver, Houston, Newark, San Francisco, and Washington Dulles. TripFindBox keeps United route research tied to practical booking choices.",
  "Air Canada": "Air Canada serves Canadian, U.S., and international routes through hubs including Toronto, Montreal, Vancouver, and Calgary. TripFindBox uses Air Canada pages to help travelers compare cross-border and long-haul planning options.",
  "Allegiant Airlines": "Allegiant Airlines is known for leisure-focused routes linking smaller U.S. markets with vacation destinations. TripFindBox highlights planning notes around dates, baggage, and optional services for these getaway routes.",
  "Alaska Airlines": "Alaska Airlines offers a strong West Coast network with service across the United States, Canada, Mexico, and beyond through partners. TripFindBox keeps Alaska route planning clear for both city trips and longer connections.",
  "WestJet Airlines": "WestJet is a Canadian carrier serving domestic, transborder, and leisure routes. TripFindBox helps travelers compare WestJet route ideas with attention to seasonal timing, baggage needs, and fare flexibility.",
  "Copa Airlines": "Copa Airlines connects North, Central, and South America through its Panama City hub. TripFindBox route pages help travelers review connection-friendly itineraries and international trip timing.",
  "Volaris Airlines": "Volaris is a Mexican low-cost airline serving Mexico, the United States, Central America, and selected international routes. TripFindBox keeps fare planning focused on route, baggage, and add-on details.",
  "Turkish Airlines": "Turkish Airlines operates a large global network through Istanbul, linking Europe, Asia, Africa, and the Americas. TripFindBox helps travelers compare long-haul routes and connection windows.",
  "Qatar Airways": "Qatar Airways connects travelers through Doha with a wide international network. TripFindBox presents Qatar route planning around cabin selection, connection timing, and international fare review.",
  "Caribbean Airlines": "Caribbean Airlines serves routes across the Caribbean, North America, and nearby regional destinations. TripFindBox keeps regional route planning simple for leisure, family, and business trips.",
  "Philippine Airlines": "Philippine Airlines operates domestic and international routes linked to the Philippines. TripFindBox helps travelers review long-haul timing, baggage planning, and route flexibility.",
  "Emirates Airlines": "Emirates connects global travelers through Dubai with a broad long-haul network. TripFindBox uses Emirates route pages to support premium-cabin comparison, connection timing, and international travel planning.",
  "Etihad Airways": "Etihad Airways serves international routes through Abu Dhabi. TripFindBox keeps Etihad planning focused on route timing, cabin class, and long-haul travel details.",
  "JetBlue Airways": "JetBlue Airways serves U.S., Caribbean, Latin American, and selected transatlantic routes. TripFindBox helps travelers compare JetBlue schedules, cabin choices, and route options.",
  "Hawaiian Airlines": "Hawaiian Airlines connects the Hawaiian Islands with the mainland United States and Pacific destinations. TripFindBox route pages help travelers plan island trips, baggage, and arrival timing.",
  "Japan Airlines": "Japan Airlines operates domestic Japan routes and international service through major Japanese airports. TripFindBox keeps route research useful for long-haul flights, cabin selection, and connection planning.",
  "All Nippon Airways": "All Nippon Airways serves domestic Japan and international routes through hubs including Tokyo. TripFindBox helps travelers compare ANA route ideas and long-haul itinerary details.",
  "Singapore Airlines": "Singapore Airlines connects travelers through Singapore with a strong Asia-Pacific and global network. TripFindBox pages support premium route research, stopover planning, and cabin comparison.",
  "Lufthansa Airlines": "Lufthansa serves global routes through German hubs such as Frankfurt and Munich. TripFindBox keeps Lufthansa planning centered on connection windows, fare classes, and international route choices.",
  "British Airways": "British Airways connects the United Kingdom with Europe, North America, Asia, Africa, and beyond through London. TripFindBox helps travelers compare British Airways route ideas and cabin choices.",
  "Latam Airlines Group": "LATAM Airlines Group connects major destinations across South America with international routes to North America, Europe, and Oceania. TripFindBox helps travelers review regional and long-haul route ideas.",
  "Porter Airlines": "Porter Airlines serves Canadian and North American routes with a focus on convenient city-pair travel. TripFindBox keeps Porter route planning clear for short trips, business travel, and flexible dates.",
  "TAP Portugal Airlines": "TAP Air Portugal connects Portugal with Europe, Africa, the Americas, and other international destinations through Lisbon and Porto. TripFindBox supports route planning for Portugal-linked trips.",
};

const citySummaries = {
  "New York": "New York is one of the busiest travel markets in the world, with multiple airports serving business, leisure, and international routes.",
  "Orlando": "Orlando is a popular family and theme-park destination with strong domestic route demand throughout the year.",
  "Las Vegas": "Las Vegas draws weekend travelers, event visitors, and convention traffic, making flexible dates useful for fare comparison.",
  "Los Angeles": "Los Angeles is a major West Coast gateway for domestic, Pacific, and international travel.",
  "Chicago": "Chicago is a central U.S. travel hub with strong business routes and broad connecting options.",
  "Miami": "Miami is a key gateway for Florida, the Caribbean, and Latin America with year-round leisure demand.",
  "London": "London is a major international destination for business, culture, and European connections.",
  "Rome": "Rome is a high-demand city for history, food, and European vacations, especially during spring and summer.",
  "Dubai": "Dubai is a global stopover and leisure destination with strong long-haul connectivity.",
  "Atlanta": "Atlanta is a major U.S. hub with extensive domestic and international flight options.",
  "Calgary": "Calgary connects travelers to western Canada, the Rockies, and regional business routes.",
  "Charlotte": "Charlotte is a major southeastern U.S. gateway with strong domestic connection options.",
  "Hartford": "Hartford supports New England travel with convenient access to Connecticut and nearby regional markets.",
  "Minneapolis": "Minneapolis is a northern U.S. hub with business, leisure, and seasonal travel demand.",
  "New Orleans": "New Orleans is a cultural destination known for music, food, events, and weekend trips.",
  "Oakland": "Oakland offers Bay Area access with convenient alternatives to larger regional airports.",
  "Philadelphia": "Philadelphia combines historic travel, business routes, and East Coast connectivity.",
  "Salt Lake City": "Salt Lake City is a gateway for mountain trips, national parks, and western U.S. connections.",
  "Seattle": "Seattle is a Pacific Northwest hub with strong domestic and international route demand.",
  "Reno": "Reno supports casino, mountain, and regional travel with flexible getaway demand.",
  "San Francisco": "San Francisco is a major technology, leisure, and international gateway city.",
  "Toronto": "Toronto is Canada’s largest air travel market and a major international gateway.",
  "Washington": "Washington is a high-demand region for government, business, and leisure travel.",
  "Portland": "Portland is a popular Pacific Northwest destination for food, culture, and outdoor trips.",
  "Santa Ana": "Santa Ana gives travelers convenient access to Orange County, beaches, and Southern California trips.",
  "Fort Myers": "Fort Myers is a Florida leisure destination with strong seasonal demand for beach and family travel.",
  "Indianapolis": "Indianapolis is a Midwest travel market for events, business, and regional trips.",
  "Phoenix": "Phoenix is a major desert destination for winter sun, business travel, and Southwest connections.",
  "Boston": "Boston combines education, healthcare, business, and historic leisure demand.",
  "Cincinnati": "Cincinnati supports Midwest business travel, family visits, and regional route planning.",
  "Dallas": "Dallas is a major U.S. travel hub with broad domestic and international connectivity.",
  "Denver": "Denver is a central hub for mountain travel, business trips, and western U.S. connections.",
  "Detroit": "Detroit is a key Great Lakes travel market with business, auto-industry, and regional routes.",
  "El Paso": "El Paso supports border-region travel, military routes, and Southwest trips.",
  "Houston": "Houston is a major energy, business, and international gateway city.",
  "Kahului": "Kahului is Maui’s main airport gateway for Hawaiian island vacations.",
  "Raleigh Durham": "Raleigh-Durham is a growing business and university travel market in North Carolina.",
  "San Diego": "San Diego is a coastal destination for leisure, military, and Southern California travel.",
  "San Jose": "San Jose offers Silicon Valley access and convenient Bay Area travel options.",
  "Austin": "Austin is a high-demand destination for technology, music, events, and weekend trips.",
  "Buffalo": "Buffalo connects travelers to western New York, Niagara Falls, and regional routes.",
  "Burbank": "Burbank is a convenient Los Angeles-area airport for entertainment, business, and local travel.",
  "Charleston": "Charleston is a popular southern destination for history, food, and coastal getaways.",
  "Columbia": "Columbia supports South Carolina business, university, and regional travel.",
  "Fort Lauderdale": "Fort Lauderdale is a South Florida leisure gateway with cruise and beach demand.",
  "Honolulu": "Honolulu is Hawaii’s largest air gateway and a major leisure destination.",
  "Nashville": "Nashville is a growing music, event, and weekend travel destination.",
  "Omaha": "Omaha supports Midwest business, family, and regional travel demand.",
  "Tampa": "Tampa is a Florida Gulf Coast destination for leisure, cruises, and business trips.",
  "Vancouver": "Vancouver is a major Canadian gateway for Pacific travel, outdoor trips, and city breaks.",
  "Wilmington": "Wilmington gives travelers access to coastal North Carolina and regional leisure routes.",
  "Saint Louis": "Saint Louis supports Midwest travel, business visits, and family trips.",
  "West Palm Beach": "West Palm Beach is a South Florida leisure destination with strong seasonal demand.",
};

const dealSummaries = {
  "Top Airline Deals": "Top Airline Deals help travelers scan popular airline fare ideas before choosing dates and travelers for a live TripFindBox search.",
  "Last Minute Flight Deals": "Last Minute Flight Deals are useful for urgent business trips, quick family travel, or spontaneous breaks when flexible routing matters.",
  "One Way Flight Deals": "One Way Flight Deals are built for travelers who need flexible arrival plans, open-ended trips, or separate outbound and return choices.",
  "Round Trip Flight Deals": "Round Trip Flight Deals help compare outbound and return combinations for vacations, business travel, and planned family trips.",
  "Domestic Flight Deals": "Domestic Flight Deals focus on routes within one country, where flexible dates and nearby airports can make comparisons easier.",
  "International Flight Deals": "International Flight Deals help travelers review longer routes, connection windows, baggage needs, and cabin choices before searching live options.",
};

function pageContent(title, section) {
  const name = cleanRouteName(title);
  const isAirline = section === "Top Airlines";
  const isCity = section === "Top Cities";
  const introTitle = isAirline ? `About ${name}` : isCity ? `About Flights To ${name}` : `About ${name}`;
  const routeLabel = isAirline ? `${name} Reservations & Deals` : title;
  const about =
    isAirline
      ? airlineSummaries[name] ?? `${name} routes are popular with travelers comparing convenient schedules, flexible cabins, and fare options across domestic and international trips. TripFindBox helps you review route ideas, update your dates, and continue into the search flow without losing your trip details.`
      : isCity
        ? `${citySummaries[name] ?? `${name} is a frequent travel pick for business trips, vacations, and flexible getaways.`} TripFindBox brings route search, traveler preferences, and deal discovery into one focused booking experience so you can compare options faster.`
        : dealSummaries[title] ?? `${name} help travelers compare useful fare ideas for upcoming trips. TripFindBox keeps the search experience simple by combining route details, cabin choices, travelers, and flexible search updates in one place.`;

  return { name, introTitle, routeLabel, about };
}

const CITY_AIRPORT_CODES = {
  Atlanta: "ATL",
  Austin: "AUS",
  Bali: "DPS",
  Boston: "BOS",
  Buffalo: "BUF",
  Burbank: "BUR",
  Calgary: "YYC",
  Charleston: "CHS",
  Charlotte: "CLT",
  Chicago: "ORD",
  Cincinnati: "CVG",
  Columbia: "CAE",
  Dallas: "DFW",
  Denver: "DEN",
  Detroit: "DTW",
  Dubai: "DXB",
  "El Paso": "ELP",
  Fargo: "FAR",
  "Fort Lauderdale": "FLL",
  "Fort Myers": "RSW",
  Goa: "GOI",
  "Grand Rapids": "GRR",
  Hartford: "BDL",
  Honolulu: "HNL",
  Houston: "IAH",
  Indianapolis: "IND",
  Istanbul: "IST",
  Jaipur: "JAI",
  Kahului: "OGG",
  Kathmandu: "KTM",
  Kerala: "COK",
  "Las Vegas": "LAS",
  London: "LHR",
  "Los Angeles": "LAX",
  Maldives: "MLE",
  Miami: "MIA",
  Minneapolis: "MSP",
  Nashville: "BNA",
  "New Orleans": "MSY",
  "New York": "JFK",
  Oakland: "OAK",
  Omaha: "OMA",
  Orlando: "MCO",
  Paris: "CDG",
  Philadelphia: "PHL",
  Phoenix: "PHX",
  Portland: "PDX",
  "Raleigh Durham": "RDU",
  Reno: "RNO",
  Rome: "FCO",
  "Saint Louis": "STL",
  "Salt Lake City": "SLC",
  "San Diego": "SAN",
  "San Francisco": "SFO",
  "San Jose": "SJC",
  "Santa Ana": "SNA",
  Seattle: "SEA",
  Seoul: "ICN",
  Singapore: "SIN",
  "Swiss Alps": "ZRH",
  Tampa: "TPA",
  Tokyo: "HND",
  Toronto: "YYZ",
  Vancouver: "YVR",
  Washington: "DCA",
  "West Palm Beach": "PBI",
  Wilmington: "ILM",
};

const MONTH_INDEX = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

function routeDealsFor(section, name) {
  const dates = [
    "Jun 21, 2026 - Jun 28, 2026",
    "Jul 15, 2026 - Jul 21, 2026",
    "Jul 22, 2026 - Jul 28, 2026",
    "Aug 13, 2026 - Aug 17, 2026",
    "Aug 19, 2026 - Aug 25, 2026",
    "Sep 02, 2026 - Sep 09, 2026",
    "Sep 18, 2026 - Sep 24, 2026",
    "Oct 05, 2026 - Oct 12, 2026",
  ];
  const prices = ["$54.98", "$55.96", "$63.96", "$64.97", "$79.40", "$88.25", "$109.30", "$127.60"];

  if (section === "Top Cities") {
    const origins = ["New York", "Chicago", "Los Angeles", "Dallas", "Denver", "Miami", "Seattle", "Atlanta"];
    return origins.map((origin, index) => ({
      date: dates[index],
      from: origin === name ? "Boston" : origin,
      to: name,
      price: prices[index],
    }));
  }

  if (section === "Top Airlines") {
    const routes = [
      ["New York", "Miami"],
      ["Los Angeles", "Denver"],
      ["Chicago", "Orlando"],
      ["Seattle", "Las Vegas"],
      ["Dallas", "Phoenix"],
      ["Boston", "Tampa"],
      ["San Francisco", "Honolulu"],
      ["Atlanta", "New Orleans"],
    ];
    return routes.map(([from, to], index) => ({ date: dates[index], from, to, price: prices[index] }));
  }

  const dealRoutes =
    name.toLowerCase().includes("international")
      ? [["New York", "London"], ["Los Angeles", "Tokyo"], ["Miami", "Dubai"], ["Chicago", "Paris"], ["Seattle", "Vancouver"], ["Boston", "Toronto"], ["Dallas", "Rome"], ["San Francisco", "Singapore"]]
      : name.toLowerCase().includes("domestic")
        ? [["New York", "Miami"], ["Chicago", "Denver"], ["Los Angeles", "Seattle"], ["Dallas", "Phoenix"], ["Boston", "Orlando"], ["Atlanta", "Tampa"], ["San Diego", "Las Vegas"], ["Austin", "Nashville"]]
        : [["Grand Rapids", "Tampa"], ["Fargo", "Las Vegas"], ["Philadelphia", "Charlotte"], ["Denver", "Los Angeles"], ["Phoenix", "Seattle"], ["Miami", "New York"], ["Dallas", "Chicago"], ["Boston", "Orlando"]];

  return dealRoutes.map(([from, to], index) => ({ date: dates[index], from, to, price: prices[index] }));
}

function encodePathPart(value) {
  return encodeURIComponent(String(value));
}

function parseDatePart(value) {
  const match = value.trim().match(/^([A-Z][a-z]{2})\s+(\d{1,2}),\s+(\d{4})$/);
  if (!match) return null;

  const [, month, day, year] = match;
  const monthNumber = MONTH_INDEX[month];
  if (!monthNumber) return null;

  return `${year}-${monthNumber}-${day.padStart(2, "0")}`;
}

function parseRouteDateRange(value) {
  const [departure, returnDate] = value.split(" - ").map(parseDatePart);
  return departure && returnDate ? { departure, returnDate } : null;
}

function parseFlightApiAmount(value) {
  const amount = typeof value?.amount === "string" ? Number(value.amount) : value?.amount;
  return Number.isFinite(amount) && amount && amount > 0 ? amount : null;
}

function cheapestFlightApiPrice(itinerary) {
  const prices = [
    parseFlightApiAmount(itinerary.cheapest_price),
    ...(itinerary.pricing_options ?? []).flatMap((option) => [
      parseFlightApiAmount(option.price),
      ...(option.items ?? []).map((item) => parseFlightApiAmount(item.price)),
    ]),
  ].filter((price) => price !== null);

  return prices.length ? Math.min(...prices) : null;
}

function formatSeoFare(amount) {
  return `$${amount.toFixed(2)}`;
}

async function fetchFlightApiDealPrice(deal) {
  const apiKey = process.env.FLIGHTAPI_IO_KEY;
  const fromCode = CITY_AIRPORT_CODES[deal.from];
  const toCode = CITY_AIRPORT_CODES[deal.to];
  const dates = parseRouteDateRange(deal.date);

  if (!apiKey || !fromCode || !toCode || !dates) {
    return null;
  }

  const endpointParts = [
    "roundtrip",
    apiKey,
    fromCode,
    toCode,
    dates.departure,
    dates.returnDate,
    1,
    0,
    0,
    "Economy",
    "USD",
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(`https://api.flightapi.io/${endpointParts.map(encodePathPart).join("/")}`, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "User-Agent": "TripFindBox/1.0 (+https://tripfindbox.com)",
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    if (payload.error) {
      return null;
    }

    const prices = (payload.itineraries ?? [])
      .map(cheapestFlightApiPrice)
      .filter((price) => price !== null);

    return prices.length ? formatSeoFare(Math.min(...prices)) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function routeDealsWithFlightApi(section, name) {
  const sampleDeals = routeDealsFor(section, name);
  const livePrices = await Promise.all(sampleDeals.map((deal) => fetchFlightApiDealPrice(deal)));

  return sampleDeals.map((deal, index) => ({
    ...deal,
    fromCode: CITY_AIRPORT_CODES[deal.from] ?? deal.from.slice(0, 3).toUpperCase(),
    toCode: CITY_AIRPORT_CODES[deal.to] ?? deal.to.slice(0, 3).toUpperCase(),
    price: livePrices[index] ?? deal.price,
  }));
}

const relatedAirlines = [
  "American Airlines",
  "United Airlines",
  "Air Canada",
  "Turkish Airlines",
  "Qatar Airways",
  "Emirates Airlines",
];

const relatedCities = [
  "Flights to Miami",
  "Flights to New York",
  "Flights to Las Vegas",
  "Flights to London",
  "Flights to Dubai",
  "Flights to Singapore",
];

const relatedDeals = [
  "Top Airline Deals",
  "Last Minute Flight Deals",
  "One Way Flight Deals",
  "Round Trip Flight Deals",
  "Domestic Flight Deals",
  "International Flight Deals",
];

const baggageAirlines = [
  { name: "Air France", code: "AF", url: "https://wwws.airfrance.us/information/bagages" },
  { name: "Emirates", code: "EK", url: "https://www.emirates.com/us/english/before-you-fly/baggage/" },
  { name: "Swiss International", code: "LX", url: "https://www.swiss.com/us/en/prepare/baggage" },
  { name: "Scandinavian Airlines", code: "SK", url: "https://www.flysas.com/us-en/travel-info/baggage/" },
  { name: "Norwegian Air", code: "DY", url: "https://www.norwegian.com/us/travel-info/baggage/" },
  { name: "Aer Lingus", code: "EI", url: "https://www.aerlingus.com/prepare/bags/" },
  { name: "Ethiopian Airlines", code: "ET", url: "https://www.ethiopianairlines.com/us/information/baggage-information" },
  { name: "Air Dolomiti", code: "EN", url: "https://www.airdolomiti.eu/baggage" },
  { name: "Caribbean Airlines", code: "BW", url: "https://www.caribbean-airlines.com/#/baggage" },
  { name: "easyJet", code: "U2", url: "https://www.easyjet.com/en/help/baggage" },
  { name: "Qantas", code: "QF", url: "https://www.qantas.com/us/en/travel-info/baggage.html" },
  { name: "All Nippon Airways", code: "NH", url: "https://www.ana.co.jp/en/us/travel-information/baggage-information/" },
  { name: "China Southern Airlines", code: "CZ", url: "https://www.csair.com/en/tourguide/luggage_service/" },
  { name: "Aegean Airlines", code: "A3", url: "https://en.aegeanair.com/travel-info/travelling-with-aegean/baggage/" },
  { name: "American Airlines", code: "AA", url: "https://www.aa.com/i18n/travel-info/baggage/baggage.jsp" },
  { name: "British Airways", code: "BA", url: "https://www.britishairways.com/content/information/baggage-essentials" },
  { name: "Qatar Airways", code: "QR", url: "https://www.qatarairways.com/en/baggage.html" },
  { name: "South African Airways", code: "SA", url: "https://www.flysaa.com/manage-fly/baggage" },
  { name: "Icelandair", code: "FI", url: "https://www.icelandair.com/support/baggage/" },
  { name: "ITA Airways", code: "AZ", url: "https://www.ita-airways.com/en_us/fly-ita/baggage.html" },
  { name: "Etihad", code: "EY", url: "https://www.etihad.com/en-us/fly-etihad/baggage" },
  { name: "Porter Airlines", code: "PD", url: "https://www.flyporter.com/en/travel-information/baggage" },
  { name: "Egyptair", code: "MS", url: "https://www.egyptair.com/en/fly/baggage/Pages/default.aspx" },
  { name: "Virgin Atlantic", code: "VS", url: "https://help.virginatlantic.com/us/en/baggage.html" },
  { name: "Japan Airlines", code: "JL", url: "https://www.jal.co.jp/jp/en/inter/baggage/" },
  { name: "Thai Airways", code: "TG", url: "https://www.thaiairways.com/en_TH/plan_my_trip/travel_information/baggage.page" },
  { name: "Air China", code: "CA", url: "https://www.airchina.us/US/GB/info/checked-baggage/" },
  { name: "SriLankan Airlines", code: "UL", url: "https://www.srilankan.com/en_uk/flying-with-us/baggage" },
  { name: "Lufthansa", code: "LH", url: "https://www.lufthansa.com/us/en/baggage-overview" },
  { name: "United Airlines", code: "UA", url: "https://www.united.com/en/us/fly/baggage.html" },
  { name: "Delta Air Lines", code: "DL", url: "https://www.delta.com/us/en/baggage/overview" },
  { name: "JetBlue Airways", code: "B6", url: "https://www.jetblue.com/at-the-airport/baggage-information" },
  { name: "Air Canada", code: "AC", url: "https://www.aircanada.com/us/en/aco/home/plan/baggage.html" },
  { name: "Turkish Airlines", code: "TK", url: "https://www.turkishairlines.com/en-int/any-questions/baggage-information/" },
  { name: "Alaska Airlines", code: "AS", url: "https://www.alaskaair.com/content/travel-info/baggage" },
  { name: "Frontier Airlines", code: "F9", url: "https://www.flyfrontier.com/travel/travel-info/bag-options/" },
  { name: "Spirit Airlines", code: "NK", url: "https://www.spirit.com/optional-services" },
  { name: "Singapore Airlines", code: "SQ", url: "https://www.singaporeair.com/en_UK/us/travel-info/baggage/" },
];

const taxFeeRows = [
  {
    title: "Travel Facilities Tax",
    description: "This tax may apply to qualifying flights routed to or from Alaska or Hawaii.",
    applicable: "U.S. Domestic and International",
    code: "US",
    price: "$9.90",
  },
  {
    title: "U.S. Federal Segment Fee",
    description: "This fee can apply to each flight segment routed within the United States.",
    applicable: "U.S. Domestic and International",
    code: "ZP",
    price: "$4.50",
  },
  {
    title: "U.S. Excise Tax",
    description: "A percentage-based tax that can apply to eligible U.S. domestic transportation and certain nearby buffer-zone routes.",
    applicable: "U.S. Domestic and International",
    code: "US",
    price: "7.50%",
  },
  {
    title: "Passenger Facility Charge (PFC)",
    description: "A variable airport facility charge collected for airport improvement and passenger facility programs.",
    applicable: "U.S. Domestic and International",
    code: "XF",
    price: "up to $18",
  },
  {
    title: "U.S. Passenger Civil Aviation Security Fee",
    description: "A security fee based on passenger boarding and itinerary structure.",
    applicable: "U.S. Domestic and International",
    code: "AY",
    price: "$11.20",
  },
  {
    title: "U.S. International Transportation Tax",
    description: "This tax can apply to international flights routed to or from the United States and certain U.S. territories.",
    applicable: "International",
    code: "US",
    price: "$19.70",
  },
  {
    title: "U.S. Animal and Plant Health Inspection Service Fee",
    description: "Applies to many flights originating abroad and arriving in the United States or selected U.S. territories.",
    applicable: "International",
    code: "XA",
    price: "$3.83",
  },
  {
    title: "U.S. Immigration and Naturalization Fee",
    description: "Applies to many international arrivals into the United States and selected U.S. territories.",
    applicable: "International",
    code: "XY",
    price: "$7.00",
  },
  {
    title: "U.S. Customs User Fee",
    description: "This fee can apply to international flights routed outside the customs territory.",
    applicable: "International",
    code: "YC",
    price: "$6.52",
  },
  {
    title: "International Taxes and Government or Airport-imposed Fees",
    description: "Covers inspection fees, security fees, airport charges, and other taxes levied by governments or airports.",
    applicable: "International",
    code: "Varies",
    price: "up to $349*",
  },
  {
    title: "TripFindBox Service Fees",
    description: "Online air transaction service fees can vary by cabin type, trip type, route complexity, and passenger type.",
    applicable: "U.S. Domestic and International",
    code: "Fees",
    price: "$0.00 to $100.00*",
  },
];

const faqGroups = [
  {
    title: "Frequently Asked Question",
    items: [
      [
        "Is TripFindBox a safe website?",
        "Yes. TripFindBox is designed to keep trip search simple while protecting sensitive travel details. Provider keys and private booking credentials should stay on the server, and travelers can review routes, dates, passengers, and fare notes before moving ahead.",
      ],
      [
        "What is TripFindBox and how is it different from other travel websites?",
        "TripFindBox focuses on a booking-first flow. You can compare route ideas, adjust your trip type, update dates, and move from search to results without losing the details you already entered.",
      ],
      [
        "Why can a flight show unavailable after I search?",
        "Flight availability can change quickly because seats, fare classes, and provider inventory update often. If a route is unavailable, try a nearby airport, a different date, or a different trip type.",
      ],
      [
        "How do I request a special meal for my flight?",
        "Special meal requests are usually handled by the airline after a booking is confirmed. Review the airline details on your selected itinerary and add the request as early as possible.",
      ],
      [
        "Are TripFindBox tickets changeable or refundable?",
        "Change and refund rules depend on the airline, fare family, cabin class, and booking conditions. Always review the final fare rules before confirming a trip.",
      ],
      [
        "How can I make changes or cancellations?",
        "Start by checking the fare rules for your selected trip. If the airline allows changes, update the route, date, traveler, or cabin details through the available support or booking flow.",
      ],
    ],
  },
  {
    title: "Questions About Payment & Billing?",
    items: [
      [
        "When can I expect my refund?",
        "Refund timing depends on the airline or payment provider. Once a refund is approved, it may still take several business days to appear on your original payment method.",
      ],
      [
        "Why did I receive a refund email if I did not request one?",
        "Some providers send automatic notices when a booking status changes, a fare expires, or a payment authorization is reversed. Review the message details and contact support if anything looks unfamiliar.",
      ],
      [
        "Why do I see multiple card charges?",
        "Some banks show temporary authorizations separately from final charges. These temporary entries usually clear automatically if they are not captured by the provider.",
      ],
      [
        "Why do duplicate charges appear for the same trip?",
        "Duplicate-looking entries can happen when a card authorization and a confirmed payment appear together for a short period. If both remain posted, contact support with the payment reference.",
      ],
      [
        "Why was I charged more than the estimate?",
        "Taxes, provider fees, baggage, seat options, or fare updates can affect the final amount. The final confirmation step should always be reviewed before payment.",
      ],
      [
        "What should I do if I do not recognize a charge?",
        "Check your trip confirmation, email notices, and bank authorization details first. If the charge still looks unfamiliar, contact TripFindBox support with the date, amount, and card reference.",
      ],
    ],
  },
];

const policyContent = {
  security: {
    intro: "TripFindBox uses a planning-first security approach so route searches, contact messages, and booking-flow details stay organized without exposing private provider credentials on the frontend.",
    sections: [
      ["Secure Search Handling", "Search choices such as route, date, traveler count, and cabin class are handled as trip-planning data. Sensitive provider credentials stay in server-side API routes and should never be shown in the browser."],
      ["Protected Booking Flow", "Travelers should review route, fare, baggage, and passenger details before continuing into any confirmation step. TripFindBox keeps each step visible so mistakes are easier to catch early."],
      ["Data Minimization", "Only the details needed for route discovery, support requests, and booking flow continuity should be used. Contact form messages are treated as support information, not public page content."],
      ["Safe Mobile Experience", "On mobile, search forms, dropdowns, and support panels must remain visible above floating elements so users can complete actions without blocked controls."],
    ],
    faqs: [
      ["Are API secrets shown in the browser?", "No. Provider secrets belong in server-side routes and environment variables, not in public frontend code."],
      ["Can I safely modify search details?", "Yes. TripFindBox keeps editable route fields available while protecting sensitive provider configuration."],
    ],
  },
  "baggage-fees": {
    intro: "Baggage fees can vary by airline, route, cabin class, fare family, and traveler type. TripFindBox keeps baggage reminders close to route planning so travelers know what to review before booking.",
    sections: [
      ["Carry-On Guidance", "Carry-on rules may include size, weight, and personal-item limits. Always compare the fare conditions shown during live booking before assuming a bag is included."],
      ["Checked Bag Notes", "Checked baggage can be included, discounted, or charged separately depending on fare class and airline policy."],
      ["Special Items", "Sports equipment, musical instruments, strollers, and oversized bags may require extra review or additional fees."],
      ["Before You Book", "Check baggage rules alongside total fare, connection time, and route duration so the final trip cost is easier to understand."],
    ],
    faqs: [
      ["Does every fare include baggage?", "No. Some fares include only a personal item, while others include carry-on or checked bags."],
      ["Where should baggage be confirmed?", "Confirm baggage during the live fare details step before payment or ticket confirmation."],
    ],
  },
  "cancellation-policy": {
    intro: "Cancellation and change rules are different across airlines and fares. TripFindBox presents planning guidance so travelers know which terms to inspect before selecting a flight.",
    sections: [
      ["Change Rules", "Flexible fares may allow date or route changes with lower fees, while restricted fares may limit changes."],
      ["Refund Eligibility", "Refund rules depend on provider policy, fare family, timing, and route. Always review final terms before booking."],
      ["Schedule Changes", "Airline schedule changes can affect departure times, connections, and arrival windows. Keep contact details accurate in the booking flow."],
      ["TripFindBox Guidance", "Use the search form to compare flexible dates and cabin options before choosing a fare with stricter conditions."],
    ],
    faqs: [
      ["Can every ticket be cancelled?", "No. Cancellation eligibility depends on the final fare rules."],
      ["Can changing dates help?", "Yes. Flexible dates can surface options with better schedules or more suitable fare conditions."],
    ],
  },
  "taxes-and-fees": {
    intro: "Taxes, carrier charges, and service fees may be included in different ways depending on the provider and route. TripFindBox keeps fare notes visible so travelers know what to verify.",
    sections: [
      ["Fare Components", "A displayed fare can include base fare, airport charges, government taxes, carrier-imposed fees, and provider service charges."],
      ["Route Differences", "International routes may include different tax structures from domestic routes, especially when multiple airports or countries are involved."],
      ["Price Review", "Review total price, baggage fees, seat fees, and change rules together before continuing."],
      ["Clear Comparison", "TripFindBox route pages are designed to help compare sample fare windows before moving into the live booking path."],
    ],
    faqs: [
      ["Are sample fares final?", "No. Final taxes and fees should be checked in the live booking step."],
      ["Why can prices change?", "Availability, taxes, provider fees, and fare class can change before confirmation."],
    ],
  },
  "refund-policy": {
    intro: "Refund eligibility is tied to airline rules, fare type, booking timing, and provider conditions. TripFindBox helps travelers understand what to review before confirming a trip.",
    sections: [
      ["Refundable Fares", "Refundable fares usually cost more but may offer easier cancellation options."],
      ["Non-Refundable Fares", "Restricted fares may allow credits, partial refunds, or no refund depending on provider conditions."],
      ["Processing Timing", "Refund processing can depend on airline review, payment method, and provider workflow."],
      ["Support Preparation", "Keep route details, traveler name, booking reference, and contact information ready when asking for help."],
    ],
    faqs: [
      ["Does TripFindBox decide refunds?", "Refunds are governed by the final airline/provider terms shown during booking."],
      ["What should I check first?", "Review fare rules, cancellation windows, and provider terms before payment."],
    ],
  },
  "airport-transfers": {
    intro: "Airport transfer planning helps travelers move from arrival to destination with less friction. TripFindBox keeps transfer reminders close to city and route planning.",
    sections: [
      ["Transfer Timing", "Plan enough time for baggage collection, immigration, terminal changes, and local traffic."],
      ["Vehicle Options", "Compare shuttle, taxi, ride-share, private car, and public transport based on route needs."],
      ["Family Travel", "Families may need child seats, additional luggage space, or larger vehicles."],
      ["Connection Planning", "For tight connections, check airport layout and transfer time before selecting flights."],
    ],
    faqs: [
      ["Should I plan transfer before booking?", "Yes. Arrival time and airport distance can affect the best flight choice."],
      ["Can transfers change by city?", "Yes. City traffic, terminal location, and airport distance can vary widely."],
    ],
  },
};

function policyDataFor(name) {
  const slug = name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return policyContent[slug] ?? {
    intro: `${name} information helps travelers understand the details that can affect route planning, booking confidence, and post-search decisions.`,
    sections: [
      ["Overview", "Use this page to review travel planning guidance before choosing a route or fare."],
      ["Before Booking", "Check trip type, dates, travelers, cabin class, baggage, and route timing before continuing."],
      ["Mobile Access", "On mobile, important details should remain easy to open, scan, and compare."],
      ["Support", "If a route or fare is unclear, adjust the search or contact TripFindBox support for next-step guidance."],
    ],
    faqs: [
      ["Can I update my search from here?", "Yes. Use the search panel above to change route, dates, travelers, and cabin."],
      ["Is this final booking advice?", "No. Always confirm final provider terms during the booking flow."],
    ],
  };
}

async function RouteDealsGrid({ title, section, name }) {
  const routeDeals = await routeDealsWithFlightApi(section, name);

  return (
    <>
      <h2>{title}</h2>
      <SeoRouteDealsGrid deals={routeDeals} />

      <p className="site-route-note">
        Last updated on <strong>Friday Jun 05, 2026 at 05:00 AM</strong>. Fares shown are TripFindBox sample planning references for this page and may change before booking. Review route details and fare conditions before confirming your trip.
      </p>
    </>
  );
}

function AccordionItem({ title, children }) {
  return (
    <details className="site-template-accordion" open>
      <summary>{title}</summary>
      <div>{children}</div>
    </details>
  );
}

function FaqRow({ question, answer, defaultOpen = false }) {
  return (
    <details className="site-faq-row" open={defaultOpen}>
      <summary>{question}</summary>
      <div className="site-faq-answer">
        <div>
          <p><strong>Ans:</strong> {answer}</p>
        </div>
      </div>
    </details>
  );
}

function RelatedStrip({ title, items }) {
  return (
    <section className="site-template-section">
      <h2>{title}</h2>
      <div className="site-related-strip">
        {items.map((item) => (
          <Link key={item} href={tfbPath(`/${item.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`)}>
            {item}
          </Link>
        ))}
      </div>
    </section>
  );
}

function AirlineTemplate({ name }) {
  return (
    <>
      <article className="site-route-info-card">
        <h2>About {name}</h2>
        <p>{name} is included in TripFindBox route discovery so travelers can compare fare windows, flexible dates, cabin choices, and route timing from one focused search experience. The goal is to make airline planning easier before moving into live search and booking details.</p>
        <p>Use this page to review sample routes, compare travel periods, and understand the type of information travelers should check before choosing a flight, including baggage rules, check-in timing, route duration, and fare conditions.</p>
      </article>

      <section className="site-template-section">
        <h2>Airline Information</h2>
        <p className="site-template-intro">These sections stay open on desktop for quick scanning and become compact accordion cards on mobile.</p>
        <div className="site-template-grid">
          <AccordionItem title="Baggage Policy">
            <p>Baggage rules can change by cabin, route, and fare class. Review carry-on limits, checked bag allowance, weight rules, and seat selection details before final confirmation.</p>
          </AccordionItem>
          <AccordionItem title="Check-In Policy">
            <p>Most airlines support online check-in before departure. Airport check-in, document checks, and boarding cutoff times can vary, so travelers should verify timing before reaching the airport.</p>
          </AccordionItem>
          <AccordionItem title="Cancellation And Changes">
            <p>Change fees, refund eligibility, same-day changes, and cancellation rules depend on the fare selected. Flexible dates can help compare better route options before booking.</p>
          </AccordionItem>
          <AccordionItem title="Frequent Flyer Program">
            <p>Loyalty benefits may include miles, upgrades, preferred seats, or partner rewards. TripFindBox keeps this as planning guidance while final benefits should be checked with the airline.</p>
          </AccordionItem>
        </div>
      </section>

      <section className="site-template-section">
        <h2>FAQs</h2>
        <div className="site-template-faq">
          <AccordionItem title={`Can I compare ${name} routes on TripFindBox?`}>
            <p>Yes. You can use the search panel to update origin, destination, dates, travelers, and cabin class, then continue into the results flow.</p>
          </AccordionItem>
          <AccordionItem title="Are prices final on this page?">
            <p>No. Route cards are planning references. Final prices and policy details should be confirmed during the live search and booking flow.</p>
          </AccordionItem>
        </div>
      </section>

      <RelatedStrip title="Related Airlines" items={relatedAirlines.filter((airline) => airline !== name)} />
    </>
  );
}

function CityTemplate({ name }) {
  return (
    <>
      <article className="site-route-info-card">
        <h2>Travel Guide For {name}</h2>
        <p>{name} is a useful route choice for flexible vacations, business visits, and seasonal breaks. TripFindBox keeps destination discovery close to the search form so you can adjust your route, dates, passengers, and cabin class without losing context.</p>
        <p>Compare sample fare windows first, then use the search panel to check current availability and move into the results experience.</p>
      </article>

      <section className="site-template-section">
        <h2>Destination Planning</h2>
        <p className="site-template-intro">Use these planning cards to compare airports, timing, route flexibility, and destination notes before running a live search.</p>
        <div className="site-template-grid">
          <AccordionItem title="Popular Routes">
            <p>Travelers often compare nearby departures, flexible weekend dates, and round-trip combinations before choosing a route to {name}.</p>
          </AccordionItem>
          <AccordionItem title="Airport Information">
            <p>Review airport location, arrival timing, transfer options, baggage collection, and connection windows before finalizing your itinerary.</p>
          </AccordionItem>
          <AccordionItem title="Best Time To Visit">
            <p>Flexible travel dates can help compare lower fares and better schedules. Shoulder seasons may offer calmer travel and stronger deal windows.</p>
          </AccordionItem>
          <AccordionItem title="Travel Tips">
            <p>Keep documents ready, compare baggage needs, and check return-date flexibility when planning a city trip or vacation route.</p>
          </AccordionItem>
        </div>
      </section>

      <section className="site-template-section">
        <h2>FAQs</h2>
        <div className="site-template-faq">
          <AccordionItem title={`How do I search flights to ${name}?`}>
            <p>Choose your origin, select {name} as destination, add dates and travelers, then run the TripFindBox search flow.</p>
          </AccordionItem>
          <AccordionItem title="Can I change dates after landing here?">
            <p>Yes. The search form stays visible so you can update travel dates, trip type, passengers, and cabin class.</p>
          </AccordionItem>
        </div>
      </section>

      <RelatedStrip title="Related Destinations" items={relatedCities.filter((city) => !city.toLowerCase().includes(name.toLowerCase()))} />
    </>
  );
}

function DealTemplate({ name }) {
  return (
    <>
      <article className="site-route-info-card">
        <h2>About {name}</h2>
        <p>{name} are built for travelers who want a quick way to review route ideas, compare sample fare windows, and then move into a fresh search. TripFindBox keeps deal discovery close to practical booking choices like cabin class, trip type, and passenger count.</p>
        <p>Use this page to compare route examples and restart the search with updated dates when you are ready to review current flight availability.</p>
      </article>

      <section className="site-template-section">
        <h2>Deal Planning</h2>
        <p className="site-template-intro">Deal pages keep sample route ideas, timing notes, and fare reminders together so travelers can quickly restart a better search.</p>
        <div className="site-template-grid">
          <AccordionItem title="Flexible Date Savings">
            <p>Small date changes can reveal better route timing or improved fare options, especially for short trips and seasonal travel periods.</p>
          </AccordionItem>
          <AccordionItem title="Route Table">
            <p>Review origin, destination, trip length, route duration, and fare references before choosing the best search path.</p>
          </AccordionItem>
          <AccordionItem title="Booking Guidance">
            <p>Always check baggage, change rules, traveler details, and final fare conditions before completing a booking step.</p>
          </AccordionItem>
          <AccordionItem title="Mobile Deal Cards">
            <p>On smaller screens, deal rows should become readable cards so each route, date, and fare remains easy to scan.</p>
          </AccordionItem>
        </div>
      </section>

      <RelatedStrip title="Related Deals" items={relatedDeals.filter((deal) => deal !== name)} />
    </>
  );
}

function QuickLinkTemplate({ name }) {
  if (name.toLowerCase().includes("faq")) {
    return (
      <article className="site-faq-simple-content">
        {faqGroups.map((group, groupIndex) => (
          <section className="site-faq-group" key={group.title}>
            {groupIndex === 0 ? <h1>{group.title}</h1> : <h2>{group.title}</h2>}
            <div className="site-faq-list">
              {group.items.map(([question, answer], itemIndex) => (
                <FaqRow
                  key={question}
                  question={question}
                  answer={answer}
                  defaultOpen={groupIndex === 0 && itemIndex === 0}
                />
              ))}
            </div>
          </section>
        ))}
      </article>
    );
  }

  if (name.toLowerCase().includes("bookings")) {
    return (
      <section className="site-template-section">
        <h2>Find A Booking</h2>
        <div className="site-booking-lookup">
          <label>Email<input placeholder="Enter booking email" /></label>
          <label>Phone<input placeholder="Enter phone number" /></label>
          <label>Last Name<input placeholder="Traveler last name" /></label>
          <button type="button">Search Booking</button>
        </div>
      </section>
    );
  }

  return (
    <article className="site-route-info-card">
      <h2>{name}</h2>
      <p>TripFindBox keeps this page available as part of the main travel support experience. Use it to review helpful information, understand the booking flow, and return to search when you are ready to compare routes.</p>
      <p>On mobile, these support pages should remain simple, readable, and easy to scan with compact sections and clear spacing.</p>
      <h3>Helpful TripFindBox Links</h3>
      <p>Travelers can move between route pages, deal pages, FAQ guidance, contact support, and booking lookup without losing the overall TripFindBox search context.</p>
    </article>
  );
}

function UsefulLinkTemplate({ name }) {
  if (name.toLowerCase() === "security") {
    return (
      <article className="site-security-simple-content">
        <h1>Safety &amp; Security</h1>
        <p>
          TripFindBox is built to keep flight planning clear, secure, and reliable for every traveler. We use protected booking flows and careful data-handling practices so your route searches, support requests, and travel preferences stay organized while you compare options.
        </p>
        <p>
          Our platform is structured so sensitive travel API credentials and provider secrets remain on the server side. Details entered during search, such as origin, destination, dates, travelers, and cabin class, are used only to support your trip-planning experience and should never expose private configuration in the browser.
        </p>
        <p>
          When a traveler continues from search to results or booking details, TripFindBox keeps important information visible for review. This helps you confirm route choices, passenger counts, cabin preferences, baggage notes, and fare conditions before moving forward.
        </p>
        <p>
          We recommend reviewing all final fare rules, provider terms, payment instructions, and airline policies before completing any booking step. TripFindBox sends support and travel updates through secure communication channels when assistance is required.
        </p>
        <p>
          TripFindBox also encourages travelers to check that they are using the correct website address before entering any personal details. Avoid sharing card numbers, passwords, one-time codes, or identity documents through unverified phone calls, social messages, or links that do not clearly belong to TripFindBox.
        </p>
        <p>
          If a payment or booking confirmation is needed, review the passenger name, route, travel dates, total amount, refund rules, and baggage conditions carefully before approval. Any support conversation should clearly reference your trip details and should never pressure you to complete a transaction without time to review.
        </p>
        <p>
          For account, booking, or route assistance, use the official TripFindBox support channels shown on this website. Our goal is to keep the travel planning process transparent, reduce confusion, and help you make confident decisions with secure access to important trip information.
        </p>
      </article>
    );
  }

  if (name.toLowerCase() === "baggage fees") {
    const midpoint = Math.ceil(baggageAirlines.length / 2);
    const baggageColumns = [baggageAirlines.slice(0, midpoint), baggageAirlines.slice(midpoint)];

    return (
      <article className="site-baggage-simple-content">
        <h1>Airlines Baggage Fees</h1>
        <div className="site-baggage-table" role="table" aria-label="TripFindBox airline baggage fee directory">
          {baggageColumns.map((column, index) => (
            <div className="site-baggage-column" role="rowgroup" key={`baggage-column-${index}`}>
              <div className="site-baggage-table-head" role="row">
                <span role="columnheader">Airline</span>
                <span role="columnheader">Baggage Details</span>
              </div>
              {column.map((airline) => (
                <div className="site-baggage-row" role="row" key={airline.name}>
                  <span className="site-baggage-airline" role="cell">
                    <strong>{airline.code}</strong>
                    {airline.name}
                  </span>
                  <a role="cell" href={airline.url} target="_blank" rel="noreferrer">
                    View Details
                  </a>
                </div>
              ))}
            </div>
          ))}
        </div>
      </article>
    );
  }

  if (name.toLowerCase() === "cancellation policy") {
    return (
      <article className="site-cancellation-simple-content">
        <ul>
          <li>TripFindBox service charges and support fees attached to a completed flight request may be non-refundable after the first 24 hours, unless the final airline or travel provider rules state otherwise.</li>
          <li>Cancellation requests made after 24 hours are handled according to the fare rules of the airline or supplier involved. Airline penalties, fare differences, or provider charges may apply.</li>
          <li>Some tickets may be eligible for cancellation within 24 hours of booking, but this depends on airline policy, route, fare type, ticketing status, and supplier rules.</li>
          <li>If a traveler does not show up for a flight, the ticket may become fully non-refundable and the remaining value may be forfeited by the airline.</li>
          <li>Name changes, passenger substitutions, and major itinerary edits are usually restricted by airline policy and may not be allowed after ticketing.</li>
          <li>Low-cost carrier tickets, promotional fares, basic fares, and close-in departure fares may carry stricter cancellation and refund conditions.</li>
        </ul>

        <p>
          Hotel, car, transfer, and add-on service bookings may follow separate cancellation rules. Any refund eligibility for those services depends on the individual supplier policy shown during the booking process.
        </p>

        <p>
          All flight cancellation or refund requests should be submitted through TripFindBox support so the request can be reviewed with the airline or travel provider. A refund request can move forward only when the fare rules, supplier policy, and ticket status permit cancellation or refund processing.
        </p>

        <ul>
          <li>The request must be made by the traveler or authorized booking contact using accurate trip details.</li>
          <li>The traveler must not be marked as a no-show by the airline unless the airline policy still permits partial value recovery.</li>
          <li>TripFindBox may contact suppliers to request waivers when possible, but waiver approval is not guaranteed.</li>
        </ul>

        <p>
          We cannot promise an exact refund processing timeline because airlines and suppliers review requests at their own pace. After TripFindBox receives your cancellation request, you may receive an acknowledgement confirming that the request has been logged. This acknowledgement does not guarantee that a refund will be approved.
        </p>

        <p>
          If the airline or supplier approves a refund, the amount credited may be reduced by airline penalties, supplier charges, fare differences, payment processing costs, or applicable TripFindBox service fees. Refunds, when approved, are generally returned to the original form of payment and may take several billing cycles depending on the bank, card issuer, airline, and supplier workflow.
        </p>

        <p>
          TripFindBox recommends reviewing fare rules, baggage conditions, change restrictions, cancellation windows, and refund eligibility before completing any booking. For help with a cancellation or exchange request, contact TripFindBox support with your route, travel date, passenger name, and booking reference.
        </p>
      </article>
    );
  }

  if (name.toLowerCase() === "taxes and fees") {
    return (
      <article className="site-taxes-simple-content">
        <h1>Taxes &amp; Fees</h1>
        <div className="site-taxes-table-wrap">
          <table className="site-taxes-table">
            <thead>
              <tr>
                <th>Description of Fees &amp; Taxes</th>
                <th>Applicable to</th>
                <th>Code</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {taxFeeRows.map((row) => (
                <tr key={row.title}>
                  <td>
                    <strong>{row.title}</strong>
                    <span>{row.description}</span>
                  </td>
                  <td>{row.applicable}</td>
                  <td>{row.code}</td>
                  <td><b>{row.price}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="site-taxes-note">
          *Taxes, government charges, airport fees, and TripFindBox service fees can vary by itinerary, provider, ticketing rules, passenger type, and booking channel. Final charges should always be reviewed in the live booking flow before confirmation.
        </p>
      </article>
    );
  }

  const content = policyDataFor(name);

  return (
    <>
      <article className="site-plain-intro">
        <h2>{name}</h2>
        <p>{content.intro}</p>
        <p>TripFindBox keeps this guidance tied to the search flow so travelers can return to the route form, adjust dates, compare cabin choices, or restart a trip search at any time.</p>
      </article>

      <section className="site-template-section">
        <h2>{name} Details</h2>
        <p className="site-template-intro">Desktop shows these as clear policy cards. Mobile users can open and close each topic without scrolling through one long text block.</p>
        <div className="site-template-grid">
          {content.sections.map(([title, body]) => (
            <AccordionItem key={title} title={title}>
              <p>{body}</p>
            </AccordionItem>
          ))}
        </div>
      </section>

      <section className="site-template-section">
        <h2>Common Questions</h2>
        <div className="site-template-faq">
          {content.faqs.map(([question, answer]) => (
            <AccordionItem key={question} title={question}>
              <p>{answer}</p>
            </AccordionItem>
          ))}
        </div>
      </section>

      <RelatedStrip title="Helpful Travel Links" items={["Baggage Fees", "Cancellation Policy", "Taxes And Fees", "Security"]} />
    </>
  );
}

function PageTemplate({ section, name }) {
  if (section === "Top Airlines") return <AirlineTemplate name={name} />;
  if (section === "Top Cities") return <CityTemplate name={name} />;
  if (section === "Top Deals") return <DealTemplate name={name} />;
  if (section === "Quick Links") return <QuickLinkTemplate name={name} />;
  if (section === "Useful Links") return <UsefulLinkTemplate name={name} />;
  return <DealTemplate name={name} />;
}

function bottomSliderItems(section, currentTitle) {
  if (section !== "Top Cities" && section !== "Top Deals") return [];

  const preferredTitles =
    section === "Top Cities"
      ? [
          "Flights to Los Angeles",
          "Flights to Orlando",
          "Flights to Miami",
          "Flights to Paris",
          "Flights to London",
          "Flights to Dubai",
          "Flights to New York",
          "Flights to Rome",
        ]
      : [
          "Top Airline Deals",
          "Last Minute Flight Deals",
          "One Way Flight Deals",
          "Round Trip Flight Deals",
          "Domestic Flight Deals",
          "International Flight Deals",
        ];

  const fallbackImages = [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=70",
    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=70",
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=70",
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=70",
  ];

  return preferredTitles
    .map((title, index) => {
      const page = sitemapPages.find((item) => item.title === title);
      if (page) {
        return {
          title: page.title,
          slug: page.slug,
          image: page.image,
        };
      }

      return {
        title,
        slug: title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        image: fallbackImages[index % fallbackImages.length],
      };
    })
    .filter((item) => item.title !== currentTitle);
}

function MobileSeoCallBar({ contact }) {
  return (
    <aside className="seo-mobile-callbar" aria-label="TripFindBox call support">
      <div className="seo-mobile-callbar-panel">
        <a href={telHref(contact.phone)} aria-label="Call TripFindBox for unpublished flight deals">
          <span className="seo-mobile-callbar-icon" aria-hidden="true">
            <FloatingCallIcon />
          </span>
          <span className="seo-mobile-callbar-copy">
            <strong>{contact.mobileCallText}</strong>
            <b>{contact.phone}</b>
          </span>
        </a>
      </div>
    </aside>
  );
}

function MobileDealSupportHero({ title, contact }) {
  return (
    <section className="mobile-deal-support-hero" aria-label={`${title} phone support`}>
      <div className="mobile-deal-support-bg" aria-hidden="true" />
      <div className="mobile-deal-support-inner">
        <h1>Book Airlines Tickets With Us</h1>
        <p className="mobile-deal-support-subtitle">24/7 Airlines Booking Support</p>
        <img
          className="mobile-deal-support-agent"
          src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=420&q=80"
          alt="TripFindBox travel support agent"
        />
        <div className="mobile-deal-support-pill">Booking, Changes &amp; Cancellation</div>
        <p className="mobile-deal-support-copy">No-Hold, Call Answered in 5 Sec</p>
        <a className="mobile-deal-support-call" href={telHref(contact.phone)} aria-label="Call TripFindBox support">
          <span aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M6.6 2.7c.5-.2 1.1 0 1.4.5l2.1 4c.3.5.2 1.2-.3 1.6l-1.5 1.3c1.1 2.2 3 4.1 5.3 5.2l1.2-1.5c.4-.5 1.1-.6 1.6-.3l4 2.1c.5.3.8.9.5 1.4l-1.1 3c-.2.6-.8 1-1.4 1C9.9 21 3 14.1 3 5.6c0-.6.4-1.2 1-1.4l2.6-1.5Z" />
            </svg>
          </span>
          <strong>{contact.phone}</strong>
          <small>Save Time and get our Best deals</small>
        </a>
        <strong className="mobile-deal-support-helpline">( 24/7 Helpline )</strong>
        <span className="mobile-deal-support-page-title">{title}</span>
      </div>
    </section>
  );
}

export function generateStaticParams() {
  return sitemapPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = getSitemapPage(slug) ?? fallbackSitemapPage(slug);
  const title = page.title;

  return createPageMetadata({
    title: `${title} | TripFindBox`,
    description: `Search and compare TripFindBox options for ${title}.`,
    path: `/tripfindbox/${slug}`,
  });
}

export default async function SitemapRoutePage({ params }) {
  const { slug } = await params;
  const page = getSitemapPage(slug) ?? fallbackSitemapPage(slug);
  const content = pageContent(page.title, page.section);
  const category = routeCategory(page.section);
  const kind = pageKind(page.section, page.title);
  const isUtilityPage = kind === "policy" || kind === "faq" || kind === "booking";
  const isSecurityPage = slug === "security";
  const isBaggagePage = slug === "baggage-fees";
  const isCancellationPage = slug === "cancellation-policy";
  const isTaxesPage = slug === "taxes-and-fees";
  const isFaqPage = slug === "faqs";
  const isSimpleUtilityPage = isSecurityPage || isBaggagePage || isCancellationPage || isTaxesPage || isFaqPage;
  const showMobileSeoCallBar = kind === "airline" || kind === "city" || kind === "deal";
  const sliderItems = bottomSliderItems(page.section, page.title);
  const contact = await getTripFindBoxContactInfo();

  return (
    <main className={`site-route-page${isUtilityPage ? " site-route-utility-page" : ""}${isSecurityPage ? " site-security-simple-page" : ""}${isBaggagePage ? " site-baggage-simple-page" : ""}${isCancellationPage ? " site-cancellation-simple-page" : ""}${isTaxesPage ? " site-taxes-simple-page" : ""}${isFaqPage ? " site-faq-simple-page" : ""}`}>
      {kind === "deal" ? <MobileDealSupportHero title={page.title} contact={contact} /> : null}
      <ResultsHeader initialContact={contact} />
      {isCancellationPage ? (
        <section className="site-cancellation-hero">
          <h1>CANCELLATIONS/REFUNDS/EXCHANGE</h1>
        </section>
      ) : null}
      {isUtilityPage && !isSimpleUtilityPage ? (
        <section className="site-utility-head">
          <div>
            <p>{page.section}</p>
            <h1>{page.title}</h1>
            <span>Helpful TripFindBox travel guidance, organized for quick reading on desktop and mobile.</span>
          </div>
        </section>
      ) : !isSimpleUtilityPage ? (
        <section
          className="site-route-hero"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(12, 15, 42, 0.56), rgba(12, 15, 42, 0.72)), url(${page.image})`,
          }}
        >
          <div className="site-route-hero-inner">
            <p className="site-route-kicker">{page.section}</p>
            <h1>{page.title}</h1>
            <FlightSearchBox compact />
            <div className="site-route-trust" aria-label="TripFindBox customer trust rating">
              <p>Trusted by <strong>100,000+</strong> customers every year</p>
              <div>
                <span>Excellent</span>
                <span className="site-route-stars" aria-label="3.9 out of 5 stars">
                  <i>★</i>
                  <i>★</i>
                  <i>★</i>
                  <i>★</i>
                  <i className="is-muted">★</i>
                </span>
                <span>(3.9) 89 Reviews on</span>
                <strong>★ Trustpilot</strong>
              </div>
            </div>
          </div>
        </section>
      ) : null}
      <section className="site-route-content">
        {!isSimpleUtilityPage ? (
          <nav className="site-route-breadcrumb" aria-label="Breadcrumb">
            <Link href="/tripfindbox">Home</Link>
            <span>›</span>
            <Link href="/tripfindbox/site-map">{category}</Link>
            <span>›</span>
            <strong>{page.title}</strong>
          </nav>
        ) : null}

        {isUtilityPage
          ? null
          : <RouteDealsGrid title={content.routeLabel} section={page.section} name={content.name} />}
        <PageTemplate section={page.section} name={content.name} />
        {sliderItems.length > 0 ? (
          <RouteBottomSlider
            title="A Step Towards Memory Capturing Family Vacations"
            items={sliderItems}
          />
        ) : null}
      </section>
      <Footer />
      {showMobileSeoCallBar ? <MobileSeoCallBar contact={contact} /> : null}
    </main>
  );
}
