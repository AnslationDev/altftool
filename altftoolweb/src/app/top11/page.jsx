import React from 'react'
import JsonLd from '@/platform/seo/JsonLd';
import {
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from '@/platform/seo/generateMetadata';
import Top11 from './components/Top11hero';
// MeetExpert was deleted: it rendered six invented testimonials (names,
// @handles, star ratings, stock avatars) under a "Trusted by Thousands of Tool
// Explorers" heading. None of it was real.
import FAQ from './components/Faq';
import FeaturedCategories from './components/FeaturedCategories';
import ExploreCategory from './components/ExploreCategory';
import WhyChooseUs from './components/WhyChooseUs';
import ExpertRecommendation from './components/ExpertRecommendation';
import categoryData from './data/categoryData';
import { isTop11Indexable } from './data/indexPolicy';

export async function generateMetadata() {
  const categoryCount = Object.keys(categoryData).length;

  // "Expert ranked" was never true of this section: there is no expert panel
  // and nothing here is tested or scored. The count is read from the data.
  return createPageMetadata({
    title: 'Top11 - Product & Service Categories',
    description: `${categoryCount} categories of software, services, VPNs, CRM tools, hosting, online learning, and business platforms, each listing a short set of options in a fixed editorial order on AltFTool.`,
    path: '/top11',
    // See data/indexPolicy.js. The hub is deindexed alongside the categories it
    // fronts, because everything it collects is out of the index.
    noindex: !isTop11Indexable('/top11'),
    follow: true,
  });
}

export default function Page() {
  const indexable = isTop11Indexable('/top11');
  const categories = Object.entries(categoryData).map(([slug, item]) => ({
    name: item.title,
    path: `/top11/${slug}`,
  }));

  return (
  <>
   {/*
     No rich schema while the family is out of the index: a CollectionPage and
     an ItemList of noindexed URLs cannot produce a result, and the ItemList
     would be pointing a crawler at ten pages it has been told not to index.
   */}
   {indexable ? (
     <JsonLd
       id="top11-collection-schema"
       data={[
         createCollectionPageJsonLd({
           path: '/top11',
           name: 'Top11 Categories',
           description:
             'Product and service categories across software, privacy, business, home, and learning, each listing a short set of options in a fixed editorial order.',
         }),
         createItemListJsonLd({
           path: '/top11',
           name: 'Top11 categories',
           items: categories,
         }),
       ]}
     />
   ) : null}
   <Top11 />
   <FeaturedCategories/>
   <ExpertRecommendation/>
   <ExploreCategory/>
   <WhyChooseUs/>
   <FAQ/>
   </>
  )
}
