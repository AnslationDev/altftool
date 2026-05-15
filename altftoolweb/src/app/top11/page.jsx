import React from 'react'
import JsonLd from '@/platform/seo/JsonLd';
import {
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from '@/platform/seo/generateMetadata';
import Top11 from './components/Top11hero';
import Meetexpert from './components/MeetExpert';
import FAQ from './components/Faq';
import FeaturedCategories from './components/FeaturedCategories';
import ExploreCategory from './components/ExploreCategory';
import WhyChooseUs from './components/WhyChooseUs';
import ExpertRecommendation from './components/ExpertRecommendation';
import categoryData from './data/categoryData';

export async function generateMetadata() {
  return createPageMetadata({
    title: 'Top11 - Expert Ranked Products & Services',
    description:
      'Compare expert-ranked software, services, VPNs, CRM tools, hosting, online learning, and business platforms on AltFTool Top11.',
    path: '/top11',
  });
}

export default function Page() {
  const categories = Object.entries(categoryData).map(([slug, item]) => ({
    name: item.title,
    path: `/top11/${slug}`,
  }));

  return (  
  <>
   <JsonLd
     id="top11-collection-schema"
     data={[
       createCollectionPageJsonLd({
         path: '/top11',
         name: 'Top11 Rankings',
         description: 'Expert-ranked products and services across software, privacy, business, home, and learning.',
       }),
       createItemListJsonLd({
         path: '/top11',
         name: 'Top11 categories',
         items: categories,
       }),
     ]}
   />
   <Top11 />
   <FeaturedCategories/>
   <ExpertRecommendation/>
   <ExploreCategory/>
   <WhyChooseUs/>
   <Meetexpert/>
   <FAQ/>
   </>
  )
}
