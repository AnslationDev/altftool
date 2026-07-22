import {Code} from "lucide-react";

export default function Footer(){
    return(
              <footer className="bg-white border-t border-orange-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Chindi Lang
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                A fun parody programming language inspired by Indian culture and Hinglish.
              </p>
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-orange-600 transition">Hinglish Keywords</a></li>
                <li><a href="#" className="text-gray-600 hover:text-orange-600 transition">Live Editor</a></li>
                <li><a href="#" className="text-gray-600 hover:text-orange-600 transition">Examples</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Learn</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-orange-600 transition">Documentation</a></li>
                <li><a href="#" className="text-gray-600 hover:text-orange-600 transition">Tutorials</a></li>
                <li><a href="#" className="text-gray-600 hover:text-orange-600 transition">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-orange-600 transition">Privacy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-orange-600 transition">Terms</a></li>
                <li><a href="#" className="text-gray-600 hover:text-orange-600 transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-orange-100 pt-8 text-center">
            <p className="text-gray-500 text-sm">© 2025 Chindi Lang. Made with ❤️ in India 🇮🇳</p>
          </div>
        </div>
      </footer>

    )
}