import { Link, useLocation } from "react-router-dom";
import { Button } from './ui/button';
import { FileText, HelpCircle, Home } from "lucide-react";
const Navigation = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  return <nav className="sticky top-0 z-50 bg-(--background)/80 backdrop-blur-lg border-b border-(--border)">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
                            <span className="text-(--foreground) font-bold text-lg">A</span>
                        </div>
                        <span className="font-bold text-xl text-(--foreground)">AdWriter</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Button
    variant={isActive("/") ? "default" : "ghost"}
    size="sm"
    asChild
  >
                            <Link to="/" className="flex items-center gap-2">
                                <Home className="w-4 h-4" />
                                <span className="hidden sm:inline">Home</span>
                            </Link>
                        </Button>

                        <Button
    variant={isActive("/privacy") ? "default" : "ghost"}
    size="sm"
    asChild
  >
                            <Link to="/privacy" className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                <span className="hidden sm:inline">Privacy</span>
                            </Link>
                        </Button>

                        <Button
    variant={isActive("/faqs") ? "default" : "ghost"}
    size="sm"
    asChild
  >
                            <Link to="/faqs" className="flex items-center gap-2">
                                <HelpCircle className="w-4 h-4" />
                                <span className="hidden sm:inline">FAQs</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </nav>;
};
export default Navigation;
