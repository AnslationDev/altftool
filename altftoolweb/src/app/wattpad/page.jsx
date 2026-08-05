import React from 'react'
import HeroBanner from './components/HeroBanner'
import TrendingSection from './components/TrendingSection'
import data from "./data/bookData.json";
import MustReadFanfiction from './components/MustReadFanfiction';
import BookCategorySection from './components/BookCategorySection';
import Faqs from './components/Faqs';
import books from './data/books.json';
import chapters from './data/chapters.json';
import JsonLd from '@/platform/seo/JsonLd';
import {
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from '@/platform/seo/generateMetadata';

export async function generateMetadata() {
  return createPageMetadata({
    title: 'Wattpad-Style Stories - Reads & Fanfiction',
    description:
      'Browse Wattpad-style trending stories, romance, fantasy, fanfiction, and must-read books on AltFTool.',
    path: '/wattpad',
  });
}

export default function WattpadPage() {
  const readableBookIds = new Set(chapters.map((chapter) => chapter.bookId));
  const readableBookSlugs = new Set(
    books
      .filter((book) => readableBookIds.has(book.id))
      .map((book) => book.slug),
  );
  const listedBookSlugs = new Set();
  const itemList = [
    ...(data.trending?.products || []),
    ...(data.mustRead?.items || []),
  ]
    // Cards remain visible for catalogue navigation, but structured data only
    // advertises titles that currently have something to read.
    .filter((item) => {
      if (
        !item?.slug ||
        !readableBookSlugs.has(item.slug) ||
        listedBookSlugs.has(item.slug)
      ) {
        return false;
      }
      listedBookSlugs.add(item.slug);
      return true;
    })
    .slice(0, 24)
    .map((item) => ({
      name: item.title,
      path: item.slug ? `/wattpad/book/${item.slug}` : '/wattpad',
    }));

  return (
    <div>
    <h1 className="sr-only">Trending stories and fanfiction</h1>
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
    <BookCategorySection/>
    <TrendingSection trendingData={data.trending}/>

    <MustReadFanfiction mustReadData={data.mustRead} />
    <Faqs faq={data.faq} />
    </div>
  )
}
