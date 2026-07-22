import Navigation from '../components/Navigation';
import AdGenerator from '../components/AdGenerator';
const Index = () => {
  return <div className="min-h-screen bg-(--background)">
            <Navigation />

            <main className="container mx-auto px-4 py-12">
                <AdGenerator />

            </main>


            <footer className="border-t border-(--border) py-8 mt-20">
                <div className="container mx-auto px-4 text-center text-(--muted-foreground)">
                    <p>&copy; 2025 AdWriter. Powered by AI. Built with ❤️</p>
                </div>
            </footer>
        </div>;
};
export default Index;
