import React from 'react'
import HeroBanner from './components/HeroBanner'
import TrendingSection from './components/TrendingSection'
import data from "./data/bookData.json";
import MustReadFanfiction from './components/MustReadFanfiction';

export default function WattpadPage() {
  return (
    <div>
    <HeroBanner/> 
    <TrendingSection trendingData={data.trending}/>

    <MustReadFanfiction mustReadData={data.mustRead} />
    </div>
  )
}
