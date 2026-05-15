import React from 'react'
import HeroBanner from './components/HeroBanner'
import TrendingSection from './components/TrendingSection'
import data from "./data/bookData.json";
import MustReadFanfiction from './components/MustReadFanfiction';
import JsonLd from '@/platform/seo/JsonLd';
import {
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from '@/platform/seo/generateMetadata';

export async function generateMetadata() {
  return createPageMetadata({
    title: 'Wattpad-Style Stories - Trending Reads & Fanfiction',
    description:
      'Browse Wattpad-style trending stories, romance, fantasy, fanfiction, and must-read books on AltFTool.',
    path: '/wattpad',
  });
}

export default function WattpadPage() {
  const itemList = [
    ...(data.trending?.products || []),
    ...(data.mustRead?.products || []),
  ]
    .filter((item) => item?.slug || item?.title)
    .slice(0, 24)
    .map((item) => ({
      name: item.title,
      path: item.slug ? `/wattpad/book/${item.slug}` : '/wattpad',
    }));

  return (
    <div>
    <JsonLd
      id="wattpad-collection-schema"
      data={[
        createCollectionPageJsonLd({
          path: '/wattpad',
          name: 'Wattpad-style stories',
          description: 'Trending stories, fanfiction, romance, fantasy, and serialized reads.',
        }),
        createItemListJsonLd({
          path: '/wattpad',
          name: 'Featured Wattpad stories',
          items: itemList,
        }),
      ]}
    />
    <HeroBanner/> 
    <TrendingSection trendingData={data.trending}/>

    <MustReadFanfiction mustReadData={data.mustRead} />
    </div>
  )
}
