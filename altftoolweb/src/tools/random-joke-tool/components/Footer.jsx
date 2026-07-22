import {Smile} from 'lucide-react';

export default function Footer(){
    return(
              <footer className="bg-(--background) dark:bg-gray-950 border-t-2 border-indigo-200 dark:border-indigo-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 rounded-lg flex items-center justify-center shadow-lg">
                  <Smile className="w-6 h-6 text-(--foreground)" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Joke Generator
                </span>
              </div>
              <p className="text-(--foreground) dark:text-gray-300 text-base font-medium">
                Bringing smiles and laughter, one premium joke at a time.
              </p>
            </div>
            <div>
              <h3 className="text-(--foreground) dark:text-(--foreground) font-bold mb-5 text-lg">Features</h3>
              <ul className="space-y-3 text-base">
                <li><a href="#" className="text-(--foreground) dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Random Jokes</a></li>
                <li><a href="#" className="text-(--foreground) dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Daily Humor</a></li>
                <li><a href="#" className="text-(--foreground) dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors">Share Jokes</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-(--foreground) dark:text-(--foreground) font-bold mb-5 text-lg">Categories</h3>
              <ul className="space-y-3 text-base">
                <li><a href="#" className="text-(--foreground) dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors">Programming</a></li>
                <li><a href="#" className="text-(--foreground) dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors">General</a></li>
                <li><a href="#" className="text-(--foreground) dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors">Knock-Knock</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-(--foreground) dark:text-(--foreground) font-bold mb-5 text-lg">Legal</h3>
              <ul className="space-y-3 text-base">
                <li><a href="#" className="text-(--foreground) dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-(--foreground) dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-(--foreground) dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t-2 border-indigo-200 dark:border-indigo-900 pt-10 flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left">
            <p className="text-(--foreground) dark:text-gray-300 font-medium">© 2025 Joke Generator. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="text-(--foreground) dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors text-lg">Twitter</a>
              <a href="#" className="text-(--foreground) dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-bold transition-colors text-lg">Instagram</a>
              <a href="#" className="text-(--foreground) dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors text-lg">Facebook</a>
            </div>
          </div>
        </div>
      </footer>

    );
}