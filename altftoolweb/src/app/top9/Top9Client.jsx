import Hero from './components/Hero';
import ContentArea from './components/ContentArea';
import FeaturedList from './components/FeaturedList';

export default function Home() {
  return (
    <main className="top9-page min-h-screen">
      <Hero />
      <ContentArea />
      <FeaturedList /> 
    </main>
  );
}
