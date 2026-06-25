import React, { useState } from 'react';
import NavMenu from './NavMenu';
import FeaturedSection from './FeaturedSection';
import SectionDivider from './SectionDivider';
import BottomSections from './BottomSections';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('NEW');

  return (
    <>
      <NavMenu activeCategory={activeCategory} onCategorySelect={setActiveCategory} />
      <main className="main-content">
        <SectionDivider title={`FEATURED - ${activeCategory}`} />
        <FeaturedSection category={activeCategory} />
        
        <BottomSections category={activeCategory} />
      </main>
    </>
  );
};

export default Home;
