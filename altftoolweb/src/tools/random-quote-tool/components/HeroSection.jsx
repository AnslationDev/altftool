import {Sparkles} from "lucide-react";
export default function HeroSection(){
    return(
        <div className="text-center mb-16 mt-8">
          <div className="inline-flex items-center gap-3 bg-(--muted)/50 border border-(--border) rounded-full px-5 py-2.5 mb-8 shadow-sm">
            <div className="p-1.5 rounded-full bg-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="text-(--foreground) text-sm font-semibold tracking-wide">DAILY MOTIVATION</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-(--foreground) mb-6 leading-tight tracking-tight">
            Get Your Daily Dose of
            <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Inspiration
            </span>
          </h1>
          <p className="text-(--muted-foreground) text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Discover powerful quotes from the world's greatest minds. Click the button to get inspired!
          </p>
        </div>

    )
}