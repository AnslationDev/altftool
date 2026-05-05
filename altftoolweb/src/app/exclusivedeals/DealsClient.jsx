"use client";

import React from "react";
import CouponHeader from "./(componnets)/CouponHeader";
import Hero from "./(componnets)/Hero";
import Categories from "./(componnets)/Categories";
import BestDeal from "./(componnets)/BestDeal";
import TrendingCategory from "./(componnets)/TrendingCategory";
import Online from "./(componnets)/Online";
import TrendingStore from "./(componnets)/TrendingStore";
import RecentAddStore from "./(componnets)/RecentAddStore";
import Blog from "./(componnets)/Blog";
import Feedback from "./(componnets)/Feedback";
import Brands from "./(componnets)/Brands";
import StatsSection from "./(componnets)/StatsSection";
import FAQ from "./(componnets)/FAQ";
import AboutSection from "./(componnets)/AboutSection";
import HeroSection from "./(componnets)/HeroSection";
import OutletDealsCard from "./(componnets)/OutletDealsCard";
import SubtractShape from "./(componnets)/autoDesign";
import BrowserCategory from "./(componnets)/BrowserCategory";
import TopStore from "./(componnets)/TopStore";
import UpcomingDeals from "./(componnets)/UpcomingDeals";
import DealGuides from "./(componnets)/DealGuides";
import TreindingPrice from "./(componnets)/TreindingPrice";

import data from "./(data)/db.json"
import FeedbackSection from "./(componnets)/FeedbackSection";
import HowItWorks from "./(componnets)/HowItWorks";
import SmartDeals from "./(componnets)/SmartDeals";




export default function DealsPage() {

  const {store , Categories , popularSales }  = data
 

  return (
    <div  className="bg-(--dealspage-background) text-(--foreground)">
          {/* <CouponHeader/> */}
          <HeroSection/>
          <OutletDealsCard/>
          <BrowserCategory/>
          <TreindingPrice/>
          {/* <SubtractShape/>  */}
          {/* <TrendingCategory/> */}
          <Online  data={popularSales} />
          <TopStore  store={store} />
          <HowItWorks/>
          <SmartDeals/>
          <UpcomingDeals/>
          <DealGuides/>
          {/* <FeedbackSection/> */}
          {/* <TrendingStore/> */}
           {/* <RecentAddStore/> */}
           {/* <Blog/> */}
           <Feedback/>
           {/* <Brands/> */}
           {/* <StatsSection/> */}
           <FAQ/>
           {/* <AboutSection/> */}
     
          
           
          
    </div>
  );
}
