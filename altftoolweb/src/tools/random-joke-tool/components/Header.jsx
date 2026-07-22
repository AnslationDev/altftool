import { Smile} from 'lucide-react';
export default function Header(){
    return(
              <header className="bg-(--background)/80 backdrop-blur-lg border-b border-yellow-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
              <Smile className="w-6 h-6 text-(--foreground)" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Joke Generator
            </span>
          </div>
        </div>
      </header>

    );
}