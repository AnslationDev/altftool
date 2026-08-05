// // src/app/tradeon/components/landing/LandingClient.jsx
// "use client";

// import { useMarketData } from "../../hooks/useMarketData";
// import TradeonHeader from "./TradeonHeader";
// import Hero from "./Hero";
// import MarketMovers from "./MarketMovers";
// import GlobalMarkets from "./GlobalMarkets";
// import MarketInsights from "./MarketInsights";
// import SectorOutlook from "./SectorOutlook";
// import NewsSection from "../news/NewsSection";
// import TradeonFooter from "./TradeonFooter";
// import TopBrokers from "./TopBrokers";

// export default function LandingClient() {
//   const { data, status } = useMarketData();

//   return (
//     <div id="top" className="tradeon-root">
//       {/* Sticky header carries the market tape at its very top */}
//       <TradeonHeader data={data} status={status} />
//       {/* Content surface — tdn-paper: white in light theme, app dark in dark theme (header/footer keep the app theme) */}
//       <main className="tdn-paper pt-0">
//         <Hero data={data} status={status} />
//         <MarketMovers data={data} />
//         <GlobalMarkets data={data} />

//         <NewsSection />
//         <SectorOutlook />
//         <TopBrokers/>
//          <MarketInsights data={data} />
//       </main>
//       <TradeonFooter status={status} />
//     </div>
//   );
// }



// src/app/tradeon/components/landing/LandingClient.jsx



// src/app/tradeon/components/landing/LandingClient.jsx
"use client";

import { useMarketData } from "../../hooks/useMarketData";
import TradeonHeader from "./TradeonHeader";
import Hero from "./Hero";
import MarketMovers from "./MarketMovers";
import GlobalMarkets from "./GlobalMarkets";
import MarketInsights from "./MarketInsights";
import SectorOutlook from "./SectorOutlook";
import NewsSection from "../news/NewsSection";
import TradeonFooter from "./TradeonFooter";
import TopBrokers from "./TopBrokers";

export default function LandingClient() {
  const { data, status } = useMarketData();

  return (
    <div id="top" className="tradeon-root">
      {/* Sticky header carries the market tape at its very top */}
      <TradeonHeader data={data} status={status} />

      {/* Content surface */}
      <main className="tdn-paper pt-0">
        <Hero data={data} status={status} />
        <GlobalMarkets data={data} />

        {/* ── Two-Column Main Layout ── */}
        <section className="tdn-container tdn-section-tight">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Content Column (Expanded for more breathing room) */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-10 min-w-0">
              <NewsSection />
              <SectorOutlook />
              <TopBrokers />
            </div>

            {/* Right Sidebar (Slightly narrowed) */}
            <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 flex flex-col gap-6 w-full">
              <MarketMovers data={data} />
            </aside>

          </div>
        </section>

        <MarketInsights data={data} />
      </main>

      <TradeonFooter status={status} />
    </div>
  );
}
