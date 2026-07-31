import { useState } from 'react';
import NavMenu from './NavMenu';
import FeaturedSection from './FeaturedSection';
import SectionDivider from './SectionDivider';
import BottomSections from './BottomSections';

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('NEW');

  return (
    <>
      {/*
        This page ranked on page 1 with no <h1> anywhere in the document — the
        largest text was the header wordmark, which is a link, not a heading. So
        the one element search engines read as the page's subject was missing
        entirely. Added here rather than in Header.jsx because the header is
        shared with the quiz routes, which have their own H1 (QuizPage.jsx).
        Colours are semantic tokens only, so it works in light and dark.
      */}
      <section className="w-full max-w-[1760px] mx-auto px-6 pt-8 pb-1 text-center max-md:px-4 max-md:pt-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground max-md:text-2xl">
          Free Personality Quizzes and Trivia Tests
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-md:text-xs">
          Pick a quiz, answer a few questions, get your result. No signup.
        </p>
      </section>
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
