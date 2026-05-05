import React from 'react'
import Navbar from './(components)/Navbar'
import HeroSectionBrand from './(components)/HeroSectionBrand'
import Categories from './(components)/Categories'
import PopularTopic from './(components)/PopularTopic'
import CategoryBrand from './(components)/CategoryBrand'
import MethodologySection from './(components)/MethodologySection'
import Brand from './(components)/Brand'
import ConsumerRating from './(components)/ConsumerRating'
import TrustSecure from './(components)/TrustSecure'
import CategorySection from './(components)/CategorySection'
import data from "./(data)/data.json"
// import './styles/brandrating.css'
import BrandViews from './(components)/BrandViews'


export async function generateMetadata() {
  return {
    title: "Brand Rating & Reviews – Tool Scores | AltFTool",
    description: "Check brand ratings and tool reviews on AltFTool. Compare software, extensions, and online tools with reliable scores to find the best options for your needs.",
  };
}


function page() {
  const allCategory = data.brandRating || {};
  return (
    <div className="w-full ">
      {/* <Navbar data={allCatgeory} /> */}

      <HeroSectionBrand />

      <Categories data={allCategory} />
      <PopularTopic data={allCategory} />
      <MethodologySection />
      <ConsumerRating />
      <Brand />

      <TrustSecure />
      {/* <CategorySection data={allCatgeory}  /> */}

    </div>


  )
}

export default page