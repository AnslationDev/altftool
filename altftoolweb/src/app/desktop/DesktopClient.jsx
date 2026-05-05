"use client";

import HeroSlider from "./components/HeroSlider";
import Sidebar from "./components/Sidebar";
import TopCharts from "./components/TopCharts";
import Events from "./components/Events";
import SpotlightBanner from "./components/SpotlightBanner";
import SocialNetwork from "./components/SocialNetwork";
import SoftwareListSection from "./components/SoftwareListSection";
import Recommended from "./components/Recommended";

const topFreeApps = [
  { title: "WhatsApp", image: "/images/whatsapp.png" },
  { title: "Instagram", image: "/images/instagram.png" },
  { title: "Facebook", image: "/images/facebook.png" },
  { title: "Spotify", image: "/images/spotify.png" },
  { title: "Netflix", image: "/images/netflix.png" },
];

export default function Page() {
  return (
    <div className="">

      {/* Hero Slider */}
      <div className="section">
        <HeroSlider />
      </div>

      {/* Sidebar */}
      {/* <div className="">
        <Sidebar apps={topFreeApps} />
      </div> */}

      <Sidebar apps={topFreeApps} />
      <SpotlightBanner />
      <TopCharts />
      <Events />
      <SocialNetwork />
      <SoftwareListSection />
      <Recommended />



    </div>
  );
}
