import Hero from './components/Hero';
import ContentArea from './components/ContentArea';
import FeaturedList from './components/FeaturedList';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">      
      <Hero />
      <ContentArea />
      <FeaturedList /> 
    </main>
  );
}