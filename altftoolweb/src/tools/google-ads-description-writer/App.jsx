import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Privacy from "./pages/Privacy";
import FAQs from "./pages/FAQs";
import NotFound from "./pages/NotFound";
const App = () => <TooltipProvider>
      <Toaster />
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/faqs" element={<FAQs />} />
          {
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    </TooltipProvider>;
export default App;
