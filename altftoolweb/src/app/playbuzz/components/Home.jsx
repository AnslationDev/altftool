import { useState } from 'react';
import NavMenu from './NavMenu';
import FeaturedSection from './FeaturedSection';
import SectionDivider from './SectionDivider';
import BottomSections from './BottomSections';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('NEW');

  return (
    <>
      <NavMenu activeCategory={activeCategory} onCategorySelect={setActiveCategory} />
      <main className="flex-1 w-full max-w-[1760px] mx-auto px-16 max-xl:px-10 max-md:px-4">
        <SectionDivider title={`FEATURED - ${activeCategory}`} />
        <FeaturedSection category={activeCategory} />
        <BottomSections category={activeCategory} />
      </main>
    </>
  );
};

export default Home;
