import React from 'react'
import Top11 from './components/Top11hero';
import Meetexpert from './components/MeetExpert';
import FAQ from './components/Faq';
import FeaturedCategories from './components/FeaturedCategories';
import ExploreCategory from './components/ExploreCategory';
import WhyChooseUs from './components/WhyChooseUs';


export default function Page() {
  return (  
  <>
   <Top11 />;
   <FeaturedCategories/>
   <ExploreCategory/>
   <WhyChooseUs/>
   <Meetexpert/>
   <FAQ/>
   </>
  )
}
